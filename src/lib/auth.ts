/**
 * NextAuth configuration — v4 with Prisma adapter.
 *
 * Providers:
 *   - GitHub OAuth (production + dev)
 *   - Credentials (dev only — for seeded user fallback)
 *
 * Multi-tenancy:
 *   Every authenticated user has at least one Membership linking them
 *   to an Organization. The session callback enriches the JWT with
 *   the user's active organizationId, role (org-level), AND systemRole
 *   (system-level — 'USER' | 'SUPERADMIN'). The two are independent:
 *   a founder's User row has systemRole = 'SUPERADMIN' AND a Membership
 *   with role = 'owner' on the founder's own operating org.
 *
 * Phase 6 — systemRole threading (per Viableo Production Architecture §3):
 *   - On first sign-in: jwt() callback reads User.systemRole from the
 *     Prisma user record (single extra field on the existing findUnique
 *     that already fetches the user — no extra query when the adapter
 *     populates the user object on the initial jwt call).
 *   - Persisted to token.systemRole.
 *   - session() callback copies token.systemRole onto session.systemRole.
 *   - requireSuperAdmin() resolves session → checks systemRole ===
 *     'SUPERADMIN' → throws AuthError(403) otherwise. Server-side
 *     primitive consumed by Agent 2's /api/admin/** routes.
 */
import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import { logSystemEvent } from '@/lib/observability/system-event';
import { ensureUserHasOrganization } from '@/lib/org-bootstrap';

export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
    // Credentials provider for dev/seeding — allows login with email only
    // when GITHUB_ID is not configured. Disabled in production.
    ...(process.env.NODE_ENV !== 'production'
      ? [
          CredentialsProvider({
            name: 'dev-login',
            credentials: {
              email: { label: 'Email', type: 'email' },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;
              const user = await db.user.findUnique({
                where: { email: credentials.email as string },
              });
              return user;
            },
          }),
        ]
      : []),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: Record<string, unknown>; user?: { id?: string; systemRole?: string } }) {
      // On first sign-in, `user` is populated. After that, only `token`.
      if (user?.id) {
        token.sub = user.id;
        // Load the user's first membership (active org) + systemRole in
        // a single Prisma round-trip (the user row is the same one the
        // adapter already fetched; we explicitly select systemRole to
        // guarantee it's present even when the adapter elides custom
        // fields — defensive against future adapter changes).
        const [membership, userRow] = await Promise.all([
          db.membership.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'asc' },
          }),
          db.user.findUnique({
            where: { id: user.id },
            select: { systemRole: true },
          }),
        ]);
        if (membership) {
          token.organizationId = membership.organizationId;
          token.role = membership.role;
        }
        // Thread User.systemRole through the token. Falls back to 'USER'
        // if the field is somehow null (the schema default is 'USER').
        token.systemRole = userRow?.systemRole ?? user.systemRole ?? 'USER';

        // Observability: best-effort, fire-and-forget. Never let an
        // event-emit failure fail the sign-in (the catch swallows).
        logSystemEvent({
          eventType: 'USER_SIGNED_IN',
          userId: user.id,
          organizationId: (membership?.organizationId) ?? undefined,
          severity: 'info',
          metadata: { provider: 'github' },
        }).catch(() => { /* observability must never fail the request */ });
      }
      return token;
    },
    async session({ session, token }: { session: Record<string, unknown>; token: Record<string, unknown> }) {
      if (session.user && token.sub) {
        (session.user as Record<string, unknown>).id = token.sub;
      }
      // Extend session with org context + system role.
      (session as SessionWithOrg).organizationId =
        token.organizationId as string | undefined;
      (session as SessionWithOrg).role = token.role as string | undefined;
      (session as SessionWithOrg).systemRole =
        token.systemRole as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        await ensureUserHasOrganization(user.id, user.email);
      }
    },
  },
};

// v4 API: NextAuth returns a single handler function
const handler = NextAuth(authOptions);
export default handler;

// Re-export for use in route files
export { handler };

// ── Extended session type ─────────────────────────────────────────

export interface SessionWithOrg {
  organizationId?: string;
  role?: string; // 'owner' | 'member' (org-scoped)
  systemRole?: string; // 'USER' | 'SUPERADMIN' (system-scoped)
}

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    organizationId?: string;
    role?: string;
    systemRole?: string;
  }
}

// ── Server-side session helpers ───────────────────────────────────
// These use `getServerSession` from next-auth v4

import { getServerSession } from 'next-auth/next';

/**
 * Get the current server-side session. Returns null if unauthenticated.
 */
export async function getAuthSession() {
  const req = undefined; // App Router: no req/res needed
  const res = undefined;
  return getServerSession(authOptions);
}

/**
 * Get the authenticated user's active organization ID.
 * Returns null if unauthenticated or no membership.
 */
export async function getOrgId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session as SessionWithOrg | null)?.organizationId ?? null;
}

/**
 * Require authentication + org membership. Throws if missing.
 * Use this as the gateway for all tenant-scoped API routes.
 */
export async function requireAuth(): Promise<{
  userId: string;
  organizationId: string;
  role: string;
  systemRole: string;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AuthError('Authentication required', 401);
  }
  const orgId = (session as SessionWithOrg).organizationId;
  if (!orgId) {
    throw new AuthError('No organization membership', 403);
  }
  return {
    userId: session.user.id,
    organizationId: orgId,
    role: (session as SessionWithOrg).role ?? 'member',
    systemRole: (session as SessionWithOrg).systemRole ?? 'USER',
  };
}

/**
 * Require Superadmin access. Throws AuthError(403) if the session is
 * unauthenticated OR the user's systemRole is not 'SUPERADMIN'.
 *
 * Server-side primitive consumed by Agent 2's /api/admin/** routes and
 * every /admin/** server component — call as the FIRST statement in
 * the handler, before any Prisma call. NEVER hardcode a founder email
 * here; Superadmin status is set only via scripts/bootstrap-superadmin.ts
 * (which itself requires a one-time SUPERADMIN_BOOTSTRAP_TOKEN).
 *
 * IMPORTANT — privacy boundary (Viableo Production Architecture §8.2):
 * requireSuperAdmin() authorizes SYSTEM-LEVEL operational access. It is
 * NOT a superset of tenant(orgId) access — a Superadmin route must
 * never directly return raw Project.inputs/results or other proprietary
 * customer financial content. Use the operational-queries module
 * (Agent 2's scope) which structurally cannot return content fields.
 */
export async function requireSuperAdmin(): Promise<{
  userId: string;
  systemRole: string;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AuthError('Authentication required', 401);
  }
  if ((session as SessionWithOrg).systemRole !== 'SUPERADMIN') {
    // Best-effort audit trail (fire-and-forget; never fail the request
    // on the observability side).
    logSystemEvent({
      eventType: 'AUTH_FAILED',
      userId: session.user.id,
      severity: 'warn',
      metadata: { reason: 'superadmin_required', path: 'requireSuperAdmin' },
    }).catch(() => { /* observability must never fail the request */ });
    throw new AuthError('Superadmin access required', 403);
  }
  return {
    userId: session.user.id,
    systemRole: 'SUPERADMIN',
  };
}

/**
 * Custom auth error with HTTP status code.
 */
export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

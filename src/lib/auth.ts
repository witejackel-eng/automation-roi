/**
 * NextAuth configuration — Auth.js v4 with Prisma adapter.
 *
 * Providers:
 *   - GitHub OAuth (production + dev)
 *   - Credentials (dev only — for seeded user fallback)
 *
 * Multi-tenancy:
 *   Every authenticated user has at least one Membership linking them
 *   to an Organization. The session callback enriches the JWT with
 *   the user's active organizationId and role.
 */
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import type { Membership } from '@prisma/client';

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
    // Credentials provider for dev/seeding — allows login with email only
    // when GITHUB_ID is not configured. Disabled in production.
    ...(process.env.NODE_ENV !== 'production'
      ? [
          Credentials({
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
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, `user` is populated. After that, only `token`.
      if (user) {
        token.sub = user.id;
        // Load the user's first membership (active org).
        const membership = await db.membership.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'asc' },
        });
        if (membership) {
          token.organizationId = membership.organizationId;
          token.role = membership.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      // Extend session with org context.
      (session as SessionWithOrg).organizationId =
        token.organizationId as string | undefined;
      (session as SessionWithOrg).role = token.role as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});

// ── Extended session type ─────────────────────────────────────────

export interface SessionWithOrg {
  organizationId?: string;
  role?: string; // 'owner' | 'member'
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
  }
}

// ── Server-side session helpers ───────────────────────────────────

/**
 * Get the current server-side session. Returns null if unauthenticated.
 */
export async function getAuthSession() {
  return auth();
}

/**
 * Get the authenticated user's active organization ID.
 * Returns null if unauthenticated or no membership.
 */
export async function getOrgId(): Promise<string | null> {
  const session = await auth();
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
}> {
  const session = await auth();
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

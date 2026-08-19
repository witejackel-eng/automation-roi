/**
 * Server-side session helpers.
 *
 * This module provides the bridge between NextAuth sessions and the
 * tenant-scoped data access layer. All API routes should use
 * `getOrgFromSession()` or `requireAuth()` to resolve the current
 * organization context.
 *
 * MIGRATION NOTE: The old `DEMO_ORG_ID`, `getDemoOrganization()`, and
 * `setDemoTier()` have been removed. Multi-tenancy is enforced through
 * real auth sessions + the tenant() scoped query layer.
 */
import { requireAuth, getOrgId, AuthError, getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export { AuthError, requireAuth, getOrgId };

/**
 * Get the current authenticated user's organization.
 * Returns null if unauthenticated or no membership.
 * This replaces the old getDemoOrganization() pattern.
 */
export async function getOrgFromSession() {
  const orgId = await getOrgId();
  if (!orgId) return null;
  return db.organization.findUnique({ where: { id: orgId } });
}

/**
 * Require an authenticated session with an org, returning the org.
 * Throws AuthError if not authenticated.
 */
export async function requireOrg() {
  let organizationId: string;
  try {
    const auth = await requireAuth();
    organizationId = auth.organizationId;
  } catch (e) {
    if (e instanceof AuthError && e.status === 403 && e.message === 'No organization membership') {
      // Defensive fallback: if no membership exists yet (e.g. a pre-existing
      // user from before org-bootstrap was added, or a dev CredentialsProvider
      // sign-in that bypassed the signIn event), create one now rather than
      // permanently 403ing this user.
      const session = await getAuthSession();
      if (!session?.user?.id) throw new AuthError('Authentication required', 401);
      const { ensureUserHasOrganization } = await import('@/lib/org-bootstrap');
      await ensureUserHasOrganization(session.user.id, session.user.email);
      const retriedMembership = await db.membership.findFirst({ where: { userId: session.user.id } });
      if (!retriedMembership) {
        throw new AuthError('No organization membership', 403);
      }
      organizationId = retriedMembership.organizationId;
    } else {
      throw e;
    }
  }
  const org = await db.organization.findUnique({ where: { id: organizationId } });
  if (!org) {
    throw new AuthError('Organization not found', 404);
  }
  return org;
}

/**
 * Switch the active organization for the current user.
 * Validates that the user is a member of the target org.
 */
export async function switchOrganization(userId: string, orgId: string): Promise<boolean> {
  const membership = await db.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
  if (!membership) return false;
  // The JWT callback will pick up the new org on next session refresh.
  return true;
}

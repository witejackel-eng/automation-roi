/**
 * First-sign-in organization bootstrap.
 *
 * NextAuth's Prisma adapter creates a `User` row automatically on first
 * OAuth sign-in, but it does NOT create an `Organization` or `Membership`
 * row — this repository's multi-tenant model requires both to exist
 * before any org-scoped route (e.g. /api/entitlement, /api/projects)
 * will work. Call `ensureUserHasOrganization` from the NextAuth
 * `signIn` event so every user always has at least one organization
 * and an `owner` membership immediately after their first sign-in.
 *
 * Idempotent: if the user already has at least one Membership, this
 * is a no-op.
 */
import { db } from '@/lib/db';

export async function ensureUserHasOrganization(userId: string, userEmail: string | null | undefined): Promise<void> {
  const existingMembership = await db.membership.findFirst({ where: { userId } });
  if (existingMembership) return;

  const orgName = userEmail ? `${userEmail.split('@')[0]}'s Organization` : 'My Organization';

  await db.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: orgName,
      },
    });
    await tx.membership.create({
      data: {
        userId,
        organizationId: org.id,
        role: 'owner',
      },
    });
  });
}

/**
 * Superadmin-aware entitlement resolution.
 *
 * In the normal flow, entitlements are resolved from the organization's
 * License/Subscription. But a SUPERADMIN must have full access to every
 * feature without being blocked by the normal entitlement system.
 *
 * This helper checks the session's systemRole and returns the highest
 * tier (agency_pro) if the user is a SUPERADMIN — without affecting
 * normal users.
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { entitlementFor, type Entitlement } from '@/lib/entitlement';
import { getOrgEntitlement } from '@/lib/tenant';

/**
 * Get the effective entitlement for the current session.
 *
 * If the user is a SUPERADMIN, returns agency_pro (all capabilities unlocked).
 * Otherwise, resolves the normal org entitlement.
 */
export async function getEffectiveEntitlement(
  orgId: string
): Promise<Entitlement> {
  const session = await getServerSession(authOptions);
  if (session?.systemRole === 'SUPERADMIN') {
    return entitlementFor('agency_pro');
  }
  return getOrgEntitlement(orgId);
}

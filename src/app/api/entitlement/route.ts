/**
 * GET /api/entitlement — look up the current tier by the organization,
 * drives UI gating.
 *
 * SUPERADMIN ELEVATION: if the authenticated user's systemRole === 'SUPERADMIN',
 * the entitlement is forced to the highest tier (agency_pro) with all
 * capabilities unlocked — regardless of License/Subscription records.
 * This gives the founder full product access without touching the normal
 * entitlement system for regular users.
 */
import { NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { getOrgEntitlement } from '@/lib/tenant';
import { entitlementFor, type Entitlement } from '@/lib/entitlement';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const org = await requireOrg();

    // Superadmin elevation: check the session's systemRole.
    const session = await getServerSession(authOptions);
    if (session?.systemRole === 'SUPERADMIN') {
      const elevated: Entitlement = entitlementFor('agency_pro');
      return NextResponse.json({
        organizationId: org.id,
        organizationName: org.name,
        ...elevated,
        superadmin: true,
        tierLabel: 'Superadmin — Full access',
      });
    }

    const entitlement = await getOrgEntitlement(org.id);
    return NextResponse.json({
      organizationId: org.id,
      organizationName: org.name,
      ...entitlement,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[api/entitlement]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

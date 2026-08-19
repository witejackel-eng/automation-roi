/**
 * GET /api/entitlement — look up the current tier by the demo organization,
 * drives UI gating.
 */
import { NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { getOrgEntitlement } from '@/lib/tenant';

export const runtime = 'nodejs';

export async function GET() {
  try {
  const org = await requireOrg();
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

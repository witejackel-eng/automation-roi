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
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

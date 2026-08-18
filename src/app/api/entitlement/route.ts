/**
 * GET /api/entitlement — look up the current tier by the demo organization,
 * drives UI gating.
 */
import { NextResponse } from 'next/server';
import { getDemoOrganization } from '@/lib/session';
import { getActiveEntitlement } from '@/lib/entitlement';

export const runtime = 'nodejs';

export async function GET() {
  const org = await getDemoOrganization();
  const entitlement = await getActiveEntitlement(org.id);
  return NextResponse.json({
    organizationId: org.id,
    organizationName: org.name,
    ...entitlement,
  });
}

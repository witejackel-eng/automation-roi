/**
 * POST /api/billing/checkout — create a Whop checkout session.
 *
 * Resolves organizationId server-side from the authenticated session.
 * Never trusts client-supplied organizationId.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg } from '@/lib/session';
import { AuthError } from '@/lib/auth';
import { whopClient, WHOP_COMPANY_ID } from '@/lib/whop';
import { z } from 'zod';

const PLAN_ID_BY_TIER: Record<'case_pack' | 'agency' | 'agency_pro', string> = {
  case_pack: process.env.WHOP_PLAN_ID_CASE_PACK ?? 'TODO_HUMAN_WHOP_PLAN_ID_CASE_PACK',
  agency: process.env.WHOP_PLAN_ID_AGENCY ?? 'TODO_HUMAN_WHOP_PLAN_ID_AGENCY',
  agency_pro: process.env.WHOP_PLAN_ID_AGENCY_PRO ?? 'TODO_HUMAN_WHOP_PLAN_ID_AGENCY_PRO',
};

const requestSchema = z.object({
  tier: z.enum(['case_pack', 'agency', 'agency_pro']),
});

export async function POST(req: NextRequest) {
  try {
    const org = await requireOrg();
    const organizationId = org.id;
    const body = await req.json();
    const { tier } = requestSchema.parse(body);

    const planId = PLAN_ID_BY_TIER[tier];
    if (!planId || planId.startsWith('TODO_HUMAN_')) {
      console.error(`[billing/checkout] Whop plan id for tier "${tier}" is not configured (env var missing)`);
      return NextResponse.json(
        { error: 'This plan is not yet available for purchase. Please contact support.' },
        { status: 503 },
      );
    }

    const checkoutConfig = await whopClient.checkoutConfigurations.create({
      account_id: WHOP_COMPANY_ID,
      plan_id: planId,
      metadata: {
        organizationId,
        tier,
      },
    });

    return NextResponse.json({ sessionId: checkoutConfig.id, planId });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: err.issues }, { status: 400 });
    }
    console.error('[billing/checkout]', err);
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 });
  }
}

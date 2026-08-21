import { NextRequest, NextResponse } from 'next/server';
import { requireOrg } from '@/lib/session';
import { AuthError } from '@/lib/auth';
import { whopClient, WHOP_COMPANY_ID } from '@/lib/whop';
import { resolveTierByWhopPlanId } from '@/lib/tenant';
import { z } from 'zod';

/**
 * Checkout — canonical two-tier model.
 *
 * Only Pro is purchased (Starter is free). Legacy 'agency' / 'agency_pro'
 * tier strings are accepted for backward compatibility with older clients
 * and redirect to the same Pro plan.
 */
const PLAN_ID_BY_TIER: Record<'pro' | 'agency' | 'agency_pro', string> = {
  pro: process.env.WHOP_PLAN_ID_PRO ?? 'TODO_HUMAN_WHOP_PLAN_ID_PRO',
  // Legacy tiers map to the Pro plan id (single paid plan).
  agency: process.env.WHOP_PLAN_ID_PRO ?? 'TODO_HUMAN_WHOP_PLAN_ID_PRO',
  agency_pro: process.env.WHOP_PLAN_ID_PRO ?? 'TODO_HUMAN_WHOP_PLAN_ID_PRO',
};

const requestSchema = z.object({
  // Accept legacy tier strings; they all purchase Pro.
  tier: z.enum(['pro', 'agency', 'agency_pro']),
});

export async function POST(req: NextRequest) {
  try {
    const org = await requireOrg();
    const organizationId = org.id;
    const body = await req.json();
    const { tier } = requestSchema.parse(body);

    const planId = PLAN_ID_BY_TIER[tier];
    if (!planId || planId.startsWith('TODO_HUMAN_')) {
      console.error(`[billing/checkout] Whop plan id for tier "${tier}" is not configured (env var WHOP_PLAN_ID_PRO missing)`);
      return NextResponse.json(
        { error: 'Pro checkout is not yet available. The founder must provision the Whop plan id first. Email support if you need to upgrade sooner.' },
        { status: 503 },
      );
    }

    // Validate PlanMapping exists for this planId
    const mappedTier = await resolveTierByWhopPlanId(planId);
    if (!mappedTier) {
      console.error(`[billing/checkout] PlanMapping not found for planId "${planId}" — run \`bun run seed:plans\` after provisioning WHOP_PLAN_ID_PRO.`);
      return NextResponse.json(
        { error: 'Plan configuration is missing. Please contact support.' },
        { status: 503 },
      );
    }

    const checkoutConfig = await whopClient.checkoutConfigurations.create({
      account_id: WHOP_COMPANY_ID,
      plan_id: planId,
      metadata: {
        organizationId,
        // Always record the canonical tier purchased.
        tier: 'pro',
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

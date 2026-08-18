/**
 * POST /api/entitlement/set — set the demo organization's tier (used by the
 * pricing page CTA in this single-tenant demo, in place of a live Whop
 * checkout). In production this write would be performed by
 * /api/webhooks/whop after a verified purchase.
 */
import { NextRequest, NextResponse } from 'next/server';
import { setDemoTier } from '@/lib/session';
import type { Tier } from '@/lib/entitlement';

export const runtime = 'nodejs';

const ALLOWED: Tier[] = ['free', 'pro', 'agency', 'agency_pro'];

export async function POST(req: NextRequest) {
  let body: { tier?: string };
  try {
    body = (await req.json()) as { tier?: string };
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 422 });
  }
  const tier = body.tier as Tier;
  if (!ALLOWED.includes(tier)) {
    return NextResponse.json({ error: 'Unknown tier.' }, { status: 422 });
  }
  await setDemoTier(tier);
  return NextResponse.json({ ok: true, tier });
}

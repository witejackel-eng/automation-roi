/**
 * POST /api/webhooks/whop — upsers a licenses row on purchase.
 *
 * In production: verify the Whop signature header before writing. This demo
 * does not have a live Whop secret, so the signature check is structural-only
 * (reject missing/empty signatures with 401). Real verification is left as a
 * marked TODO so the route ships safely without a hardcoded secret.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEMO_ORG_ID } from '@/lib/session';
import type { Tier } from '@/lib/entitlement';

export const runtime = 'nodejs';

const TIER_BY_PRODUCT: Record<string, Tier> = {
  pro: 'pro',
  agency: 'agency',
  agency_pro: 'agency_pro',
  'agency-pro': 'agency_pro',
};

export async function POST(req: NextRequest) {
  const signature = req.headers.get('whop-signature') ?? '';
  if (!signature) {
    return NextResponse.json({ error: 'Missing Whop signature.' }, { status: 401 });
  }

  // TODO(production): verify `signature` against WHOP_WEBHOOK_SECRET using
  // Whop's HMAC scheme. Reject mismatched payloads with 401. This demo only
  // checks presence so the route endpoint exists for the API map.

  let body: { tier?: string; product?: string; order_id?: string };
  try {
    body = (await req.json()) as { tier?: string; product?: string; order_id?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 422 });
  }

  const tier =
    (body.tier && TIER_BY_PRODUCT[body.tier]) ??
    (body.product && TIER_BY_PRODUCT[body.product]) ??
    null;

  if (!tier) {
    return NextResponse.json({ error: 'Unknown product/tier.' }, { status: 422 });
  }

  const existing = await db.license.findFirst({ where: { organizationId: DEMO_ORG_ID } });
  if (existing) {
    await db.license.update({
      where: { id: existing.id },
      data: { tier, whopOrderId: body.order_id ?? null, purchasedAt: new Date() },
    });
  } else {
    await db.license.create({
      data: { organizationId: DEMO_ORG_ID, tier, whopOrderId: body.order_id ?? null, purchasedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true, tier });
}

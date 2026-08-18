/**
 * POST /api/webhooks/whop — upserts a license row on purchase.
 *
 * SECURITY:
 *  - If WHOP_WEBHOOK_SECRET is set, the HMAC-SHA256 signature is verified
 *    against the raw request body.
 *  - If the secret is NOT set:
 *      • In development: log a warning and allow (for local testing).
 *      • In production: reject with 500 (misconfiguration).
 *  - Idempotency: If a License with the same whopEventId already exists,
 *    return 200 without creating a duplicate.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEMO_ORG_ID } from '@/lib/session';
import type { Tier } from '@/lib/entitlement';
import { createHmac } from 'crypto';

export const runtime = 'nodejs';

const TIER_BY_PRODUCT: Record<string, Tier> = {
  pro: 'pro',
  agency: 'agency',
  agency_pro: 'agency_pro',
  'agency-pro': 'agency_pro',
};

/**
 * Verify the Whop webhook signature using HMAC-SHA256.
 * Returns true if the signature is valid, false otherwise.
 */
function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  // Constant-time comparison to prevent timing attacks.
  if (expected.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(req: NextRequest) {
  // ── Read raw body as text for signature verification ───────────
  const rawBody = await req.text();

  const signature = req.headers.get('whop-signature') ?? '';
  const secret = process.env.WHOP_WEBHOOK_SECRET;

  // ── Signature verification ──────────────────────────────────────
  if (secret) {
    // Secret is configured — always verify.
    if (!signature || !verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid Whop signature.' }, { status: 401 });
    }
  } else {
    // No secret configured.
    if (process.env.NODE_ENV === 'production') {
      console.error('[webhooks/whop] WHOP_WEBHOOK_SECRET is not set. Rejecting in production.');
      return NextResponse.json(
        { error: 'Webhook secret not configured.' },
        { status: 500 }
      );
    }
    // Development: warn but allow.
    console.warn(
      '[webhooks/whop] ⚠️  WHOP_WEBHOOK_SECRET is not set. Skipping signature verification (development only).'
    );
    if (!signature) {
      return NextResponse.json({ error: 'Missing Whop signature.' }, { status: 401 });
    }
  }

  // ── Parse body ──────────────────────────────────────────────────
  let body: { tier?: string; product?: string; order_id?: string; event_id?: string };
  try {
    body = JSON.parse(rawBody) as { tier?: string; product?: string; order_id?: string; event_id?: string };
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

  // ── Idempotency: skip if we already processed this event ───────
  const whopEventId = body.event_id ?? null;
  if (whopEventId) {
    const existingByEvent = await db.license.findFirst({
      where: { whopEventId },
    });
    if (existingByEvent) {
      return NextResponse.json({ ok: true, tier: existingByEvent.tier, idempotent: true });
    }
  }

  // ── Upsert license ─────────────────────────────────────────────
  const existing = await db.license.findFirst({ where: { organizationId: DEMO_ORG_ID } });
  if (existing) {
    await db.license.update({
      where: { id: existing.id },
      data: {
        tier,
        whopOrderId: body.order_id ?? null,
        whopEventId,
        purchasedAt: new Date(),
      },
    });
  } else {
    await db.license.create({
      data: {
        organizationId: DEMO_ORG_ID,
        tier,
        whopOrderId: body.order_id ?? null,
        whopEventId,
        purchasedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ ok: true, tier });
}

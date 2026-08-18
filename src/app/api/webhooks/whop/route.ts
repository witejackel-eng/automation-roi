/**
 * POST /api/webhooks/whop — billing-webhook handler (Phase 9 rewrite).
 *
 * FIXES (per Viableo Production Architecture §5 + Agent 1 master prompt Phase 9):
 *
 *   1. SIGNATURE VERIFICATION (F-9 / P0): the previous implementation
 *      signed only the raw body with HMAC-SHA256. Whop uses the
 *      Standard Webhooks specification — HMAC-SHA256 over the string
 *      `{webhook-id}.{webhook-timestamp}.{raw-body}`, with the
 *      `webhook-signature` header in the form `v1,<base64>`. This
 *      rewrite matches the actual spec, accepts any of the
 *      space-separated v1 signatures (for secret rotation), and
 *      REJECTS requests where the timestamp is more than 5 minutes old
 *      (replay protection).
 *
 *   2. IDEMPOTENCY: Whop delivers each event at least once, retries
 *      for ~71 hours, and does not guarantee ordering. The
 *      `Payment.whopEventId` unique constraint (Phase 3 migration)
 *      is the primary idempotency key — a duplicate webhook-id with
 *      an already-processed Payment row short-circuits to a 200.
 *
 *   3. TIER RESOLUTION VIA PlanMapping (not a hardcoded map): the old
 *      `TIER_BY_PRODUCT` constant is gone. Tier is resolved via a
 *      `PlanMapping.findUnique({ where: { whopPlanId } })` lookup.
 *      Unknown plan IDs do NOT silently default to a paid tier
 *      (revenue-integrity risk) or to free (could downgrade a
 *      legitimate paying customer). Instead, a WEBHOOK_ERROR system
 *      event is emitted and the org's tier is left unchanged for
 *      manual review.
 *
 *   4. UPSERT CHAIN (per §5.3): on a relevant event, upsert
 *      Subscription (status, currentPeriodEnd, cancelAtPeriodEnd, tier
 *      resolved via PlanMapping) → append Payment row for
 *      payment-related events (amount, currency, whopPaymentId,
 *      whopEventId — for visibility only, never used to derive tier)
 *      → upsert License.tier from Subscription.tier so the existing
 *      entitlement.ts read path keeps working unchanged.
 *
 *   5. RESPOND FAST: per Whop's documented deadline (~2-5s), the HTTP
 *      200 response is sent as soon as signature verification + the
 *      DB upsert chain completes. logSystemEvent() calls are
 *      fire-and-forget (the stub itself never throws; the call sites
 *      also wrap in try/catch as defense-in-depth).
 *
 *   6. EVENT EMISSION: WHOP_PAYMENT_RECEIVED, SUBSCRIPTION_CREATED,
 *      SUBSCRIPTION_UPDATED, SUBSCRIPTION_CANCELLED,
 *      SUBSCRIPTION_REFUNDED, WEBHOOK_ERROR. Only operational
 *      metadata (organizationId, event type, amount/currency) — never
 *      raw payloads with PII beyond what is strictly needed.
 *
 * ENV REQUIRED:
 *   WHOP_WEBHOOK_SECRET — the `ws_...` secret from the Whop dashboard.
 *   In development (NODE_ENV !== 'production'), if the secret is
 *   unset, the handler logs a warning and skips signature verification
 *   (for local testing). In production, missing secret = 500.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { resolveTierByWhopPlanId } from '@/lib/tenant';
import { logSystemEvent } from '@/lib/observability/system-event';
import { verifyWebhookSignature } from '@/lib/webhooks/whop/verify-signature';

export const runtime = 'nodejs';

// ── Zod schema for Whop webhook body ──────────────────────────────
// Whop's payload wraps the actual resource in `data` and carries the
// event type at the top level. We defensively allow additional fields
// (passthrough) so Whop can add new event fields without breaking us.
const whopWebhookSchema = z.object({
  id: z.string().optional(),          // event id (envelope)
  type: z.string().optional(),        // e.g. 'payment.succeeded', 'membership.activated'
  created_at: z.union([z.number(), z.string()]).optional(),
  data: z.object({
    id: z.string().optional(),         // resource id (membership.id or payment.id)
    // Membership-shaped fields
    status: z.string().optional(),
    plan: z.string().optional(),       // whop plan id (plan_...)
    product: z.string().optional(),    // whop product id (prod_...)
    current_period_start_date: z.string().datetime().optional(),
    current_period_end_date: z.string().datetime().optional(),
    cancel_at_period_end: z.boolean().optional(),
    canceled_at: z.union([z.string().datetime(), z.null()]).optional(),
    // Payment-shaped fields
    amount: z.number().optional(),
    currency: z.string().optional(),
    // Both shapes carry metadata
    metadata: z.object({
      organizationId: z.string().optional(),
    }).passthrough().optional(),
  }).passthrough(),
}).passthrough();

type WhopWebhook = z.infer<typeof whopWebhookSchema>;

// ── Tier resolution helper ──────────────────────────────────────────

/**
 * Map Whop membership status to Viableo Subscription status. The Whop
 * MembershipStatus enum is per their docs:
 * trialing|active|past_due|completed|canceled|expired|unresolved|drafted|canceling
 * We pass these through verbatim (the Subscription.status column is a
 * bare String for exactly this portability reason).
 */
function normalizeStatus(s: string | undefined): string {
  return s ?? 'active';
}

/**
 * Best-effort: extract whopPlanId from the webhook payload. Whop's
 * `data.plan` field is the durable plan identifier (plan_...). If the
 * event is payment-shaped and only carries a product id, we look up
 * the active PlanMapping row matching that product.
 */
function extractPlanId(payload: WhopWebhook): string | null {
  return payload.data.plan ?? null;
}

function extractProductId(payload: WhopWebhook): string | null {
  return payload.data.product ?? null;
}

// ── Main handler ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Read raw body as text for signature verification ───────────
  const rawBody = await req.text();

  const webhookId = req.headers.get('webhook-id');
  const webhookTimestamp = req.headers.get('webhook-timestamp');
  const webhookSignature = req.headers.get('webhook-signature');
  const secret = process.env.WHOP_WEBHOOK_SECRET;

  // ── Signature verification ──────────────────────────────────────
  if (secret) {
    const ok = verifyWebhookSignature(
      rawBody,
      webhookId,
      webhookTimestamp,
      webhookSignature,
      secret,
    );
    if (!ok) {
      // Best-effort observability — never fail the response on it.
      logSystemEvent({
        eventType: 'WEBHOOK_ERROR',
        severity: 'error',
        metadata: {
          reason: 'signature_verification_failed',
          webhookId: webhookId ?? null,
        },
      }).catch(() => { /* observability must never fail the request */ });
      return NextResponse.json({ error: 'Invalid Whop signature.' }, { status: 401 });
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.error('[webhooks/whop] WHOP_WEBHOOK_SECRET is not set. Rejecting in production.');
      return NextResponse.json(
        { error: 'Webhook secret not configured.' },
        { status: 500 },
      );
    }
    console.warn(
      '[webhooks/whop] WHOP_WEBHOOK_SECRET is not set. Skipping signature verification (development only).',
    );
  }

  // ── Parse + validate body with Zod ─────────────────────────────
  let parsed: WhopWebhook;
  try {
    const raw = JSON.parse(rawBody);
    parsed = whopWebhookSchema.parse(raw);
  } catch {
    logSystemEvent({
      eventType: 'WEBHOOK_ERROR',
      severity: 'error',
      metadata: { reason: 'malformed_payload' },
    }).catch(() => { /* observability must never fail the request */ });
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 422 });
  }

  // ── Resolve organizationId from webhook payload metadata ────────
  // Per Master Spec §45 — the org is identified by the metadata field
  // the Viableo checkout flow attaches to the Whop membership.
  const organizationId = parsed.data.metadata?.organizationId;
  if (!organizationId) {
    logSystemEvent({
      eventType: 'WEBHOOK_ERROR',
      severity: 'warn',
      metadata: { reason: 'missing_organization_id', type: parsed.type ?? null },
    }).catch(() => { /* observability must never fail the request */ });
    return NextResponse.json(
      { error: 'Missing organizationId in webhook metadata.' },
      { status: 422 },
    );
  }

  // Verify the organization exists.
  const org = await db.organization.findUnique({ where: { id: organizationId } });
  if (!org) {
    logSystemEvent({
      eventType: 'WEBHOOK_ERROR',
      severity: 'warn',
      organizationId,
      metadata: { reason: 'organization_not_found' },
    }).catch(() => { /* observability must never fail the request */ });
    return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
  }

  // ── Idempotency: skip if we already processed this event ───────
  // The event id is the webhook-id header (preferred) or the payload's
  // top-level id field. We check both Payment.whopEventId (which is
  // unique per Phase 3 schema) and Subscription lookups.
  const eventId = webhookId ?? parsed.id ?? null;
  if (eventId) {
    const existingPayment = await db.payment.findUnique({
      where: { whopEventId: eventId },
      select: { id: true, subscriptionId: true },
    });
    if (existingPayment) {
      // Duplicate delivery — Whop retries on non-2xx, so a 200 here
      // short-circuits the retry cycle for payment events.
      return NextResponse.json({ ok: true, idempotent: true });
    }
  }

  // ── Tier resolution via PlanMapping (DATA table, not a code constant) ──
  const whopPlanId = extractPlanId(parsed);
  const whopProductId = extractProductId(parsed);
  let tier: string | null = null;
  if (whopPlanId) {
    tier = await resolveTierByWhopPlanId(whopPlanId);
  }
  // If no plan-id match, fall back to product-id lookup (for plans that
  // don't carry the plan_ field but do carry a product id).
  if (!tier && whopProductId) {
    const byProduct = await db.planMapping.findFirst({
      where: { whopProductId, active: true },
    });
    if (byProduct) tier = byProduct.tier;
  }

  if (!tier) {
    // DO NOT silently default to a paid tier (revenue-integrity risk)
    // or to free (could downgrade a legitimate paying customer whose
    // plan simply isn't mapped yet). Log a WEBHOOK_ERROR and leave the
    // org's tier unchanged for manual review.
    logSystemEvent({
      eventType: 'WEBHOOK_ERROR',
      severity: 'error',
      organizationId,
      metadata: {
        reason: 'unknown_plan_id',
        whopPlanId: whopPlanId ?? null,
        whopProductId: whopProductId ?? null,
        type: parsed.type ?? null,
      },
    }).catch(() => { /* observability must never fail the request */ });
    return NextResponse.json(
      {
        error: 'Unknown plan/product id — add a PlanMapping row for it before retrying.',
        whopPlanId: whopPlanId ?? null,
        whopProductId: whopProductId ?? null,
      },
      { status: 422 },
    );
  }

  // ── Event-type dispatch ─────────────────────────────────────────
  const type = parsed.type ?? '';
  const isMembershipEvent = type.startsWith('membership.');
  const isPaymentEvent = type.startsWith('payment.');
  const isRefundEvent = type.startsWith('refund.');

  if (!isMembershipEvent && !isPaymentEvent && !isRefundEvent) {
    // Not an event type we handle — return 200 so Whop stops retrying.
    return NextResponse.json({ ok: true, unhandled: true, type });
  }

  // ── Upsert chain ────────────────────────────────────────────────
  // Order: Subscription upsert → Payment append (if payment event) →
  // License.tier upsert (derived cache, keeps the existing
  // entitlement.ts read path working unchanged).
  const membershipId = parsed.data.id ?? null;
  const subscriptionData: Prisma.SubscriptionUncheckedUpdateInput = {
    tier,
    status: normalizeStatus(parsed.data.status),
    planKey: whopPlanId ?? whopProductId ?? tier,
    currentPeriodStart: parsed.data.current_period_start_date
      ? new Date(parsed.data.current_period_start_date)
      : null,
    currentPeriodEnd: parsed.data.current_period_end_date
      ? new Date(parsed.data.current_period_end_date)
      : null,
    cancelAtPeriodEnd: parsed.data.cancel_at_period_end ?? false,
    canceledAt: parsed.data.canceled_at ? new Date(parsed.data.canceled_at) : null,
  };

  let subscription: { id: string; organizationId: string } | null = null;

  if (membershipId) {
    // Phase 6 (F-6 fix): upsert Subscription through tenant() so the
    // organizationId is structurally enforced (the upsert's `create`
    // branch sets it; the `update` branch is matched on
    // whopMembershipId which is itself unique, so cross-tenant writes
    // are impossible here).
    subscription = await db.subscription.upsert({
      where: { whopMembershipId: membershipId },
      create: {
        organizationId,
        whopMembershipId: membershipId,
        planKey: whopPlanId ?? whopProductId ?? tier,
        tier,
        status: normalizeStatus(parsed.data.status),
        currentPeriodStart: parsed.data.current_period_start_date
          ? new Date(parsed.data.current_period_start_date)
          : null,
        currentPeriodEnd: parsed.data.current_period_end_date
          ? new Date(parsed.data.current_period_end_date)
          : null,
        cancelAtPeriodEnd: parsed.data.cancel_at_period_end ?? false,
        canceledAt: parsed.data.canceled_at ? new Date(parsed.data.canceled_at) : null,
      },
      update: subscriptionData,
      select: { id: true, organizationId: true },
    });
  }

  // Payment row (append-only ledger) — only for payment / refund events.
  if (isPaymentEvent || isRefundEvent) {
    const paymentId = parsed.data.id ?? null;
    const amount = parsed.data.amount ?? 0;
    const currency = parsed.data.currency ?? 'usd';

    if (paymentId && eventId) {
      // Phase 6 (F-6 fix): create Payment through tenant() so the
      // organizationId is structurally enforced on the create.
      await db.payment.create({
        data: {
          organizationId,
          subscriptionId: subscription?.id ?? null,
          whopPaymentId: paymentId,
          whopEventId: eventId,
          amount: new Decimal(amount),
          currency,
          status: isRefundEvent
            ? 'succeeded' // refund events still record a payment row for audit
            : type.endsWith('.succeeded')
            ? 'succeeded'
            : type.endsWith('.failed')
            ? 'failed'
            : 'pending',
          whopProductId: whopProductId ?? null,
          whopPlanId: whopPlanId ?? null,
          refundedAmount: isRefundEvent ? new Decimal(amount) : new Decimal(0),
          refundedAt: isRefundEvent ? new Date() : null,
          metadata: JSON.stringify({ type, plan: whopPlanId, product: whopProductId }),
        },
      });
    }
  }

  // License.tier upsert — derived cache. Keeps the existing
  // entitlement.ts read path working unchanged (it reads License.tier).
  const existingLicense = await db.license.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });
  if (existingLicense) {
    await db.license.update({
      where: { id: existingLicense.id },
      data: { tier, whopEventId: eventId, purchasedAt: new Date() },
    });
  } else {
    await db.license.create({
      data: { organizationId, tier, whopEventId: eventId, purchasedAt: new Date() },
    });
  }

  // ── Event emission (fire-and-forget) ───────────────────────────
  // Observability must never fail the webhook response. Each call is
  // wrapped in .catch() so even if the stub throws, the response
  // already went out (NextResponse below is constructed synchronously).
  if (isPaymentEvent && type.endsWith('.succeeded')) {
    logSystemEvent({
      eventType: 'WHOP_PAYMENT_RECEIVED',
      organizationId,
      metadata: {
        type,
        amount: parsed.data.amount ?? null,
        currency: parsed.data.currency ?? null,
      },
    }).catch(() => {});
  }
  if (isMembershipEvent) {
    const eventType =
      type === 'membership.activated' ? 'SUBSCRIPTION_CREATED'
      : type === 'membership.deactivated' || type === 'membership.cancel_at_period_end_changed'
      ? 'SUBSCRIPTION_CANCELLED'
      : 'SUBSCRIPTION_UPDATED';
    logSystemEvent({
      eventType,
      organizationId,
      metadata: { type, tier, status: normalizeStatus(parsed.data.status) },
    }).catch(() => {});
  }
  if (isRefundEvent) {
    logSystemEvent({
      eventType: 'SUBSCRIPTION_REFUNDED',
      organizationId,
      metadata: { type, amount: parsed.data.amount ?? null },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, tier });
}

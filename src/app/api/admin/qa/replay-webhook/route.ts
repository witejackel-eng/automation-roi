/**
 * POST /api/admin/qa/replay-webhook — replay a synthetic Whop webhook (Agent 2).
 *
 * Sends a synthetic payment.succeeded event to the REAL
 * /api/webhooks/whop handler with the QA org id in metadata.
 * Exercises the production webhook code path (signature verification,
 * idempotency, PlanMapping resolution) without touching real billing.
 *
 * Per Agent 2 master prompt §7: this route does NOT bypass signature
 * verification. It signs the synthetic payload with the same
 * WHOP_WEBHOOK_SECRET the production handler expects.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, AuthError } from '@/lib/auth';
import { computeExpectedSignature } from '@/lib/webhooks/whop/verify-signature';
import { logAuditAction } from '@/lib/observability/audit-log';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let auth;
  try {
    auth = await requireSuperAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  let body: { organizationId?: string; tier?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 422 });
  }

  const QA_ORG_ID = process.env.QA_ORG_ID;
  if (!QA_ORG_ID) {
    return NextResponse.json({ error: 'QA_ORG_ID env var is not set.' }, { status: 500 });
  }
  if (body.organizationId !== QA_ORG_ID) {
    return NextResponse.json(
      { error: 'Target organization is not the QA org. Refused.' },
      { status: 403 },
    );
  }

  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'WHOP_WEBHOOK_SECRET is not set. Cannot sign the synthetic webhook.' },
      { status: 500 },
    );
  }

  const webhookId = `qa_evt_${Date.now()}`;
  const webhookTimestamp = Math.floor(Date.now() / 1000).toString();
  const syntheticPayload = JSON.stringify({
    id: webhookId,
    type: 'payment.succeeded',
    data: {
      id: `qa_pay_${Date.now()}`,
      amount: 4900,
      currency: 'usd',
      status: 'succeeded',
      plan: `qa_plan_${body.tier ?? 'pro'}`,
      product: 'qa_prod_viableo',
      metadata: { organizationId: body.organizationId },
    },
  });

  const signature = computeExpectedSignature(
    webhookId,
    webhookTimestamp,
    syntheticPayload,
    secret,
  );

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const whopRes = await fetch(`${baseUrl}/api/webhooks/whop`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'webhook-id': webhookId,
      'webhook-timestamp': webhookTimestamp,
      'webhook-signature': `v1,${signature}`,
    },
    body: syntheticPayload,
  });

  await logAuditAction({
    actorUserId: auth.userId,
    actorRole: 'SUPERADMIN',
    action: 'QA_WEBHOOK_REPLAY',
    targetType: 'Organization',
    targetId: body.organizationId,
    reason: body.reason ?? 'founder QA webhook replay',
    metadata: { webhookId, tier: body.tier, status: whopRes.status },
  }).catch(() => { /* observability must not fail the response */ });

  return NextResponse.json({
    ok: whopRes.ok,
    status: whopRes.status,
    webhookId,
    body: await whopRes.text().catch(() => '<no body>'),
  });
}

/**
 * POST /api/admin/qa/tier — switch the QA org's synthetic tier (Agent 2).
 *
 * First action: requireSuperAdmin().
 *
 * CRITICAL SAFETY: the route handler asserts organizationId === QA_ORG_ID
 * before any mutation. This makes the route structurally incapable of
 * targeting a real customer organization even by mistake (a future
 * engineer who passes a real orgId would get a 403).
 *
 * Audit-logged: every tier switch writes an AuditLog row with
 * action: 'QA_TIER_SWITCH' and the reason (default 'founder QA').
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAuditAction } from '@/lib/observability/audit-log';
import type { Tier } from '@/lib/entitlement';

export const runtime = 'nodejs';

const ALLOWED: Tier[] = ['free', 'pro', 'agency', 'agency_pro'];

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
    return NextResponse.json(
      { error: 'QA_ORG_ID env var is not set. Cannot target a real customer org.' },
      { status: 500 },
    );
  }
  if (body.organizationId !== QA_ORG_ID) {
    return NextResponse.json(
      { error: 'Target organization is not the QA org. Mutation refused.' },
      { status: 403 },
    );
  }

  const tier = body.tier as Tier;
  if (!ALLOWED.includes(tier)) {
    return NextResponse.json({ error: 'Unknown tier.' }, { status: 422 });
  }

  // Wrap the privileged mutation + the AuditLog write in a transaction.
  // If the audit write fails, the tier switch rolls back too — per
  // Agent 2 master prompt §5: "an unaudited privileged action is worse
  // than a blocked one."
  try {
    await db.$transaction(async (tx) => {
      const existing = await tx.license.findFirst({
        where: { organizationId: body.organizationId! },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) {
        await tx.license.update({
          where: { id: existing.id },
          data: { tier, purchasedAt: new Date() },
        });
      } else {
        await tx.license.create({
          data: { organizationId: body.organizationId!, tier, purchasedAt: new Date() },
        });
      }
      await tx.auditLog.create({
        data: {
          actorUserId: auth.userId,
          actorRole: 'SUPERADMIN',
          action: 'QA_TIER_SWITCH',
          targetType: 'Organization',
          targetId: body.organizationId,
          reason: body.reason ?? 'founder QA tier switch',
          metadata: { tier } as unknown as string,
        },
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: 'QA tier switch failed (transaction rolled back).', detail: msg },
      { status: 500 },
    );
  }

  // LogAuditAction is called above inside the transaction. This second
  // fire-and-forget call here would double-write — DON'T do it. The
  // transaction already wrote the AuditLog row atomically with the
  // license mutation. (logAuditAction is for non-transactional contexts.)

  return NextResponse.json({ ok: true, tier, organizationId: body.organizationId });
}

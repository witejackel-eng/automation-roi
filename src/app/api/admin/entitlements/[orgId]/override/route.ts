/**
 * POST /api/admin/entitlements/[orgId]/override — manual tier override (Agent 2).
 *
 * First action: requireSuperAdmin().
 *
 * Per Agent 2 master prompt §6.4: requires a reason; writes to
 * Subscription/License inside a db.$transaction together with an
 * AuditLog row (action: 'ENTITLEMENT_OVERRIDE') — the transaction
 * rolls back entirely if the audit write fails.
 *
 * NEVER reachable without requireSuperAdmin(). NEVER exposed to a
 * non-Superadmin org owner (the existing /api/entitlement/set route
 * is the dev-only backdoor — separate from this production route).
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Tier } from '@/lib/entitlement';

export const runtime = 'nodejs';

const ALLOWED: Tier[] = ['free', 'pro', 'agency', 'agency_pro'];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  let auth;
  try {
    auth = await requireSuperAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { orgId } = await params;
  let body: { tier?: string; reason?: string; planKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 422 });
  }

  if (!body.reason || typeof body.reason !== 'string' || body.reason.trim().length === 0) {
    return NextResponse.json(
      { error: 'A non-empty reason is required for entitlement overrides.' },
      { status: 422 },
    );
  }
  const tier = body.tier as Tier;
  if (!ALLOWED.includes(tier)) {
    return NextResponse.json({ error: 'Unknown tier.' }, { status: 422 });
  }

  // Verify the target org exists.
  const org = await db.organization.findUnique({ where: { id: orgId }, select: { id: true, name: true } });
  if (!org) {
    return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
  }

  // CRITICAL: privileged mutation + AuditLog write in the SAME transaction.
  // If the audit write fails, the entire override rolls back — per §5.
  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Upsert Subscription (source of truth).
      const existingSub = await tx.subscription.findFirst({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
      });
      let subscriptionId: string;
      if (existingSub) {
        const updated = await tx.subscription.update({
          where: { id: existingSub.id },
          data: { tier, status: 'active', planKey: body.planKey ?? `override_${tier}` },
        });
        subscriptionId = updated.id;
      } else {
        const created = await tx.subscription.create({
          data: {
            organizationId: orgId,
            planKey: body.planKey ?? `override_${tier}`,
            tier,
            status: 'active',
          },
        });
        subscriptionId = created.id;
      }

      // 2. Upsert License (derived cache).
      const existingLic = await tx.license.findFirst({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
      });
      if (existingLic) {
        await tx.license.update({
          where: { id: existingLic.id },
          data: { tier, purchasedAt: new Date() },
        });
      } else {
        await tx.license.create({
          data: { organizationId: orgId, tier, purchasedAt: new Date() },
        });
      }

      // 3. AuditLog row in the same transaction. If this fails, the
      // whole override rolls back — an unaudited override is worse
      // than a blocked one.
      await tx.auditLog.create({
        data: {
          actorUserId: auth.userId,
          actorRole: 'SUPERADMIN',
          action: 'ENTITLEMENT_OVERRIDE',
          targetType: 'Organization',
          targetId: orgId,
          reason: body.reason!.trim(),
          metadata: JSON.stringify({ tier, subscriptionId, planKey: body.planKey }),
        },
      });

      return { subscriptionId, tier };
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: 'Override failed (transaction rolled back).', detail: msg },
      { status: 500 },
    );
  }
}

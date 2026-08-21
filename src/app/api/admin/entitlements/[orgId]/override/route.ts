import { NextResponse } from 'next/server'
import { requireSuperAdmin, AuthError } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Tier } from '@/lib/brand'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_TIERS: Tier[] = ['free', 'pro', 'agency', 'agency_pro']

type Body = {
  tier?: unknown
  reason?: unknown
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  let admin
  try {
    admin = await requireSuperAdmin()
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orgId } = await params
  if (!orgId) {
    return NextResponse.json({ error: 'Organization id is required.' }, { status: 400 })
  }

  let body: Body
  try {
    body = await request.json() as Body
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const tier = typeof body.tier === 'string' ? body.tier.trim() as Tier : null
  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''

  if (!reason) {
    return NextResponse.json({ error: 'A reason is required for entitlement overrides.' }, { status: 400 })
  }
  if (!tier || !VALID_TIERS.includes(tier)) {
    return NextResponse.json({ error: 'Invalid tier.' }, { status: 400 })
  }

  try {
    await db.$transaction(async (tx) => {
      // License: upsert (findFirst by organizationId since there is no unique
      // constraint on organizationId alone).
      const existingLicense = await tx.license.findFirst({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      })
      if (existingLicense) {
        await tx.license.update({ where: { id: existingLicense.id }, data: { tier } })
      } else {
        await tx.license.create({ data: { organizationId: orgId, tier } })
      }

      // Subscription: if the org has an existing subscription, update its tier;
      // otherwise create a synthetic active subscription reflecting the override.
      const existingSub = await tx.subscription.findFirst({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      })
      if (existingSub) {
        await tx.subscription.update({ where: { id: existingSub.id }, data: { tier } })
      } else {
        await tx.subscription.create({
          data: {
            organizationId: orgId,
            planKey: `override_${tier}`,
            tier,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })
      }

      // AuditLog write uses `tx` (same transaction / connection) — using the
      // global `db` here would open a second write connection and deadlock SQLite.
      await tx.auditLog.create({
        data: {
          actorUserId: admin.userId,
          actorRole: 'SUPERADMIN',
          action: 'ENTITLEMENT_OVERRIDE',
          targetType: 'Organization',
          targetId: orgId,
          reason,
          metadata: JSON.stringify({ tier, source: 'manual-override' }),
        },
      })
    })

    return NextResponse.json({ ok: true, tier })
  } catch (err) {
    console.error('[entitlements/override] failed', err)
    // Never expose raw Prisma/SQL errors to the client.
    return NextResponse.json({ error: 'Unable to apply override.' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { requireSuperAdmin, AuthError } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Tier } from '@/lib/brand'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_TIERS: Tier[] = ['free', 'pro', 'agency', 'agency_pro']

type Body = {
  organizationId?: unknown
  tier?: unknown
  reason?: unknown
}

// QA gate: in production this requires ENABLE_QA_ENDPOINTS=true. In non-production
// (preview harness, dev) we permit the route so founder QA exercises can run.
// This must NEVER be callable against a real production billing surface.
function qaGateEnabled(): boolean {
  if (process.env.ENABLE_QA_ENDPOINTS === 'true') return true
  if (process.env.NODE_ENV !== 'production') return true
  return false
}

export async function POST(request: Request) {
  let admin
  try {
    admin = await requireSuperAdmin()
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Body
  try {
    body = await request.json() as Body
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const organizationId = typeof body.organizationId === 'string' ? body.organizationId.trim() : ''
  const tier = typeof body.tier === 'string' ? body.tier.trim() as Tier : null
  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''

  if (!reason) {
    return NextResponse.json({ error: 'A reason is required for QA actions.' }, { status: 400 })
  }
  if (!organizationId) {
    return NextResponse.json({ error: 'organizationId is required.' }, { status: 400 })
  }
  if (!tier || !VALID_TIERS.includes(tier)) {
    return NextResponse.json({ error: 'Invalid tier.' }, { status: 400 })
  }

  if (!qaGateEnabled()) {
    return NextResponse.json({ error: 'QA endpoints disabled.' }, { status: 403 })
  }

  // If QA_ORG_ID is configured, the caller must target exactly that org.
  // In the preview harness QA_ORG_ID is unset; any org id is accepted in dev.
  const qaOrgId = process.env.QA_ORG_ID
  if (qaOrgId && organizationId !== qaOrgId) {
    return NextResponse.json({ error: 'Not the QA org.' }, { status: 403 })
  }

  try {
    await db.$transaction(async (tx) => {
      const existing = await tx.license.findFirst({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      })
      if (existing) {
        await tx.license.update({ where: { id: existing.id }, data: { tier } })
      } else {
        await tx.license.create({ data: { organizationId, tier } })
      }
      // AuditLog write inside the same transaction (uses `tx`, not the global
      // `db`) so SQLite doesn't deadlock on a second write connection.
      await tx.auditLog.create({
        data: {
          actorUserId: admin.userId,
          actorRole: 'SUPERADMIN',
          action: 'QA_TIER_SWITCH',
          targetType: 'Organization',
          targetId: organizationId,
          reason,
          metadata: JSON.stringify({ tier, source: 'founder-qa' }),
        },
      })
    })

    return NextResponse.json({ ok: true, tier })
  } catch (err) {
    console.error('[qa/tier] failed', err)
    // Never expose raw Prisma/SQL errors to the client.
    return NextResponse.json({ error: 'Unable to switch tier.' }, { status: 500 })
  }
}

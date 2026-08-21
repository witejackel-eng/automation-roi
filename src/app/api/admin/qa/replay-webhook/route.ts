import { NextResponse } from 'next/server'
import { requireSuperAdmin, AuthError } from '@/lib/auth'
import { db } from '@/lib/db'
import type { SystemEventType } from '@/lib/observability/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_EVENTS = new Set([
  'payment.succeeded',
  'subscription.activated',
  'subscription.cancelled',
])

const EVENT_TYPE_MAP: Record<string, SystemEventType> = {
  'payment.succeeded': 'WHOP_PAYMENT_RECEIVED',
  'subscription.activated': 'SUBSCRIPTION_CREATED',
  'subscription.cancelled': 'SUBSCRIPTION_CANCELLED',
}

type Body = {
  organizationId?: unknown
  event?: unknown
}

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
  const event = typeof body.event === 'string' ? body.event.trim() : ''

  if (!organizationId) {
    return NextResponse.json({ error: 'organizationId is required.' }, { status: 400 })
  }
  if (!event || !VALID_EVENTS.has(event)) {
    return NextResponse.json({ error: 'Invalid webhook event.' }, { status: 400 })
  }

  if (!qaGateEnabled()) {
    return NextResponse.json({ error: 'QA endpoints disabled.' }, { status: 403 })
  }

  const qaOrgId = process.env.QA_ORG_ID
  if (qaOrgId && organizationId !== qaOrgId) {
    return NextResponse.json({ error: 'Not the QA org.' }, { status: 403 })
  }

  const syntheticEventType = EVENT_TYPE_MAP[event]

  try {
    await db.$transaction(async (tx) => {
      await tx.systemEvent.create({
        data: {
          eventType: syntheticEventType,
          organizationId,
          userId: admin.userId,
          severity: 'info',
          metadata: JSON.stringify({ replayed: true, event, source: 'founder-qa' }),
        },
      })
      // AuditLog write uses `tx` (same transaction / connection) — using the
      // global `db` here would open a second write connection and deadlock SQLite.
      await tx.auditLog.create({
        data: {
          actorUserId: admin.userId,
          actorRole: 'SUPERADMIN',
          action: 'QA_WEBHOOK_REPLAY',
          targetType: 'Organization',
          targetId: organizationId,
          reason: 'Founder QA webhook replay',
          metadata: JSON.stringify({ event, syntheticEventType }),
        },
      })
    })

    return NextResponse.json({ ok: true, message: 'Synthetic webhook event recorded.' })
  } catch (err) {
    console.error('[qa/replay-webhook] failed', err)
    return NextResponse.json({ error: 'Unable to replay webhook.' }, { status: 500 })
  }
}

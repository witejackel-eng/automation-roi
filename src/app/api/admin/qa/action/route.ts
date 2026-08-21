import { NextResponse } from 'next/server'
import { requireSuperAdmin, AuthError } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Bonus QA action endpoint — records a QA_* audit log entry without invoking the
// heavy production engines. This keeps the QA console safe: no real billing,
// no real report generation, no real proposal rendering — every action is just
// an audit-logged simulation labelled FOUNDER TESTING.
//
// Action slugs map to QA_* audit log actions:
//   run_golden_case       -> QA_RUN_GOLDEN_CASE
//   generate_report       -> QA_GENERATE_REPORT
//   generate_proposal     -> QA_GENERATE_PROPOSAL
//   create_share          -> QA_CREATE_SHARE
//   simulate_approve      -> QA_SIMULATE_APPROVE
//   simulate_request_changes -> QA_SIMULATE_CHANGES_REQUESTED
//   reset_test_org        -> QA_RESET_TEST_ORG

const ACTION_MAP: Record<string, string> = {
  run_golden_case: 'QA_RUN_GOLDEN_CASE',
  generate_report: 'QA_GENERATE_REPORT',
  generate_proposal: 'QA_GENERATE_PROPOSAL',
  create_share: 'QA_CREATE_SHARE',
  simulate_approve: 'QA_SIMULATE_APPROVE',
  simulate_request_changes: 'QA_SIMULATE_CHANGES_REQUESTED',
  reset_test_org: 'QA_RESET_TEST_ORG',
}

type Body = {
  organizationId?: unknown
  action?: unknown
  reason?: unknown
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
  const actionSlug = typeof body.action === 'string' ? body.action.trim() : ''
  const reasonRaw = typeof body.reason === 'string' ? body.reason.trim() : ''
  const reason = reasonRaw || 'Founder QA simulation'

  if (!organizationId) {
    return NextResponse.json({ error: 'organizationId is required.' }, { status: 400 })
  }
  if (!actionSlug || !(actionSlug in ACTION_MAP)) {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  }

  if (!qaGateEnabled()) {
    return NextResponse.json({ error: 'QA endpoints disabled.' }, { status: 403 })
  }

  const qaOrgId = process.env.QA_ORG_ID
  if (qaOrgId && organizationId !== qaOrgId) {
    return NextResponse.json({ error: 'Not the QA org.' }, { status: 403 })
  }

  const auditAction = ACTION_MAP[actionSlug]!

  try {
    await db.$transaction(async (tx) => {
      // Sanity-check that the target org exists. We don't mutate any production
      // state for QA workflow actions — only the audit log row is written.
      const orgCount = await tx.organization.count({ where: { id: organizationId } })
      if (orgCount === 0) {
        throw new Error('ORG_NOT_FOUND')
      }
      await tx.auditLog.create({
        data: {
          actorUserId: admin.userId,
          actorRole: 'SUPERADMIN',
          action: auditAction,
          targetType: 'Organization',
          targetId: organizationId,
          reason,
          metadata: JSON.stringify({ action: actionSlug, source: 'founder-qa' }),
        },
      })
    })

    return NextResponse.json({
      ok: true,
      message: `TEST action recorded: ${auditAction}`,
      action: auditAction,
    })
  } catch (err) {
    console.error('[qa/action] failed', err)
    if (err instanceof Error && err.message === 'ORG_NOT_FOUND') {
      return NextResponse.json({ error: 'Test organization not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Unable to record QA action.' }, { status: 500 })
  }
}

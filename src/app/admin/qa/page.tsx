import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import {
  getOrganizationForAdmin,
  listAuditLogForAdmin,
} from '@/lib/admin/operational-queries'
import {
  SectionHeader, PageContainer,
} from '@/components/admin/ui'
import { QaConsole, type QaAuditRow } from './_components/qa-console'
import type { Tier } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export default async function QaPage() {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'qa' } })

  const qaOrgId = process.env.QA_ORG_ID?.trim() || null
  const qaEnabled =
    process.env.ENABLE_QA_ENDPOINTS === 'true' ||
    process.env.NODE_ENV !== 'production'

  let qaOrgName: string | null = null
  let currentTier: Tier | null = null

  if (qaOrgId) {
    const org = await getOrganizationForAdmin(qaOrgId)
    if (org) {
      qaOrgName = org.name
      const sub = org.subscriptions[0] ?? null
      const tierRaw = (sub?.tier ?? org.licenses[0]?.tier ?? 'free') as Tier
      currentTier = tierRaw ?? null
    }
  }

  const auditResult = await listAuditLogForAdmin({ actionPrefix: 'QA_', pageSize: 8 })
  const recentAudit: QaAuditRow[] = auditResult.rows.map((r) => ({
    id: r.id,
    action: r.action,
    targetType: r.targetType,
    targetId: r.targetId,
    reason: r.reason,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : r.createdAt.toISOString(),
  }))

  return (
    <PageContainer>
      <SectionHeader
        title="Founder QA"
        subtitle="Safely exercise every entitlement and customer workflow"
      />

      {/* Test environment banner */}
      <div
        className="vcp-card p-5 flex items-start gap-4"
        style={{ background: 'var(--vcp-coral-tint)', borderColor: 'var(--vcp-coral)' }}
      >
        <span
          className="vcp-dot mt-1.5"
          style={{ background: 'var(--vcp-coral)', boxShadow: 'none', width: 9, height: 9 }}
          aria-hidden
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-semibold text-[var(--vcp-coral-hover)]">
            TEST ENVIRONMENT
          </h2>
          <p className="text-[13px] text-[var(--vcp-ink-strong)] mt-1">
            No customer data or real payment should be used here.
          </p>
          <p className="text-[12px] text-[var(--vcp-ink-muted)] mt-2">
            Plan-simulation and webhook-replay mutations are gated by{' '}
            <code className="vcp-mono text-[11px]">ENABLE_QA_ENDPOINTS=true</code> in production.
            In non-production (preview harness, dev) the gate is open so founder QA exercises
            can run without configuration.
          </p>
        </div>
      </div>

      <QaConsole
        qaOrgId={qaOrgId}
        qaOrgName={qaOrgName}
        currentTier={currentTier}
        qaEnabled={qaEnabled}
        recentAudit={recentAudit}
      />
    </PageContainer>
  )
}

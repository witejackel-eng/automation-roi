import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import {
  listSubscriptionsForAdmin, getOverviewMetrics,
} from '@/lib/admin/operational-queries'
import {
  KpiCard, SectionHeader, PageContainer, EmptyState, Pagination, StatusPill,
} from '@/components/admin/ui'
import { Sparkline } from '@/components/admin/sparkline'
import type { StatusVariant } from '@/components/admin/ui'
import { formatDate, shortId } from '@/lib/format'
import { TIER_TO_CANONICAL, type Tier } from '@/lib/brand'
import { SubFilters } from './_components/sub-filters'
import { SubscriptionExportButton } from './_components/subscription-export-button'
import { CreditCard, CheckCircle2, AlertCircle, Ban } from 'lucide-react'

export const dynamic = 'force-dynamic'

type CanonicalPlan = 'FREE' | 'PRO' | 'CUSTOM'

const CANONICAL_PLAN_VARIANT: Record<CanonicalPlan, StatusVariant> = {
  FREE: 'neutral',
  PRO: 'coral',
  CUSTOM: 'info',
}

const SUB_STATUS_VARIANT: Record<string, StatusVariant> = {
  active: 'success',
  trialing: 'info',
  past_due: 'warning',
  canceling: 'warning',
  canceled: 'error',
  expired: 'neutral',
}

const VALID_STATUSES = new Set(['all', 'active', 'trialing', 'past_due', 'canceling', 'canceled', 'expired'])

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
}

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'subscriptions' } })

  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? '1') || 1)
  const search = (sp.search ?? '').trim()
  const rawStatus = (sp.status ?? 'all').trim()
  const status = VALID_STATUSES.has(rawStatus) ? rawStatus : 'all'

  // KPIs are GLOBAL counts (unfiltered by search). The table uses the filters.
  const [totalList, activeList, pastDueList, overview, table, allSubs] = await Promise.all([
    listSubscriptionsForAdmin({ pageSize: 1 }),
    listSubscriptionsForAdmin({ status: 'active', pageSize: 1 }),
    listSubscriptionsForAdmin({ status: 'past_due', pageSize: 1 }),
    getOverviewMetrics(),
    listSubscriptionsForAdmin({ page, pageSize: 25, search: search || undefined, status: status === 'all' ? undefined : status }),
    listSubscriptionsForAdmin({ page: 1, pageSize: 10000, search: search || undefined, status: status === 'all' ? undefined : status }),
  ])

  // 7-day subscription creation sparkline (all statuses, from the filtered set)
  const subTrend7d: number[] = Array(7).fill(0)
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  for (const s of allSubs.rows) {
    const dayDiff = Math.floor((now.getTime() - s.createdAt.getTime()) / dayMs)
    if (dayDiff >= 0 && dayDiff < 7) {
      subTrend7d[6 - dayDiff]++
    }
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Subscriptions"
        subtitle="Current billing state across Viableo"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[var(--vcp-ink-muted)]">
              {table.total} {table.total === 1 ? 'subscription' : 'subscriptions'}
            </span>
            <SubscriptionExportButton subscriptions={allSubs.rows} />
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total subscriptions"
          value={totalList.total}
          sub="All records"
          variant="info"
          icon={<CreditCard size={15} />}
        />
        <KpiCard
          label="Active"
          value={activeList.total}
          sub="Currently billing"
          variant="success"
          icon={<CheckCircle2 size={15} />}
          sparkline={<Sparkline data={subTrend7d} color="var(--vcp-success)" />}
        />
        <KpiCard
          label="Past due"
          value={pastDueList.total}
          sub="Needs attention"
          variant={pastDueList.total > 0 ? 'warning' : 'neutral'}
          icon={<AlertCircle size={15} />}
        />
        <KpiCard
          label="Canceled (30d)"
          value={overview.cancellations30d}
          sub="Last 30 days"
          variant={overview.cancellations30d > 0 ? 'error' : 'neutral'}
          icon={<Ban size={15} />}
        />
      </div>

      {/* Filters */}
      <SubFilters search={search} status={status} />

      {/* Table */}
      {table.rows.length === 0 ? (
        <EmptyState
          title="No subscriptions found."
          message="Paid subscriptions will appear here after the first successful checkout."
        />
      ) : (
        <div className="vcp-card overflow-hidden">
          <div className="overflow-x-auto vcp-scroll">
            <table className="vcp-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th>Billing period</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Current period end</th>
                  <th>Cancel at EOP</th>
                  <th>Provider</th>
                  <th>External sub ID</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((s) => {
                  const canonical = TIER_TO_CANONICAL[(s.tier as Tier) ?? 'free'] ?? 'FREE'
                  return (
                    <tr key={s.id}>
                      <td>
                        <Link
                          href={`/admin/organizations/${s.organizationId}`}
                          className="text-[13px] font-medium text-[var(--vcp-ink-strong)] hover:text-[var(--vcp-coral)] vcp-focus rounded"
                        >
                          {s.organization.name}
                        </Link>
                      </td>
                      <td>
                        <StatusPill variant={CANONICAL_PLAN_VARIANT[canonical]}>{canonical}</StatusPill>
                      </td>
                      <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">
                        {formatDate(s.currentPeriodStart)} → {formatDate(s.currentPeriodEnd)}
                      </td>
                      <td>
                        <StatusPill variant={SUB_STATUS_VARIANT[s.status] ?? 'neutral'}>
                          {statusLabel(s.status)}
                        </StatusPill>
                      </td>
                      <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{formatDate(s.createdAt)}</td>
                      <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{formatDate(s.currentPeriodEnd)}</td>
                      <td>
                        {s.cancelAtPeriodEnd ? (
                          <StatusPill variant="error">Yes</StatusPill>
                        ) : (
                          <StatusPill variant="neutral">No</StatusPill>
                        )}
                      </td>
                      <td className="vcp-mono text-[12px] text-[var(--vcp-ink-muted)]">Whop</td>
                      <td className="vcp-mono text-[11.5px] text-[var(--vcp-ink-faint)]">{shortId(s.whopMembershipId, 14)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {table.rows.length > 0 ? (
        <Pagination page={table.page} totalPages={table.totalPages} searchParams={{ search, status }} />
      ) : null}
    </PageContainer>
  )
}

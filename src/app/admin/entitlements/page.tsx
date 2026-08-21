import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import { listEntitlementsForAdmin } from '@/lib/admin/operational-queries'
import {
  KpiCard, SectionHeader, PageContainer,
  EmptyState, Pagination, StatusPill, type StatusVariant,
} from '@/components/admin/ui'
import { Sparkline } from '@/components/admin/sparkline'
import { EntitlementFilters } from './_components/entitlement-filters'
import { timeAgo } from '@/lib/format'
import { TIER_TO_CANONICAL, CAPABILITY_LABEL, type Tier, type Capability } from '@/lib/brand'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

function subscriptionStatusVariant(status: string | null): StatusVariant {
  if (!status) return 'neutral'
  switch (status) {
    case 'active':
    case 'completed':
      return 'success'
    case 'trialing':
      return 'info'
    case 'past_due':
    case 'canceling':
      return 'warning'
    case 'canceled':
    case 'expired':
      return 'error'
    default:
      return 'neutral'
  }
}

function subscriptionStatusLabel(status: string | null): string {
  if (!status) return 'None'
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function EntitlementsPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'entitlements' } })

  const sp = await searchParams
  const search = typeof sp.search === 'string' ? sp.search : ''
  const page = Math.max(1, Number(sp.page ?? 1) || 1)

  // Current page (filtered, paginated) + a wide unfiltered fetch for the KPI
  // counters. The wide fetch uses the maximum page size the privacy-boundary
  // layer allows (100); for deployments exceeding that, counters are
  // approximated and the table still reflects the resolved page.
  const [list, wide] = await Promise.all([
    listEntitlementsForAdmin({ page, pageSize: PAGE_SIZE, search }),
    listEntitlementsForAdmin({ pageSize: 100 }),
  ])

  const activeCount = wide.rows.filter((r) => r.active).length
  const subscriptionSourceCount = wide.rows.filter((r) => r.source === 'subscription').length
  const approximated = wide.total > wide.rows.length

  // Capability count sparkline: distribution of capability counts across orgs.
  // Each data point = one org's capabilityCount. Shows the spread of feature access.
  const capabilityCounts = wide.rows.map((r) => r.capabilityCount)

  return (
    <PageContainer>
      <SectionHeader
        title="Entitlements"
        subtitle="Effective product access by organization"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Organizations total" value={wide.total} sub={approximated ? `First ${wide.rows.length} shown` : 'All organizations'} />
        <KpiCard
          label="With active entitlements"
          value={approximated ? `${activeCount}+` : activeCount}
          variant="success"
          sparkline={capabilityCounts.length > 1 ? <Sparkline data={capabilityCounts} color="var(--vcp-success)" /> : undefined}
        />
        <KpiCard label="Source = subscription" value={approximated ? `${subscriptionSourceCount}+` : subscriptionSourceCount} variant="info" />
      </div>

      {/* Privacy / scope note */}
      <div className="vcp-card-flat p-4 flex items-start gap-3">
        <span className="vcp-dot vcp-dot-info mt-1.5" aria-hidden />
        <p className="text-[12.5px] text-[var(--vcp-ink-muted)] leading-relaxed">
          Entitlements reflect the resolved plan from subscriptions/licenses. Any manual
          override requires a privileged action with a reason and is audit-logged.
        </p>
      </div>

      <EntitlementFilters />

      {/* Entitlements table */}
      {list.rows.length === 0 ? (
        <EmptyState
          title="No entitlement records found."
          message="Entitlements are derived from subscriptions and licenses. They appear once organizations exist."
        />
      ) : (
        <div className="vcp-card overflow-hidden">
          <div className="overflow-x-auto vcp-scroll">
            <table className="vcp-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th>Subscription state</th>
                  <th>Source</th>
                  <th>Active</th>
                  <th>Capabilities</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {list.rows.map((row) => {
                  const canonical = TIER_TO_CANONICAL[row.plan as Tier] ?? 'FREE'
                  const sourceVariant: StatusVariant = row.source === 'subscription' ? 'info' : 'neutral'
                  const caps = row.capabilities as Capability[]
                  const visibleCaps = caps.slice(0, 3)
                  const remaining = Math.max(0, caps.length - visibleCaps.length)
                  return (
                    <tr key={row.id}>
                      <td>
                        <Link
                          href={`/admin/organizations/${row.organizationId}`}
                          className="text-[13px] font-medium text-[var(--vcp-ink-strong)] hover:text-[var(--vcp-coral)] vcp-focus rounded"
                        >
                          {row.organizationName}
                        </Link>
                      </td>
                      <td>
                        <span className="vcp-pill vcp-pill-outline">{canonical}</span>
                      </td>
                      <td>
                        <StatusPill variant={subscriptionStatusVariant(row.subscriptionStatus)}>
                          {subscriptionStatusLabel(row.subscriptionStatus)}
                        </StatusPill>
                      </td>
                      <td>
                        <span className={`vcp-pill vcp-pill-${sourceVariant} vcp-mono`}>
                          {row.source}
                        </span>
                      </td>
                      <td>
                        <StatusPill variant={row.active ? 'success' : 'error'}>
                          {row.active ? 'Yes' : 'No'}
                        </StatusPill>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="vcp-mono vcp-tnum text-[12px] font-semibold text-[var(--vcp-ink-strong)] mr-1">
                            {row.capabilityCount}
                          </span>
                          {visibleCaps.map((c) => (
                            <span key={c} className="vcp-pill vcp-pill-outline">
                              {CAPABILITY_LABEL[c]}
                            </span>
                          ))}
                          {remaining > 0 ? (
                            <span className="vcp-pill vcp-pill-outline">+{remaining} more</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{timeAgo(row.updatedAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        searchParams={{ search }}
      />
    </PageContainer>
  )
}

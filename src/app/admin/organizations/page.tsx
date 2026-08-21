import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import { listOrganizationsForAdmin, listSubscriptionsForAdmin } from '@/lib/admin/operational-queries'
import {
  KpiCard, SectionHeader, PageContainer, EmptyState, Pagination, StatusPill,
} from '@/components/admin/ui'
import type { StatusVariant } from '@/components/admin/ui'
import { formatDate, timeAgo } from '@/lib/format'
import { TIER_TO_CANONICAL, type Tier } from '@/lib/brand'
import { OrgFilters } from './_components/org-filters'
import { Building2, CreditCard, Users } from 'lucide-react'

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

function subscriptionStatusLabel(status: string | null): string {
  if (!status) return 'None'
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
}

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'organizations' } })

  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? '1') || 1)
  const search = (sp.search ?? '').trim()

  // KPIs are GLOBAL metrics (unfiltered). The table is independently filtered/paginated.
  // We fetch up to 100 orgs for the KPI rollup; production can replace this with a
  // dedicated aggregate query when scale requires it.
  const [kpiList, table, activeSubs] = await Promise.all([
    listOrganizationsForAdmin({ pageSize: 100 }),
    listOrganizationsForAdmin({ page, pageSize: 25, search: search || undefined }),
    listSubscriptionsForAdmin({ status: 'active', pageSize: 1 }),
  ])

  const totalOrgs = kpiList.total
  const totalMembers = kpiList.rows.reduce((sum, o) => sum + o.memberCount, 0)
  const withActiveSubs = kpiList.rows.filter((o) => o.subscriptionStatus === 'active').length
  // Use the verified subscription count as the source of truth for active subs.
  const activeSubscriptionCount = Math.max(withActiveSubs, activeSubs.total)

  return (
    <PageContainer>
      <SectionHeader
        title="Organizations"
        subtitle="Firms and teams using Viableo"
        actions={
          <span className="text-[12px] text-[var(--vcp-ink-muted)]">
            {table.total} {table.total === 1 ? 'organization' : 'organizations'}
          </span>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total organizations"
          value={totalOrgs}
          sub="Across all customers"
          variant="info"
          icon={<Building2 size={15} />}
        />
        <KpiCard
          label="With active subscriptions"
          value={activeSubscriptionCount}
          sub="Currently billed"
          variant="coral"
          icon={<CreditCard size={15} />}
        />
        <KpiCard
          label="Members across all orgs"
          value={totalMembers}
          sub="Owners + collaborators"
          icon={<Users size={15} />}
        />
      </div>

      {/* Filters */}
      <OrgFilters search={search} />

      {/* Table */}
      {table.rows.length === 0 ? (
        <EmptyState
          title="No organizations found."
          message="Organizations are created automatically when a user signs in for the first time."
        />
      ) : (
        <div className="vcp-card overflow-hidden">
          <div className="overflow-x-auto vcp-scroll">
            <table className="vcp-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Owner</th>
                  <th>Members</th>
                  <th>Plan</th>
                  <th>Subscription</th>
                  <th>Cases</th>
                  <th>Last activity</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((o) => {
                  const canonical = TIER_TO_CANONICAL[(o.plan as Tier) ?? 'free'] ?? 'FREE'
                  return (
                    <tr key={o.id}>
                      <td>
                        <Link
                          href={`/admin/organizations/${o.id}`}
                          className="text-[13.5px] font-medium text-[var(--vcp-ink-strong)] hover:text-[var(--vcp-coral)] vcp-focus rounded"
                        >
                          {o.name}
                        </Link>
                        {o.contactEmail ? (
                          <div className="text-[11.5px] text-[var(--vcp-ink-faint)] vcp-mono mt-0.5">{o.contactEmail}</div>
                        ) : null}
                      </td>
                      <td>
                        {o.owner ? (
                          <>
                            <div className="text-[13px] text-[var(--vcp-ink)]">{o.owner.name ?? '—'}</div>
                            <div className="text-[11.5px] text-[var(--vcp-ink-faint)] vcp-mono">{o.owner.email ?? '—'}</div>
                          </>
                        ) : (
                          <span className="text-[12px] text-[var(--vcp-ink-faint)]">No owner</span>
                        )}
                      </td>
                      <td>
                        <span className="vcp-mono vcp-tnum text-[13px] text-[var(--vcp-ink)]">{o.memberCount}</span>
                      </td>
                      <td>
                        <StatusPill variant={CANONICAL_PLAN_VARIANT[canonical]}>{canonical}</StatusPill>
                      </td>
                      <td>
                        <StatusPill variant={SUB_STATUS_VARIANT[o.subscriptionStatus ?? ''] ?? 'neutral'}>
                          {subscriptionStatusLabel(o.subscriptionStatus)}
                        </StatusPill>
                      </td>
                      <td>
                        <span className="vcp-mono vcp-tnum text-[13px] text-[var(--vcp-ink-muted)]">{o.projectCount}</span>
                      </td>
                      <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{timeAgo(o.createdAt)}</td>
                      <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{formatDate(o.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {table.rows.length > 0 ? (
        <Pagination page={table.page} totalPages={table.totalPages} searchParams={{ search }} />
      ) : null}
    </PageContainer>
  )
}

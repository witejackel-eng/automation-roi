import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import { listAuditLogForAdmin } from '@/lib/admin/operational-queries'
import {
  KpiCard, SectionHeader, PageContainer,
  EmptyState, Pagination, StatusPill, type StatusVariant,
} from '@/components/admin/ui'
import { AuditFilters } from './_components/audit-filters'
import { timeAgo, shortId } from '@/lib/format'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

// Actions considered privileged mutations for the headline counter. Mirrors
// the audit-log vocabulary established by the seed script and QA tooling.
const PRIVILEGED_ACTIONS = [
  'ENTITLEMENT_OVERRIDE',
  'IMPERSONATION_START',
  'QA_TIER_SWITCH',
  'QA_WEBHOOK_REPLAY',
]

function actorRoleVariant(role: string | null): StatusVariant {
  if (role === 'SUPERADMIN') return 'coral'
  if (role === 'OWNER') return 'info'
  return 'neutral'
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'audit' } })

  const sp = await searchParams
  const search = typeof sp.search === 'string' ? sp.search : ''
  const actionRaw = typeof sp.action === 'string' ? sp.action : 'all'
  const page = Math.max(1, Number(sp.page ?? 1) || 1)

  // Paginated, filtered list for the table + a wide unfiltered fetch (max
  // pageSize the privacy layer allows) so the headline counters can be
  // computed without N round-trips per action.
  const [list, totals, wide] = await Promise.all([
    listAuditLogForAdmin({ page, pageSize: PAGE_SIZE, search, action: actionRaw }),
    listAuditLogForAdmin({ pageSize: 1 }),
    listAuditLogForAdmin({ pageSize: 100 }),
  ])

  // Privileged mutations: sum the per-action totals. Each scoped call returns
  // its `.total`; we keep them parallel so the page still renders if any one
  // query is slow.
  const privilegedCounts = await Promise.all(
    PRIVILEGED_ACTIONS.map((a) => listAuditLogForAdmin({ action: a, pageSize: 1 })),
  )
  const privilegedMutations = privilegedCounts.reduce((sum, r) => sum + r.total, 0)

  // Founder actions: count rows in the wide fetch where actorRole=SUPERADMIN.
  // Approximated when total > wide fetch cap, surfaced transparently.
  const founderCount = wide.rows.filter((r) => r.actorRole === 'SUPERADMIN').length
  const founderApproximated = wide.total > 100

  return (
    <PageContainer>
      <SectionHeader
        title="Audit Log"
        subtitle="Privileged administrator activity"
      />

      {/* Privacy / integrity note */}
      <div className="vcp-card-flat p-4">
        <p className="text-[12.5px] text-[var(--vcp-ink-muted)]">
          Audit log is append-only. Entries cannot be edited or deleted from the application.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total entries" value={totals.total} sub="All recorded actions" />
        <KpiCard
          label="Privileged mutations"
          value={privilegedMutations}
          variant={privilegedMutations > 0 ? 'coral' : 'neutral'}
          sub="Override / impersonation / QA"
        />
        <KpiCard
          label="Founder actions"
          value={founderApproximated ? `${founderCount}+` : founderCount}
          variant={founderCount > 0 ? 'coral' : 'neutral'}
          sub={founderApproximated ? 'Showing first 100' : 'actorRole = SUPERADMIN'}
        />
      </div>

      <AuditFilters action={actionRaw} />

      {/* Audit table */}
      {list.rows.length === 0 ? (
        <EmptyState
          title="No administrative actions recorded."
          message="Privileged actions performed by superadmins are recorded here automatically."
        />
      ) : (
        <div className="vcp-card overflow-hidden">
          <div className="overflow-x-auto vcp-scroll">
            <table className="vcp-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Target</th>
                  <th>Reason</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {list.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="vcp-mono text-[13px] font-semibold text-[var(--vcp-ink-strong)]">
                        {row.action}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="vcp-mono text-[12px] text-[var(--vcp-ink-muted)]">
                          {shortId(row.actorUserId)}
                        </span>
                        <StatusPill variant={actorRoleVariant(row.actorRole)}>
                          {row.actorRole ?? '—'}
                        </StatusPill>
                      </div>
                    </td>
                    <td>
                      {row.targetType ? (
                        <span className="text-[12.5px] text-[var(--vcp-ink-muted)]">
                          {row.targetType}
                          {row.targetId ? (
                            <span className="vcp-mono text-[12px] text-[var(--vcp-ink-faint)] ml-1.5">
                              {shortId(row.targetId)}
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-[13px] text-[var(--vcp-ink-faint)]">—</span>
                      )}
                    </td>
                    <td>
                      {row.reason ? (
                        <span className="text-[12.5px] text-[var(--vcp-ink-muted)]">
                          {row.reason}
                        </span>
                      ) : (
                        <span className="text-[12.5px] italic text-[var(--vcp-ink-faint)]">
                          No reason recorded
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="text-[12.5px] text-[var(--vcp-ink-muted)]">
                        {timeAgo(row.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        searchParams={{
          search,
          action: actionRaw === 'all' ? undefined : actionRaw,
        }}
      />
    </PageContainer>
  )
}

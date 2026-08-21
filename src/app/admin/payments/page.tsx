import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import { listPaymentsForAdmin } from '@/lib/admin/operational-queries'
import {
  KpiCard, SectionHeader, PageContainer,
  EmptyState, Pagination, StatusPill, type StatusVariant,
} from '@/components/admin/ui'
import { PaymentFilters } from './_components/payment-filters'
import { formatCurrency, formatDateTime, shortId } from '@/lib/format'
import { TIER_LABEL } from '@/lib/brand'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

// Map a whopPlanId substring to a canonical tier label for display.
// Falls back to "—" when the plan id is absent or doesn't contain a
// recognized tier keyword.
function tierFromPlanId(whopPlanId: string | null): string {
  if (!whopPlanId) return '—'
  const lower = whopPlanId.toLowerCase()
  if (lower.includes('agency_pro')) return TIER_LABEL.agency_pro
  if (lower.includes('agency')) return TIER_LABEL.agency
  if (lower.includes('pro')) return TIER_LABEL.pro
  if (lower.includes('free')) return TIER_LABEL.free
  return '—'
}

function paymentStatusVariant(status: string): StatusVariant {
  if (status === 'succeeded') return 'success'
  if (status === 'pending') return 'info'
  if (status === 'failed') return 'error'
  return 'neutral'
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function PaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'payments' } })

  const sp = await searchParams
  const search = typeof sp.search === 'string' ? sp.search : ''
  const statusRaw = typeof sp.status === 'string' ? sp.status : 'all'
  const status = statusRaw === 'succeeded' || statusRaw === 'failed' || statusRaw === 'pending' ? statusRaw : 'all'
  const page = Math.max(1, Number(sp.page ?? 1) || 1)

  const [list, totals] = await Promise.all([
    listPaymentsForAdmin({ page, pageSize: PAGE_SIZE, search, status: status === 'all' ? undefined : status }),
    Promise.all([
      listPaymentsForAdmin({ pageSize: 1 }),
      listPaymentsForAdmin({ status: 'succeeded', pageSize: 100 }),
      listPaymentsForAdmin({ status: 'failed', pageSize: 1 }),
    ]),
  ])

  const succeededRows = totals[1].rows
  const refundedCount = succeededRows.filter((p) => Number(p.refundedAmount ?? 0) > 0).length
  const refundedApproximated = succeededRows.length >= 100 && totals[1].total > 100

  return (
    <PageContainer>
      <SectionHeader
        title="Payments"
        subtitle="Payment events and billing exceptions"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total payments" value={totals[0].total} sub="All captured events" />
        <KpiCard label="Successful" value={totals[1].total} variant="success" />
        <KpiCard label="Failed" value={totals[2].total} variant={totals[2].total > 0 ? 'error' : 'neutral'} />
        <KpiCard
          label="Refunded"
          value={refundedApproximated ? `${refundedCount}+` : refundedCount}
          variant={refundedCount > 0 ? 'warning' : 'neutral'}
          sub={refundedApproximated ? 'Showing first 100' : 'refundedAmount > 0'}
        />
      </div>

      <PaymentFilters status={status} />

      {/* Payments table */}
      {list.rows.length === 0 ? (
        <EmptyState
          title="No payment activity found."
          message="Payments will appear here after the first successful checkout."
        />
      ) : (
        <div className="vcp-card overflow-hidden">
          <div className="overflow-x-auto vcp-scroll">
            <table className="vcp-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Provider</th>
                  <th>Payment date</th>
                  <th>External ID</th>
                </tr>
              </thead>
              <tbody>
                {list.rows.map((p) => {
                  const refunded = Number(p.refundedAmount ?? 0) > 0
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link
                          href={`/admin/organizations/${p.organization.id}`}
                          className="text-[13px] font-medium text-[var(--vcp-ink-strong)] hover:text-[var(--vcp-coral)] vcp-focus rounded"
                        >
                          {p.organization.name}
                        </Link>
                      </td>
                      <td className="vcp-mono vcp-tnum font-semibold text-[var(--vcp-ink-strong)]">
                        {formatCurrency(p.amount, p.currency)}
                      </td>
                      <td className="vcp-mono text-[12px] text-[var(--vcp-ink-muted)]">{p.currency}</td>
                      <td>
                        <span className="vcp-pill vcp-pill-outline">{tierFromPlanId(p.whopPlanId)}</span>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-1">
                          <StatusPill variant={paymentStatusVariant(p.status)}>
                            <span className="capitalize">{p.status}</span>
                          </StatusPill>
                          {refunded ? <StatusPill variant="warning">Refunded</StatusPill> : null}
                        </div>
                      </td>
                      <td className="vcp-mono text-[12px] text-[var(--vcp-ink-muted)]">Whop</td>
                      <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{formatDateTime(p.createdAt)}</td>
                      <td className="vcp-mono text-[12px] text-[var(--vcp-ink-faint)]">{shortId(p.whopPaymentId, 12)}</td>
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
        searchParams={{ search, status: status === 'all' ? undefined : status }}
      />
    </PageContainer>
  )
}

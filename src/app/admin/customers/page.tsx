import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import { listCustomersForAdmin, type CustomerRow } from '@/lib/admin/operational-queries'
import {
  KpiCard, SectionHeader, PageContainer, EmptyState,
  StatusPill, Pagination, type StatusVariant,
} from '@/components/admin/ui'
import { CustomerFilters } from './_components/customer-filters'
import { CustomerExportButton } from './_components/customer-export-button'
import { TIER_TO_CANONICAL } from '@/lib/brand'
import type { Tier } from '@/lib/brand'
import { formatDate, timeAgo, initials } from '@/lib/format'
import { Users, CreditCard, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ q?: string; page?: string; plan?: string; subscriptionStatus?: string; attention?: string }>

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'customers' } })

  const sp = await searchParams
  const q = (sp.q ?? '').trim()
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const plan = sp.plan ?? 'all'
  const subscriptionStatus = sp.subscriptionStatus ?? 'all'
  const attentionOnly = sp.attention === '1'

  const { rows, total, totalPages, page: pageNum } = await listCustomersForAdmin({
    page,
    pageSize: 25,
    search: q || undefined,
    plan: plan === 'all' ? undefined : plan,
    subscriptionStatus: subscriptionStatus === 'all' ? undefined : subscriptionStatus,
    attentionOnly,
  })

  // Fetch all matching customers for CSV export (no pagination cap)
  const { rows: allRows } = await listCustomersForAdmin({
    page: 1,
    pageSize: 10000,
    search: q || undefined,
    plan: plan === 'all' ? undefined : plan,
    subscriptionStatus: subscriptionStatus === 'all' ? undefined : subscriptionStatus,
    attentionOnly,
  })

  const activeSubs = rows.filter((r) => r.subscriptionStatus === 'active').length
  const attentionCount = rows.filter((r) => r.needsAttention).length

  return (
    <PageContainer>
      <SectionHeader
        title="Customers"
        subtitle="Identity, subscription, usage, and operational state"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[var(--vcp-ink-muted)]">{total} total</span>
            <CustomerExportButton customers={allRows} />
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total customers" value={total} variant="info" icon={<Users size={15} />} sub="Across all plans" />
        <KpiCard label="Active subscriptions" value={activeSubs} variant="coral" icon={<CreditCard size={15} />} sub="On this page" />
        <KpiCard
          label="Needs attention"
          value={attentionCount}
          variant={attentionCount > 0 ? 'error' : 'neutral'}
          icon={<AlertTriangle size={15} />}
          sub="On this page"
        />
      </div>

      {/* Filters */}
      <CustomerFilters q={q} plan={plan} subscriptionStatus={subscriptionStatus} attention={attentionOnly ? '1' : ''} />

      {/* Table or empty state */}
      {rows.length === 0 ? (
        <EmptyState
          title="No customers yet."
          message="New customer accounts will appear here after their first successful sign-in."
        />
      ) : (
        <div className="vcp-card overflow-hidden">
          <div className="overflow-x-auto vcp-scroll">
            <table className="vcp-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th>Subscription</th>
                  <th>Joined</th>
                  <th>Last active</th>
                  <th>Cases</th>
                  <th>Reports</th>
                  <th>Attention</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <CustomerRow key={c.id} c={c} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={pageNum}
        totalPages={totalPages}
        searchParams={{
          ...(q ? { q } : {}),
          ...(plan !== 'all' ? { plan } : {}),
          ...(subscriptionStatus !== 'all' ? { subscriptionStatus } : {}),
          ...(attentionOnly ? { attention: '1' } : {}),
        }}
      />
    </PageContainer>
  )
}

function CustomerRow({ c }: { c: CustomerRow }) {
  const planVariant: StatusVariant = c.plan === 'pro' ? 'coral' : c.plan === 'agency' || c.plan === 'agency_pro' ? 'info' : 'neutral'
  const subVariant: StatusVariant =
    c.subscriptionStatus === 'active'
      ? 'success'
      : c.subscriptionStatus === 'past_due'
        ? 'warning'
        : c.subscriptionStatus === 'canceled'
          ? 'error'
          : c.subscriptionStatus === 'trialing'
            ? 'info'
            : 'neutral'

  return (
    <tr>
      <td>
        <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-2.5 vcp-focus rounded group">
          <span
            className="w-8 h-8 rounded-full bg-[var(--vcp-coral)] text-white text-[11px] font-semibold flex items-center justify-center flex-none"
            aria-hidden
          >
            {initials(c.name) === '—' ? '?' : initials(c.name)}
          </span>
          <span className="min-w-0 flex flex-col leading-tight">
            <span className="text-[13px] font-medium text-[var(--vcp-ink-strong)] group-hover:text-[var(--vcp-coral)] truncate">
              {c.name || 'Unnamed'}
            </span>
            <span className="text-[12px] text-[var(--vcp-ink-muted)] vcp-mono truncate">{c.email || '—'}</span>
          </span>
        </Link>
      </td>
      <td>
        {c.organization ? (
          <Link href={`/admin/organizations/${c.organization.id}`} className="text-[13px] text-[var(--vcp-ink)] hover:text-[var(--vcp-coral)] vcp-focus rounded">
            {c.organization.name}
          </Link>
        ) : (
          <span className="text-[13px] text-[var(--vcp-ink-faint)]">—</span>
        )}
      </td>
      <td>
        <StatusPill variant={planVariant}>{TIER_TO_CANONICAL[c.plan as Tier] ?? 'FREE'}</StatusPill>
      </td>
      <td>
        {c.subscriptionStatus ? (
          <StatusPill variant={subVariant}>{prettyStatus(c.subscriptionStatus)}</StatusPill>
        ) : (
          <StatusPill variant="neutral">None</StatusPill>
        )}
      </td>
      <td className="text-[13px] text-[var(--vcp-ink-muted)]">{formatDate(c.createdAt)}</td>
      <td className="text-[13px] text-[var(--vcp-ink-muted)]">{timeAgo(c.lastActivity)}</td>
      <td className="text-[13px] text-[var(--vcp-ink)] vcp-mono vcp-tnum">{c.projectCount}</td>
      <td className="text-[13px] text-[var(--vcp-ink)] vcp-mono vcp-tnum">{c.reportCount}</td>
      <td>
        {c.needsAttention ? (
          <StatusPill variant="error">{c.attentionReasons.join(', ')}</StatusPill>
        ) : (
          <span className="text-[13px] text-[var(--vcp-ink-faint)]">—</span>
        )}
      </td>
    </tr>
  )
}

function prettyStatus(status: string): string {
  const map: Record<string, string> = {
    active: 'Active',
    past_due: 'Past due',
    canceled: 'Canceled',
    trialing: 'Trialing',
    expired: 'Expired',
    paused: 'Paused',
  }
  return map[status] ?? status.charAt(0).toUpperCase() + status.slice(1)
}

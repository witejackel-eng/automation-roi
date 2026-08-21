import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import {
  getOverviewMetrics, getCustomerGrowthTrend, getRevenueTrend,
  getSubscriptionMix, getProductActivity24h, getRecentCriticalEvents, getRecentSystemEvents,
  listPaymentsForAdmin,
} from '@/lib/admin/operational-queries'
import { KpiCard, SectionHeader, PageContainer } from '@/components/admin/ui'
import { Sparkline } from '@/components/admin/sparkline'
import { RightRail } from '@/components/admin/right-rail'
import { TrendArea, MiniBars, DonutMix, CHART_COLORS } from '@/components/admin/charts'
import { formatCompactCurrency, timeAgo } from '@/lib/format'
import { Users, CreditCard, DollarSign, HeartPulse, UserPlus, Ban, AlertCircle, FileText, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OverviewPage() {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'overview' } })

  const [metrics, growth, revenue, mix, activity24, critical, recentEvents, failedPayments] = await Promise.all([
    getOverviewMetrics(),
    getCustomerGrowthTrend(30),
    getRevenueTrend(30),
    getSubscriptionMix(),
    getProductActivity24h(),
    getRecentCriticalEvents(6),
    getRecentSystemEvents(10),
    listPaymentsForAdmin({ status: 'failed', pageSize: 5 }),
  ])

  // 7-day sparkline data (last 7 entries of the 30-day trend)
  const growth7d = growth.slice(-7).map((d) => d.value)
  const revenue7d = revenue.slice(-7).map((d) => d.value)

  const donutData = [
    { name: 'Free', value: mix.free, color: CHART_COLORS.muted },
    { name: 'Pro', value: mix.pro, color: CHART_COLORS.coral },
    { name: 'Custom (Agency)', value: (mix.agency ?? 0) + (mix.agency_pro ?? 0), color: CHART_COLORS.info },
  ].filter((d) => d.value > 0)

  const billingAlerts = [
    ...failedPayments.rows.slice(0, 3).map((p) => ({
      id: p.id,
      label: `Failed payment · ${p.organization.name}`,
      severity: 'error' as const,
      href: `/admin/payments?status=failed`,
    })),
    ...(metrics.operationalSignals.webhookFailures24h > 0 ? [{
      id: 'webhook-24h',
      label: `${metrics.operationalSignals.webhookFailures24h} webhook failure(s) in 24h`,
      severity: 'warning' as const,
      href: '/admin/events?eventType=WEBHOOK_ERROR',
    }] : []),
  ]

  const productActivity = [
    { label: 'Projects (24h)', value: activity24.projects, href: '/admin/events?eventType=PROJECT_CREATED' },
    { label: 'Reports (24h)', value: activity24.reports, href: '/admin/events?eventType=REPORT_GENERATED' },
    { label: 'Shares (24h)', value: activity24.shares, href: '/admin/events?eventType=SHARE_CREATED' },
    { label: 'Proposals (24h)', value: activity24.proposals, href: '/admin/events?eventType=PROPOSAL_GENERATED' },
  ]

  return (
    <PageContainer>
      <SectionHeader
        title="Founder Overview"
        subtitle="Real-time product, revenue, entitlement, and system health"
        actions={
          <span className="text-[12px] text-[var(--vcp-ink-muted)]">Updated {timeAgo(new Date())}</span>
        }
      />

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Active customers" value={metrics.activeOrganizations} sub={`${metrics.newCustomers7d} new in 7 days`} variant="info" icon={<Users size={15} />} sparkline={<Sparkline data={growth7d} color="var(--vcp-info)" />} />
        <KpiCard label="Active subscriptions" value={metrics.activeSubscriptions} sub={`${metrics.cancellations30d} canceled in 30d`} variant="coral" icon={<CreditCard size={15} />} />
        <KpiCard label="MRR (verified)" value={formatCompactCurrency(metrics.proMrr)} sub={`+ ${metrics.customActiveCount} custom tier`} icon={<DollarSign size={15} />} sparkline={<Sparkline data={revenue7d} color="var(--vcp-success)" />} />
        <KpiCard
          label="System health"
          value={<span className="flex items-center gap-2"><span className="vcp-dot vcp-dot-success" /> Operational</span>}
          sub={metrics.operationalSignals.systemErrors24h > 0 ? `${metrics.operationalSignals.systemErrors24h} errors in 24h` : 'No errors in 24h'}
          variant={metrics.operationalSignals.systemErrors24h > 0 ? 'warning' : 'success'}
          icon={<HeartPulse size={15} />}
        />
      </div>

      {/* Secondary signal cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="New customers (7d)" value={metrics.newCustomers7d} icon={<UserPlus size={15} />} />
        <KpiCard label="Cancellations (30d)" value={metrics.cancellations30d} variant={metrics.cancellations30d > 0 ? 'warning' : 'neutral'} icon={<Ban size={15} />} />
        <KpiCard label="Failed payments" value={metrics.failedPayments30d} sub="Requires attention" variant={metrics.failedPayments30d > 0 ? 'error' : 'neutral'} icon={<AlertCircle size={15} />} />
        <KpiCard label="Reports generated (24h)" value={metrics.reportsGenerated24h} variant="info" icon={<FileText size={15} />} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Customer growth" subtitle="New sign-ups, last 30 days" href="/admin/customers">
          <TrendArea data={growth} height={200} />
        </ChartCard>
        <ChartCard title="Revenue trend" subtitle="Successful payments, last 30 days" href="/admin/payments">
          <TrendArea data={revenue} height={200} color={CHART_COLORS.info} />
        </ChartCard>
        <ChartCard title="Product activity" subtitle="Cases → reports → shares (24h)" href="/admin/events">
          <MiniBars data={productActivity.map((p) => ({ label: p.label.split(' ')[0], value: Number(p.value) }))} height={200} color={CHART_COLORS.coral} />
        </ChartCard>
        <ChartCard title="Subscription mix" subtitle="Distribution by canonical plan" href="/admin/subscriptions">
          <div className="flex items-center gap-4">
            <DonutMix data={donutData} height={200} />
            <div className="flex flex-col gap-2">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-[12.5px] text-[var(--vcp-ink)]">{d.name}</span>
                  <span className="text-[12.5px] font-semibold text-[var(--vcp-ink-strong)] vcp-tnum">{d.value}</span>
                </div>
              ))}
              {donutData.length === 0 ? <span className="text-[12px] text-[var(--vcp-ink-muted)]">No subscriptions yet.</span> : null}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Recent system events table */}
      <div className="vcp-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--vcp-border)]">
          <h3 className="text-[13px] font-semibold text-[var(--vcp-ink-strong)]">Recent system events</h3>
          <Link href="/admin/events" className="text-[12px] text-[var(--vcp-ink-muted)] hover:text-[var(--vcp-coral)] vcp-focus rounded inline-flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto vcp-scroll">
          <table className="vcp-table">
            <thead>
              <tr>
                <th>Event</th><th>Severity</th><th>Organization</th><th>When</th><th>Request ID</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-[var(--vcp-ink-muted)] py-8">No operational events recorded yet.</td></tr>
              ) : recentEvents.map((e) => (
                <tr key={e.id}>
                  <td className="vcp-mono font-medium text-[var(--vcp-ink)]">{e.eventType}</td>
                  <td><SeverityPill severity={e.severity} /></td>
                  <td className="text-[var(--vcp-ink-muted)]">{e.organizationId ? shortId(e.organizationId) : '—'}</td>
                  <td className="text-[var(--vcp-ink-muted)]">{timeAgo(e.createdAt)}</td>
                  <td className="vcp-mono text-[12px] text-[var(--vcp-ink-faint)]">{e.requestId ? shortId(e.requestId, 10) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RightRail
        systemStatus={{ label: metrics.operationalSignals.systemErrors24h > 0 ? 'Degraded' : 'Operational', variant: metrics.operationalSignals.systemErrors24h > 0 ? 'warning' : 'success' }}
        criticalEvents={critical}
        billingAlerts={billingAlerts}
        productActivity={productActivity}
        planDistribution={{
          segments: [
            { label: 'Starter', value: mix.free, color: CHART_COLORS.muted },
            { label: 'Pro', value: (mix.pro ?? 0) + (mix.agency ?? 0) + (mix.agency_pro ?? 0), color: CHART_COLORS.coral },
          ],
          total: (mix.free ?? 0) + (mix.pro ?? 0) + (mix.agency ?? 0) + (mix.agency_pro ?? 0),
        }}
        revenueByPlan={{
          segments: [
            { label: 'Pro (verified)', value: metrics.proMrr, verified: true, color: CHART_COLORS.coral },
            { label: 'Custom (unverified)', value: 0, verified: false, color: CHART_COLORS.info },
          ],
          total: metrics.proMrr,
        }}
      />
    </PageContainer>
  )
}

function ChartCard({ title, subtitle, href, children }: { title: string; subtitle: string; href: string; children: React.ReactNode }) {
  return (
    <div className="vcp-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-semibold text-[var(--vcp-ink-strong)]">{title}</h3>
          <p className="text-[12px] text-[var(--vcp-ink-muted)] mt-0.5">{subtitle}</p>
        </div>
        <Link href={href} className="text-[11px] text-[var(--vcp-ink-muted)] hover:text-[var(--vcp-coral)] vcp-focus rounded inline-flex items-center gap-1">
          Details <ArrowUpRight size={11} />
        </Link>
      </div>
      {children}
    </div>
  )
}

function SeverityPill({ severity }: { severity: string }) {
  const v = severity === 'error' ? 'error' : severity === 'warn' ? 'warning' : 'neutral'
  const label = severity === 'error' ? 'Error' : severity === 'warn' ? 'Warning' : 'Info'
  return <span className={`vcp-pill vcp-pill-${v}`}>{label}</span>
}

function shortId(id: string, len = 8) {
  return id.length <= len ? id : `${id.slice(0, len)}…`
}

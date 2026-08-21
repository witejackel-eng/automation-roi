import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import { getCustomerForAdmin } from '@/lib/admin/operational-queries'
import { cn } from '@/lib/utils'
import {
  SectionHeader, PageContainer, ErrorState,
  StatusPill, type StatusVariant,
} from '@/components/admin/ui'
import { ActivityTimeline } from '@/components/admin/activity-timeline'
import { CapabilityBadges } from '@/components/admin/capability-badges'
import { SubscriptionLifecycle } from '@/components/admin/subscription-lifecycle'
import {
  formatDate, formatDateTime, timeAgo, shortId, initials,
} from '@/lib/format'
import { TIER_TO_CANONICAL } from '@/lib/brand'
import type { Tier, Capability } from '@/lib/brand'
import { ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function CustomerDetailPage({ params }: { params: Params }) {
  const admin = await requireSuperAdmin()
  const { id } = await params
  await logSystemEvent({
    eventType: 'ADMIN_PAGE_VIEWED',
    userId: admin.userId,
    metadata: { page: 'customer_detail', target: id },
  })

  const data = await getCustomerForAdmin(id)

  if (!data) {
    return (
      <PageContainer>
        <SectionHeader title="Customer not found" subtitle="The account you are looking for does not exist." />
        <ErrorState
          title="Customer not found."
          message="This account may have been deleted, or the link is incorrect."
          onRetry={undefined}
        />
        <div className="mt-4">
          <Link href="/admin/customers" className="vcp-pill vcp-pill-outline vcp-focus hover:bg-[var(--vcp-surface-sunken)]">
            ‹ Back to customers
          </Link>
        </div>
      </PageContainer>
    )
  }

  const { identity, organization, subscription, entitlement, usage, recentEvents, recentAudit, recentPayments } = data

  return (
    <PageContainer>
      <SectionHeader
        title={identity.name || 'Unnamed customer'}
        subtitle={identity.email || 'No email on file'}
        actions={
          <Link
            href="/admin/customers"
            className="vcp-pill vcp-pill-outline vcp-focus hover:bg-[var(--vcp-surface-sunken)] inline-flex items-center gap-1"
          >
            <ChevronLeft size={12} /> Customers
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main column (spans 2) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <IdentityCard identity={identity} />
          <OrganizationCard organization={organization} />
          <SubscriptionCard subscription={subscription} />
          {subscription ? (
            <SubscriptionLifecycle
              createdAt={subscription.createdAt}
              currentPeriodStart={subscription.currentPeriodStart}
              currentPeriodEnd={subscription.currentPeriodEnd}
              cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
              canceledAt={subscription.canceledAt}
              status={subscription.status}
            />
          ) : null}
          <EntitlementsCard entitlement={entitlement} />
          <UsageCard usage={usage} />
          <ActivityTimeline entries={recentEvents} maxItems={12} />
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-4">
          <RiskIndicatorsCard
            subscription={subscription}
            hasOrg={!!organization}
            entitlementActive={entitlement.active}
            tier={entitlement.tier}
            recentEvents={recentEvents}
          />
          {recentPayments && recentPayments.length > 0 ? (
            <RecentPaymentsCard payments={recentPayments} />
          ) : null}
          <AdminActionsCard recentAudit={recentAudit} />
          <PrivacyNoteCard />
        </div>
      </div>
    </PageContainer>
  )
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

type Identity = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  systemRole: string
  createdAt: Date
  updatedAt: Date
}

function IdentityCard({ identity }: { identity: Identity }) {
  const roleVariant: StatusVariant = identity.systemRole === 'SUPERADMIN' ? 'coral' : 'neutral'
  return (
    <div className="vcp-card p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">Identity</h3>
      <div className="flex items-start gap-3">
        <span
          className="w-11 h-11 rounded-full bg-[var(--vcp-coral)] text-white text-[14px] font-semibold flex items-center justify-center flex-none"
          aria-hidden
        >
          {initials(identity.name) === '—' ? '?' : initials(identity.name)}
        </span>
        <div className="min-w-0 flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-semibold text-[var(--vcp-ink-strong)]">{identity.name || 'Unnamed'}</span>
            <StatusPill variant={roleVariant}>{identity.systemRole}</StatusPill>
          </div>
          <div className="text-[13px] text-[var(--vcp-ink)] vcp-mono">{identity.email || '—'}</div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            <Field label="User ID" value={<span className="vcp-mono">{shortId(identity.id, 12)}</span>} />
            <Field label="Joined" value={formatDate(identity.createdAt)} />
            <Field label="Updated" value={formatDateTime(identity.updatedAt)} />
          </dl>
        </div>
      </div>
    </div>
  )
}

type Organization = {
  id: string
  name: string
  website: string | null
  contactEmail: string | null
  createdAt: Date
  membershipRole: string | null
} | null

function OrganizationCard({ organization }: { organization: Organization }) {
  return (
    <div className="vcp-card p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">Organization</h3>
      {organization ? (
        <div className="flex flex-col gap-2">
          <Link
            href={`/admin/organizations/${organization.id}`}
            className="text-[15px] font-semibold text-[var(--vcp-ink-strong)] hover:text-[var(--vcp-coral)] vcp-focus rounded inline-flex items-center gap-1.5"
          >
            {organization.name}
          </Link>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            <Field label="Website" value={organization.website ? <span className="vcp-mono text-[12px]">{organization.website}</span> : '—'} />
            <Field label="Contact email" value={organization.contactEmail ? <span className="vcp-mono text-[12px]">{organization.contactEmail}</span> : '—'} />
            <Field label="Membership role" value={
              organization.membershipRole === 'owner'
                ? <StatusPill variant="success">Owner</StatusPill>
                : <StatusPill variant="neutral">{organization.membershipRole ?? 'Member'}</StatusPill>
            } />
            <Field label="Joined org" value={formatDate(organization.createdAt)} />
          </dl>
        </div>
      ) : (
        <p className="text-[13px] text-[var(--vcp-ink-muted)]">No organization</p>
      )}
    </div>
  )
}

type Subscription = {
  id: string
  status: string
  tier: Tier
  planKey: string
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  canceledAt: Date | null
  createdAt: Date
  whopMembershipId: string | null
} | null

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  return (
    <div className="vcp-card p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">Subscription</h3>
      {subscription ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusPill variant={subStatusVariant(subscription.status)}>{prettyStatus(subscription.status)}</StatusPill>
            <StatusPill variant="info">{TIER_TO_CANONICAL[subscription.tier]}</StatusPill>
            {subscription.cancelAtPeriodEnd ? <StatusPill variant="warning">Canceling</StatusPill> : null}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            <Field label="Plan key" value={<span className="vcp-mono text-[12px]">{subscription.planKey || '—'}</span>} />
            <Field label="Whop membership" value={<span className="vcp-mono text-[12px]">{shortId(subscription.whopMembershipId, 14)}</span>} />
            <Field label="Period start" value={formatDate(subscription.currentPeriodStart)} />
            <Field label="Period end" value={formatDate(subscription.currentPeriodEnd)} />
            <Field label="Cancel at period end" value={subscription.cancelAtPeriodEnd ? 'Yes' : 'No'} />
            <Field label="Canceled at" value={subscription.canceledAt ? formatDateTime(subscription.canceledAt) : '—'} />
            <Field label="Subscription ID" value={<span className="vcp-mono">{shortId(subscription.id, 12)}</span>} />
            <Field label="Created" value={formatDate(subscription.createdAt)} />
          </dl>
        </div>
      ) : (
        <p className="text-[13px] text-[var(--vcp-ink-muted)]">No active subscription</p>
      )}
    </div>
  )
}

type Entitlement = {
  tier: Tier
  capabilities: Capability[]
  source: 'subscription' | 'license' | 'default'
  active: boolean
}

function EntitlementsCard({ entitlement }: { entitlement: Entitlement }) {
  const sourceLabel = entitlement.source === 'subscription'
    ? 'Subscription'
    : entitlement.source === 'license'
      ? 'License'
      : 'Default (free)'
  return (
    <div className="vcp-card p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">Entitlements</h3>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <StatusPill variant="info">{TIER_TO_CANONICAL[entitlement.tier]}</StatusPill>
        <StatusPill variant={entitlement.active ? 'success' : 'error'}>
          {entitlement.active ? 'Active' : 'Inactive'}
        </StatusPill>
        <span className="text-[12px] text-[var(--vcp-ink-muted)]">Source: {sourceLabel}</span>
      </div>
      <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--vcp-ink-faint)] mb-2">Capabilities</div>
      <CapabilityBadges capabilities={entitlement.capabilities} />
    </div>
  )
}

type Usage = { projectCount: number; reportCount: number; shareCount: number }

function UsageCard({ usage }: { usage: Usage }) {
  return (
    <div className="vcp-card p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">Usage</h3>
      <div className="grid grid-cols-3 gap-3">
        <UsageStat label="Projects" value={usage.projectCount} variant={usage.projectCount > 0 ? 'info' : 'neutral'} />
        <UsageStat label="Reports" value={usage.reportCount} variant={usage.reportCount > 0 ? 'success' : 'neutral'} />
        <UsageStat label="Shares" value={usage.shareCount} variant={usage.shareCount > 0 ? 'coral' : 'neutral'} />
      </div>
    </div>
  )
}

function UsageStat({ label, value, variant = 'neutral' }: { label: string; value: number; variant?: 'neutral' | 'info' | 'success' | 'coral' }) {
  const colorMap: Record<string, string> = {
    neutral: 'var(--vcp-ink-strong)',
    info: 'var(--vcp-info)',
    success: 'var(--vcp-success)',
    coral: 'var(--vcp-coral)',
  }
  const accentMap: Record<string, string> = {
    neutral: 'transparent',
    info: 'var(--vcp-info)',
    success: 'var(--vcp-success)',
    coral: 'var(--vcp-coral)',
  }
  return (
    <div
      className="rounded-[var(--vcp-radius-sm)] bg-[var(--vcp-surface-sunken)] px-3 py-2.5 flex flex-col gap-1 border-l-2"
      style={{ borderLeftColor: accentMap[variant] }}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">{label}</span>
      <span className="text-[22px] leading-none font-semibold vcp-tnum" style={{ color: colorMap[variant] }}>{value}</span>
    </div>
  )
}

type AuditRow = {
  id: string
  action: string
  actorRole: string
  reason: string | null
  createdAt: Date
}

function AdminActionsCard({ recentAudit }: { recentAudit: AuditRow[] }) {
  return (
    <div className="vcp-card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--vcp-border)]">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">Admin actions</h3>
      </div>
      <div className="overflow-x-auto vcp-scroll">
        <table className="vcp-table">
          <thead>
            <tr><th>Action</th><th>Actor</th><th>Reason</th><th>When</th></tr>
          </thead>
          <tbody>
            {recentAudit.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-[var(--vcp-ink-muted)] py-8">No administrative actions recorded.</td></tr>
            ) : recentAudit.map((a) => (
              <tr key={a.id}>
                <td className="vcp-mono font-medium text-[var(--vcp-ink)]">{a.action}</td>
                <td><span className="text-[12px] text-[var(--vcp-ink-muted)] vcp-mono">{a.actorRole}</span></td>
                <td className="text-[var(--vcp-ink-muted)]">{a.reason || '—'}</td>
                <td className="text-[var(--vcp-ink-muted)]">{timeAgo(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PrivacyNoteCard() {
  return (
    <div className="vcp-card-flat p-3">
      <p className="text-[12px] text-[var(--vcp-ink-muted)] leading-relaxed">
        Customer business-case content is hidden by default. Access is recorded.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Recent Payments — mini payment history in the side column
// ---------------------------------------------------------------------------

type PaymentRow = {
  id: string
  amount: number | { toNumber(): number }
  currency: string
  status: string
  createdAt: Date
  whopPaymentId: string
}

function RecentPaymentsCard({ payments }: { payments: PaymentRow[] }) {
  const toNum = (v: number | { toNumber(): number }): number =>
    typeof v === 'number' ? v : v.toNumber()
  const statusVariant = (status: string): StatusVariant => {
    if (status === 'succeeded') return 'success'
    if (status === 'failed') return 'error'
    if (status === 'pending') return 'warning'
    return 'neutral'
  }
  return (
    <div className="vcp-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">Recent payments</h3>
        <span className="text-[11px] text-[var(--vcp-ink-faint)]">{payments.length}</span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {payments.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 py-2 border-b border-[var(--vcp-border)] last:border-0 last:pb-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={cn('vcp-dot', `vcp-dot-${statusVariant(p.status)}`)}
                style={{ boxShadow: 'none', width: 6, height: 6 }}
                aria-hidden
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[12.5px] font-semibold text-[var(--vcp-ink-strong)] vcp-tnum">
                  ${toNum(p.amount).toFixed(2)} {p.currency}
                </span>
                <span className="text-[10px] text-[var(--vcp-ink-faint)] vcp-mono truncate">{p.whopPaymentId.slice(0, 14)}…</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <StatusPill variant={statusVariant(p.status)} size="sm">
                {p.status}
              </StatusPill>
              <span className="text-[10px] text-[var(--vcp-ink-faint)]">{timeAgo(p.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Risk Indicators — visual summary of attention signals
// ---------------------------------------------------------------------------

type RiskIndicator = {
  label: string
  severity: 'error' | 'warning' | 'info' | 'success'
  detail: string
}

function RiskIndicatorsCard({
  subscription,
  hasOrg,
  entitlementActive,
  tier,
  recentEvents,
}: {
  subscription: Subscription
  hasOrg: boolean
  entitlementActive: boolean
  tier: Tier
  recentEvents: { severity: string }[]
}) {
  const indicators: RiskIndicator[] = []

  // Subscription risks
  if (subscription) {
    if (subscription.status === 'past_due') {
      indicators.push({ label: 'Past due', severity: 'error', detail: 'Subscription payment is past due' })
    }
    if (subscription.status === 'canceled') {
      indicators.push({ label: 'Canceled', severity: 'error', detail: 'Subscription has been canceled' })
    }
    if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
      const daysLeft = Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysLeft > 0) {
        indicators.push({ label: `Canceling in ${daysLeft}d`, severity: 'warning', detail: 'Cancel at period end is set' })
      }
    }
    if (subscription.status === 'trialing') {
      indicators.push({ label: 'Trialing', severity: 'info', detail: 'On a trial subscription' })
    }
  }

  // Organization risk
  if (!hasOrg) {
    indicators.push({ label: 'No organization', severity: 'warning', detail: 'User has no organization attached' })
  }

  // Entitlement risk
  if (!entitlementActive) {
    indicators.push({ label: 'Inactive entitlement', severity: 'warning', detail: 'Entitlement is not currently active' })
  }

  // Upgrade opportunity
  if (tier === 'free' && subscription?.status === 'active') {
    indicators.push({ label: 'Active but Starter', severity: 'info', detail: 'On the free Starter plan — upgrade opportunity' })
  }

  // Recent errors
  const errorCount = recentEvents.filter((e) => e.severity === 'error').length
  if (errorCount > 0) {
    indicators.push({ label: `${errorCount} recent error${errorCount === 1 ? '' : 's'}`, severity: 'error', detail: 'Error-level events in recent activity' })
  }

  // Healthy state
  const isHealthy = indicators.length === 0

  return (
    <div className="vcp-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">Risk indicators</h3>
        {isHealthy ? (
          <span className="vcp-pill vcp-pill-success">
            <span className="vcp-dot vcp-dot-success" style={{ boxShadow: 'none', width: 5, height: 5 }} />
            Healthy
          </span>
        ) : (
          <span className="vcp-pill vcp-pill-warning">
            <span className="vcp-dot vcp-dot-warning" style={{ boxShadow: 'none', width: 5, height: 5 }} />
            {indicators.length} signal{indicators.length === 1 ? '' : 's'}
          </span>
        )}
      </div>
      {isHealthy ? (
        <p className="text-[13px] text-[var(--vcp-ink-muted)] py-2">
          No risk signals detected. Subscription active, organization present, no recent errors.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {indicators.map((ind, i) => {
            const dotClass = ind.severity === 'error' ? 'vcp-dot-error' : ind.severity === 'warning' ? 'vcp-dot-warning' : 'vcp-dot-info'
            return (
              <li key={i} className="flex items-start gap-2.5">
                <span className={`vcp-dot ${dotClass} mt-1.5`} style={{ boxShadow: 'none', width: 6, height: 6 }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium text-[var(--vcp-ink)]">{ind.label}</div>
                  <div className="text-[11px] text-[var(--vcp-ink-muted)] mt-0.5">{ind.detail}</div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small primitives / helpers
// ---------------------------------------------------------------------------

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <dt className="text-[11px] uppercase tracking-[0.06em] text-[var(--vcp-ink-faint)]">{label}</dt>
      <dd className="text-[13px] text-[var(--vcp-ink)]">{value}</dd>
    </div>
  )
}

function subStatusVariant(status: string): StatusVariant {
  if (status === 'active') return 'success'
  if (status === 'past_due') return 'warning'
  if (status === 'canceled') return 'error'
  if (status === 'trialing') return 'info'
  return 'neutral'
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

import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import { getOrganizationForAdmin } from '@/lib/admin/operational-queries'
import {
  SectionHeader, PageContainer, ErrorState, StatusPill,
} from '@/components/admin/ui'
import type { StatusVariant } from '@/components/admin/ui'
import { formatDate, formatDateTime, timeAgo, formatCurrency, shortId } from '@/lib/format'
import { TIER_TO_CANONICAL, TIER_LABEL, CAPABILITY_LABEL, type Tier } from '@/lib/brand'
import type { Capability } from '@/lib/brand'

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

function subscriptionStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
}

const SEVERITY_VARIANT: Record<string, StatusVariant> = {
  info: 'info',
  warn: 'warning',
  error: 'error',
}

const PAYMENT_STATUS_VARIANT: Record<string, StatusVariant> = {
  succeeded: 'success',
  failed: 'error',
  pending: 'warning',
  refunded: 'neutral',
}

function paymentStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const admin = await requireSuperAdmin()
  const { id } = await params
  await logSystemEvent({
    eventType: 'ADMIN_PAGE_VIEWED',
    userId: admin.userId,
    metadata: { page: 'organization_detail', organizationId: id },
  })

  const org = await getOrganizationForAdmin(id)

  if (!org) {
    return (
      <PageContainer>
        <SectionHeader
          title="Organization"
          subtitle="Detail"
          actions={
            <Link href="/admin/organizations" className="vcp-pill vcp-pill-outline vcp-focus">
              ‹ Organizations
            </Link>
          }
        />
        <ErrorState
          title="Organization not found."
          message="This organization may have been removed, or the ID is invalid."
        />
      </PageContainer>
    )
  }

  const canonical = TIER_TO_CANONICAL[(org.tier as Tier) ?? 'free'] ?? 'FREE'
  const currentSub = org.subscriptions[0] ?? null
  const brandColor = org.brandColorHex?.trim() || null
  const website = org.website?.trim() || null

  return (
    <PageContainer>
      <SectionHeader
        title={org.name}
        subtitle={org.contactEmail || 'No contact email on file'}
        actions={
          <Link href="/admin/organizations" className="vcp-pill vcp-pill-outline vcp-focus">
            ‹ Organizations
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overview — main, spans 2 */}
        <section className="vcp-card p-5 lg:col-span-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">Overview</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Name" value={org.name} />
            <Field
              label="Website"
              value={website ? (
                <a href={website} target="_blank" rel="noreferrer" className="text-[var(--vcp-ink)] hover:text-[var(--vcp-coral)] vcp-focus rounded underline-offset-2 hover:underline">
                  {website}
                </a>
              ) : '—'}
            />
            <Field label="Contact email" value={<span className="vcp-mono">{org.contactEmail || '—'}</span>} />
            <Field label="Phone" value={org.phone || '—'} />
            <Field label="Created" value={formatDate(org.createdAt)} />
            <Field label="Updated" value={formatDate(org.updatedAt)} />
            <Field
              label="Brand color"
              value={
                brandColor ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block w-4 h-4 rounded-[3px] border border-[var(--vcp-border-strong)]"
                      style={{ background: brandColor }}
                      aria-hidden
                    />
                    <span className="vcp-mono text-[12px] text-[var(--vcp-ink-muted)]">{brandColor}</span>
                  </span>
                ) : '—'
              }
            />
            {org.logoUrl ? (
              <Field label="Logo" value={<span className="vcp-mono text-[12px] text-[var(--vcp-ink-muted)]">{shortId(org.logoUrl, 32)}</span>} />
            ) : null}
          </dl>
        </section>

        {/* Entitlements — side, spans 1 */}
        <section className="vcp-card p-5 lg:col-span-1">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">Entitlements</h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[12px] text-[var(--vcp-ink-muted)]">Tier</span>
            <StatusPill variant={CANONICAL_PLAN_VARIANT[canonical]}>{canonical}</StatusPill>
            <span className="text-[12px] text-[var(--vcp-ink-faint)]">· {TIER_LABEL[(org.tier as Tier) ?? 'free'] ?? 'Free'}</span>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-2">Capabilities</div>
          {org.entitlement.capabilities.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {org.entitlement.capabilities.map((c: Capability) => (
                <li key={c}>
                  <span className="vcp-pill vcp-pill-outline">{CAPABILITY_LABEL[c]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-[12px] text-[var(--vcp-ink-muted)]">No capabilities.</span>
          )}
        </section>

        {/* Billing — main, spans 2 */}
        <section className="vcp-card p-5 lg:col-span-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">Billing</h3>
          {currentSub ? (
            <>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-5">
                <Field label="Tier" value={<StatusPill variant={CANONICAL_PLAN_VARIANT[canonical]}>{canonical}</StatusPill>} />
                <Field
                  label="Subscription status"
                  value={
                    <StatusPill variant={SUB_STATUS_VARIANT[currentSub.status] ?? 'neutral'}>
                      {subscriptionStatusLabel(currentSub.status)}
                    </StatusPill>
                  }
                />
                <Field label="Plan key" value={<span className="vcp-mono text-[12px]">{currentSub.planKey ?? '—'}</span>} />
                <Field
                  label="Billing period"
                  value={
                    <span className="text-[12.5px] text-[var(--vcp-ink)]">
                      {formatDate(currentSub.currentPeriodStart)} → {formatDate(currentSub.currentPeriodEnd)}
                    </span>
                  }
                />
                <Field
                  label="Cancel at end of period"
                  value={
                    currentSub.cancelAtPeriodEnd ? (
                      <StatusPill variant="warning">Yes</StatusPill>
                    ) : (
                      <StatusPill variant="neutral">No</StatusPill>
                    )
                  }
                />
                <Field
                  label="Canceled at"
                  value={currentSub.canceledAt ? formatDate(currentSub.canceledAt) : '—'}
                />
              </dl>

              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-2">Recent payments</div>
              {org.recentPayments.length > 0 ? (
                <div className="overflow-x-auto vcp-scroll -mx-2">
                  <table className="vcp-table">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Payment ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {org.recentPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="vcp-mono vcp-tnum text-[var(--vcp-ink-strong)] font-medium">
                            {formatCurrency(p.amount, p.currency || 'USD')}
                          </td>
                          <td>
                            <StatusPill variant={PAYMENT_STATUS_VARIANT[p.status] ?? 'neutral'}>
                              {paymentStatusLabel(p.status)}
                            </StatusPill>
                          </td>
                          <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{formatDateTime(p.createdAt)}</td>
                          <td className="vcp-mono text-[11.5px] text-[var(--vcp-ink-faint)]">{shortId(p.whopPaymentId, 14)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <span className="text-[12px] text-[var(--vcp-ink-muted)]">No payments recorded yet.</span>
              )}
            </>
          ) : (
            <p className="text-[13px] text-[var(--vcp-ink-muted)]">No active subscription.</p>
          )}
        </section>

        {/* Usage — side, spans 1 */}
        <section className="vcp-card p-5 lg:col-span-1">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">Usage</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCell label="Projects" value={org.counts.projects} />
            <StatCell label="Members" value={org.counts.memberships} />
            <StatCell label="Payments" value={org.counts.payments} />
            <StatCell label="Share events" value={org.counts.shareEvents} />
          </div>
        </section>

        {/* Team / Members — full width */}
        <section className="vcp-card overflow-hidden lg:col-span-3">
          <div className="px-5 py-4 border-b border-[var(--vcp-border)]">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">Team / Members</h3>
          </div>
          <div className="overflow-x-auto vcp-scroll">
            <table className="vcp-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>System role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {org.memberships.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-[var(--vcp-ink-muted)] py-8">No members on this organization.</td>
                  </tr>
                ) : org.memberships.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <Link
                        href={`/admin/customers/${m.user.id}`}
                        className="text-[13px] font-medium text-[var(--vcp-ink-strong)] hover:text-[var(--vcp-coral)] vcp-focus rounded"
                      >
                        {m.user.name ?? 'Unnamed'}
                      </Link>
                    </td>
                    <td className="vcp-mono text-[12px] text-[var(--vcp-ink-muted)]">{m.user.email}</td>
                    <td>
                      {m.role === 'owner' ? (
                        <StatusPill variant="success">Owner</StatusPill>
                      ) : (
                        <StatusPill variant="neutral">{m.role.charAt(0).toUpperCase() + m.role.slice(1)}</StatusPill>
                      )}
                    </td>
                    <td>
                      {m.user.systemRole === 'SUPERADMIN' ? (
                        <StatusPill variant="coral">Superadmin</StatusPill>
                      ) : (
                        <span className="text-[12px] text-[var(--vcp-ink-muted)]">
                          {m.user.systemRole ? m.user.systemRole.toLowerCase() : 'Member'}
                        </span>
                      )}
                    </td>
                    <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{formatDate(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent activity — full width */}
        <section className="vcp-card overflow-hidden lg:col-span-3">
          <div className="px-5 py-4 border-b border-[var(--vcp-border)]">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">Recent activity</h3>
          </div>
          <div className="overflow-x-auto vcp-scroll">
            <table className="vcp-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Severity</th>
                  <th>When</th>
                  <th>Request ID</th>
                </tr>
              </thead>
              <tbody>
                {org.recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-[var(--vcp-ink-muted)] py-8">No operational events for this organization.</td>
                  </tr>
                ) : org.recentEvents.map((e) => (
                  <tr key={e.id}>
                    <td className="vcp-mono text-[12.5px] font-medium text-[var(--vcp-ink)]">{e.eventType}</td>
                    <td>
                      <StatusPill variant={SEVERITY_VARIANT[e.severity] ?? 'neutral'}>
                        {e.severity === 'warn' ? 'Warning' : e.severity.charAt(0).toUpperCase() + e.severity.slice(1)}
                      </StatusPill>
                    </td>
                    <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{timeAgo(e.createdAt)}</td>
                    <td className="vcp-mono text-[11.5px] text-[var(--vcp-ink-faint)]">{e.requestId ? shortId(e.requestId, 12) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Privacy note — full width */}
        <p className="lg:col-span-3 text-[12px] text-[var(--vcp-ink-muted)] px-1">
          Member and billing data only. Client business-case content is hidden by default.
        </p>
      </div>
    </PageContainer>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-[var(--vcp-ink-faint)]">{label}</dt>
      <dd className="text-[13px] text-[var(--vcp-ink)] truncate">{value}</dd>
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="vcp-card-flat p-3 flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--vcp-ink-faint)]">{label}</span>
      <span className="text-[20px] font-semibold text-[var(--vcp-ink-strong)] vcp-tnum">{value}</span>
    </div>
  )
}

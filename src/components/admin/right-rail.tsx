'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StatusDot, StatusPill } from './ui'
import { MiniDonut } from './mini-donut'
import { timeAgo } from '@/lib/format'
import { ArrowUpRight } from 'lucide-react'
import { getEventMeta } from './activity-timeline'

export function RightRail({
  systemStatus,
  criticalEvents,
  billingAlerts,
  productActivity,
  planDistribution,
  revenueByPlan,
  churnRisk,
}: {
  systemStatus?: { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }
  criticalEvents?: { id: string; eventType: string; severity: string; organizationId: string | null; createdAt: Date | string }[]
  billingAlerts?: { id: string; label: string; severity: 'error' | 'warning' | 'info'; href?: string }[]
  productActivity?: { label: string; value: string | number; href?: string }[]
  planDistribution?: { segments: { label: string; value: number; color: string }[]; total: number }
  revenueByPlan?: { segments: { label: string; value: number; verified: boolean; color: string }[]; total: number }
  churnRisk?: { cancellations30d: number; pastDue: number; cancelingCount: number; total: number }
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* System status */}
      <RailCard title="System status">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[var(--vcp-ink)]">{systemStatus?.label ?? 'Operational'}</span>
          <StatusDot variant={systemStatus?.variant ?? 'success'} />
        </div>
        <Link href="/admin/system" className="mt-2 text-[12px] text-[var(--vcp-ink-muted)] hover:text-[var(--vcp-coral)] vcp-focus rounded inline-flex items-center gap-1">
          View health details <ArrowUpRight size={12} />
        </Link>
      </RailCard>

      {/* Critical events */}
      <RailCard title="Recent critical events" action={<Link href="/admin/events?severity=error" className="text-[11px] text-[var(--vcp-ink-muted)] hover:text-[var(--vcp-coral)] vcp-focus rounded">All</Link>}>
        {criticalEvents && criticalEvents.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {criticalEvents.map((e) => {
              const sev = (e.severity as 'warn' | 'error') ?? 'warn'
              const meta = getEventMeta(e.eventType)
              const Icon = meta.icon
              return (
                <li key={e.id} className="flex items-start gap-2.5">
                  <span
                    className="w-5 h-5 rounded-[5px] flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: meta.bg, color: meta.color }}
                    aria-hidden
                  >
                    <Icon size={11} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-medium text-[var(--vcp-ink)] truncate vcp-mono">{e.eventType}</div>
                    <div className="text-[11px] text-[var(--vcp-ink-muted)] flex items-center gap-1.5">
                      <span className={`vcp-dot vcp-dot-${sev === 'error' ? 'error' : 'warning'}`} style={{ boxShadow: 'none', width: 5, height: 5 }} />
                      {timeAgo(e.createdAt)}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyRailRow message="Everything is quiet." />
        )}
      </RailCard>

      {/* Billing alerts */}
      {billingAlerts && billingAlerts.length > 0 ? (
        <RailCard title="Billing alerts">
          <ul className="flex flex-col gap-2">
            {billingAlerts.map((a) => (
              <li key={a.id} className="flex items-start gap-2.5">
                <StatusDot variant={a.severity === 'error' ? 'error' : 'warning'} />
                {a.href ? (
                  <Link href={a.href} className="text-[12.5px] text-[var(--vcp-ink)] hover:text-[var(--vcp-coral)] vcp-focus rounded">{a.label}</Link>
                ) : (
                  <span className="text-[12.5px] text-[var(--vcp-ink)]">{a.label}</span>
                )}
              </li>
            ))}
          </ul>
        </RailCard>
      ) : null}

      {/* Product activity */}
      {productActivity && productActivity.length > 0 ? (
        <RailCard title="Product activity">
          <ul className="flex flex-col divide-y divide-[var(--vcp-border)]">
            {productActivity.map((a) => (
              <li key={a.label} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                {a.href ? (
                  <Link href={a.href} className="text-[12.5px] text-[var(--vcp-ink-muted)] hover:text-[var(--vcp-coral)] vcp-focus rounded">{a.label}</Link>
                ) : (
                  <span className="text-[12.5px] text-[var(--vcp-ink-muted)]">{a.label}</span>
                )}
                <span className="text-[13px] font-semibold text-[var(--vcp-ink-strong)] vcp-tnum">{a.value}</span>
              </li>
            ))}
          </ul>
        </RailCard>
      ) : null}

      {/* Plan distribution mini-donut */}
      {planDistribution && planDistribution.total > 0 ? (
        <RailCard title="Plan distribution" action={<Link href="/admin/subscriptions" className="text-[11px] text-[var(--vcp-ink-muted)] hover:text-[var(--vcp-coral)] vcp-focus rounded">All</Link>}>
          <div className="flex items-center gap-3">
            <MiniDonut
              segments={planDistribution.segments}
              size={96}
              thickness={12}
              centerValue={planDistribution.total}
              centerLabel="orgs"
            />
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              {planDistribution.segments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                  <span className="text-[11px] text-[var(--vcp-ink-muted)] truncate">{seg.label}</span>
                  <span className="text-[11px] font-semibold text-[var(--vcp-ink-strong)] vcp-tnum ml-auto">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </RailCard>
      ) : null}

      {/* Revenue by plan breakdown */}
      {revenueByPlan ? (
        <RailCard title="Revenue by plan" action={<Link href="/admin/payments" className="text-[11px] text-[var(--vcp-ink-muted)] hover:text-[var(--vcp-coral)] vcp-focus rounded">All</Link>}>
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[20px] font-semibold text-[var(--vcp-ink-strong)] vcp-tnum">${revenueByPlan.total}/mo</span>
            <span className="text-[10px] uppercase tracking-wide text-[var(--vcp-ink-faint)]">MRR</span>
          </div>
          <ul className="flex flex-col gap-2">
            {revenueByPlan.segments.map((seg) => (
              <li key={seg.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                  <span className="text-[12px] text-[var(--vcp-ink-muted)] truncate">{seg.label}</span>
                  {!seg.verified ? (
                    <span className="vcp-pill vcp-pill-outline" style={{ fontSize: 9, padding: '0 5px' }}>unverified</span>
                  ) : null}
                </div>
                <span className="text-[12px] font-semibold text-[var(--vcp-ink-strong)] vcp-tnum">${seg.value}/mo</span>
              </li>
            ))}
          </ul>
          {revenueByPlan.segments.some((s) => !s.verified) ? (
            <p className="mt-3 pt-3 border-t border-[var(--vcp-border)] text-[10px] text-[var(--vcp-ink-faint)] leading-relaxed">
              Verified MRR is derived from active Pro subscriptions at $49/mo. Custom-tier revenue requires manual verification.
            </p>
          ) : null}
        </RailCard>
      ) : null}

      {/* Churn risk card */}
      {churnRisk ? (
        <RailCard title="Churn risk" action={<Link href="/admin/subscriptions?status=canceled" className="text-[11px] text-[var(--vcp-ink-muted)] hover:text-[var(--vcp-coral)] vcp-focus rounded">Subs</Link>}>
          {(() => {
            const totalAtRisk = churnRisk.cancellations30d + churnRisk.pastDue + churnRisk.cancelingCount
            const variant = totalAtRisk > 0 ? (churnRisk.cancellations30d > 2 ? 'error' : 'warning') : 'success'
            const label = totalAtRisk === 0 ? 'No churn risk' : `${totalAtRisk} signal${totalAtRisk === 1 ? '' : 's'}`
            const dotClass = variant === 'error' ? 'vcp-dot-error' : variant === 'warning' ? 'vcp-dot-warning' : 'vcp-dot-success'
            const pillClass = variant === 'error' ? 'vcp-pill-error' : variant === 'warning' ? 'vcp-pill-warning' : 'vcp-pill-success'
            return (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('vcp-dot', dotClass)} style={{ boxShadow: 'none', width: 7, height: 7 }} />
                  <span className={cn('vcp-pill', pillClass)}>{label}</span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {churnRisk.cancellations30d > 0 ? (
                    <li className="flex items-center justify-between gap-2">
                      <span className="text-[12px] text-[var(--vcp-ink-muted)]">Canceled (30d)</span>
                      <span className="text-[13px] font-semibold vcp-tnum" style={{ color: 'var(--vcp-error)' }}>{churnRisk.cancellations30d}</span>
                    </li>
                  ) : null}
                  {churnRisk.pastDue > 0 ? (
                    <li className="flex items-center justify-between gap-2">
                      <span className="text-[12px] text-[var(--vcp-ink-muted)]">Past due</span>
                      <span className="text-[13px] font-semibold vcp-tnum" style={{ color: 'var(--vcp-warning)' }}>{churnRisk.pastDue}</span>
                    </li>
                  ) : null}
                  {churnRisk.cancelingCount > 0 ? (
                    <li className="flex items-center justify-between gap-2">
                      <span className="text-[12px] text-[var(--vcp-ink-muted)]">Canceling</span>
                      <span className="text-[13px] font-semibold vcp-tnum" style={{ color: 'var(--vcp-warning)' }}>{churnRisk.cancelingCount}</span>
                    </li>
                  ) : null}
                  {totalAtRisk === 0 ? (
                    <li className="text-[12px] text-[var(--vcp-ink-muted)] py-1">
                      All active subscriptions are in good standing.
                    </li>
                  ) : null}
                </ul>
                {churnRisk.total > 0 ? (
                  <p className="mt-3 pt-3 border-t border-[var(--vcp-border)] text-[10px] text-[var(--vcp-ink-faint)]">
                    {churnRisk.total} active subscription{churnRisk.total === 1 ? '' : 's'} total
                  </p>
                ) : null}
              </>
            )
          })()}
        </RailCard>
      ) : null}
    </div>
  )
}

export function RailCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="vcp-card-flat p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

export function EmptyRailRow({ message }: { message: string }) {
  return <div className="text-[12.5px] text-[var(--vcp-ink-muted)] py-1">{message}</div>
}

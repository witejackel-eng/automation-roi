'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StatusDot, StatusPill } from './ui'
import { timeAgo } from '@/lib/format'
import { ArrowUpRight } from 'lucide-react'

export function RightRail({
  systemStatus,
  criticalEvents,
  billingAlerts,
  productActivity,
}: {
  systemStatus?: { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }
  criticalEvents?: { id: string; eventType: string; severity: string; organizationId: string | null; createdAt: Date | string }[]
  billingAlerts?: { id: string; label: string; severity: 'error' | 'warning' | 'info'; href?: string }[]
  productActivity?: { label: string; value: string | number; href?: string }[]
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
          <ul className="flex flex-col gap-2.5">
            {criticalEvents.map((e) => {
              const sev = (e.severity as 'warn' | 'error') ?? 'warn'
              return (
                <li key={e.id} className="flex items-start gap-2.5">
                  <StatusDot variant={sev === 'error' ? 'error' : 'warning'} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium text-[var(--vcp-ink)] truncate vcp-mono">{e.eventType}</div>
                    <div className="text-[11px] text-[var(--vcp-ink-muted)]">{timeAgo(e.createdAt)}</div>
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

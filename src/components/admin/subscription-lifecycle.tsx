'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { formatDate, timeAgo } from '@/lib/format'
import {
  Play, Calendar, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  type LucideIcon,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Subscription Lifecycle Timeline
//
// A horizontal visual showing the billing lifecycle:
//   Started → Current Period → Renewal / Cancel
// ---------------------------------------------------------------------------

type LifecycleStage = {
  key: 'started' | 'period' | 'renewal' | 'cancel'
  label: string
  date: Date | string | null
  icon: LucideIcon
  color: string
  bg: string
  detail?: string
}

export function SubscriptionLifecycle({
  createdAt,
  currentPeriodStart,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  canceledAt,
  status,
}: {
  createdAt: Date | string
  currentPeriodStart: Date | string | null
  currentPeriodEnd: Date | string | null
  cancelAtPeriodEnd: boolean
  canceledAt: Date | string | null
  status: string
}) {
  const stages: LifecycleStage[] = []

  // Stage 1: Started
  stages.push({
    key: 'started',
    label: 'Started',
    date: createdAt,
    icon: Play,
    color: 'var(--vcp-info)',
    bg: 'var(--vcp-info-bg)',
    detail: 'Subscription created',
  })

  // Stage 2: Current period
  if (currentPeriodStart) {
    const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd as string) : null
    const now = new Date()
    const inPeriod = periodEnd ? periodEnd > now : false
    stages.push({
      key: 'period',
      label: 'Current period',
      date: currentPeriodStart,
      icon: Calendar,
      color: inPeriod ? 'var(--vcp-success)' : 'var(--vcp-ink-muted)',
      bg: inPeriod ? 'var(--vcp-success-bg)' : 'var(--vcp-surface-sunken)',
      detail: currentPeriodEnd ? `Ends ${formatDate(currentPeriodEnd)}` : undefined,
    })
  }

  // Stage 3: Renewal or Cancel
  if (canceledAt) {
    stages.push({
      key: 'cancel',
      label: 'Canceled',
      date: canceledAt,
      icon: XCircle,
      color: 'var(--vcp-error)',
      bg: 'var(--vcp-error-bg)',
      detail: `Canceled ${timeAgo(canceledAt)}`,
    })
  } else if (cancelAtPeriodEnd && currentPeriodEnd) {
    stages.push({
      key: 'cancel',
      label: 'Cancel at EOP',
      date: currentPeriodEnd,
      icon: AlertTriangle,
      color: 'var(--vcp-warning)',
      bg: 'var(--vcp-warning-bg)',
      detail: 'Will cancel when period ends',
    })
  } else if (currentPeriodEnd) {
    const daysLeft = Math.ceil((new Date(currentPeriodEnd as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    stages.push({
      key: 'renewal',
      label: 'Renewal',
      date: currentPeriodEnd,
      icon: RefreshCw,
      color: daysLeft > 7 ? 'var(--vcp-success)' : 'var(--vcp-warning)',
      bg: daysLeft > 7 ? 'var(--vcp-success-bg)' : 'var(--vcp-warning-bg)',
      detail: daysLeft > 0 ? `${daysLeft} days left` : 'Due to renew',
    })
  }

  if (stages.length === 0) return null

  return (
    <div className="vcp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-[var(--vcp-ink-strong)]">Subscription lifecycle</h3>
        <span className="text-[11px] text-[var(--vcp-ink-faint)] capitalize">{status}</span>
      </div>
      <div className="flex items-stretch gap-2 overflow-x-auto vcp-scroll pb-2">
        {stages.map((stage, i) => {
          const Icon = stage.icon
          const isLast = i === stages.length - 1
          return (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: stage.bg, color: stage.color }}
                  aria-hidden
                >
                  <Icon size={15} strokeWidth={2} />
                </span>
                <span className="text-[11px] font-semibold text-[var(--vcp-ink)] text-center">{stage.label}</span>
                {stage.date ? (
                  <span className="text-[10px] text-[var(--vcp-ink-muted)] text-center vcp-tnum">
                    {formatDate(stage.date)}
                  </span>
                ) : null}
                {stage.detail ? (
                  <span className="text-[10px] text-[var(--vcp-ink-faint)] text-center leading-tight">{stage.detail}</span>
                ) : null}
              </div>
              {!isLast ? (
                <div className="flex items-center flex-shrink-0">
                  <span className="block h-px w-8 bg-[var(--vcp-border)]" />
                  <svg width="8" height="8" viewBox="0 0 8 8" className="text-[var(--vcp-ink-faint)]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 1l3 3-3 3" />
                  </svg>
                </div>
              ) : null}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

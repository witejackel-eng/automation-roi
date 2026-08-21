'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/format'
import {
  User, Shield, FileText, Zap, Share2, Eye, CheckCircle2, AlertTriangle,
  XCircle, RefreshCw, CreditCard, DollarSign, Database, Activity,
  type LucideIcon,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Event type → icon + color mapping
// ---------------------------------------------------------------------------

type EventMeta = { icon: LucideIcon; color: string; bg: string }

function getEventMeta(eventType: string): EventMeta {
  const t = eventType.toUpperCase()
  // AUTH
  if (t === 'USER_SIGNED_IN') return { icon: User, color: 'var(--vcp-info)', bg: 'var(--vcp-info-bg)' }
  if (t === 'AUTH_FAILED') return { icon: Shield, color: 'var(--vcp-error)', bg: 'var(--vcp-error-bg)' }
  // PRODUCT
  if (t === 'PROJECT_CREATED') return { icon: FileText, color: 'var(--vcp-info)', bg: 'var(--vcp-info-bg)' }
  if (t === 'PROJECT_SAVED' || t === 'PROJECT_REOPENED') return { icon: FileText, color: 'var(--vcp-ink-muted)', bg: 'var(--vcp-surface-sunken)' }
  if (t === 'CALCULATION_STARTED') return { icon: Zap, color: 'var(--vcp-coral)', bg: 'var(--vcp-coral-tint)' }
  if (t === 'CALCULATION_COMPLETED') return { icon: CheckCircle2, color: 'var(--vcp-success)', bg: 'var(--vcp-success-bg)' }
  if (t === 'CALCULATION_FAILED') return { icon: XCircle, color: 'var(--vcp-error)', bg: 'var(--vcp-error-bg)' }
  // DELIVERABLE
  if (t === 'REPORT_STARTED' || t === 'REPORT_GENERATED') return { icon: FileText, color: 'var(--vcp-info)', bg: 'var(--vcp-info-bg)' }
  if (t === 'REPORT_FAILED') return { icon: XCircle, color: 'var(--vcp-error)', bg: 'var(--vcp-error-bg)' }
  if (t === 'PROPOSAL_GENERATED') return { icon: FileText, color: 'var(--vcp-coral)', bg: 'var(--vcp-coral-tint)' }
  if (t === 'PROPOSAL_FAILED') return { icon: XCircle, color: 'var(--vcp-error)', bg: 'var(--vcp-error-bg)' }
  // CLIENT-DELIVERY
  if (t === 'SHARE_CREATED') return { icon: Share2, color: 'var(--vcp-info)', bg: 'var(--vcp-info-bg)' }
  if (t === 'SHARE_VIEWED') return { icon: Eye, color: 'var(--vcp-ink-muted)', bg: 'var(--vcp-surface-sunken)' }
  if (t === 'SHARE_APPROVED') return { icon: CheckCircle2, color: 'var(--vcp-success)', bg: 'var(--vcp-success-bg)' }
  if (t === 'SHARE_CHANGES_REQUESTED') return { icon: AlertTriangle, color: 'var(--vcp-warning)', bg: 'var(--vcp-warning-bg)' }
  // BILLING
  if (t === 'WHOP_PAYMENT_RECEIVED') return { icon: DollarSign, color: 'var(--vcp-success)', bg: 'var(--vcp-success-bg)' }
  if (t === 'SUBSCRIPTION_CREATED') return { icon: CreditCard, color: 'var(--vcp-info)', bg: 'var(--vcp-info-bg)' }
  if (t === 'SUBSCRIPTION_UPDATED') return { icon: RefreshCw, color: 'var(--vcp-ink-muted)', bg: 'var(--vcp-surface-sunken)' }
  if (t === 'SUBSCRIPTION_CANCELLED') return { icon: XCircle, color: 'var(--vcp-error)', bg: 'var(--vcp-error-bg)' }
  if (t === 'SUBSCRIPTION_REFUNDED') return { icon: DollarSign, color: 'var(--vcp-warning)', bg: 'var(--vcp-warning-bg)' }
  // SYSTEM
  if (t === 'WEBHOOK_ERROR' || t === 'DATABASE_ERROR' || t === 'STORAGE_ERROR') return { icon: Database, color: 'var(--vcp-error)', bg: 'var(--vcp-error-bg)' }
  if (t === 'ADMIN_PAGE_VIEWED' || t === 'ADMIN_SEARCH') return { icon: Activity, color: 'var(--vcp-ink-muted)', bg: 'var(--vcp-surface-sunken)' }
  // AI
  if (t.startsWith('AI_')) return { icon: Zap, color: 'var(--vcp-coral)', bg: 'var(--vcp-coral-tint)' }
  // Default
  return { icon: Activity, color: 'var(--vcp-ink-muted)', bg: 'var(--vcp-surface-sunken)' }
}

function severityDot(severity: string): string {
  if (severity === 'error') return 'var(--vcp-error)'
  if (severity === 'warn') return 'var(--vcp-warning)'
  return 'var(--vcp-ink-faint)'
}

// ---------------------------------------------------------------------------
// Timeline entry type
// ---------------------------------------------------------------------------

export interface TimelineEntry {
  id: string
  eventType: string
  severity: string
  createdAt: string | Date
  requestId?: string | null
}

// ---------------------------------------------------------------------------
// Activity Timeline — vertical timeline with event icons + timestamps
// ---------------------------------------------------------------------------

export function ActivityTimeline({ entries, maxItems = 10 }: { entries: TimelineEntry[]; maxItems?: number }) {
  const items = entries.slice(0, maxItems)
  if (items.length === 0) {
    return (
      <div className="vcp-card p-8 flex flex-col items-center justify-center text-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[var(--vcp-surface-sunken)] flex items-center justify-center text-[var(--vcp-ink-faint)]" aria-hidden>
          <Activity size={18} strokeWidth={1.5} />
        </div>
        <p className="text-[13px] text-[var(--vcp-ink-muted)]">No activity recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="vcp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-[var(--vcp-ink-strong)]">Activity timeline</h3>
        <span className="text-[11px] text-[var(--vcp-ink-faint)]">Last {items.length} events</span>
      </div>
      <ol className="vcp-timeline" role="list">
        {items.map((entry, i) => {
          const meta = getEventMeta(entry.eventType)
          const Icon = meta.icon
          const isLast = i === items.length - 1
          return (
            <li key={entry.id} className="vcp-timeline-item">
              <div className="vcp-timeline-rail" aria-hidden>
                <span className="vcp-timeline-icon" style={{ background: meta.bg, color: meta.color }}>
                  <Icon size={13} strokeWidth={2} />
                </span>
                {!isLast && <span className="vcp-timeline-line" />}
              </div>
              <div className="vcp-timeline-content">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-medium text-[var(--vcp-ink)] vcp-mono">{entry.eventType}</span>
                  <span className="vcp-timeline-severity" style={{ background: severityDot(entry.severity) }} title={entry.severity} aria-hidden />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-[var(--vcp-ink-muted)]">{timeAgo(entry.createdAt)}</span>
                  {entry.requestId ? (
                    <span className="text-[10px] font-mono text-[var(--vcp-ink-faint)]">· req {entry.requestId.slice(0, 8)}</span>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

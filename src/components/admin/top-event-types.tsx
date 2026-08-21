'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * TopEventTypes — horizontal bar chart showing the top N event types by count.
 *
 * Each bar is colored by the event category (auth=info, billing=success,
 * system=error, ai=coral, delivery=warning, product=info). Bars are
 * proportional to the max count in the slice.
 */
const CATEGORY_COLORS: Record<string, string> = {
  AUTH: 'var(--vcp-info)',
  USER_SIGNED_IN: 'var(--vcp-info)',
  AUTH_FAILED: 'var(--vcp-error)',
  PRODUCT: 'var(--vcp-info)',
  CALCULATION: 'var(--vcp-coral)',
  PROJECT: 'var(--vcp-info)',
  REPORT: 'var(--vcp-warning)',
  PROPOSAL: 'var(--vcp-coral)',
  SHARE: 'var(--vcp-info)',
  SHARE_VIEWED: 'var(--vcp-ink-muted)',
  SHARE_APPROVED: 'var(--vcp-success)',
  SHARE_CHANGES_REQUESTED: 'var(--vcp-warning)',
  AI: 'var(--vcp-coral)',
  BILLING: 'var(--vcp-success)',
  WHOP: 'var(--vcp-success)',
  SUBSCRIPTION: 'var(--vcp-success)',
  WEBHOOK: 'var(--vcp-error)',
  DATABASE: 'var(--vcp-error)',
  STORAGE: 'var(--vcp-error)',
  ADMIN: 'var(--vcp-ink-muted)',
}

function getColor(eventType: string): string {
  const t = eventType.toUpperCase()
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (t.includes(key)) return color
  }
  return 'var(--vcp-ink-muted)'
}

export function TopEventTypes({
  entries,
  maxItems = 10,
}: {
  entries: { eventType: string; _count: number }[]
  maxItems?: number
}) {
  const sorted = [...entries].sort((a, b) => b._count - a._count).slice(0, maxItems)
  if (sorted.length === 0) {
    return (
      <div className="vcp-card p-5">
        <h3 className="text-[13px] font-semibold text-[var(--vcp-ink-strong)] mb-3">Top event types</h3>
        <p className="text-[13px] text-[var(--vcp-ink-muted)]">No events recorded yet.</p>
      </div>
    )
  }

  const max = sorted[0]._count || 1

  return (
    <div className="vcp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-[var(--vcp-ink-strong)]">Top event types</h3>
        <span className="text-[11px] text-[var(--vcp-ink-faint)]">By count, last 30 days</span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {sorted.map((entry, i) => {
          const pct = Math.round((entry._count / max) * 100)
          const color = getColor(entry.eventType)
          return (
            <li key={entry.eventType} className="flex items-center gap-3 group">
              <span className="text-[11px] text-[var(--vcp-ink-faint)] vcp-tnum w-5 text-right flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[12px] font-medium text-[var(--vcp-ink)] vcp-mono truncate">{entry.eventType}</span>
                  <span className="text-[12px] font-semibold text-[var(--vcp-ink-strong)] vcp-tnum flex-shrink-0">{entry._count}</span>
                </div>
                <div className="h-[5px] bg-[var(--vcp-surface-sunken)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out group-hover:opacity-80"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

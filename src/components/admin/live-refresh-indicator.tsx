'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

/**
 * Live "Last refreshed" indicator.
 *
 * Shows "Updated Xs ago" in the top bar and auto-updates every 10 seconds.
 * The timestamp resets on manual refresh (clicking the Refresh button navigates
 * to /admin which reloads the page, and the component re-mounts with a fresh timestamp).
 *
 * In the preview harness this is cosmetic — it tracks component mount time.
 * In production it would track the last successful data fetch.
 */
export function LiveRefreshIndicator({ className }: { className?: string }) {
  const [mountedAt] = React.useState(() => Date.now())
  const [now, setNow] = React.useState(Date.now())
  const [spinning, setSpinning] = React.useState(false)

  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10_000) // update every 10s
    return () => clearInterval(interval)
  }, [])

  const elapsedMs = now - mountedAt
  const elapsedSec = Math.floor(elapsedMs / 1000)
  let label: string
  if (elapsedSec < 5) label = 'just now'
  else if (elapsedSec < 60) label = `${elapsedSec}s ago`
  else if (elapsedSec < 3600) label = `${Math.floor(elapsedSec / 60)}m ago`
  else label = `${Math.floor(elapsedSec / 3600)}h ago`

  const handleRefresh = () => {
    setSpinning(true)
    // Navigate to the current page to force a refresh
    window.location.reload()
  }

  return (
    <span className={cn('hidden md:inline-flex items-center gap-2 px-2.5 h-7 rounded-[var(--vcp-radius-sm)] text-[11px] text-[var(--vcp-ink-muted)] bg-[var(--vcp-surface)]', className)}>
      <span className="vcp-dot vcp-dot-success vcp-dot-pulse" aria-hidden />
      <span>Updated {label}</span>
      <button
        onClick={handleRefresh}
        className="vcp-focus rounded p-0.5 hover:text-[var(--vcp-ink)] transition-colors"
        aria-label="Refresh data"
        title="Refresh"
      >
        <RefreshCw size={12} className={cn(spinning && 'animate-spin')} />
      </button>
    </span>
  )
}

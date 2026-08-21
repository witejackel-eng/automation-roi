'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Status helpers — semantic, never color-only
// ---------------------------------------------------------------------------

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'coral'

export function StatusDot({ variant = 'neutral', label }: { variant?: StatusVariant; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn('vcp-dot', `vcp-dot-${variant}`)} aria-hidden />
      {label ? <span className="text-[13px] text-[var(--vcp-ink)]">{label}</span> : null}
    </span>
  )
}

export function StatusPill({ variant = 'neutral', children, icon }: { variant?: StatusVariant; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className={cn('vcp-pill', `vcp-pill-${variant}`)} role="status">
      {icon}
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

export function KpiCard({
  label,
  value,
  sub,
  trend,
  variant = 'neutral',
  icon,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  trend?: { value: string; direction: 'up' | 'down' | 'flat'; good?: boolean }
  variant?: StatusVariant
  icon?: React.ReactNode
}) {
  return (
    <div className="vcp-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">{label}</span>
        {icon ? <span className="text-[var(--vcp-ink-faint)]">{icon}</span> : null}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-[26px] leading-none font-semibold text-[var(--vcp-ink-strong)] vcp-tnum">{value}</span>
        {trend ? (
          <span className={cn(
            'text-[12px] font-medium mb-[2px] flex items-center gap-0.5',
            trend.good === undefined ? 'text-[var(--vcp-ink-muted)]' : trend.good ? 'text-[var(--vcp-success)]' : 'text-[var(--vcp-error)]',
          )}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
          </span>
        ) : null}
      </div>
      {sub ? <span className="text-[12px] text-[var(--vcp-ink-muted)]">{sub}</span> : null}
      {variant !== 'neutral' ? <span className={cn('h-[3px] w-10 rounded-full', `bg-[var(--vcp-${variant === 'coral' ? 'coral' : variant})]`)} aria-hidden /> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

export function SectionHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--vcp-ink-strong)] tracking-tight">{title}</h1>
        {subtitle ? <p className="text-[13px] text-[var(--vcp-ink-muted)] mt-1">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty / Error / Loading states
// ---------------------------------------------------------------------------

export function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="vcp-card p-10 flex flex-col items-center justify-center text-center gap-2">
      <div className="w-10 h-10 rounded-full bg-[var(--vcp-surface-sunken)] flex items-center justify-center text-[var(--vcp-ink-faint)]" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--vcp-ink-strong)] mt-1">{title}</h3>
      <p className="text-[13px] text-[var(--vcp-ink-muted)] max-w-sm">{message}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}

export function ErrorState({ title = 'Unable to load.', message = 'Something went wrong fetching this data. Refresh and try again.', onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div className="vcp-card p-10 flex flex-col items-center justify-center text-center gap-2 border-[var(--vcp-error)]/30">
      <div className="w-10 h-10 rounded-full bg-[var(--vcp-error-bg)] flex items-center justify-center text-[var(--vcp-error)]" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--vcp-ink-strong)]">{title}</h3>
      <p className="text-[13px] text-[var(--vcp-ink-muted)] max-w-sm">{message}</p>
      {onRetry ? (
        <button onClick={onRetry} className="mt-3 vcp-pill vcp-pill-outline vcp-focus cursor-pointer hover:bg-[var(--vcp-surface-sunken)]">Refresh</button>
      ) : null}
    </div>
  )
}

export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="vcp-card overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-[var(--vcp-border)] last:border-0">
          <div className="h-3 w-24 vcp-shimmer rounded" />
          <div className="h-3 w-40 vcp-shimmer rounded" />
          <div className="h-3 w-16 vcp-shimmer rounded" />
          <div className="h-3 w-12 vcp-shimmer rounded ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page container
// ---------------------------------------------------------------------------

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-5', className)}>{children}</div>
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="vcp-card-flat p-2 flex flex-wrap items-center gap-2">
      {children}
    </div>
  )
}

export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex items-center gap-2 px-2 py-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--vcp-ink-faint)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[13px] text-[var(--vcp-ink)] vcp-focus rounded border border-transparent hover:border-[var(--vcp-border)] cursor-pointer pr-6"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…', autoFocus }: { value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean }) {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') { e.preventDefault(); ref.current?.focus() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <div className="relative flex-1 min-w-[180px]">
      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--vcp-ink-faint)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
      <input
        ref={ref}
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-8 pr-3 text-[13px] bg-[var(--vcp-surface)] border border-[var(--vcp-border)] rounded-[var(--vcp-radius-sm)] text-[var(--vcp-ink)] placeholder:text-[var(--vcp-ink-faint)] vcp-focus"
      />
      <kbd className="hidden sm:inline absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--vcp-ink-faint)] border border-[var(--vcp-border)] rounded px-1">/</kbd>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export function Pagination({ page, totalPages, searchParams }: { page: number; totalPages: number; searchParams: Record<string, string | undefined> }) {
  if (totalPages <= 1) return null
  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) if (v != null && v !== '') params.set(k, v)
    params.set('page', String(p))
    return `?${params.toString()}`
  }
  return (
    <nav className="flex items-center justify-between gap-2 mt-4" aria-label="Pagination">
      <span className="text-[12px] text-[var(--vcp-ink-muted)]">Page {page} of {totalPages}</span>
      <div className="flex items-center gap-1">
        <Link href={buildHref(Math.max(1, page - 1))} aria-disabled={page <= 1} className={cn('vcp-pill vcp-pill-outline vcp-focus', page <= 1 && 'pointer-events-none opacity-40')}>‹ Prev</Link>
        <Link href={buildHref(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages} className={cn('vcp-pill vcp-pill-outline vcp-focus', page >= totalPages && 'pointer-events-none opacity-40')}>Next ›</Link>
      </div>
    </nav>
  )
}

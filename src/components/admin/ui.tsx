'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Status helpers — semantic, never color-only
// ---------------------------------------------------------------------------

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'coral'

export function StatusDot({ variant = 'neutral', label, pulse }: { variant?: StatusVariant; label?: string; pulse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn('vcp-dot', `vcp-dot-${variant}`, pulse && 'vcp-dot-pulse')} aria-hidden />
      {label ? <span className="text-[13px] text-[var(--vcp-ink)]">{label}</span> : null}
    </span>
  )
}

export function StatusPill({ variant = 'neutral', children, icon, size = 'md' }: { variant?: StatusVariant; children: React.ReactNode; icon?: React.ReactNode; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'vcp-pill vcp-pill-border',
        `vcp-pill-${variant}`,
        size === 'sm' && 'vcp-pill-sm',
      )}
      role="status"
    >
      {icon}
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// KPI Card — refined with icon pill, hover lift, accent bar
// ---------------------------------------------------------------------------

export function KpiCard({
  label,
  value,
  sub,
  trend,
  variant = 'neutral',
  icon,
  interactive = false,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  trend?: { value: string; direction: 'up' | 'down' | 'flat'; good?: boolean }
  variant?: StatusVariant
  icon?: React.ReactNode
  interactive?: boolean
}) {
  const trendColor =
    trend?.good === undefined ? 'var(--vcp-ink-muted)' : trend.good ? 'var(--vcp-success)' : 'var(--vcp-error)'
  return (
    <div
      className={cn(
        'vcp-card vcp-kpi-card group',
        interactive && 'vcp-kpi-card-interactive',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon ? (
            <span className={cn('vcp-kpi-icon-pill', `vcp-kpi-icon-${variant}`)} aria-hidden>
              {icon}
            </span>
          ) : null}
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] truncate">{label}</span>
        </div>
      </div>
      <div className="flex items-end gap-2 mt-3">
        <span className="text-[28px] leading-none font-semibold text-[var(--vcp-ink-strong)] vcp-tnum tracking-tight">{value}</span>
        {trend ? (
          <span
            className="text-[12px] font-semibold mb-[3px] flex items-center gap-0.5 vcp-trend"
            style={{ color: trendColor }}
          >
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
          </span>
        ) : null}
      </div>
      {sub ? <span className="text-[12px] text-[var(--vcp-ink-muted)] mt-1.5">{sub}</span> : null}
      {variant !== 'neutral' ? (
        <span className={cn('h-[3px] w-full rounded-full mt-3 vcp-kpi-accent', `vcp-kpi-accent-${variant}`)} aria-hidden />
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section header — refined with breadcrumb support
// ---------------------------------------------------------------------------

export function SectionHeader({ title, subtitle, actions, breadcrumb }: { title: string; subtitle?: string; actions?: React.ReactNode; breadcrumb?: { label: string; href?: string }[] }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav className="flex items-center gap-1.5 text-[12px] text-[var(--vcp-ink-faint)] mb-2" aria-label="Breadcrumb">
            {breadcrumb.map((b, i) => (
              <React.Fragment key={i}>
                {b.href ? (
                  <Link href={b.href} className="hover:text-[var(--vcp-coral)] vcp-focus rounded transition-colors">{b.label}</Link>
                ) : (
                  <span className="text-[var(--vcp-ink-muted)] font-medium">{b.label}</span>
                )}
                {i < breadcrumb.length - 1 ? <span className="text-[var(--vcp-ink-faint)]">/</span> : null}
              </React.Fragment>
            ))}
          </nav>
        ) : null}
        <h1 className="text-[22px] font-semibold text-[var(--vcp-ink-strong)] tracking-tight">{title}</h1>
        {subtitle ? <p className="text-[13px] text-[var(--vcp-ink-muted)] mt-1">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 flex-shrink-0">{actions}</div> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty / Error / Loading states — refined
// ---------------------------------------------------------------------------

export function EmptyState({ title, message, action, icon }: { title: string; message: string; action?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="vcp-card p-12 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-[var(--vcp-surface-sunken)] flex items-center justify-center text-[var(--vcp-ink-faint)]" aria-hidden>
        {icon ?? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>}
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--vcp-ink-strong)]">{title}</h3>
      <p className="text-[13px] text-[var(--vcp-ink-muted)] max-w-sm leading-relaxed">{message}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export function ErrorState({ title = 'Unable to load.', message = 'Something went wrong fetching this data. Refresh and try again.', onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div className="vcp-card p-12 flex flex-col items-center justify-center text-center gap-3 border-[var(--vcp-error)]/30">
      <div className="w-12 h-12 rounded-2xl bg-[var(--vcp-error-bg)] flex items-center justify-center text-[var(--vcp-error)]" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--vcp-ink-strong)]">{title}</h3>
      <p className="text-[13px] text-[var(--vcp-ink-muted)] max-w-sm leading-relaxed">{message}</p>
      {onRetry ? (
        <button onClick={onRetry} className="mt-2 vcp-pill vcp-pill-outline vcp-focus cursor-pointer hover:bg-[var(--vcp-surface-sunken)]">Refresh</button>
      ) : null}
    </div>
  )
}

export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="vcp-card overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-[var(--vcp-border)] last:border-0">
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
// Filter bar — refined with better spacing
// ---------------------------------------------------------------------------

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="vcp-card-flat p-2 flex flex-wrap items-center gap-1">
      {children}
    </div>
  )
}

export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--vcp-radius-sm)] hover:bg-[var(--vcp-surface-sunken)] transition-colors">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--vcp-ink-faint)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[13px] font-medium text-[var(--vcp-ink)] vcp-focus rounded cursor-pointer pr-1 -mr-1"
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
    const onKey = (e: KeyboardEvent) => { if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'SELECT') { e.preventDefault(); ref.current?.focus() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <div className="relative flex-1 min-w-[180px]">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--vcp-ink-faint)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
      <input
        ref={ref}
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-9 text-[13px] bg-[var(--vcp-surface)] border border-[var(--vcp-border)] rounded-[var(--vcp-radius-sm)] text-[var(--vcp-ink)] placeholder:text-[var(--vcp-ink-faint)] vcp-focus transition-colors hover:border-[var(--vcp-border-strong)]"
      />
      <kbd className="hidden sm:inline absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--vcp-ink-faint)] bg-[var(--vcp-surface-sunken)] border border-[var(--vcp-border)] rounded px-1.5 py-0.5">/</kbd>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Export button — CSV export for list pages
// ---------------------------------------------------------------------------

export function ExportButton({ onClick, loading, label = 'Export CSV' }: { onClick: () => void; loading?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="vcp-pill vcp-pill-outline vcp-focus cursor-pointer hover:bg-[var(--vcp-surface-sunken)] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
    >
      {loading ? (
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
      ) : (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
      )}
      {loading ? 'Exporting…' : label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Pagination — refined with page numbers
// ---------------------------------------------------------------------------

export function Pagination({ page, totalPages, searchParams }: { page: number; totalPages: number; searchParams: Record<string, string | undefined> }) {
  if (totalPages <= 1) return null
  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) if (v != null && v !== '') params.set(k, v)
    params.set('page', String(p))
    return `?${params.toString()}`
  }

  // Build a compact page-number list with ellipsis
  const pages: (number | 'ellipsis')[] = []
  const add = (p: number | 'ellipsis') => pages.push(p)
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) add(i)
  } else {
    add(1)
    if (page > 3) add('ellipsis')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i)
    if (page < totalPages - 2) add('ellipsis')
    add(totalPages)
  }

  return (
    <nav className="flex items-center justify-between gap-3 mt-5" aria-label="Pagination">
      <span className="text-[12px] text-[var(--vcp-ink-muted)]">Page <span className="font-semibold text-[var(--vcp-ink)] vcp-tnum">{page}</span> of <span className="vcp-tnum">{totalPages}</span></span>
      <div className="flex items-center gap-1">
        <Link href={buildHref(Math.max(1, page - 1))} aria-disabled={page <= 1} aria-label="Previous page" className={cn('vcp-page-btn', page <= 1 && 'vcp-page-btn-disabled')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className="px-2 text-[12px] text-[var(--vcp-ink-faint)]">…</span>
          ) : (
            <Link key={p} href={buildHref(p)} aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined} className={cn('vcp-page-btn', p === page && 'vcp-page-btn-active')}>
              <span className="vcp-tnum">{p}</span>
            </Link>
          ),
        )}
        <Link href={buildHref(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages} aria-label="Next page" className={cn('vcp-page-btn', page >= totalPages && 'vcp-page-btn-disabled')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
        </Link>
      </div>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Table row action button — for inline row actions
// ---------------------------------------------------------------------------

export function RowAction({ href, onClick, icon, label }: { href?: string; onClick?: () => void; icon: React.ReactNode; label: string }) {
  const cls = 'inline-flex items-center justify-center w-7 h-7 rounded-[var(--vcp-radius-sm)] text-[var(--vcp-ink-faint)] hover:text-[var(--vcp-coral)] hover:bg-[var(--vcp-coral-subtle)] vcp-focus transition-colors'
  if (href) {
    return <Link href={href} className={cls} aria-label={label} title={label}>{icon}</Link>
  }
  return <button onClick={onClick} className={cls} aria-label={label} title={label}>{icon}</button>
}

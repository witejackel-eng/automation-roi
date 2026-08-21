'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Users, Building2, CreditCard, Receipt, Activity, type LucideIcon } from 'lucide-react'
import type { SearchResult } from '@/lib/admin/operational-queries'

const GROUPS: { kind: SearchResult['kind']; label: string; icon: LucideIcon; href: (id: string) => string }[] = [
  { kind: 'customer', label: 'Customers', icon: Users, href: (id) => `/admin/customers/${id}` },
  { kind: 'organization', label: 'Organizations', icon: Building2, href: (id) => `/admin/organizations/${id}` },
  { kind: 'subscription', label: 'Subscriptions', icon: CreditCard, href: (id) => `/admin/subscriptions?id=${id}` },
  { kind: 'payment', label: 'Payments', icon: Receipt, href: (id) => `/admin/payments?id=${id}` },
  { kind: 'event', label: 'System events', icon: Activity, href: (id) => `/admin/events?id=${id}` },
]

function groupResults(results: SearchResult[]) {
  const grouped: Record<SearchResult['kind'], SearchResult[]> = {
    customer: [],
    organization: [],
    subscription: [],
    payment: [],
    event: [],
  }
  for (const r of results) grouped[r.kind].push(r)
  return grouped
}

/**
 * Search results with keyboard navigation.
 *
 * - Up/Down arrows move the selection highlight across all results (flat list).
 * - Enter navigates to the highlighted result.
 * - The active index resets when the query changes.
 */
export function SearchResults({ results, query }: { results: SearchResult[]; query: string }) {
  const router = useRouter()
  const grouped = groupResults(results)
  const flat: { kind: SearchResult['kind']; id: string; label: string; sublabel: string; href: string }[] = []
  for (const g of GROUPS) {
    for (const r of grouped[g.kind]) {
      flat.push({ kind: g.kind, id: r.id, label: r.label, sublabel: r.sublabel, href: g.href(r.id) })
    }
  }

  const [activeIndex, setActiveIndex] = React.useState(0)

  // Reset selection when query changes
  React.useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Keyboard navigation
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, flat.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && flat[activeIndex]) {
        e.preventDefault()
        router.push(flat[activeIndex].href)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flat, activeIndex, router])

  if (flat.length === 0) return null

  let runningIndex = 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {GROUPS.map((g) => {
        const rows = grouped[g.kind]
        if (rows.length === 0) return null
        const Icon = g.icon
        return (
          <section key={g.kind} className="vcp-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--vcp-border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-[6px] bg-[var(--vcp-surface-sunken)] flex items-center justify-center text-[var(--vcp-ink-muted)]">
                  <Icon size={14} strokeWidth={2} />
                </span>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">
                  {g.label}
                </h3>
              </div>
              <span className="vcp-pill vcp-pill-outline vcp-mono">{rows.length}</span>
            </div>
            <ul className="divide-y divide-[var(--vcp-border)]">
              {rows.map((r) => {
                const myIndex = runningIndex++
                const isActive = myIndex === activeIndex
                const href = g.href(r.id)
                return (
                  <li key={`${r.kind}-${r.id}`}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center justify-between gap-3 px-5 py-3 transition-colors vcp-focus border-l-2',
                        isActive
                          ? 'bg-[var(--vcp-coral-subtle)] border-[var(--vcp-coral)]'
                          : 'hover:bg-[var(--vcp-coral-subtle)] border-transparent',
                      )}
                    >
                      <span className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium text-[var(--vcp-ink-strong)] truncate">
                          {r.label}
                        </span>
                        {r.sublabel ? (
                          <span className="text-[12px] vcp-mono text-[var(--vcp-ink-muted)] truncate">
                            {r.sublabel}
                          </span>
                        ) : null}
                      </span>
                      <span className="vcp-mono text-[11px] text-[var(--vcp-ink-faint)] flex-none">
                        {r.id.length > 12 ? `${r.id.slice(0, 10)}…` : r.id}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      {/* Keyboard hint */}
      <div className="lg:col-span-2 flex items-center justify-center gap-3 text-[11px] text-[var(--vcp-ink-faint)] py-2">
        <span className="flex items-center gap-1">
          <kbd className="vcp-kbd-key-inline">↑</kbd>
          <kbd className="vcp-kbd-key-inline">↓</kbd>
          navigate
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <kbd className="vcp-kbd-key-inline">Enter</kbd>
          open
        </span>
      </div>
    </div>
  )
}

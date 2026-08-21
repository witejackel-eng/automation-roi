import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import { adminSearch, type SearchResult } from '@/lib/admin/operational-queries'
import {
  SectionHeader, PageContainer, EmptyState,
} from '@/components/admin/ui'
import { Users, Building2, CreditCard, Receipt, Activity, type LucideIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

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

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'search' } })

  const sp = await searchParams
  const qRaw = typeof sp.q === 'string' ? sp.q.trim() : ''
  const q = qRaw

  const results = q ? await adminSearch(q, 20) : []
  const grouped = groupResults(results)
  const totalResults = results.length

  return (
    <PageContainer>
      <SectionHeader
        title="Search"
        subtitle="Operational records across Viableo"
      />

      {q ? (
        <p className="text-[13px] text-[var(--vcp-ink-muted)] -mt-2 mb-2">
          {totalResults > 0
            ? `${totalResults} result${totalResults === 1 ? '' : 's'} for `
            : 'No results for '}
          <span className="vcp-mono text-[12.5px] text-[var(--vcp-ink-strong)]">&ldquo;{q}&rdquo;</span>
        </p>
      ) : null}

      {!q ? (
        <EmptyState
          title="Search operational records."
          message="Search customers, organizations, subscriptions, payments, and events."
        />
      ) : totalResults === 0 ? (
        <EmptyState
          title={`No results for \u201C${q}\u201D.`}
          message="Try a different name, email, plan key, Whop payment id, or event type."
        />
      ) : (
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
                  {rows.map((r) => (
                    <li key={`${r.kind}-${r.id}`}>
                      <Link
                        href={g.href(r.id)}
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[var(--vcp-coral-subtle)] transition-colors vcp-focus"
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
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}

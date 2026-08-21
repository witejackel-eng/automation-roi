import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import { adminSearch, type SearchResult } from '@/lib/admin/operational-queries'
import {
  SectionHeader, PageContainer, EmptyState,
} from '@/components/admin/ui'
import { SearchResults } from './_components/search-results'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'search' } })

  const sp = await searchParams
  const qRaw = typeof sp.q === 'string' ? sp.q.trim() : ''
  const q = qRaw

  const results = q ? await adminSearch(q, 20) : []
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
        <SearchResults results={results} query={q} />
      )}
    </PageContainer>
  )
}

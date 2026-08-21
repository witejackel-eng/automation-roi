'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterBar, SearchInput, FilterSelect } from '@/components/admin/ui'

// Debounced client-side filter that pushes state into the URL so the server
// component re-renders with the new search/status. Mirrors the FilterBar +
// SearchInput pattern shared across admin pages.
export function PaymentFilters({ status }: { status: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const search = sp.get('search') ?? ''

  const [term, setTerm] = React.useState(search)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state when the URL changes (e.g. back/forward navigation).
  React.useEffect(() => {
    setTerm(sp.get('search') ?? '')
  }, [sp])

  const push = React.useCallback((next: { search?: string; status?: string }) => {
    const params = new URLSearchParams(sp.toString())
    if (next.search !== undefined) {
      if (next.search === '') params.delete('search')
      else params.set('search', next.search)
    }
    if (next.status !== undefined) {
      if (next.status === 'all') params.delete('status')
      else params.set('status', next.status)
    }
    params.delete('page')
    router.push(`/admin/payments?${params.toString()}`)
  }, [router, sp])

  const onSearch = React.useCallback((v: string) => {
    setTerm(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => push({ search: v }), 300)
  }, [push])

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return (
    <FilterBar>
      <SearchInput
        value={term}
        onChange={onSearch}
        placeholder="Search org, payment ID, or event ID…"
      />
      <FilterSelect
        label="Status"
        value={status}
        onChange={(v) => push({ status: v })}
        options={[
          { value: 'all', label: 'All statuses' },
          { value: 'succeeded', label: 'Succeeded' },
          { value: 'pending', label: 'Pending' },
          { value: 'failed', label: 'Failed' },
        ]}
      />
    </FilterBar>
  )
}

'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterBar, SearchInput } from '@/components/admin/ui'

// Debounced search that pushes the term into the URL so the entitlements
// server component re-renders with the new filter. Mirrors the FilterBar +
// SearchInput pattern shared across admin pages.
export function EntitlementFilters() {
  const router = useRouter()
  const sp = useSearchParams()
  const search = sp.get('search') ?? ''

  const [term, setTerm] = React.useState(search)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state when the URL changes (e.g. back/forward navigation).
  React.useEffect(() => {
    setTerm(sp.get('search') ?? '')
  }, [sp])

  const push = React.useCallback((next: string) => {
    const params = new URLSearchParams(sp.toString())
    if (next === '') params.delete('search')
    else params.set('search', next)
    params.delete('page')
    router.push(`/admin/entitlements?${params.toString()}`)
  }, [router, sp])

  const onSearch = React.useCallback((v: string) => {
    setTerm(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => push(v), 300)
  }, [push])

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return (
    <FilterBar>
      <SearchInput
        value={term}
        onChange={onSearch}
        placeholder="Search organizations…"
      />
    </FilterBar>
  )
}

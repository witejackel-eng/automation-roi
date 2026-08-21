'use client'

import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { FilterBar, SearchInput } from '@/components/admin/ui'

/**
 * Client-side filter bar for the Organizations list. Wraps FilterBar + SearchInput
 * and navigates via router.push, debouncing search input by 300ms.
 */
export function OrgFilters({ search }: { search: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = React.useState(search)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep local state in sync when the URL changes (pagination, back/forward).
  React.useEffect(() => {
    setValue(searchParams.get('search') ?? '')
  }, [searchParams])

  const commit = React.useCallback((q: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set('search', q)
    else params.delete('search')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  const onChange = (v: string) => {
    setValue(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => commit(v), 300)
  }

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return (
    <FilterBar>
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder="Search organization name…"
        autoFocus
      />
    </FilterBar>
  )
}

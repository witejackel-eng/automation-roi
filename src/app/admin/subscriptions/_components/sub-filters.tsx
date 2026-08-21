'use client'

import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { FilterBar, SearchInput, FilterSelect } from '@/components/admin/ui'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'trialing', label: 'Trialing' },
  { value: 'past_due', label: 'Past due' },
  { value: 'canceling', label: 'Canceling' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'expired', label: 'Expired' },
]

/**
 * Client-side filter bar for the Subscriptions list. Wraps FilterBar + SearchInput
 * + FilterSelect and navigates via router.push, debouncing search input by 300ms.
 */
export function SubFilters({ search, status }: { search: string; status: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = React.useState(search)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setValue(searchParams.get('search') ?? '')
  }, [searchParams])

  const buildHref = React.useCallback((next: { search?: string; status?: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    const searchVal = next.search !== undefined ? next.search : (searchParams.get('search') ?? '')
    const statusVal = next.status !== undefined ? next.status : (searchParams.get('status') ?? 'all')
    if (searchVal) params.set('search', searchVal)
    else params.delete('search')
    if (statusVal && statusVal !== 'all') params.set('status', statusVal)
    else params.delete('status')
    params.delete('page')
    return `${pathname}?${params.toString()}`
  }, [pathname, searchParams])

  const commitSearch = React.useCallback((q: string) => {
    router.push(buildHref({ search: q }))
  }, [buildHref, router])

  const onChange = (v: string) => {
    setValue(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => commitSearch(v), 300)
  }

  const onStatus = (v: string) => {
    router.push(buildHref({ status: v }))
  }

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return (
    <FilterBar>
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder="Search org name, plan key, or Whop membership ID…"
        autoFocus
      />
      <FilterSelect
        label="Status"
        value={status || 'all'}
        onChange={onStatus}
        options={STATUS_OPTIONS}
      />
    </FilterBar>
  )
}

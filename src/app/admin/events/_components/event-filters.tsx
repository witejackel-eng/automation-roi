'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterBar, SearchInput, FilterSelect } from '@/components/admin/ui'

// Client-side filter bar for the System Events console. Wraps FilterBar +
// SearchInput (300ms debounce) and two FilterSelects (event type + severity)
// derived from getEventTypeSummary on the server. All state is pushed into URL
// search params so the server component re-renders; back/forward syncs local
// input state.
export function EventFilters({
  eventType,
  severity,
  eventTypeOptions,
}: {
  eventType: string
  severity: string
  eventTypeOptions: string[]
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const search = sp.get('search') ?? ''

  const [term, setTerm] = React.useState(search)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setTerm(sp.get('search') ?? '')
  }, [sp])

  const push = React.useCallback((next: { search?: string; eventType?: string; severity?: string }) => {
    const params = new URLSearchParams(sp.toString())
    if (next.search !== undefined) {
      if (next.search === '') params.delete('search')
      else params.set('search', next.search)
    }
    if (next.eventType !== undefined) {
      if (next.eventType === 'all') params.delete('eventType')
      else params.set('eventType', next.eventType)
    }
    if (next.severity !== undefined) {
      if (next.severity === 'all') params.delete('severity')
      else params.set('severity', next.severity)
    }
    params.delete('page')
    router.push(`/admin/events?${params.toString()}`)
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
        placeholder="Search event type or request ID…"
      />
      <FilterSelect
        label="Event type"
        value={eventType}
        onChange={(v) => push({ eventType: v })}
        options={[
          { value: 'all', label: 'All event types' },
          ...eventTypeOptions.map((t) => ({ value: t, label: t })),
        ]}
      />
      <FilterSelect
        label="Severity"
        value={severity}
        onChange={(v) => push({ severity: v })}
        options={[
          { value: 'all', label: 'All severities' },
          { value: 'info', label: 'Info' },
          { value: 'warn', label: 'Warning' },
          { value: 'error', label: 'Error' },
        ]}
      />
    </FilterBar>
  )
}

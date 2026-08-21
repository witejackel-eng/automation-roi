'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterBar, SearchInput, FilterSelect } from '@/components/admin/ui'

// Client-side filter bar for the Audit Log. Wraps FilterBar + SearchInput
// (300ms debounce) + FilterSelect for action. All state is pushed into URL
// search params so the server component re-renders; back/forward syncs local
// input state.
export function AuditFilters({ action }: { action: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const search = sp.get('search') ?? ''

  const [term, setTerm] = React.useState(search)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setTerm(sp.get('search') ?? '')
  }, [sp])

  const push = React.useCallback((next: { search?: string; action?: string }) => {
    const params = new URLSearchParams(sp.toString())
    if (next.search !== undefined) {
      if (next.search === '') params.delete('search')
      else params.set('search', next.search)
    }
    if (next.action !== undefined) {
      if (next.action === 'all') params.delete('action')
      else params.set('action', next.action)
    }
    params.delete('page')
    router.push(`/admin/audit?${params.toString()}`)
  }, [router, sp])

  const onSearch = React.useCallback((v: string) => {
    setTerm(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => push({ search: v }), 300)
  }, [push])

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  // Common privileged actions surfaced as quick filters. Derived from the
  // audit-log vocabulary established in the seed script + scripts/bootstrap.
  const actionOptions = [
    { value: 'all', label: 'All actions' },
    { value: 'ENTITLEMENT_OVERRIDE', label: 'Entitlement override' },
    { value: 'IMPERSONATION_START', label: 'Impersonation start' },
    { value: 'IMPERSONATION_END', label: 'Impersonation end' },
    { value: 'QA_TIER_SWITCH', label: 'QA tier switch' },
    { value: 'QA_WEBHOOK_REPLAY', label: 'QA webhook replay' },
    { value: 'SUPERADMIN_BOOTSTRAP', label: 'Superadmin bootstrap' },
    { value: 'ADMIN_PAGE_VIEWED', label: 'Admin page viewed' },
    { value: 'PLANMAPPING_UPDATE', label: 'Plan mapping update' },
  ]

  return (
    <FilterBar>
      <SearchInput
        value={term}
        onChange={onSearch}
        placeholder="Search action or reason…"
      />
      <FilterSelect
        label="Action"
        value={action}
        onChange={(v) => push({ action: v })}
        options={actionOptions}
      />
    </FilterBar>
  )
}

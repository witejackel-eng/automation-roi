'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterBar, SearchInput, FilterSelect } from '@/components/admin/ui'
import { cn } from '@/lib/utils'
import { ShieldCheck, User, Users } from 'lucide-react'

const ROLE_PILLS = [
  { value: 'all', label: 'All roles', icon: Users, activeClass: 'vcp-pill-neutral' },
  { value: 'SUPERADMIN', label: 'Superadmin', icon: ShieldCheck, activeClass: 'vcp-pill-coral' },
  { value: 'OWNER', label: 'Owner', icon: User, activeClass: 'vcp-pill-info' },
  { value: 'MEMBER', label: 'Member', icon: User, activeClass: 'vcp-pill-outline' },
]

export function AuditFilters({ action }: { action: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const search = sp.get('search') ?? ''
  const role = sp.get('role') ?? 'all'

  const [term, setTerm] = React.useState(search)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setTerm(sp.get('search') ?? '')
  }, [sp])

  const push = React.useCallback((next: { search?: string; action?: string; role?: string }) => {
    const params = new URLSearchParams(sp.toString())
    if (next.search !== undefined) {
      if (next.search === '') params.delete('search')
      else params.set('search', next.search)
    }
    if (next.action !== undefined) {
      if (next.action === 'all') params.delete('action')
      else params.set('action', next.action)
    }
    if (next.role !== undefined) {
      if (next.role === 'all') params.delete('role')
      else params.set('role', next.role)
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
    <div className="flex flex-col gap-2">
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
      {/* Role filter pills — visual quick-filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--vcp-ink-faint)] mr-1">Role</span>
        {ROLE_PILLS.map((pill) => {
          const isActive = role === pill.value
          const Icon = pill.icon
          return (
            <button
              key={pill.value}
              onClick={() => push({ role: pill.value })}
              className={cn(
                'vcp-pill vcp-focus cursor-pointer transition-all',
                isActive ? pill.activeClass : 'vcp-pill-outline hover:bg-[var(--vcp-surface-sunken)]',
              )}
            >
              <Icon size={11} strokeWidth={2} />
              {pill.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

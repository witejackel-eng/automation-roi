'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FilterBar, SearchInput, FilterSelect } from '@/components/admin/ui'

// Debounced client-side filter that pushes state into the URL so the server
// component re-renders with the new search/plan/subscription/attention. Mirrors
// the FilterBar + SearchInput + FilterSelect pattern shared across admin pages.
export function CustomerFilters({
  q,
  plan,
  subscriptionStatus,
  attention,
}: {
  q: string
  plan: string
  subscriptionStatus: string
  attention: string
}) {
  const router = useRouter()
  const sp = useSearchParams()

  const [term, setTerm] = React.useState(q)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state when the URL changes (e.g. back/forward navigation).
  React.useEffect(() => {
    setTerm(sp.get('q') ?? '')
  }, [sp])

  const push = React.useCallback(
    (next: { q?: string; plan?: string; subscriptionStatus?: string; attention?: string }) => {
      const params = new URLSearchParams(sp.toString())
      if (next.q !== undefined) {
        if (next.q === '') params.delete('q')
        else params.set('q', next.q)
      }
      if (next.plan !== undefined) {
        if (next.plan === 'all') params.delete('plan')
        else params.set('plan', next.plan)
      }
      if (next.subscriptionStatus !== undefined) {
        if (next.subscriptionStatus === 'all') params.delete('subscriptionStatus')
        else params.set('subscriptionStatus', next.subscriptionStatus)
      }
      if (next.attention !== undefined) {
        if (next.attention === '1') params.set('attention', '1')
        else params.delete('attention')
      }
      params.delete('page')
      router.push(`/admin/customers?${params.toString()}`)
    },
    [router, sp],
  )

  const onSearch = React.useCallback(
    (v: string) => {
      setTerm(v)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => push({ q: v }), 300)
    },
    [push],
  )

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const attentionOn = attention === '1'

  return (
    <FilterBar>
      <SearchInput value={term} onChange={onSearch} placeholder="Search name or email…" />
      <FilterSelect
        label="Plan"
        value={plan}
        onChange={(v) => push({ plan: v })}
        options={[
          { value: 'all', label: 'All plans' },
          { value: 'free', label: 'Starter' },
          { value: 'pro', label: 'Pro' },
        ]}
      />
      <FilterSelect
        label="Subscription"
        value={subscriptionStatus}
        onChange={(v) => push({ subscriptionStatus: v })}
        options={[
          { value: 'all', label: 'All subscriptions' },
          { value: 'active', label: 'Active' },
          { value: 'past_due', label: 'Past due' },
          { value: 'canceled', label: 'Canceled' },
          { value: 'trialing', label: 'Trialing' },
          { value: 'none', label: 'None' },
        ]}
      />
      <Link
        href={buildAttentionHref(sp, attentionOn)}
        className={`vcp-pill vcp-focus cursor-pointer ml-auto ${attentionOn ? 'vcp-pill-coral' : 'vcp-pill-outline'}`}
      >
        {attentionOn ? 'Attention only: On' : 'Attention only'}
      </Link>
    </FilterBar>
  )
}

// Build the href for the attention toggle link: flips the attention param
// while preserving every other active filter.
function buildAttentionHref(sp: URLSearchParams, currentlyOn: boolean): string {
  const params = new URLSearchParams(sp.toString())
  if (currentlyOn) params.delete('attention')
  else params.set('attention', '1')
  params.delete('page')
  const qs = params.toString()
  return qs ? `/admin/customers?${qs}` : '/admin/customers'
}

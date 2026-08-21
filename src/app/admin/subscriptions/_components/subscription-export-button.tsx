'use client'

import { useState } from 'react'
import { ExportButton } from '@/components/admin/ui'
import { exportToCsv, timestampedName } from '@/lib/admin/csv-export'

type SubscriptionExportRow = {
  id: string
  organizationId: string
  whopMembershipId: string | null
  planKey: string
  tier: string
  status: string
  currentPeriodStart: Date | string | null
  currentPeriodEnd: Date | string | null
  cancelAtPeriodEnd: boolean
  canceledAt: Date | string | null
  createdAt: Date | string
  organization: { id: string; name: string }
}

export function SubscriptionExportButton({ subscriptions }: { subscriptions: SubscriptionExportRow[] }) {
  const [loading, setLoading] = useState(false)

  const handleExport = () => {
    setLoading(true)
    const headers = [
      'ID', 'Organization', 'Tier', 'Status', 'Plan Key',
      'Whop Membership ID', 'Current Period Start', 'Current Period End',
      'Cancel at Period End', 'Canceled At', 'Created At',
    ]
    const rows = subscriptions.map((s) => [
      s.id,
      s.organization.name,
      s.tier,
      s.status,
      s.planKey,
      s.whopMembershipId ?? '',
      s.currentPeriodStart ? (typeof s.currentPeriodStart === 'string' ? s.currentPeriodStart : s.currentPeriodStart.toISOString()) : '',
      s.currentPeriodEnd ? (typeof s.currentPeriodEnd === 'string' ? s.currentPeriodEnd : s.currentPeriodEnd.toISOString()) : '',
      s.cancelAtPeriodEnd ? 'Yes' : 'No',
      s.canceledAt ? (typeof s.canceledAt === 'string' ? s.canceledAt : s.canceledAt.toISOString()) : '',
      typeof s.createdAt === 'string' ? s.createdAt : s.createdAt.toISOString(),
    ])
    exportToCsv(timestampedName('viableo-subscriptions'), headers, rows)
    setTimeout(() => setLoading(false), 500)
  }

  return <ExportButton onClick={handleExport} loading={loading} label={`Export ${subscriptions.length}`} />
}

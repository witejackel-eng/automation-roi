'use client'

import { useState } from 'react'
import { ExportButton } from '@/components/admin/ui'
import { exportToCsv, timestampedName } from '@/lib/admin/csv-export'

type CustomerExportRow = {
  id: string
  name: string | null
  email: string | null
  systemRole: string
  createdAt: Date | string
  organization: { id: string; name: string } | null
  membershipRole: string | null
  plan: string
  subscriptionStatus: string | null
  lastActivity: Date | string | null
  projectCount: number
  reportCount: number
  needsAttention: boolean
  attentionReasons: string[]
}

export function CustomerExportButton({ customers }: { customers: CustomerExportRow[] }) {
  const [loading, setLoading] = useState(false)

  const handleExport = () => {
    setLoading(true)
    const headers = [
      'ID', 'Name', 'Email', 'System Role', 'Created At',
      'Organization ID', 'Organization Name', 'Membership Role',
      'Plan', 'Subscription Status', 'Last Activity',
      'Project Count', 'Report Count', 'Needs Attention', 'Attention Reasons',
    ]
    const rows = customers.map((c) => [
      c.id,
      c.name ?? '',
      c.email ?? '',
      c.systemRole,
      typeof c.createdAt === 'string' ? c.createdAt : c.createdAt.toISOString(),
      c.organization?.id ?? '',
      c.organization?.name ?? '',
      c.membershipRole ?? '',
      c.plan,
      c.subscriptionStatus ?? '',
      c.lastActivity ? (typeof c.lastActivity === 'string' ? c.lastActivity : c.lastActivity.toISOString()) : '',
      c.projectCount,
      c.reportCount,
      c.needsAttention ? 'Yes' : 'No',
      c.attentionReasons.join('; '),
    ])
    exportToCsv(timestampedName('viableo-customers'), headers, rows)
    setTimeout(() => setLoading(false), 500)
  }

  return <ExportButton onClick={handleExport} loading={loading} label={`Export ${customers.length}`} />
}

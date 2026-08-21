'use client'

import { useState } from 'react'
import { ExportButton } from '@/components/admin/ui'
import { exportToCsv, timestampedName } from '@/lib/admin/csv-export'

type PaymentExportRow = {
  id: string
  organizationId: string
  whopPaymentId: string
  whopEventId: string
  amount: number | { toNumber(): number }
  currency: string
  status: string
  whopProductId: string | null
  whopPlanId: string | null
  refundedAmount: number | { toNumber(): number } | null
  refundedAt: Date | string | null
  createdAt: Date | string
  organization: { id: string; name: string }
}

export function PaymentExportButton({ payments }: { payments: PaymentExportRow[] }) {
  const [loading, setLoading] = useState(false)

  const handleExport = () => {
    setLoading(true)
    const toNum = (v: number | { toNumber(): number } | null | undefined): number =>
      v == null ? 0 : typeof v === 'number' ? v : v.toNumber()
    const headers = [
      'ID', 'Organization', 'Amount', 'Currency', 'Status',
      'Whop Payment ID', 'Whop Event ID', 'Whop Product ID', 'Whop Plan ID',
      'Refunded Amount', 'Refunded At', 'Created At',
    ]
    const rows = payments.map((p) => [
      p.id,
      p.organization.name,
      toNum(p.amount),
      p.currency,
      p.status,
      p.whopPaymentId,
      p.whopEventId,
      p.whopProductId ?? '',
      p.whopPlanId ?? '',
      toNum(p.refundedAmount),
      p.refundedAt ? (typeof p.refundedAt === 'string' ? p.refundedAt : p.refundedAt.toISOString()) : '',
      typeof p.createdAt === 'string' ? p.createdAt : p.createdAt.toISOString(),
    ])
    exportToCsv(timestampedName('viableo-payments'), headers, rows)
    setTimeout(() => setLoading(false), 500)
  }

  return <ExportButton onClick={handleExport} loading={loading} label={`Export ${payments.length}`} />
}

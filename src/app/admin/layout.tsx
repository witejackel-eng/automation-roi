import type { Metadata } from 'next'
import { AdminShell } from './_components/admin-shell'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Viableo · Founder Control Plane',
  description: 'Founder / Superadmin operational console for Viableo.',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="vcp-root">
      <AdminShell>{children}</AdminShell>
    </div>
  )
}

/**
 * AdminShell — shared layout for every /admin/** page.
 *
 * Renders the nav (links to each admin section) + a persistent
 * "Superadmin mode" banner so the founder never forgets they are in
 * the operational surface.
 *
 * Per Agent 2 master prompt §6.1, every page that uses this shell
 * must call requireSuperAdmin() as its first statement — the shell
 * itself does NOT enforce auth (it would be too late: the page already
 * fetched data by then). The shell is purely presentational.
 */
import Link from 'next/link';
import { ReactNode } from 'react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/organizations', label: 'Organizations' },
  { href: '/admin/subscriptions', label: 'Subscriptions' },
  { href: '/admin/payments', label: 'Payments' },
  { href: '/admin/entitlements', label: 'Entitlements' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/audit', label: 'Audit Log' },
  { href: '/admin/system', label: 'System' },
  { href: '/admin/qa', label: 'QA Console' },
];

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      <header className="border-b border-black/[0.06] bg-[#F5F4F0]/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#999]">Viableo</span>
              <h1 className="text-lg font-semibold text-[#111]">Superadmin</h1>
            </div>
            <Link
              href="/start"
              className="rounded border border-black/[0.08] px-3 py-1 text-xs text-[#666] transition-colors hover:bg-black/[0.04] hover:text-[#111]"
            >
              ← Back to product
            </Link>
            <Link
              href="/"
              className="rounded px-3 py-1 text-xs text-[#666] transition-colors hover:bg-black/[0.04] hover:text-[#111]"
            >
              Marketing site
            </Link>
          </div>
          <span className="rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-500">
            Superadmin mode
          </span>
        </div>
        <nav className="flex flex-wrap gap-1 border-t border-black/[0.06] px-3 py-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-1 text-sm text-[#666] hover:bg-black/[0.04] hover:text-[#111]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main-content" className="container mx-auto px-6 py-8">
        <h2 className="mb-4 text-2xl font-bold text-[#111]">{title}</h2>
        {children}
      </main>
    </div>
  );
}

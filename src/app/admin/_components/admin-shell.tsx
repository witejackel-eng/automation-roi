'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Building2, CreditCard, Receipt, KeyRound,
  Activity, ScrollText, HeartPulse, FlaskConical, Settings as SettingsIcon,
  AlertTriangle, AlertCircle, Search, RefreshCw, Bell, ChevronRight, Menu, X, Keyboard,
} from 'lucide-react'
import { KeyboardNavHandler, KeyboardHelpOverlay } from '@/components/admin/keyboard-nav'

const NAV = [
  {
    group: 'Quick access',
    items: [
      { href: '/admin/customers?attention=1', label: 'At-risk customers', icon: AlertTriangle, activeMatch: '/admin/customers' },
      { href: '/admin/payments?status=failed', label: 'Failed payments', icon: AlertCircle, activeMatch: '/admin/payments' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { href: '/admin', label: 'Overview', icon: LayoutDashboard, activeMatch: '/admin', exact: true },
      { href: '/admin/customers', label: 'Customers', icon: Users, activeMatch: '/admin/customers' },
      { href: '/admin/organizations', label: 'Organizations', icon: Building2, activeMatch: '/admin/organizations' },
      { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard, activeMatch: '/admin/subscriptions' },
      { href: '/admin/payments', label: 'Payments', icon: Receipt, activeMatch: '/admin/payments' },
      { href: '/admin/entitlements', label: 'Entitlements', icon: KeyRound, activeMatch: '/admin/entitlements' },
      { href: '/admin/events', label: 'System Events', icon: Activity, activeMatch: '/admin/events' },
      { href: '/admin/audit', label: 'Audit Log', icon: ScrollText, activeMatch: '/admin/audit' },
      { href: '/admin/system', label: 'System Health', icon: HeartPulse, activeMatch: '/admin/system' },
      { href: '/admin/qa', label: 'Founder QA', icon: FlaskConical, activeMatch: '/admin/qa' },
    ],
  },
  {
    group: 'Configuration',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: SettingsIcon, activeMatch: '/admin/settings' },
    ],
  },
]

function isActive(pathname: string, href: string, match: string, exact?: boolean) {
  if (exact) return pathname === href
  if (match === '/admin') return pathname === '/admin'
  return pathname === match || pathname.startsWith(match + '/')
}

export function AdminShell({ children, rightRail }: { children: React.ReactNode; rightRail?: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
  const [mobileRailOpen, setMobileRailOpen] = React.useState(false)

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-2.5 vcp-focus rounded" aria-label="Viableo Founder Control Plane">
          <span className="w-7 h-7 rounded-[5px] bg-[var(--vcp-coral)] flex items-center justify-center text-white font-bold text-[13px]">V</span>
          <span className="flex flex-col leading-tight">
            <span className="text-[14px] font-semibold text-[var(--vcp-nav-ink)]">Viableo</span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--vcp-nav-ink-muted)]">Founder Console</span>
          </span>
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto vcp-scroll px-3 py-4 flex flex-col gap-5" aria-label="Primary">
        {NAV.map((section) => (
          <div key={section.group} className="flex flex-col gap-0.5">
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--vcp-nav-ink-muted)]">{section.group}</div>
            {section.items.map((item) => {
              const active = isActive(pathname, item.href, item.activeMatch, item.exact)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active}
                  className="vcp-nav-link vcp-focus"
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={15} strokeWidth={active ? 2.4 : 2} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Admin profile */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-[var(--vcp-radius-sm)]">
          <div className="w-7 h-7 rounded-full bg-[var(--vcp-coral)] flex items-center justify-center text-white text-[11px] font-semibold">VF</div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-[12px] font-medium text-[var(--vcp-nav-ink)] truncate">Viableo Founder</span>
            <span className="text-[10px] text-[var(--vcp-nav-ink-muted)] truncate">Superadmin · foundertest</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="vcp-root flex">
      {/* Desktop nav */}
      <aside
        className="hidden lg:flex w-[244px] flex-none flex-col fixed inset-y-0 left-0 z-30"
        style={{ background: 'var(--vcp-nav-bg)' }}
        aria-label="Founder navigation"
      >
        {navContent}
      </aside>

      {/* Mobile nav drawer */}
      {mobileNavOpen ? (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} aria-hidden />
          <aside className="relative w-[260px] flex flex-col" style={{ background: 'var(--vcp-nav-bg)' }} aria-label="Founder navigation">
            <button onClick={() => setMobileNavOpen(false)} className="absolute right-3 top-4 text-[var(--vcp-nav-ink-muted)] vcp-focus rounded" aria-label="Close navigation">
              <X size={18} />
            </button>
            {navContent}
          </aside>
        </div>
      ) : null}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[244px]">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[var(--vcp-canvas)]/85 backdrop-blur border-b border-[var(--vcp-border)]">
          <div className="flex items-center gap-3 px-4 lg:px-6 h-14">
            <button
              className="lg:hidden text-[var(--vcp-ink-muted)] vcp-focus rounded p-1"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            {/* Environment badge */}
            <span className="hidden sm:inline-flex vcp-pill vcp-pill-coral">
              <span className="vcp-dot vcp-dot-coral" style={{ background: 'var(--vcp-coral)', boxShadow: 'none' }} />
              FOUNDER TEST
            </span>

            {/* Global search */}
            <form action="/admin/search" className="flex-1 max-w-md" role="search">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--vcp-ink-faint)]" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search customers, orgs, subscriptions, events…"
                  className="w-full h-9 pl-9 pr-3 text-[13px] bg-[var(--vcp-surface)] border border-[var(--vcp-border)] rounded-[var(--vcp-radius-sm)] text-[var(--vcp-ink)] placeholder:text-[var(--vcp-ink-faint)] vcp-focus"
                />
              </div>
            </form>

            <div className="flex items-center gap-1 ml-auto">
              <SystemStatusBadge />
              <button
                onClick={() => document.body.classList.toggle('vcp-kbd-help-visible')}
                className="hidden sm:block vcp-focus rounded p-2 text-[var(--vcp-ink-muted)] hover:text-[var(--vcp-ink)] hover:bg-[var(--vcp-surface-sunken)] transition-colors"
                title="Keyboard shortcuts (?)"
                aria-label="Keyboard shortcuts"
              >
                <Keyboard size={16} />
              </button>
              <a href="/admin" className="vcp-focus rounded p-2 text-[var(--vcp-ink-muted)] hover:text-[var(--vcp-ink)] hover:bg-[var(--vcp-surface-sunken)] transition-colors" title="Refresh" aria-label="Refresh">
                <RefreshCw size={16} />
              </a>
              <a href="/admin/events?severity=error" className="vcp-focus rounded p-2 text-[var(--vcp-ink-muted)] hover:text-[var(--vcp-ink)] hover:bg-[var(--vcp-surface-sunken)] transition-colors relative" title="Notifications" aria-label="Notifications">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--vcp-coral)]" />
              </a>
            </div>
          </div>
        </header>

        {/* Content area: main + right rail */}
        <div className="flex flex-1 min-h-0">
          <main className="flex-1 min-w-0 px-4 lg:px-6 py-6" id="admin-main">
            {children}
          </main>

          {rightRail ? (
            <>
              {/* Desktop right rail */}
              <aside className="hidden xl:block w-[300px] flex-none border-l border-[var(--vcp-border)] bg-[var(--vcp-canvas)] px-4 py-6 overflow-y-auto vcp-scroll">
                {rightRail}
              </aside>
              {/* Mobile rail toggle */}
              <div className="xl:hidden">
                <button
                  onClick={() => setMobileRailOpen((v) => !v)}
                  className="fixed bottom-4 right-4 z-30 vcp-pill vcp-pill-coral shadow-[var(--vcp-shadow-pop)] vcp-focus"
                  aria-expanded={mobileRailOpen}
                >
                  Status {mobileRailOpen ? <X size={12} /> : <ChevronRight size={12} />}
                </button>
                {mobileRailOpen ? (
                  <div className="fixed inset-0 z-40" onClick={() => setMobileRailOpen(false)}>
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-[var(--vcp-canvas)] border-l border-[var(--vcp-border)] overflow-y-auto vcp-scroll p-4" onClick={(e) => e.stopPropagation()}>
                      {rightRail}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
      <KeyboardNavHandler />
      <KeyboardHelpOverlay />
    </div>
  )
}

function SystemStatusBadge() {
  // In production this reads from a real health check. Static label here for the
  // preview harness; the System Health page shows the measured values.
  return (
    <span className="hidden md:inline-flex items-center gap-2 px-2.5 h-7 rounded-[var(--vcp-radius-sm)] border border-[var(--vcp-border)] text-[12px] font-medium text-[var(--vcp-ink)] bg-[var(--vcp-surface)]">
      <span className="vcp-dot vcp-dot-success vcp-dot-pulse" />
      System operational
    </span>
  )
}

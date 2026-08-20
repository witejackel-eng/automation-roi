'use client';

/**
 * Viableo app shell — Orbit-style command dock + stage.
 *
 * Structure from customer-success-management-app.zip (Orbit):
 *   - CommandDock: left rail with icon nav (Calculator, Reports, Settings, Admin)
 *   - CommandStage: animated view transition host
 *   - Bottom rail: tier chip + auth indicator (avatar, sign-out)
 *
 * Preserves all existing Viableo backend wires: calculator store,
 * entitlement, session, PDF, share APIs, auth.
 */
import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calculator,
  FileText,
  Settings2,
  type LucideIcon,
} from 'lucide-react';
import { useApp, useTier, type View } from '@/lib/store';
import { cn } from '@/lib/utils';
import { StatusPill } from '@/components/status-pill';
import { LogoCompact, SuperadminLink } from '@/components/viableo';
import { AppShellAuthIndicator } from '@/components/app-shell-auth-indicator';
import { COMPANY_NAME } from '@/lib/brand';
import { TIER_LABEL, type Tier } from '@/lib/entitlement';

interface NavItem {
  view: View;
  label: string;
  icon: LucideIcon;
  minTier?: Tier;
}

// Per SITE_COPY.md app shell navigation.
const APP_NAV: NavItem[] = [
  { view: 'calculator', label: 'Calculator', icon: Calculator },
  { view: 'projects', label: 'Reports', icon: FileText },
  { view: 'settings', label: 'Settings', icon: Settings2 },
];

function tierLabel(tier: Tier): string {
  return TIER_LABEL[tier];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const view = useApp((s) => s.view);

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop command dock */}
      <CommandDock />

      {/* Mobile top bar */}
      <MobileTopBar />

      {/* Stage — animated view transitions */}
      <div className="flex flex-1 flex-col overflow-hidden md:pl-[64px]">
        <CommandStage viewKey={view}>{children}</CommandStage>
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </div>
  );
}

// ── Command Dock (desktop left rail — Orbit pattern) ──────────────────────

function CommandDock() {
  const view = useApp((s) => s.view);
  const go = useApp((s) => s.go);
  const tier = useTier();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 hidden w-[64px] flex-col items-center border-r border-border bg-surface/80 py-5 backdrop-blur-sm md:flex"
      aria-label="Primary"
    >
      {/* Logo */}
      <div className="mb-10">
        <button
          type="button"
          onClick={() => go('landing')}
          aria-label={`${COMPANY_NAME} home`}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5"
        >
          <LogoCompact />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-1" aria-label="App">
        {APP_NAV.map((item) => {
          const isActive = view === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => go(item.view)}
              className={cn(
                'group relative flex h-10 w-10 items-center justify-center rounded-md transition-all duration-150',
                isActive
                  ? 'text-brand'
                  : 'text-ink-muted/70 hover:text-ink hover:bg-surface-raised',
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator — minimal left line */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-brand" />
              )}
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {/* Tooltip */}
              <span className="absolute left-14 z-50 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-[11px] font-medium text-canvas opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}
        {/* Superadmin-only entry */}
        <SuperadminLink />
      </nav>

      {/* Tier chip + auth */}
      <div className="mt-auto flex flex-col items-center gap-2 pt-6">
        <StatusPill variant={tier === 'free' ? 'draft' : 'paid'}>
          {tierLabel(tier)}
        </StatusPill>
        <div className="flex flex-col items-center gap-1">
          <AppShellAuthIndicator />
        </div>
      </div>
    </aside>
  );
}

// ── Mobile top bar ─────────────────────────────────────────────────────────

function MobileTopBar() {
  const view = useApp((s) => s.view);
  const go = useApp((s) => s.go);
  const tier = useTier();

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-sm md:hidden">
      <button
        type="button"
        onClick={() => go('landing')}
        aria-label={`${COMPANY_NAME} home`}
      >
        <LogoCompact />
      </button>
      <div className="flex items-center gap-2">
        <StatusPill variant={tier === 'free' ? 'draft' : 'paid'}>
          {tierLabel(tier)}
        </StatusPill>
      </div>
    </header>
  );
}

// ── Command Stage (Orbit animated view host) ──────────────────────────────

function CommandStage({ children, viewKey }: { children: React.ReactNode; viewKey: string }) {
  return (
    <div className="flex-1 overflow-hidden bg-canvas pt-14 md:pt-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={viewKey}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.4,
          }}
          className="h-full overflow-auto"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────────

function MobileTabBar() {
  const view = useApp((s) => s.view);
  const go = useApp((s) => s.go);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border bg-surface/80 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Primary mobile"
    >
      {APP_NAV.map((item) => {
        const active = view === item.view;
        const Icon = item.icon;
        return (
          <button
            key={item.view}
            type="button"
            onClick={() => go(item.view)}
            className={cn(
              'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
              active ? 'text-brand' : 'text-ink-muted',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            {active && <span className="block h-1 w-1 rounded-full bg-brand" aria-hidden="true" />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

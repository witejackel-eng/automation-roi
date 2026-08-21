'use client';

/**
 * DashboardShell — the Pulse-style three-column console.
 *
 *   ┌────────────┬─────────────────────────────────┬──────────────┐
 *   │ AppSidebar │ MainContent (section switcher)  │ RightPanel   │
 *   │  260px     │       flex-1                    │   300px      │
 *   └────────────┴─────────────────────────────────┴──────────────┘
 *
 * Layout:
 *   - Desktop (lg+): full 3-column.
 *   - Tablet (md): sidebar collapses to a 60px icon rail; right panel
 *     moves below main.
 *   - Mobile: sidebar drawer (hamburger) + full-width main + right panel
 *     below.
 *
 * The shell owns its own `activeSection` state (like Pulse) but reads
 * projects + entitlement from the existing `useApp()` store. It fetches
 * /api/projects on mount + on manual refresh, and fetches /api/entitlement
 * only if the store doesn't already have one (the /start page also fetches).
 *
 * It fills the CommandStage area at full height — the app-shell top bar +
 * CaseList remain unchanged outside the dashboard.
 */
import * as React from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  X,
  LayoutDashboard,
  FileText,
  Gauge,
  ShieldAlert,
  Wallet,
  Users,
  Library,
  FileBarChart,
  Settings,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import { entitlementFor, type Entitlement } from '@/lib/entitlement';
import type { SavedProject } from '@/lib/store';
import { AppSidebar } from './app-sidebar';
import { MainContent } from './main-content';
import { RightPanel } from './right-panel';
import type { Section } from './types';

const TABLET_NAV: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'cases', label: 'Cases', icon: FileText },
  { id: 'performance', label: 'Performance', icon: Gauge },
  { id: 'risk', label: 'Risk', icon: ShieldAlert },
  { id: 'usage', label: 'Usage', icon: Wallet },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function DashboardShell() {
  const { projects, setProjects, entitlement, setEntitlement, startCalculator } = useApp(
    useShallow((s) => ({
      projects: s.projects,
      setProjects: s.setProjects,
      entitlement: s.entitlement,
      setEntitlement: s.setEntitlement,
      startCalculator: s.startCalculator,
    })),
  );
  const [activeSection, setActiveSection] = React.useState<Section>('overview');
  const [loading, setLoading] = React.useState(true);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  // ── Initial fetch: projects + entitlement (if missing) ──
  const loadProjects = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = (await res.json()) as { projects: SavedProject[] };
        setProjects(data.projects ?? []);
      }
    } catch {
      // Silently fall back to whatever's in the store.
    } finally {
      setLoading(false);
    }
  }, [setProjects]);

  const loadEntitlement = React.useCallback(async () => {
    // Only fetch if the store doesn't already have one.
    if (entitlement) return;
    try {
      const res = await fetch('/api/entitlement');
      if (!res.ok) {
        setEntitlement(entitlementFor('free'));
        return;
      }
      const data = (await res.json()) as Entitlement;
      setEntitlement(data);
    } catch {
      setEntitlement(entitlementFor('free'));
    }
  }, [entitlement, setEntitlement]);

  React.useEffect(() => {
    void loadProjects();
    void loadEntitlement();
  }, [loadProjects, loadEntitlement]);

  const handleRefresh = React.useCallback(() => {
    void loadProjects();
    void loadEntitlement();
  }, [loadProjects, loadEntitlement]);

  const handleSectionChange = React.useCallback((s: Section) => {
    setActiveSection(s);
    setMobileNavOpen(false);
  }, []);

  const handleOpenMobileNav = React.useCallback(() => {
    setMobileNavOpen(true);
  }, []);

  return (
    <div className="flex h-full w-full bg-canvas">
      {/* ── Sidebar — desktop ── */}
      <div className="hidden w-[260px] shrink-0 lg:block">
        <AppSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          projects={projects}
          className="h-full"
        />
      </div>

      {/* ── Sidebar — tablet (icons-only collapsed) ──
          Hidden below md, shown md→lg as a thin icon strip. */}
      <div className="hidden w-[60px] shrink-0 border-r border-border bg-surface md:block lg:hidden">
        <TabletIconRail
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          startCalculator={startCalculator}
        />
      </div>

      {/* ── Sidebar — mobile drawer ── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-black/60"
            aria-label="Close navigation"
          />
          <div className="absolute left-0 top-0 h-full w-[260px] max-w-[80vw] shadow-floating">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-2 top-2 z-10 rounded-md p-1.5 text-ink-muted hover:bg-surface-raised hover:text-ink"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <AppSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              projects={projects}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* ── Main + Right panel ── */}
      <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
        <MainContent
          activeSection={activeSection}
          projects={projects}
          loading={loading}
          onRefresh={handleRefresh}
          onOpenMobileNav={handleOpenMobileNav}
        />

        {/* Right panel: 300px column on desktop, below main on tablet/mobile. */}
        <div className="h-auto w-full shrink-0 lg:h-full lg:w-[300px]">
          <RightPanel
            activeSection={activeSection}
            projects={projects}
            loading={loading}
            onOpenSection={handleSectionChange}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Tablet icon rail ────────────────────────────────────────────────────────

interface TabletIconRailProps {
  activeSection: Section;
  onSectionChange: (s: Section) => void;
  startCalculator: () => void;
}

function TabletIconRail({
  activeSection,
  onSectionChange,
  startCalculator,
}: TabletIconRailProps) {
  return (
    <nav className="flex h-full flex-col items-center gap-1 py-3" aria-label="Dashboard navigation">
      <button
        type="button"
        onClick={() => startCalculator()}
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cta text-brand-foreground transition-colors hover:bg-brand-cta-hover"
        aria-label="New case"
        title="New Case"
      >
        <Plus className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <div className="mb-1 h-px w-6 bg-border" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {TABLET_NAV.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              aria-current={active ? 'page' : undefined}
              title={item.label}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                active
                  ? 'bg-surface-raised text-brand'
                  : 'text-ink-muted hover:bg-surface-raised hover:text-ink',
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

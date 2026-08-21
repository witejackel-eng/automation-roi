'use client';

/**
 * AppSidebar — the left rail of the Pulse-style dashboard shell.
 *
 * Structure (matches the Pulse reference, with Viableo-specific copy):
 *   - Logo area: "Viableo" mark + plan badge pill (Starter / Pro from useTier()).
 *   - Search button (decorative; placeholder for case/client filter wiring).
 *   - Quick Access group: New Case (startCalculator), Recent Cases (switch).
 *   - Operations group: Overview / Cases (CONSIDER badge) / ROI Performance /
 *     Risk (low-confidence badge) / Usage / Clients / Library / Reports /
 *     Settings.
 *   - Footer: time-range hint + plan status.
 *
 * The sidebar is dark on the dark canvas (this is the authenticated product
 * shell — kept dark to feel distinct from the light marketing site). It uses
 * the existing `--color-*` token system from globals.css exclusively.
 */
import * as React from 'react';
import {
  LayoutDashboard,
  FileText,
  Gauge,
  ShieldAlert,
  Wallet,
  Users,
  Library,
  FileBarChart,
  Settings,
  Search,
  Plus,
  History,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import { useTier } from '@/lib/store';
import { TIER_LABEL } from '@/lib/entitlement';
import type { Section } from './types';
import type { SavedProject } from '@/lib/store';

interface AppSidebarProps {
  activeSection: Section;
  onSectionChange: (s: Section) => void;
  projects: SavedProject[];
  /** Hidden on mobile when the drawer is closed. */
  className?: string;
}

interface NavItem {
  id: Section;
  label: string;
  icon: LucideIcon;
  badge?: number;
  badgeTone?: 'consider' | 'critical';
}

/** Build the Operations nav list with live badge counts from projects. */
function buildOperationsNav(projects: SavedProject[]): NavItem[] {
  const considerCount = projects.filter((p) => p.recommendation === 'consider').length;
  // Risk badge: cases that are CONSIDER or DON'T BUILD — these are the
  // "needs attention" cases. Using CONSIDER count alone would understate the
  // risk surface, so we surface the combined count.
  const riskCount = projects.filter(
    (p) => p.recommendation === 'consider' || p.recommendation === 'dont_build',
  ).length;

  return [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'cases',
      label: 'Cases',
      icon: FileText,
      badge: considerCount > 0 ? considerCount : undefined,
      badgeTone: 'consider',
    },
    { id: 'performance', label: 'ROI Performance', icon: Gauge },
    {
      id: 'risk',
      label: 'Risk',
      icon: ShieldAlert,
      badge: riskCount > 0 ? riskCount : undefined,
      badgeTone: 'critical',
    },
    { id: 'usage', label: 'Usage', icon: Wallet },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
}

const QUICK_ACCESS: { id: 'new_case' | 'recent'; label: string; icon: LucideIcon }[] = [
  { id: 'new_case', label: 'New Case', icon: Plus },
  { id: 'recent', label: 'Recent Cases', icon: History },
];

export function AppSidebar({
  activeSection,
  onSectionChange,
  projects,
  className,
}: AppSidebarProps) {
  const startCalculator = useApp((s) => s.startCalculator);
  const tier = useTier();
  const planLabel = TIER_LABEL[tier] ?? 'Starter';
  const isPro = tier === 'pro' || tier === 'agency' || tier === 'agency_pro';

  const operations = React.useMemo(() => buildOperationsNav(projects), [projects]);

  const handleQuickAccess = (id: 'new_case' | 'recent') => {
    if (id === 'new_case') startCalculator();
    else onSectionChange('cases');
  };

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col bg-surface border-r border-border shrink-0',
        className,
      )}
      aria-label="Dashboard navigation"
    >
      {/* ── Logo + plan badge ── */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle">
          <span className="text-[13px] font-semibold text-brand" aria-hidden="true">
            V
          </span>
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
          Viableo
        </span>
        <span
          className={cn(
            'ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
            isPro ? 'bg-brand-subtle text-brand' : 'bg-surface-raised text-ink-muted',
          )}
        >
          {planLabel}
        </span>
      </div>

      {/* ── Search (decorative) ── */}
      <div className="px-4 py-4">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-left transition-colors hover:border-border-strong"
          aria-label="Search cases or clients"
        >
          <Search className="h-4 w-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
          <span className="flex-1 text-[13px] text-ink-muted">Search cases or clients…</span>
          <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
            /
          </kbd>
        </button>
      </div>

      {/* ── Quick Access ── */}
      <div className="px-4">
        <p className="px-2 pb-2 text-[10px] font-medium uppercase tracking-wider text-ink-faint">
          Quick Access
        </p>
        <nav className="space-y-0.5" aria-label="Quick access">
          {QUICK_ACCESS.map((item) => {
            const Icon = item.icon;
            const active =
              (item.id === 'recent' && activeSection === 'cases') ||
              (item.id === 'new_case' && false);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleQuickAccess(item.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
                  active
                    ? 'bg-brand-subtle text-brand font-medium'
                    : 'text-ink-soft hover:bg-surface-raised hover:text-ink',
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'new_case' && (
                  <ChevronRight className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Operations ── */}
      <div className="mt-4 flex-1 overflow-y-auto px-4 pb-4">
        <p className="px-2 pb-2 text-[10px] font-medium uppercase tracking-wider text-ink-faint">
          Operations
        </p>
        <nav className="space-y-0.5" aria-label="Operations">
          {operations.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
            />
          ))}
        </nav>
      </div>

      {/* ── Footer: plan status ── */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between text-[11px] text-ink-faint">
          <span>{projects.length} saved {projects.length === 1 ? 'case' : 'cases'}</span>
          <span className={cn('inline-flex items-center gap-1', isPro ? 'text-brand' : 'text-ink-muted')}>
            <span className={cn('inline-block h-1.5 w-1.5 rounded-full', isPro ? 'bg-brand' : 'bg-ink-faint')} />
            {planLabel}
          </span>
        </div>
      </div>
    </aside>
  );
}

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ item, isActive, onClick }: NavButtonProps) {
  const Icon = item.icon;
  const badgeToneClass =
    item.badgeTone === 'critical'
      ? 'bg-dont-build-bg text-dont-build'
      : 'bg-consider-bg text-consider';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        isActive
          ? 'bg-surface-raised text-ink font-medium'
          : 'text-ink-soft hover:bg-surface-raised hover:text-ink',
      )}
    >
      <Icon
        className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-brand' : 'text-ink-muted')}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge !== undefined && (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums',
            isActive ? 'bg-surface text-ink-muted' : badgeToneClass,
          )}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}

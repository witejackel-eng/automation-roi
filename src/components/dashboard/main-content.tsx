'use client';

/**
 * MainContent — the middle column of the dashboard shell.
 *
 * Renders a per-section header (title + subtitle + time-range selector +
 * Refresh + Run New Case CTA) and switches the body by activeSection.
 *
 * The header copy is Viableo-specific (no incident/deployment language).
 * The Run New Case CTA uses the brand amber accent — the one place the
 * dashboard breaks the dark editorial surface for a primary action.
 */
import * as React from 'react';
import {
  Calendar,
  RefreshCw,
  Zap,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import type { SavedProject } from '@/lib/store';
import { SECTION_META, type Section, type TimeRange, TIME_RANGE_LABELS } from './types';
import { OverviewContent } from './content/overview-content';
import { CasesContent } from './content/cases-content';
import { PerformanceContent } from './content/performance-content';
import { RiskContent } from './content/risk-content';
import { UsageContent } from './content/usage-content';
import { ClientsContent } from './content/clients-content';
import { LibraryContent } from './content/library-content';
import { ReportsContent } from './content/reports-content';
import { SettingsContent } from './content/settings-content';

interface MainContentProps {
  activeSection: Section;
  projects: SavedProject[];
  loading: boolean;
  /** Re-fetch projects + entitlement (passed down from the shell). */
  onRefresh: () => void;
  /** Open the mobile sidebar drawer. */
  onOpenMobileNav: () => void;
}

const TIME_RANGES: TimeRange[] = ['7d', '30d', '90d'];

export function MainContent({
  activeSection,
  projects,
  loading,
  onRefresh,
  onOpenMobileNav,
}: MainContentProps) {
  const startCalculator = useApp((s) => s.startCalculator);
  const config = SECTION_META[activeSection];
  const [range, setRange] = React.useState<TimeRange>('30d');
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const rangeRef = React.useRef<HTMLDivElement>(null);

  // Close the time-range dropdown on outside click.
  React.useEffect(() => {
    if (!rangeOpen) return;
    const handler = (e: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) {
        setRangeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [rangeOpen]);

  const renderBody = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewContent projects={projects} loading={loading} onNewCase={() => startCalculator()} />;
      case 'cases':
        return <CasesContent projects={projects} loading={loading} />;
      case 'performance':
        return <PerformanceContent />;
      case 'risk':
        return <RiskContent projects={projects} loading={loading} />;
      case 'usage':
        return <UsageContent projects={projects} />;
      case 'clients':
        return <ClientsContent />;
      case 'library':
        return <LibraryContent />;
      case 'reports':
        return <ReportsContent projects={projects} />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <OverviewContent projects={projects} loading={loading} onNewCase={() => startCalculator()} />;
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-canvas">
      {/* ── Header ── */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-raised hover:text-ink lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate font-display text-[16px] font-semibold tracking-tight text-ink md:text-[18px]">
              {config.title}
            </h1>
            <p className="truncate text-[12px] text-ink-muted">{config.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range (decorative for now) */}
          <div className="relative hidden sm:block" ref={rangeRef}>
            <button
              type="button"
              onClick={() => setRangeOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[12px] text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
              aria-haspopup="listbox"
              aria-expanded={rangeOpen}
            >
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>{TIME_RANGE_LABELS[range]}</span>
              <ChevronDown className="h-3 w-3 text-ink-faint" strokeWidth={1.5} />
            </button>
            {rangeOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface-raised py-1 shadow-floating"
              >
                {TIME_RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="option"
                    aria-selected={r === range}
                    onClick={() => {
                      setRange(r);
                      setRangeOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-1.5 text-[12px] transition-colors hover:bg-surface',
                      r === range ? 'text-brand' : 'text-ink-soft',
                    )}
                  >
                    <span>{TIME_RANGE_LABELS[r]}</span>
                    {r === range && <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[12px] text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
            aria-label="Refresh data"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => startCalculator()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-cta px-3 py-1.5 text-[12px] font-medium text-brand-foreground transition-colors hover:bg-brand-cta-hover"
          >
            <Zap className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Run New Case</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 overflow-y-auto">
        <div key={activeSection} className="h-full px-4 py-5 md:px-6 md:py-6">
          {renderBody()}
        </div>
      </main>
    </div>
  );
}

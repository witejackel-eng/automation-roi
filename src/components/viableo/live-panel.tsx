'use client';

/**
 * Live business-case panel (Section 6.6).
 *
 * Sticky right panel on desktop, fixed compact bottom bar on mobile. Updates
 * instantly as the user types in the calculator — no network round-trip. Uses
 * the same pure TS calculation engine client-side (Expected scenario).
 *
 * Desktop (lg+): a sticky card (~300px) pinned to the right of the calculator
 *   main content. Shows DecisionBadge, Annual Opportunity (totalAnnualBenefit),
 *   ROI as a multiplier, Payback in months, and a thin progress indicator
 *   showing where the current ROI falls on a 0–10× track.
 *
 * Mobile (< lg): a fixed bottom bar showing a compact "$132.8k opportunity ·
 *   5.0× ROI · 1.6 mo" summary plus the DecisionBadge. Tap to expand into a 2×2
 *   grid of the same headline figures.
 *
 * When `inputs` is null (required math fields are blank or non-numeric), shows
 * a muted "Enter your assumptions to see the live business case" placeholder in
 * both surfaces — never invents numbers.
 *
 * React.useMemo on the derived calc so a keystroke in one field only
 * recomputes when the resolved `CalculatorInputs` reference actually changes.
 */
import * as React from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  calculateScenario,
  type CalculatorInputs,
  type ScenarioResult,
} from '@/lib/calculations/engine';
import {
  recommend,
  type RecommendationResult,
} from '@/lib/calculations/recommendation';
import { DecisionBadge, CountUp, Dot } from '@/components/viableo';
import type { DecisionKey } from '@/lib/brand';

interface LivePanelProps {
  inputs: CalculatorInputs | null;
  className?: string;
}

interface DerivedLive {
  result: ScenarioResult;
  rec: RecommendationResult;
  roiMultiple: number | null;
  decision: DecisionKey;
  /** 0–100 on a 0–10× ROI track. */
  roiProgress: number;
  /** "Total annual benefit" or "Annual revenue opportunity" depending on margin availability. */
  benefitLabel: string;
}

/** ROI multiplier cap for the progress track. Anything above renders as a full bar. */
const ROI_TRACK_MAX_MULTIPLE = 10;

export function LivePanel({ inputs, className }: LivePanelProps) {
  const derived = React.useMemo<DerivedLive | null>(() => {
    if (!inputs) return null;
    const result = calculateScenario(inputs, 'expected');
    const rec = recommend(result);
    const roiMultiple = result.roiPct == null ? null : result.roiPct / 100;
    const decision = rec.recommendation as DecisionKey;
    const roiProgress =
      roiMultiple == null
        ? 0
        : Math.min(100, Math.max(0, (roiMultiple / ROI_TRACK_MAX_MULTIPLE) * 100));
    const benefitLabel = result.isRevenueOpportunityOnly
      ? 'Annual revenue opportunity'
      : 'Total annual benefit';
    return { result, rec, roiMultiple, decision, roiProgress, benefitLabel };
  }, [inputs]);

  if (!derived) {
    return (
      <>
        <MobilePlaceholder />
        <DesktopPlaceholder className={className} />
      </>
    );
  }

  return (
    <>
      <MobileBar d={derived} />
      <DesktopPanel d={derived} className={className} />
    </>
  );
}

// ── Desktop sticky right panel ───────────────────────────────────────────────

function DesktopPanel({
  d,
  className,
}: {
  d: DerivedLive;
  className?: string;
}) {
  const { result, roiMultiple, decision, roiProgress, benefitLabel } = d;
  return (
    <aside
      className={cn(
        'hidden lg:sticky lg:top-4 lg:block lg:self-start',
        className,
      )}
      aria-label="Live business case preview"
    >
      <div className="w-[300px] rounded-lg border border-border bg-surface-raised p-5 shadow-[0_2px_8px_-4px_rgba(23,21,22,0.08)]">
        <PanelHeader />
        <div className="mt-4">
          <DecisionBadge decision={decision} size="md" animate />
        </div>

        <div className="mt-5">
          <span className="text-[11px] uppercase tracking-wide text-ink-muted">
            {benefitLabel}
          </span>
          <div className="mt-1">
            <CountUp
              value={result.totalAnnualBenefit}
              prefix="$"
              decimals={0}
              retriggerOnValueChange
              className="text-[32px] font-medium leading-none text-ink"
            />
          </div>
          <span className="mt-1.5 block text-[11px] text-ink-muted">
            Expected scenario · before first-year cost
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wide text-ink-muted">
              ROI
            </span>
            <div className="mt-1 font-mono tnum">
              {roiMultiple == null ? (
                <span className="text-[20px] font-medium text-ink-muted">N/A</span>
              ) : (
                <CountUp
                  value={roiMultiple}
                  suffix="×"
                  decimals={1}
                  retriggerOnValueChange
                  className="text-[20px] font-medium leading-none text-ink"
                />
              )}
            </div>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wide text-ink-muted">
              Payback
            </span>
            <div className="mt-1 font-mono tnum">
              {result.paybackMonths == null ? (
                <span className="text-[20px] font-medium text-ink-muted">Never</span>
              ) : (
                <CountUp
                  value={result.paybackMonths}
                  suffix=" mo"
                  decimals={result.paybackMonths >= 10 ? 0 : 1}
                  retriggerOnValueChange
                  className="text-[20px] font-medium leading-none text-ink"
                />
              )}
            </div>
          </div>
        </div>

        {/* Thin progress indicator showing where ROI falls on a 0–10× track. */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wide text-ink-faint">
            <span>ROI track</span>
            <span className="font-mono tnum">0× → 10×</span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface">
            {/* Break-even marker at 1× */}
            <div
              className="absolute top-0 bottom-0 w-px bg-border-strong"
              style={{ left: `${(1 / ROI_TRACK_MAX_MULTIPLE) * 100}%` }}
              aria-hidden="true"
            />
            {/* Filled portion up to current ROI, tinted by decision color. */}
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-500 ease-out-expo',
                decision === 'build' && 'bg-build',
                decision === 'consider' && 'bg-consider',
                decision === 'dont_build' && 'bg-dont-build',
              )}
              style={{ width: `${roiProgress}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] uppercase tracking-wide text-ink-faint">
            <span>Break-even</span>
            <span>10×</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DesktopPlaceholder({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'hidden lg:sticky lg:top-4 lg:block lg:self-start',
        className,
      )}
      aria-label="Live business case preview"
    >
      <div className="w-[300px] rounded-lg border border-dashed border-border bg-surface-raised p-5">
        <PanelHeader muted />
        <p className="mt-4 text-[13px] leading-[1.55] text-ink-muted">
          Enter your assumptions to see the live business case.
        </p>
      </div>
    </aside>
  );
}

// ── Mobile fixed bottom bar (expandable) ────────────────────────────────────

function MobileBar({ d }: { d: DerivedLive }) {
  const [open, setOpen] = React.useState(false);
  const { result, roiMultiple, decision } = d;

  const compact = React.useMemo(() => {
    const benefit = compactMoney(result.totalAnnualBenefit);
    const roi = roiMultiple == null ? 'N/A' : `${roiMultiple.toFixed(1)}×`;
    const payback =
      result.paybackMonths == null
        ? 'Never'
        : result.paybackMonths >= 10
          ? `${Math.round(result.paybackMonths)} mo`
          : `${result.paybackMonths.toFixed(1)} mo`;
    return `${benefit} opportunity · ${roi} ROI · ${payback}`;
  }, [result, roiMultiple]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 lg:hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-h-[44px] w-full items-center justify-between gap-2 px-4 py-2 text-left"
            aria-expanded={open}
            aria-controls="live-panel-mobile-content"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Dot size="sm" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
                Live
              </span>
              <span className="font-mono tnum text-[12px] text-ink-faint" aria-hidden="true">
                ·
              </span>
              <span className="truncate font-mono tnum text-[13px] font-medium text-ink">
                {compact}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <DecisionBadge decision={decision} size="sm" animate />
              <ChevronUp
                className={cn(
                  'size-4 text-ink-muted transition-transform duration-200',
                  open && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent id="live-panel-mobile-content">
          <div className="border-t border-border bg-surface px-4 pb-4 pt-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <CompactMetric
                label={d.benefitLabel}
                value={
                  <CountUp
                    value={result.totalAnnualBenefit}
                    prefix="$"
                    decimals={0}
                    retriggerOnValueChange
                    className="text-[20px] font-medium leading-none text-ink"
                  />
                }
              />
              <CompactMetric
                label="ROI"
                value={
                  roiMultiple == null ? (
                    <span className="text-[20px] font-medium text-ink-muted">N/A</span>
                  ) : (
                    <CountUp
                      value={roiMultiple}
                      suffix="×"
                      decimals={1}
                      retriggerOnValueChange
                      className="text-[20px] font-medium leading-none text-ink"
                    />
                  )
                }
              />
              <CompactMetric
                label="Payback"
                value={
                  result.paybackMonths == null ? (
                    <span className="text-[20px] font-medium text-ink-muted">Never</span>
                  ) : (
                    <CountUp
                      value={result.paybackMonths}
                      suffix=" mo"
                      decimals={result.paybackMonths >= 10 ? 0 : 1}
                      retriggerOnValueChange
                      className="text-[20px] font-medium leading-none text-ink"
                    />
                  )
                }
              />
              <CompactMetric
                label="First-year cost"
                value={
                  <CountUp
                    value={result.totalFirstYearCost}
                    prefix="$"
                    decimals={0}
                    retriggerOnValueChange
                    className="text-[20px] font-medium leading-none text-ink"
                  />
                }
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function MobilePlaceholder() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-surface/80 lg:hidden">
      <p className="text-[12px] text-ink-muted">
        Enter your assumptions to see the live business case.
      </p>
    </div>
  );
}

// ── Shared bits ──────────────────────────────────────────────────────────────

function PanelHeader({ muted = false }: { muted?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Dot size="sm" className={muted ? 'opacity-50' : undefined} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
        Live business case
      </span>
    </div>
  );
}

function CompactMetric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <div className="font-mono tnum">{value}</div>
    </div>
  );
}

/**
 * Compact currency for the mobile summary line: "$132.8k" / "$1.2M" / "$860".
 * Mirrors `formatCurrency`'s M tier but adds a "k" tier for thousands so the
 * bar reads like the spec example ("$132.8k opportunity"). The "k" tier always
 * shows one decimal place for readability (matches the spec example).
 */
function compactMoney(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${sign}$${m.toFixed(m >= 10 ? 1 : 2).replace(/\.0+$/, '')}M`;
  }
  if (abs >= 1_000) {
    const k = abs / 1_000;
    return `${sign}$${k.toFixed(1)}k`;
  }
  return `${sign}$${Math.round(abs).toLocaleString('en-US')}`;
}

'use client';

/**
 * BreakingPointSlider — The product's most distinctive moment (§7.6, §29, §30).
 *
 * Lets the user drag any key assumption and see the verdict change in real-time
 * from BUILD → CONSIDER → DON'T BUILD. Uses the engine's pure calculateScenario()
 * for sub-16ms recalculation on each drag tick.
 *
 * - 60fps via requestAnimationFrame throttling on input handler
 * - Keyboard accessible: Arrow = 1% increment, Shift+Arrow = 5%
 * - aria-live="polite" on verdict readout for screen readers
 * - Shows the exact breaking point labeled
 * - One-line plain-English explanation
 * - Mobile: full-width touch, min 44px hit targets, persistent verdict above slider
 * - Respects prefers-reduced-motion (disable animation transitions)
 */
import * as React from 'react';
import { calculateScenario, type CalculatorInputs } from '@/lib/calculations/engine';
import { recommend, type RecommendationResult } from '@/lib/calculations/recommendation';
import type { ScenarioName } from '@/lib/calculations/scenarios';
import { DecisionBadge } from './decision-badge';
import { Dot } from './dot';
import { cn } from '@/lib/utils';
import { formatCurrency, formatRatioAsPercent, formatPercentagePoints } from '@/lib/format';
import { DECISION_COLORS, type DecisionKey } from '@/lib/brand';

// ── Lever definitions ──────────────────────────────────────────
/** A lever the user can drag to find the breaking point. */
export interface LeverDef {
  key: keyof CalculatorInputs;
  label: string;
  /** Minimum value on the slider. */
  min: number;
  /** Maximum value on the slider. */
  max: number;
  /** Step size for the range input (before keyboard override). */
  step: number;
  /** Format the current value for display. */
  formatValue: (v: number) => string;
  /** Higher = more prominent in the lever selector. */
  order: number;
}

/** The four material levers available for the breaking-point slider. */
export const BREAKING_POINT_LEVERS: LeverDef[] = [
  {
    key: 'expectedAutomationPct',
    label: 'Automation coverage',
    min: 0.01,
    max: 0.99,
    step: 0.01,
    formatValue: (v) => formatRatioAsPercent(v, 0),
    order: 0,
  },
  {
    key: 'implementationFee',
    label: 'Implementation cost',
    min: 0,
    max: 500_000,
    step: 500,
    formatValue: (v) => formatCurrency(v),
    order: 1,
  },
  {
    key: 'hourlyCost',
    label: 'Hourly cost',
    min: 1,
    max: 500,
    step: 1,
    formatValue: (v) => formatCurrency(v),
    order: 2,
  },
  {
    key: 'expectedConversionImprovementPct',
    label: 'Conversion improvement',
    min: 0,
    max: 0.5,
    step: 0.001,
    formatValue: (v) => formatPercentagePoints(v),
    order: 3,
  },
  {
    key: 'monthlyAiApiCost',
    label: 'Monthly AI/API cost',
    min: 0,
    max: 50_000,
    step: 50,
    formatValue: (v) => formatCurrency(v),
    order: 4,
  },
];

// ── Breaking point finder ──────────────────────────────────────

/** Binary search for the exact value where the verdict changes. */
function findBreakingPoint(
  inputs: CalculatorInputs,
  lever: LeverDef,
  activeScenario: ScenarioName,
  baseVerdict: RecommendationResult['recommendation'],
): { value: number; direction: 'above' | 'below' } | null {
  // Try sweeping up first, then down.
  const modified = { ...inputs };
  const resolution = lever.step;

  // Check if moving up changes the verdict.
  let upBreak: number | null = null;
  let lo = (inputs[lever.key] as number) + resolution;
  let hi = lever.max;
  while (lo <= hi) {
    const mid = Math.round((lo + hi) / (2 * resolution)) * resolution;
    modified[lever.key] = mid as never;
    try {
      const result = calculateScenario(modified as CalculatorInputs, activeScenario);
      const rec = recommend(result);
      if (rec.recommendation !== baseVerdict) {
        upBreak = mid;
        hi = mid - resolution;
      } else {
        lo = mid + resolution;
      }
    } catch {
      lo = mid + resolution;
    }
  }

  // Check if moving down changes the verdict.
  let downBreak: number | null = null;
  lo = lever.min;
  hi = (inputs[lever.key] as number) - resolution;
  while (lo <= hi) {
    const mid = Math.round((lo + hi) / (2 * resolution)) * resolution;
    modified[lever.key] = mid as never;
    try {
      const result = calculateScenario(modified as CalculatorInputs, activeScenario);
      const rec = recommend(result);
      if (rec.recommendation !== baseVerdict) {
        downBreak = mid;
        lo = mid + resolution;
      } else {
        hi = mid - resolution;
      }
    } catch {
      hi = mid - resolution;
    }
  }

  // Return the nearest breaking point.
  if (upBreak != null && downBreak != null) {
    const upDist = Math.abs(upBreak - (inputs[lever.key] as number));
    const downDist = Math.abs(downBreak - (inputs[lever.key] as number));
    return upDist <= downDist
      ? { value: upBreak, direction: 'above' }
      : { value: downBreak, direction: 'below' };
  }
  if (upBreak != null) return { value: upBreak, direction: 'above' };
  if (downBreak != null) return { value: downBreak, direction: 'below' };
  return null;
}

// ── Reduced motion hook ────────────────────────────────────────
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// ── Component ──────────────────────────────────────────────────

interface BreakingPointSliderProps {
  inputs: CalculatorInputs;
  activeScenario: ScenarioName;
  className?: string;
}

export function BreakingPointSlider({
  inputs,
  activeScenario,
  className,
}: BreakingPointSliderProps) {
  const reduced = usePrefersReducedMotion();

  // Which lever is selected.
  const [activeLeverIdx, setActiveLeverIdx] = React.useState(0);
  const lever = BREAKING_POINT_LEVERS[activeLeverIdx];

  // Current slider value (starts at the input's current value).
  const baseValue = inputs[lever.key] as number;
  const [sliderValue, setSliderValue] = React.useState(baseValue);

  // Sync slider when lever changes or inputs change.
  React.useEffect(() => {
    setSliderValue(inputs[BREAKING_POINT_LEVERS[activeLeverIdx].key] as number);
  }, [activeLeverIdx, inputs]);

  // RAF-throttled recalculation state.
  const [liveVerdict, setLiveVerdict] = React.useState<RecommendationResult | null>(null);
  const pendingValueRef = React.useRef<number>(baseValue);
  const rafRef = React.useRef<number>(0);

  // Recalculate using the engine's pure function.
  const recalc = React.useCallback(
    (value: number) => {
      const modified = { ...inputs };
      modified[lever.key] = value as never;
      try {
        const result = calculateScenario(modified as CalculatorInputs, activeScenario);
        const rec = recommend(result);
        setLiveVerdict(rec);
      } catch {
        // Invalid combination — keep the last valid verdict.
      }
    },
    [inputs, lever.key, activeScenario],
  );

  // Initial calculation.
  React.useEffect(() => {
    recalc(sliderValue);
  }, [recalc, sliderValue]);

  // RAF-throttled input handler.
  const handleSliderInput = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseFloat(e.target.value);
      if (Number.isNaN(raw)) return;
      pendingValueRef.current = raw;
      setSliderValue(raw);
      if (rafRef.current) return; // already scheduled
      rafRef.current = requestAnimationFrame(() => {
        recalc(pendingValueRef.current);
        rafRef.current = 0;
      });
    },
    [recalc],
  );

  // Keyboard handler for arrow key increments.
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isPct = lever.key === 'expectedAutomationPct' || lever.key === 'expectedConversionImprovementPct';
      const baseStep = isPct ? 0.01 : lever.step;
      let delta = 0;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        delta = e.shiftKey ? baseStep * 5 : baseStep;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        delta = e.shiftKey ? -(baseStep * 5) : -baseStep;
      }
      if (delta === 0) return;
      e.preventDefault();
      const next = Math.min(Math.max(sliderValue + delta, lever.min), lever.max);
      setSliderValue(next);
      pendingValueRef.current = next;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        recalc(pendingValueRef.current);
        rafRef.current = 0;
      });
    },
    [sliderValue, lever, recalc],
  );

  // Clean up RAF on unmount.
  React.useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Compute the base verdict (from original inputs).
  const baseResult = React.useMemo(
    () => calculateScenario(inputs, activeScenario),
    [inputs, activeScenario],
  );
  const baseRec = recommend(baseResult);

  // Find the breaking point for the active lever.
  const breakingPoint = React.useMemo(
    () => findBreakingPoint(inputs, lever, activeScenario, baseRec.recommendation),
    [inputs, lever, activeScenario, baseRec.recommendation],
  );

  const verdict = liveVerdict ?? baseRec;
  const decision = verdict.recommendation as DecisionKey;
  const hasChanged = verdict.recommendation !== baseRec.recommendation;

  // Breaking point statement.
  const breakingStatement = React.useMemo(() => {
    if (!breakingPoint) return null;
    const formatted = lever.formatValue(breakingPoint.value);
    if (breakingPoint.direction === 'above') {
      return `This stays viable until ${lever.label.toLowerCase()} exceeds ${formatted}.`;
    }
    return `This becomes viable if ${lever.label.toLowerCase()} exceeds ${formatted}.`;
  }, [breakingPoint, lever]);

  return (
    <section
      className={cn('mt-10', className)}
      aria-labelledby="breaking-point-heading"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.005em] text-ink-muted">
          <Dot size="sm" />
          Breaking point
        </div>
        <h2
          id="breaking-point-heading"
          className="mt-3 text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl"
        >
          Drag any assumption. Watch the verdict change.
        </h2>
        <p className="mt-2 max-w-[560px] text-[15px] leading-[1.55] text-ink-muted">
          The breaking point is the exact value where your recommendation changes from BUILD to DON&rsquo;T BUILD.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 md:p-6">
        {/* Lever selector pills */}
        <div
          role="radiogroup"
          aria-label="Select assumption to test"
          className="mb-5 flex flex-wrap gap-2"
        >
          {BREAKING_POINT_LEVERS.map((l, i) => (
            <button
              key={l.key}
              type="button"
              role="radio"
              aria-checked={i === activeLeverIdx}
              onClick={() => setActiveLeverIdx(i)}
              className={cn(
                'min-h-[44px] rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                i === activeLeverIdx
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-border bg-canvas text-ink-muted hover:border-ink-muted hover:text-ink',
                reduced && 'transition-none',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Persistent verdict readout above the slider (ARIA live region) */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="mb-4 flex items-center gap-3"
        >
          <DecisionBadge decision={decision} size="lg" />
          {hasChanged && (
            <span className="text-[13px] font-medium text-ink-muted">
              Changed from{' '}
              <span className="font-semibold text-ink">
                {baseRec.recommendation === 'build'
                  ? 'BUILD'
                  : baseRec.recommendation === 'consider'
                    ? 'CONSIDER'
                    : "DON'T BUILD"}
              </span>
            </span>
          )}
        </div>

        {/* Slider row — full-width on mobile, min 44px hit targets */}
        <div className="flex items-center gap-4">
          <span className="shrink-0 font-mono tnum text-[13px] text-ink-muted">
            {lever.formatValue(lever.min)}
          </span>
          <div className="w-full flex-1">
            <input
              type="range"
              min={lever.min}
              max={lever.max}
              step={lever.step}
              value={sliderValue}
              onChange={handleSliderInput}
              onKeyDown={handleKeyDown}
              aria-label={`${lever.label} slider`}
              aria-valuemin={lever.min}
              aria-valuemax={lever.max}
              aria-valuenow={sliderValue}
              aria-valuetext={lever.formatValue(sliderValue)}
              className={cn(
                'breaking-point-slider h-[44px] w-full cursor-pointer appearance-none rounded-full bg-surface-raised',
                reduced && 'transition-none',
              )}
            />
          </div>
          <span className="shrink-0 font-mono tnum text-[13px] text-ink-muted">
            {lever.formatValue(lever.max)}
          </span>
        </div>

        {/* Current value display */}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono tnum text-lg font-bold text-ink">
            {lever.formatValue(sliderValue)}
          </span>
          <span className="text-[12px] text-ink-muted">
            Original: {lever.formatValue(baseValue)}
          </span>
        </div>

        {/* Breaking point statement */}
        {breakingStatement && (
          <div className="mt-5 rounded-md border border-border bg-canvas p-4">
            <p className="text-[14px] font-medium text-ink">
              {breakingStatement}
            </p>
            <p className="mt-1 text-[12px] text-ink-muted">
              The breaking point is the exact value where your recommendation changes from BUILD to DON&rsquo;T BUILD.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

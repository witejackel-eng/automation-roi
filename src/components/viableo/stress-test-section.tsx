'use client';

/**
 * StressTestSection — "Try to break it" (Master Spec §29, §30, §31).
 *
 * Shows the break-even thresholds (when does this stop making sense?) and
 * the sensitivity ranking (what could go wrong?). Pure display — all
 * calculations happen in `@/lib/calculations/stress-test` against the
 * frozen engine. No invented numbers.
 *
 * Voice (§5.11): "Move the assumptions. We'll tell you the second this
 * stops making sense."
 */
import * as React from 'react';
import { motion } from 'motion/react';
import {
  computeBreakEven,
  computeSensitivity,
  stillViableStatement,
} from '@/lib/calculations/stress-test';
import { calculateScenario } from '@/lib/calculations/engine';
import type { CalculatorInputs } from '@/lib/calculations/engine';
import type { ScenarioName } from '@/lib/calculations/scenarios';
import { formatCurrency } from '@/lib/format';
import { Dot, DotRule } from '@/components/viableo';
import { cn } from '@/lib/utils';

interface StressTestSectionProps {
  inputs: CalculatorInputs;
  activeScenario: ScenarioName;
}

export function StressTestSection({ inputs, activeScenario }: StressTestSectionProps) {
  // Recompute on every render (pure functions, cheap).
  const thresholds = React.useMemo(
    () => computeBreakEven(inputs, activeScenario),
    [inputs, activeScenario]
  );
  const sensitivity = React.useMemo(
    () => computeSensitivity(inputs, activeScenario),
    [inputs, activeScenario]
  );
  const viableStatement = React.useMemo(
    () => stillViableStatement(thresholds, inputs),
    [thresholds, inputs]
  );

  // Compute the expected result for threshold bar visualizations.
  const expectedResult = React.useMemo(
    () => calculateScenario(inputs, activeScenario),
    [inputs, activeScenario]
  );

  return (
    <section className="mt-10" aria-labelledby="stress-test-heading">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.005em] text-ink-muted">
          <Dot size="sm" />
          Stress test
        </div>
        <h2
          id="stress-test-heading"
          className="mt-3 text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl"
        >
          Try to break it.
        </h2>
        <p className="mt-2 max-w-[560px] text-[15px] leading-[1.55] text-ink-muted">
          Move the assumptions. We{"\u2019"}ll tell you the second this stops making sense.
        </p>
      </div>

      {/* Break-even thresholds (Section 30) */}
      <div className="rounded-lg border border-border bg-surface p-5 md:p-6">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
          Here{"\u2019"}s where it stops making sense.
        </h3>

        {thresholds.alreadyBroken ? (
          <p className="mt-3 text-[15px] font-medium text-dont-build">
            The numbers don{"\u2019"}t support it in this scenario. Better to know now.
          </p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ThresholdCardWithBar
                label="Implementation cost"
                currentValue={inputs.implementationFee}
                thresholdValue={thresholds.implementationFee}
                formatValue={(v) => formatCurrency(v)}
                context="cross this and the return drops below zero"
              />
              <ThresholdCardWithBar
                label="Automation coverage"
                currentValue={inputs.expectedAutomationPct}
                thresholdValue={thresholds.automationPct}
                formatValue={(v) => `${Math.round(v * 100)}%`}
                context="drop below this and the case breaks"
                inverted
              />
              <ThresholdCardWithBar
                label="Monthly operating cost"
                currentValue={inputs.monthlyAiApiCost + inputs.monthlySoftwareCost}
                thresholdValue={thresholds.monthlyOperatingCost}
                formatValue={(v) => formatCurrency(v)}
                context="AI/API + software, per month"
              />
            </div>

            {viableStatement && (
              <p className="mt-4 text-[14px] font-medium text-build">
                Still viable. — {viableStatement}
              </p>
            )}
          </>
        )}
      </div>

      <div className="my-6">
        <DotRule />
      </div>

      {/* Sensitivity ranking (Section 31) */}
      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
          Before you build, know what could go wrong.
        </h3>
        <p className="mt-2 text-[14px] text-ink-muted">
          Each bar shows how far the ROI moves when that assumption shifts ±20%.
        </p>

        <div className="mt-4 space-y-3">
          {sensitivity.map((item, i) => {
            const maxImpact = Math.max(...sensitivity.map((s) => s.impact), 1);
            const widthPct = (item.impact / maxImpact) * 100;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-44 shrink-0 text-[13px] text-ink-muted">
                  {item.label}
                </div>
                <div className="relative h-7 flex-1 overflow-hidden rounded-sm bg-surface">
                  <motion.div
                    className={cn(
                      'h-full rounded-sm',
                      item.level === 'high'
                        ? 'bg-dont-build'
                        : item.level === 'medium'
                          ? 'bg-consider'
                          : 'bg-build'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(widthPct, 3)}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
                    aria-hidden="true"
                  />
                  <span className="absolute inset-y-0 left-2 flex items-center text-[11px] font-medium text-white mix-blend-difference">
                    {item.level === 'high'
                      ? 'high sensitivity'
                      : item.level === 'medium'
                        ? 'medium'
                        : 'low'}
                  </span>
                </div>
                <div className="w-28 shrink-0 text-right font-mono tnum text-[12px] text-ink-muted">
                  ±{Math.round(item.impact)}pp ROI
                </div>
              </div>
            );
          })}
        </div>

        {sensitivity[0] && sensitivity[0].level === 'high' && (
          <p className="mt-4 text-[14px] text-ink-muted">
            <span className="font-medium text-ink">{sensitivity[0].label}</span> — high sensitivity.
            The case depends most on this assumption.
          </p>
        )}
      </div>
    </section>
  );
}

function ThresholdCard({
  label,
  value,
  context,
}: {
  label: string;
  value: string;
  context: string;
}) {
  return (
    <div className="rounded-md border border-border bg-canvas p-4">
      <div className="text-[12px] uppercase tracking-[0.005em] text-ink-muted">
        {label}
      </div>
      <div className="mt-2 font-mono tnum text-xl font-bold tracking-[-0.02em] text-ink">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-ink-faint">{context}</div>
    </div>
  );
}

/**
 * ThresholdCardWithBar — enhanced threshold card with a horizontal bar showing
 * where the current value sits relative to the break-even threshold.
 *
 * The bar fills from left to right. For cost variables (implementation fee,
 * monthly operating cost), the bar shows current/threshold — crossing the
 * end = decision breaks. For coverage (automationPct), `inverted` flips it
 * so the bar shows how close to the minimum threshold.
 */
function ThresholdCardWithBar({
  label,
  currentValue,
  thresholdValue,
  formatValue,
  context,
  inverted = false,
}: {
  label: string;
  currentValue: number;
  thresholdValue: number | null;
  formatValue: (v: number) => string;
  context: string;
  /** If true, the threshold is a *minimum* (automation coverage) — bar fills
   *  from right to left conceptually, and we show distance to the floor. */
  inverted?: boolean;
}) {
  if (thresholdValue == null || thresholdValue <= 0 || !Number.isFinite(currentValue)) {
    return <ThresholdCard label={label} value="N/A" context={context} />;
  }

  const ratio = currentValue / thresholdValue;
  // For inverted (minimum threshold): viable when current >= threshold
  // For normal (maximum threshold): viable when current <= threshold
  const isViable = inverted ? currentValue >= thresholdValue : currentValue <= thresholdValue;
  const barPct = Math.min(Math.max(ratio * 100, 0), 100);

  return (
    <div className="rounded-md border border-border bg-canvas p-4">
      <div className="text-[12px] uppercase tracking-[0.005em] text-ink-muted">
        {label}
      </div>
      <div className="mt-2 font-mono tnum text-xl font-bold tracking-[-0.02em] text-ink">
        {formatValue(currentValue)}
      </div>
      <div className="mt-1 text-[11px] text-ink-faint">{context}</div>

      {/* Threshold visualization bar — SIGNATURE INTERACTION (Section 7.6b):
          The bar animates from 0 to its fill width on mount and on scenario
          change, creating a "variable moving toward break-even" feel. */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.04em]">
          <motion.span
            key={isViable ? 'viable' : 'breaks'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={isViable ? 'text-build' : 'text-dont-build'}
          >
            {isViable ? 'STILL VIABLE' : 'DECISION BREAKS'}
          </motion.span>
          <span className="font-mono tnum text-ink-muted">
            {formatValue(thresholdValue)}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <motion.div
            className={cn(
              'h-full rounded-full',
              isViable ? 'bg-build' : 'bg-dont-build'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  );
}

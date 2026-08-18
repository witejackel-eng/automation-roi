'use client';

/**
 * RecurringEconomicsView — P1 feature.
 *
 * A first-class "Monthly recurring" view tab/section to results:
 *   1. Monthly recurring benefit vs monthly recurring cost
 *   2. Monthly net benefit (positive = green, negative = red)
 *   3. Run rate — annualized monthly figures
 *
 * This is a first-class view, not hidden behind a toggle.
 */
import * as React from 'react';
import type { ScenarioResult } from '@/lib/calculations/engine';
import { formatCurrency } from '@/lib/format';
import { Dot } from './dot';
import { cn } from '@/lib/utils';

interface RecurringEconomicsViewProps {
  result: ScenarioResult;
  monthlyAiApiCost: number;
  monthlySoftwareCost: number;
  platformApiCost?: number;
  className?: string;
}

export function RecurringEconomicsView({
  result,
  monthlyAiApiCost,
  monthlySoftwareCost,
  platformApiCost = 0,
  className,
}: RecurringEconomicsViewProps) {
  // Monthly recurring benefit = annualLaborSavings + additionalGrossProfit, divided by 12
  const monthlyRecurringBenefit = result.totalAnnualBenefit / 12;

  // Monthly recurring cost = AI/API + software + platform/API + (otherAnnualCost / 12)
  const monthlyRecurringCost =
    monthlyAiApiCost + monthlySoftwareCost + platformApiCost + result.annualRecurringCost / 12 -
    (monthlyAiApiCost + monthlySoftwareCost); // avoid double-counting: annualRecurringCost already includes monthly*12

  // Actually, let's compute correctly:
  // annualRecurringCost = monthlyAiApiCost*12 + monthlySoftwareCost*12 + otherAnnualCost
  // So monthly recurring cost = annualRecurringCost / 12
  // But we want to show the monthly breakdown clearly:
  const monthlyOperatingCost = result.annualRecurringCost / 12;
  const monthlyNetBenefit = monthlyRecurringBenefit - monthlyOperatingCost;

  // Run rate = annualized monthly figures
  const annualBenefitRunRate = monthlyRecurringBenefit * 12;
  const annualCostRunRate = monthlyOperatingCost * 12;
  const annualNetRunRate = monthlyNetBenefit * 12;

  const isPositive = monthlyNetBenefit >= 0;

  return (
    <section
      className={cn('mt-10', className)}
      aria-labelledby="recurring-economics-heading"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.005em] text-ink-muted">
          <Dot size="sm" />
          Monthly recurring
        </div>
        <h2
          id="recurring-economics-heading"
          className="mt-3 text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl"
        >
          The ongoing economics.
        </h2>
        <p className="mt-2 max-w-[560px] text-[15px] leading-[1.55] text-ink-muted">
          After the one-time implementation, this is what the automation earns and costs each month.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 md:p-6">
        {/* Monthly comparison — benefit vs cost */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Monthly recurring benefit */}
          <div className="rounded-md border border-border bg-canvas p-4">
            <div className="text-[12px] uppercase tracking-[0.005em] text-ink-muted">
              Monthly recurring benefit
            </div>
            <div className="mt-2 font-mono tnum text-2xl font-bold tracking-[-0.02em] text-build">
              {formatCurrency(monthlyRecurringBenefit)}
            </div>
            <div className="mt-1 text-[11px] text-ink-faint">
              Labor savings + gross profit, per month
            </div>
          </div>

          {/* Monthly recurring cost */}
          <div className="rounded-md border border-border bg-canvas p-4">
            <div className="text-[12px] uppercase tracking-[0.005em] text-ink-muted">
              Monthly recurring cost
            </div>
            <div className="mt-2 font-mono tnum text-2xl font-bold tracking-[-0.02em] text-dont-build">
              {formatCurrency(monthlyOperatingCost)}
            </div>
            <div className="mt-1 text-[11px] text-ink-faint">
              AI/API + software + other, per month
            </div>
          </div>
        </div>

        {/* Monthly net benefit — big prominent callout */}
        <div
          className={cn(
            'mt-5 rounded-md p-5',
            isPositive
              ? 'border border-[#D1F2DF] bg-[#D1F2DF]/40'
              : 'border border-[#FDDEE5] bg-[#FDDEE5]/40',
          )}
        >
          <div className="text-[12px] uppercase tracking-[0.005em] text-ink-muted">
            Monthly net benefit
          </div>
          <div
            className={cn(
              'mt-2 font-mono tnum text-3xl font-bold tracking-[-0.02em]',
              isPositive ? 'text-build' : 'text-dont-build',
            )}
          >
            {formatCurrency(monthlyNetBenefit)}
            <span className="text-[15px] font-normal text-ink-muted">/mo</span>
          </div>
          <div className="mt-1 text-[12px] text-ink-muted">
            {isPositive
              ? 'The automation pays for itself each month.'
              : 'Monthly costs exceed monthly benefits at current assumptions.'}
          </div>
        </div>

        {/* Run rate — annualized */}
        <div className="mt-5 border-t border-border pt-5">
          <h4 className="text-[13px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
            Run rate (annualized)
          </h4>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <span className="text-[11px] uppercase tracking-[0.04em] text-ink-faint">
                Benefit run rate
              </span>
              <div className="mt-1 font-mono tnum text-lg font-semibold text-build">
                {formatCurrency(annualBenefitRunRate)}
                <span className="text-[12px] font-normal text-ink-muted">/yr</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-[0.04em] text-ink-faint">
                Cost run rate
              </span>
              <div className="mt-1 font-mono tnum text-lg font-semibold text-dont-build">
                {formatCurrency(annualCostRunRate)}
                <span className="text-[12px] font-normal text-ink-muted">/yr</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-[0.04em] text-ink-faint">
                Net run rate
              </span>
              <div
                className={cn(
                  'mt-1 font-mono tnum text-lg font-semibold',
                  isPositive ? 'text-build' : 'text-dont-build',
                )}
              >
                {formatCurrency(annualNetRunRate)}
                <span className="text-[12px] font-normal text-ink-muted">/yr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

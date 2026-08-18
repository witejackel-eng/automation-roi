'use client';

/**
 * "Why this recommendation?" — expandable section (Section 6.9).
 *
 * Sits under the Verdict Stamp on the results dashboard. Generates 2–4
 * concrete reasons for the recommendation, each backed by an actual number
 * pulled from the calculation results — never invents figures.
 *
 * Collapsed by default with a "Why this recommendation?" trigger; expands to
 * a list of reasons, each prefixed by a Viableo `Dot` (the brand device for
 * bullet markers per Section 5.4).
 *
 * The reason set is generated programmatically based on which branch of the
 * recommendation engine fired:
 *   - 'build'     → strong economics + resilience + manageable investment + fast payback
 *   - 'consider'  → positive-but-slower + payback stretch + conservative sensitivity
 *   - 'negative'  → negative economics + no payback + conservative also negative
 *   - 'slow'      → payback exceeds 24mo + slow return + conservative worse
 *
 * Each reason references real numbers: ROI %, payback months, first-year cost,
 * implementation fee, net annual benefit, conservative scenario's ROI/benefit.
 */
import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Dot } from '@/components/viableo';
import { DECISION_LABELS, type DecisionKey } from '@/lib/brand';
import {
  formatCurrency,
  formatPayback,
  formatRoi,
} from '@/lib/format';
import type { CalculatorInputs, ScenarioResult } from '@/lib/calculations/engine';
import type { ScenarioName } from '@/lib/calculations/scenarios';
import type { RecommendationResult } from '@/lib/calculations/recommendation';

interface WhyRecommendationProps {
  inputs: CalculatorInputs;
  results: Record<ScenarioName, ScenarioResult>;
  recommendation: RecommendationResult;
  className?: string;
}

interface Reason {
  /** The leading clause, ending with an em-dash (e.g. "Strong economics —"). */
  title: string;
  /** The detail clause referencing a real number (e.g. "499% expected ROI against $26,600 in first-year cost."). */
  detail: string;
}

export function WhyRecommendation({
  inputs,
  results,
  recommendation,
  className,
}: WhyRecommendationProps) {
  const [open, setOpen] = React.useState(false);
  const decision = recommendation.recommendation as DecisionKey;

  const reasons = React.useMemo(
    () => buildReasons(inputs, results, recommendation),
    [inputs, results, recommendation],
  );

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        'rounded-lg border border-border bg-surface-raised',
        className,
      )}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex min-h-[44px] w-full items-center justify-between gap-3 px-5 py-4 text-left"
          aria-expanded={open}
          aria-controls="why-recommendation-content"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Dot size="sm" />
            <span className="text-[14px] font-semibold text-ink">
              Why this recommendation?
            </span>
            <span className="hidden text-[12px] text-ink-muted sm:inline">
              {DECISION_LABELS[decision]} · {reasons.length} reasons
            </span>
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-ink-muted transition-transform duration-200',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent id="why-recommendation-content">
        <div className="border-t border-border px-5 py-4">
          <ul className="flex flex-col gap-3">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-[7px]" aria-hidden="true">
                  <Dot size="sm" />
                </span>
                <p className="min-w-0 flex-1 text-[13px] leading-[1.55] text-ink-muted">
                  <span className="font-semibold text-ink">{r.title}</span>{' '}
                  {r.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Reason builder ──────────────────────────────────────────────────────────

function buildReasons(
  inputs: CalculatorInputs,
  results: Record<ScenarioName, ScenarioResult>,
  rec: RecommendationResult,
): Reason[] {
  const expected = results.expected;
  const conservative = results.conservative;

  switch (rec.reason) {
    case 'build':
      return buildReasonsForBuild(inputs, expected, conservative);
    case 'consider':
      return buildReasonsForConsider(inputs, expected, conservative);
    case 'negative':
      return buildReasonsForNegative(expected, conservative);
    case 'slow':
      return buildReasonsForSlow(expected, conservative);
  }
}

function buildReasonsForBuild(
  inputs: CalculatorInputs,
  expected: ScenarioResult,
  conservative: ScenarioResult,
): Reason[] {
  const reasons: Reason[] = [];

  // 1. Strong economics — expected ROI against first-year cost.
  reasons.push({
    title: 'Strong economics —',
    detail: `${formatRoi(expected.roiPct)} expected ROI against ${formatCurrency(
      expected.totalFirstYearCost,
    )} in first-year cost.`,
  });

  // 2. Resilient under the conservative scenario — only if conservative is still positive.
  if (conservative.netAnnualBenefit > 0) {
    // When totalFirstYearCost is zero the engine returns roiPct = null → render
    // "still positive" instead of "still N/A ROI".
    const roiText =
      conservative.roiPct == null
        ? 'still positive'
        : `still ${formatRoi(conservative.roiPct)} ROI`;
    reasons.push({
      title: 'Resilient under the conservative scenario —',
      detail: `${roiText} even with a 35% discount to automation coverage.`,
    });
  }

  // 3. Manageable investment — first-year cost vs annual benefit.
  reasons.push({
    title: 'Manageable investment —',
    detail: `${formatCurrency(expected.totalFirstYearCost)} first-year cost against ${formatCurrency(
      expected.totalAnnualBenefit,
    )} in annual benefit.`,
  });

  // 4. Fast payback — if a payback exists.
  if (expected.paybackMonths != null) {
    reasons.push({
      title: 'Fast payback —',
      detail: `${formatPayback(expected.paybackMonths, {
        compact: true,
      })} to recover the implementation investment of ${formatCurrency(
        inputs.implementationFee,
      )}.`,
    });
  }

  return reasons;
}

function buildReasonsForConsider(
  inputs: CalculatorInputs,
  expected: ScenarioResult,
  conservative: ScenarioResult,
): Reason[] {
  const reasons: Reason[] = [];

  // 1. Positive but slower.
  reasons.push({
    title: 'Positive but slower —',
    detail: `${formatRoi(expected.roiPct)} expected ROI against ${formatCurrency(
      expected.totalFirstYearCost,
    )} in first-year cost.`,
  });

  // 2. Payback stretches beyond the 12-month BUILD threshold.
  if (expected.paybackMonths != null) {
    reasons.push({
      title: `Payback stretches to ${formatPayback(expected.paybackMonths, {
        compact: true,
      })} —`,
      detail:
        'beyond the 12-month high-confidence threshold for BUILD, but within the 24-month execution-risk limit.',
    });
  }

  // 3. Conservative scenario sensitivity.
  if (conservative.netAnnualBenefit > 0) {
    const roiText =
      conservative.roiPct == null
        ? 'still positive'
        : `${formatRoi(conservative.roiPct)} ROI`;
    reasons.push({
      title: 'Conservative scenario still positive —',
      detail: `${roiText} when automation coverage is discounted by 35%. The case depends on assumptions holding.`,
    });
  } else {
    reasons.push({
      title: 'Conservative scenario is negative —',
      detail: `${formatCurrency(
        conservative.netAnnualBenefit,
      )} net when automation coverage is discounted by 35%. The case depends on assumptions holding.`,
    });
  }

  // 4. Manageable investment.
  reasons.push({
    title: 'Manageable investment —',
    detail: `${formatCurrency(expected.totalFirstYearCost)} first-year cost against ${formatCurrency(
      expected.totalAnnualBenefit,
    )} in annual benefit; implementation fee ${formatCurrency(
      inputs.implementationFee,
    )}.`,
  });

  return reasons;
}

function buildReasonsForNegative(
  expected: ScenarioResult,
  conservative: ScenarioResult,
): Reason[] {
  const reasons: Reason[] = [];

  // 1. Negative economics.
  reasons.push({
    title: 'Negative economics —',
    detail: `the automation costs more than it returns at current assumptions (${formatCurrency(
      expected.netAnnualBenefit,
    )} net annual benefit).`,
  });

  // 2. No payback within the model.
  reasons.push({
    title: 'No payback within the model —',
    detail:
      expected.paybackMonths == null
        ? 'the net annual benefit is not positive, so the implementation investment never recovers.'
        : `the net annual benefit is not positive; payback would require ${formatPayback(
            expected.paybackMonths,
          )}, which the model cannot reach.`,
  });

  // 3. Conservative scenario is also negative (always true when expected is).
  reasons.push({
    title: 'Conservative scenario is also negative —',
    detail: `${formatCurrency(
      conservative.netAnnualBenefit,
    )} net under the 35% automation discount.`,
  });

  return reasons;
}

function buildReasonsForSlow(
  expected: ScenarioResult,
  conservative: ScenarioResult,
): Reason[] {
  const reasons: Reason[] = [];

  // 1. Payback exceeds the 24-month execution-risk threshold.
  reasons.push({
    title: 'Payback exceeds the 24-month threshold —',
    detail:
      expected.paybackMonths == null
        ? 'no payback within the model.'
        : `${formatPayback(
            expected.paybackMonths,
          )} is beyond the high-confidence execution-risk limit.`,
  });

  // 2. Positive economics, slow return.
  reasons.push({
    title: 'Positive economics, slow return —',
    detail: `${formatCurrency(
      expected.netAnnualBenefit,
    )} net annually, but the horizon carries execution risk that compounds the longer the payback stretches.`,
  });

  // 3. Conservative scenario sensitivity.
  if (conservative.netAnnualBenefit <= 0) {
    reasons.push({
      title: 'Conservative scenario is negative —',
      detail: `${formatCurrency(
        conservative.netAnnualBenefit,
      )} net under the 35% automation discount.`,
    });
  } else {
    const roiText =
      conservative.roiPct == null
        ? 'still positive'
        : `${formatRoi(conservative.roiPct)} ROI`;
    reasons.push({
      title: 'Conservative scenario is slower still —',
      detail: `${roiText} under the 35% automation discount.`,
    });
  }

  return reasons;
}

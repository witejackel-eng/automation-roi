/**
 * Recommendation engine — Section 10 of the Viableo Master Spec.
 *
 * Two entry points:
 *
 * 1. `recommend(result)` — single-scenario verdict (BUILD / CONSIDER /
 *    DON'T BUILD). Used by the results view for the per-scenario label that
 *    sits next to each row in the scenario comparison table.
 *
 * 2. `recommendWithConfidence({ expected, conservative, confidenceScore })` —
 *    the project-level verdict. Compares the Expected case against the
 *    Conservative case AND the confidence score, returns one of four
 *    verdicts: BUILD / PILOT / CONSIDER / DON'T BUILD. PILOT fires when the
 *    expected case is strong but the conservative case (or the confidence
 *    score) signals material uncertainty.
 *
 * INVARIANT: never output BUILD when expected.netAnnualBenefit <= 0. Branch 1
 * enforces this first in both functions — keep it first if the branches are
 * ever refactored.
 */
import type { ScenarioResult, Recommendation } from './engine';

export interface RecommendationResult {
  recommendation: Recommendation;
  /** Which copy template fired: 'negative' | 'build' | 'pilot' | 'consider' | 'slow'. */
  reason: 'negative' | 'build' | 'pilot' | 'consider' | 'slow';
  copy: string;
}

export interface RecommendationInput {
  expected: ScenarioResult;
  conservative: ScenarioResult;
  /** 0–100 from computeConfidenceScore (Section 11). */
  confidenceScore: number;
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtRoi(roiPct: number | null): string {
  if (roiPct == null) return 'N/A';
  return `${Math.round(roiPct)}%`;
}

function fmtPayback(paybackMonths: number | null): string {
  if (paybackMonths == null) return 'Never';
  return `${paybackMonths.toFixed(1)} months`;
}

/**
 * Apply the decision tree to a single scenario result.
 *
 * This function does NOT consider the confidence score or the conservative
 * scenario — it answers "what does THIS scenario say?". Use it for the
 * per-scenario label in the comparison table.
 */
export function recommend(result: ScenarioResult): RecommendationResult {
  const {
    netAnnualBenefit,
    paybackMonths,
    roiPct,
    totalFirstYearCost,
  } = result;

  // Branch 1 — invariant guard: negative economics.
  if (netAnnualBenefit <= 0) {
    return {
      recommendation: 'dont_build',
      reason: 'negative',
      copy: `DON\u2019T BUILD — At current assumptions, this automation costs more than it returns (${fmtCurrency(
        netAnnualBenefit
      )} net annual benefit). Revisit scope, cost, or target a higher-leverage process.`,
    };
  }

  // Branch 2 — high-confidence build. When total first-year cost is zero and
  // net is positive, payback is instantaneous -> BUILD (roiPct is N/A by design).
  if (totalFirstYearCost === 0 || (paybackMonths != null && paybackMonths <= 12 && (roiPct ?? 0) >= 50)) {
    return {
      recommendation: 'build',
      reason: 'build',
      copy: `BUILD — Expected payback of ${fmtPayback(
        paybackMonths
      )}. This automation is projected to generate ${fmtCurrency(
        netAnnualBenefit
      )} in net annual benefit against ${fmtCurrency(
        totalFirstYearCost
      )} in first-year cost, a return of ${fmtRoi(roiPct)}.`,
    };
  }

  // Branch 3 — positive but slower.
  if (paybackMonths != null && paybackMonths <= 24) {
    return {
      recommendation: 'consider',
      reason: 'consider',
      copy: `CONSIDER — Payback stretches to ${fmtPayback(
        paybackMonths
      )}. The economics are positive but slower to materialize than a high-confidence automation. Consider narrowing the first phase or renegotiating implementation cost.`,
    };
  }

  // Branch 4 — payback exceeds 24 months.
  return {
    recommendation: 'dont_build',
    reason: 'slow',
    copy: `DON\u2019T BUILD — Payback exceeds ${fmtPayback(
      paybackMonths
    )}. Even with positive economics, a return horizon this long carries too much execution risk to justify the investment as scoped.`,
  };
}

/**
 * Effective ROI used by the confidence-aware decision tree.
 *
 * When `totalFirstYearCost` is zero, the engine returns `roiPct = null` to
 * avoid a divide-by-zero. Conceptually, the ROI on a zero-cost automation is
 * infinite — treat it as `Infinity` for the `> 50%` comparisons in the
 * decision tree so the BUILD branch can fire for the cost-zero case.
 */
function effectiveRoi(r: ScenarioResult): number {
  if (r.totalFirstYearCost === 0) return Infinity;
  return r.roiPct ?? 0;
}

/**
 * Project-level verdict — Section 10 decision tree with confidence.
 *
 * Evaluated in order against the Expected + Conservative scenarios and the
 * 0–100 confidence score from `computeConfidenceScore()` (Section 11):
 *
 * 1. expected.netAnnualBenefit ≤ 0       → DON'T BUILD (negative economics)
 * 2. conservative ROI > 50% AND conservative payback ≤ 12mo
 *    AND confidence ≥ 60                → BUILD
 * 3. (expected ROI > 50% AND conservative ROI ≤ 50%)
 *    OR confidence 40–59                 → PILOT (material uncertainty)
 * 4. expected ROI is 0–50%
 *    OR payback > 12mo with positive ROI → CONSIDER
 * 5. else                                → DON'T BUILD
 *
 * Confidence band `[40, 60)` covers the material-uncertainty zone: high
 * enough to act on (PILOT), too low to commit fully (not BUILD). The BUILD
 * branch (2) needs ≥ 60.
 */
export function recommendWithConfidence(
  input: RecommendationInput
): RecommendationResult {
  const { expected, conservative, confidenceScore } = input;

  const expectedRoi = effectiveRoi(expected);
  const conservativeRoi = effectiveRoi(conservative);
  const expectedPayback = expected.paybackMonths;
  const conservativePayback = conservative.paybackMonths;

  // Branch 1 — invariant guard: negative economics.
  if (expected.netAnnualBenefit <= 0) {
    return {
      recommendation: 'dont_build',
      reason: 'negative',
      copy: `DON\u2019T BUILD — At current assumptions, this automation costs more than it returns (${fmtCurrency(
        expected.netAnnualBenefit
      )} net annual benefit). Revisit scope, cost, or target a higher-leverage process.`,
    };
  }

  // Branch 2 — high-confidence BUILD. Strong conservative case AND confidence ≥ 60.
  if (
    conservativeRoi > 50 &&
    conservativePayback != null &&
    conservativePayback <= 12 &&
    confidenceScore >= 60
  ) {
    return {
      recommendation: 'build',
      reason: 'build',
      copy: `BUILD — Conservative-case ROI of ${fmtRoi(
        conservative.roiPct
      )} with payback of ${fmtPayback(
        conservativePayback
      )}, and confidence in the inputs is high. This automation is projected to generate ${fmtCurrency(
        expected.netAnnualBenefit
      )} in net annual benefit against ${fmtCurrency(
        expected.totalFirstYearCost
      )} in first-year cost, an expected return of ${fmtRoi(expected.roiPct)}.`,
    };
  }

  // Branch 3 — PILOT. Material uncertainty: expected is strong but
  // conservative isn't, or the confidence band says so.
  if (
    (expectedRoi > 50 && conservativeRoi <= 50) ||
    (confidenceScore >= 40 && confidenceScore < 60)
  ) {
    return {
      recommendation: 'pilot',
      reason: 'pilot',
      copy: `PILOT — The expected case is strong (${fmtRoi(
        expected.roiPct
      )} ROI, ${fmtCurrency(
        expected.netAnnualBenefit
      )} net annual benefit), but the conservative scenario is less certain (${fmtRoi(
        conservative.roiPct
      )} ROI, ${fmtPayback(
        conservativePayback
      )} payback). Run a time-boxed pilot to validate the assumptions before committing to the full build.`,
    };
  }

  // Branch 4 — CONSIDER. Positive but slower / smaller ROI.
  if (
    (expectedRoi >= 0 && expectedRoi <= 50) ||
    (expectedPayback != null && expectedPayback > 12 && expectedRoi > 0)
  ) {
    return {
      recommendation: 'consider',
      reason: 'consider',
      copy: `CONSIDER — Expected payback of ${fmtPayback(
        expectedPayback
      )} at a ${fmtRoi(
        expected.roiPct
      )} return. The economics are positive but slower to materialize than a high-confidence automation. Consider narrowing the first phase or renegotiating implementation cost.`,
    };
  }

  // Branch 5 — DON'T BUILD. Expected ROI ≤ 0 or no other branch fired.
  return {
    recommendation: 'dont_build',
    reason: 'slow',
    copy: `DON\u2019T BUILD — Expected-case ROI is ${fmtRoi(
      expected.roiPct
    )} with payback of ${fmtPayback(
      expectedPayback
    )}. Even with positive economics, the return horizon or confidence in the inputs does not justify committing to the build as scoped.`,
  };
}

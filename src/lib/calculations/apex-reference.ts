/**
 * getApexReferenceNumbers — the single source of truth for every Apex
 * golden-case number shown on any marketing surface, results view, PDF,
 * or share view.
 *
 * Per the launch-readiness directive (Phase 0 + Phase 1):
 * "Every financial number that appears on any marketing page, results
 * view, PDF, or share view MUST be computed from the exact same engine
 * call using the exact same input snapshot. No hardcoded Apex numbers
 * anywhere except the golden-case test file."
 *
 * This helper is that single engine call. Every surface that shows a
 * golden-case number MUST import and call this function (or receive its
 * output as a prop). The returned object is frozen so no consumer can
 * accidentally mutate the canonical numbers.
 *
 * The confidence statuses mirror the Apex reference case's real input
 * quality (3 provided, 2 estimated, 2 assumed).
 */
import { APEX_INPUTS } from '../golden-case';
import {
  calculateScenario,
  calculateAllScenarios,
} from './engine';
import { recommend } from './recommendation';
import {
  computeBreakEven,
  computeSensitivity,
  PERMUTATION_COUNT,
  stillViableStatement,
} from './stress-test';
import {
  computeConfidenceScore,
  confidenceLabel,
  type InputStatus,
} from './confidence';
import {
  formatCurrency,
  formatPayback,
  formatRoi,
  formatPercentagePoints,
} from '../format';

// The Apex reference case's input-quality map (which inputs are
// measured vs estimated vs assumed). This drives the confidence score.
const APEX_CONFIDENCE_STATUSES: Record<string, InputStatus> = {
  hourlyCost: 'provided',
  leadsPerMonth: 'provided',
  implementationFee: 'provided',
  expectedAutomationPct: 'estimated',
  expectedConversionImprovementPct: 'estimated',
  errorCost: 'assumption',
  otherInputs: 'assumption',
};

export interface ApexReferenceNumbers {
  inputs: typeof APEX_INPUTS;
  expected: ReturnType<typeof calculateScenario>;
  all: ReturnType<typeof calculateAllScenarios>;
  breakEven: ReturnType<typeof computeBreakEven>;
  sensitivity: ReturnType<typeof computeSensitivity>;
  recommendation: ReturnType<typeof recommend>;
  confidence: ReturnType<typeof computeConfidenceScore>;
  confidenceLabel: string;
  stillViable: ReturnType<typeof stillViableStatement>;
  permutations: number;
  verdict: 'build' | 'consider' | 'dont_build';
  // Pre-formatted display strings (so every surface shows identical text).
  formatted: {
    netAnnualBenefit: string;
    totalAnnualBenefit: string;
    totalFirstYearCost: string;
    roi: string;
    payback: string;
    breakEvenFee: string;
    implementationFee: string;
    conservativeNet: string;
    upsideNet: string;
    confidenceScore: string;
  };
}

let cached: Readonly<ApexReferenceNumbers> | null = null;

/**
 * Returns the frozen canonical Apex reference numbers. Computed once at
 * first call (module-load semantics), then cached. Every marketing surface,
 * PDF, results view, and share view should call this.
 */
export function getApexReferenceNumbers(): Readonly<ApexReferenceNumbers> {
  if (cached) return cached;

  const expected = calculateScenario(APEX_INPUTS, 'expected');
  const all = calculateAllScenarios(APEX_INPUTS);
  const breakEven = computeBreakEven(APEX_INPUTS, 'expected');
  const sensitivity = computeSensitivity(APEX_INPUTS, 'expected');
  const recommendation = recommend(expected);
  const confidence = computeConfidenceScore(APEX_CONFIDENCE_STATUSES);
  const stillViable = stillViableStatement(breakEven, APEX_INPUTS);
  const breakEvenFee = breakEven.implementationFee ?? 0;

  const result: ApexReferenceNumbers = {
    inputs: APEX_INPUTS,
    expected,
    all,
    breakEven,
    sensitivity,
    recommendation,
    confidence,
    confidenceLabel: confidenceLabel(confidence.score),
    stillViable,
    permutations: PERMUTATION_COUNT,
    verdict: recommendation.recommendation,
    formatted: {
      netAnnualBenefit: formatCurrency(expected.netAnnualBenefit),
      totalAnnualBenefit: formatCurrency(expected.totalAnnualBenefit),
      totalFirstYearCost: formatCurrency(expected.totalFirstYearCost),
      roi: formatRoi(expected.roiPct),
      payback: formatPayback(expected.paybackMonths),
      breakEvenFee: formatCurrency(breakEvenFee),
      implementationFee: formatCurrency(APEX_INPUTS.implementationFee),
      conservativeNet: formatCurrency(all.conservative.netAnnualBenefit),
      upsideNet: formatCurrency(all.upside.netAnnualBenefit),
      confidenceScore: String(confidence.score),
    },
  };

  cached = Object.freeze(result) as Readonly<ApexReferenceNumbers>;
  return cached;
}

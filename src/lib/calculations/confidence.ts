/**
 * Confidence score module — Section 11 of the Viableo Master Spec.
 *
 * A weighted 0–100 score that expresses how much of the analysis rests on
 * user-provided data vs. Viableo-supplied estimates vs. modeling assumptions.
 *
 * Each material input carries a weight (summing to 100). The status of each
 * input multiplies its weight:
 *   - provided  (×1.0): the user typed it.
 *   - estimated (×0.6): Viableo suggested it from a benchmark or heuristic.
 *   - assumption (×0.3): a modeling assumption baked into the engine.
 *
 * The score never feeds the dollar math — it sits alongside the calculation
 * engine (which is frozen) and informs the recommendation + the per-input
 * tagging UI (Section 6.4).
 */
export type InputStatus = 'provided' | 'estimated' | 'assumption';

export interface InputConfidence {
  status: InputStatus;
}

/**
 * Default weights for the seven material inputs (sum = 100).
 *
 * The heaviest weight sits on `conversionImprovement` because revenue upside
 * is the input most often overstated in automation business cases. Labor
 * inputs and cost inputs split the remaining load evenly.
 */
export const CONFIDENCE_WEIGHTS = {
  hourlyLaborCost: 15,
  workloadVolume: 15,
  implementationFee: 15,
  automationCoverage: 15,
  conversionImprovement: 15,
  platformApiCost: 10,
  otherInputs: 10,
  errorCost: 5,
} as const;

/** Status → multiplier. Provided counts fully; assumption counts 30%. */
export const STATUS_MULTIPLIERS = {
  provided: 1.0,
  estimated: 0.6,
  assumption: 0.3,
} as const;

/** Friendly plain-language labels for each input, used in summaries. */
export const INPUT_LABELS: Record<keyof typeof CONFIDENCE_WEIGHTS, string> = {
  hourlyLaborCost: 'labor inputs',
  workloadVolume: 'workload inputs',
  implementationFee: 'implementation cost',
  automationCoverage: 'automation coverage',
  conversionImprovement: 'revenue improvement',
  platformApiCost: 'platform/API cost',
  otherInputs: 'other cost inputs',
  errorCost: 'error cost inputs',
};

export interface ConfidenceBreakdownRow {
  input: string;
  weight: number;
  status: InputStatus;
  /** weight × status multiplier — the contribution to the 0–100 score. */
  contribution: number;
}

export interface ConfidenceResult {
  /** Weighted 0–100 confidence score (rounded to nearest integer). */
  score: number;
  breakdown: ConfidenceBreakdownRow[];
}

/**
 * Compute the weighted 0–100 confidence score from a map of input-key → status.
 *
 * Inputs not present in `statuses` default to `assumption` (the lowest
 * multiplier) — a missing input is treated as the weakest kind of evidence.
 */
export function computeConfidenceScore(
  statuses: Record<string, InputStatus>
): ConfidenceResult {
  const breakdown: ConfidenceBreakdownRow[] = (
    Object.entries(CONFIDENCE_WEIGHTS) as Array<[string, number]>
  ).map(([input, weight]) => {
    const status: InputStatus = statuses[input] ?? 'assumption';
    const contribution = weight * STATUS_MULTIPLIERS[status];
    return { input, weight, status, contribution };
  });

  const raw = breakdown.reduce((sum, b) => sum + b.contribution, 0);
  return { score: Math.round(raw), breakdown };
}

/**
 * Map a 0–100 score to a plain-language label (Section 11).
 *
 *   ≥ 80 → High confidence
 *   ≥ 60 → Moderate confidence
 *   ≥ 40 → Material uncertainty
 *   < 40 → Low confidence
 */
export function confidenceLabel(score: number): string {
  if (score >= 80) return 'High confidence';
  if (score >= 60) return 'Moderate confidence';
  if (score >= 40) return 'Material uncertainty';
  return 'Low confidence';
}

/**
 * Generate a one-line plain-language summary from the breakdown, e.g.
 * "Strong on labor inputs, relies on estimated revenue improvement."
 *
 * Heuristic: pick the heaviest `provided` input for the "Strong on…" clause
 * and the heaviest `estimated`/`assumption` input for the "relies on…" clause.
 * If everything is provided, the second clause is dropped. If nothing is
 * provided, the first clause is dropped.
 */
export function confidenceSummary(
  breakdown: ConfidenceBreakdownRow[]
): string {
  const provided = breakdown
    .filter((b) => b.status === 'provided')
    .sort((a, b) => b.weight - a.weight);

  const weak = breakdown
    .filter((b) => b.status === 'estimated' || b.status === 'assumption')
    .sort((a, b) => b.weight - a.weight);

  const parts: string[] = [];

  if (provided.length > 0) {
    const label = INPUT_LABELS[provided[0].input as keyof typeof INPUT_LABELS];
    parts.push(`Strong on ${label ?? provided[0].input}`);
  }

  if (weak.length > 0) {
    const statusWord = weak[0].status === 'estimated' ? 'estimated' : 'assumed';
    const label = INPUT_LABELS[weak[0].input as keyof typeof INPUT_LABELS];
    parts.push(`relies on ${statusWord} ${label ?? weak[0].input}`);
  }

  if (parts.length === 0) {
    return 'All material inputs are provided.';
  }

  return parts.join(', ') + '.';
}

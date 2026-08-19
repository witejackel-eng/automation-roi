/**
 * Recommendation display helpers — companion to recommendation.ts (Section 10).
 *
 * Pure functions that generate human-readable strings for the results UI.
 * These do NOT modify the decision logic — they only describe it.
 *
 * DO NOT modify recommendation.ts. This file exists to keep display concerns
 * out of the calculation engine.
 */

// ── Types (mirrored from recommendation.ts for prop typing) ────────

type Verdict = 'build' | 'consider' | 'dont_build';

// ── generateRationaleSentence ───────────────────────────────────────

/**
 * Generate a one-sentence plain-language rationale for the verdict.
 *
 * Example outputs:
 *   "Conservative payback is 8.2 months and confidence is 72. This is BUILD."
 *   "Conservative payback is 15.0 months and confidence is 45. This is CONSIDER."
 *   "Conservative payback is 30.0 months and confidence is 28. This is DON\u2019T BUILD."
 */
export function generateRationaleSentence(
  verdict: Verdict,
  confidence: number,
  conservativePayback: number,
): string {
  const verdictLabel =
    verdict === 'build'
      ? 'BUILD'
      : verdict === 'consider'
        ? 'CONSIDER'
        : "DON\u2019T BUILD";

  const paybackStr =
    conservativePayback == null || !Number.isFinite(conservativePayback)
      ? 'N/A'
      : `${conservativePayback.toFixed(1)} months`;

  return `Conservative payback is ${paybackStr} and confidence is ${confidence}. This is ${verdictLabel}.`;
}

// ── getDecisionTreeBranch ──────────────────────────────────────────

/**
 * Describe which branch of the confidence-aware decision tree fired.
 *
 * The branches are numbered to match the JSDoc in recommendation.ts:
 *   1. Negative economics (expected.netAnnualBenefit <= 0)
 *   2. High-confidence BUILD (conservative ROI > 50%, payback <= 12mo, confidence >= 60)
 *   3. CONSIDER — material uncertainty (expected strong but conservative weak, or confidence 40-59)
 *   4. CONSIDER — positive but slower (expected ROI 0-50% or payback > 12mo)
 *   5. DON'T BUILD — fallback (expected ROI <= 0)
 */
export function getDecisionTreeBranch(
  verdict: Verdict,
  confidence: number,
  payback: number | null,
  roi: number | null,
): string {
  // Branch 1: negative economics
  if (verdict === 'dont_build' && roi != null && roi <= 0) {
    return 'Branch 1 \u2014 Negative economics. The expected case returns a net loss, so the verdict is DON\u2019T BUILD regardless of other inputs.';
  }

  // Branch 2: high-confidence BUILD
  if (
    verdict === 'build' &&
    confidence >= 60 &&
    payback != null &&
    payback <= 12 &&
    roi != null &&
    roi > 50
  ) {
    return 'Branch 2 \u2014 High-confidence BUILD. Conservative ROI exceeds 50%, conservative payback is within 12 months, and confidence is at least 60. All three gates are met.';
  }

  // Branch 3: CONSIDER (material uncertainty)
  if (
    verdict === 'consider' &&
    confidence >= 40 &&
    confidence < 60
  ) {
    return 'Branch 3 \u2014 Material uncertainty. Confidence falls in the 40\u201359 band, which returns CONSIDER regardless of how good the economics look. The inputs need more measurement before committing.';
  }

  if (
    verdict === 'consider' &&
    roi != null &&
    roi > 50 &&
    (payback == null || payback > 12)
  ) {
    return 'Branch 4 \u2014 Positive but slower. Expected ROI is above 50% but payback exceeds 12 months. The economics work; the timeline needs narrowing.';
  }

  if (
    verdict === 'consider' &&
    roi != null &&
    roi >= 0 &&
    roi <= 50
  ) {
    return 'Branch 4 \u2014 Positive but modest. Expected ROI is in the 0\u201350% range. The economics are positive but not strong enough for a full BUILD commitment.';
  }

  // Branch 5: DON'T BUILD (slow payback or low ROI)
  if (verdict === 'dont_build') {
    if (payback != null && payback > 24) {
      return 'Branch 5 \u2014 Slow payback. Payback exceeds 24 months. Even with positive economics, a return horizon this long carries too much execution risk.';
    }
    return 'Branch 5 \u2014 DON\u2019T BUILD. The combination of ROI, payback, and confidence does not meet the thresholds for BUILD or CONSIDER.';
  }

  // Fallback for BUILD with non-standard path (e.g. zero-cost)
  return 'Branch 2 \u2014 BUILD. The economics and confidence meet all thresholds for a BUILD recommendation.';
}

// ── getImprovementSuggestion ────────────────────────────────────────

interface ImprovementInput {
  name: string;
  status: 'measured' | 'estimated' | 'assumed';
  points: number;
}

/**
 * Generate an improvement suggestion based on the current confidence score.
 *
 * Finds inputs that could be upgraded (assumed -> estimated -> measured)
 * and calculates how many need to change to reach a target threshold.
 *
 * Returns strings like:
 *   "Upgrade 2 fields from \u2018assumed\u2019 to reach 60 confidence (BUILD threshold)."
 *   "All inputs are measured. Confidence is maximized."
 */
export function getImprovementSuggestion(
  currentScore: number,
  inputs: ImprovementInput[],
): string {
  // If already at 80+, confidence is high enough
  if (currentScore >= 80) {
    return 'All inputs are measured. Confidence is maximized.';
  }

  // Find upgradeable inputs (assumed or estimated)
  const upgradeable = inputs.filter(
    (i) => i.status === 'assumed' || i.status === 'estimated',
  );

  if (upgradeable.length === 0) {
    return 'All inputs are measured. Confidence is maximized.';
  }

  // Calculate potential gains from upgrading each input
  // assumed (×0.3) -> estimated (×0.6) = 0.3 × weight gain
  // estimated (×0.6) -> measured (×1.0) = 0.4 × weight gain
  // assumed (×0.3) -> measured (×1.0) = 0.7 × weight gain
  const potentialGains = upgradeable.map((input) => {
    let gain: number;
    if (input.status === 'assumed') {
      // Best-case: upgrade straight to measured
      gain = input.points / 0.3 - input.points; // full potential
    } else {
      // estimated -> measured
      gain = input.points / 0.6 - input.points;
    }
    return { ...input, potentialGain: gain };
  });

  // Sort by potential gain descending
  potentialGains.sort((a, b) => b.potentialGain - a.potentialGain);

  // Determine the target
  const targetScore = currentScore >= 60 ? 80 : 60;
  const targetLabel =
    targetScore === 80 ? 'high confidence' : 'BUILD threshold';
  const gap = targetScore - currentScore;

  if (gap <= 0) {
    // Already past 60, aim for 80
    if (currentScore >= 60 && currentScore < 80) {
      const eightyGap = 80 - currentScore;
      const topGains = potentialGains.reduce(
        (sum, g) => sum + g.potentialGain,
    );
      if (topGains < eightyGap) {
        return `Even upgrading all fields would not reach 80. Current confidence of ${currentScore} is sufficient for BUILD.`;
      }
      // Count how many to reach 80
      let running = 0;
      let count = 0;
      for (const g of potentialGains) {
        running += g.potentialGain;
        count++;
        if (running >= eightyGap) break;
      }
      return `Upgrade ${count} field${count > 1 ? 's' : ''} from '${upgradeable[0].status}' to reach 80 (high confidence).`;
    }
    return 'All inputs are measured. Confidence is maximized.';
  }

  // Count how many upgrades needed to close the gap
  let running = 0;
  let count = 0;
  for (const g of potentialGains) {
    running += g.potentialGain;
    count++;
    if (running >= gap) break;
  }

  if (count === 0) {
    return `Confidence is at ${currentScore}. No further upgrades available.`;
  }

  return `Upgrade ${count} field${count > 1 ? 's' : ''} from '${upgradeable[0].status}' to reach ${targetScore} (${targetLabel}).`;
}

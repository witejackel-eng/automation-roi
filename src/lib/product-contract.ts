/**
 * Viableo Product Contract — canonical source of truth.
 *
 * Exported as TypeScript constants so the UI can reference contract
 * principles programmatically (e.g., tooltips, methodology pages, audit UI).
 *
 * See docs/PRODUCT_CONTRACT.md for the full human-readable document.
 */

// ── The Contract Statement ───────────────────────────────────
export const CONTRACT_STATEMENT =
  'Viableo does not tell you how high the ROI can be. It tells you whether you should actually build this, how confident that answer is, what would break it, and what you can defensibly show the client.';

// ── Decision Criterion ───────────────────────────────────────
export const DECISION_CRITERION =
  'Any feature that only makes numbers look better, or only produces prettier documents, or only speeds up optimistic quoting, moves toward the OPPOSITE of what we want.';

// ── Positive Signals ─────────────────────────────────────────
export const POSITIVE_SIGNALS = [
  'Makes verdict MORE accurate or trustworthy',
  'Increases transparency of assumptions',
  'Helps user understand WHAT WOULD CHANGE the outcome',
  'Enables more defensible client communication',
  'Reduces ability to cherry-pick favorable numbers',
  "Treats DON'T BUILD as valid, valuable outcome",
] as const;

// ── Negative Signals ─────────────────────────────────────────
export const NEGATIVE_SIGNALS = [
  'Makes numbers look better without improving accuracy',
  'Produces prettier output without adding insight',
  'Speeds up process while reducing rigor',
  'Hides assumptions or uncertainty',
  'Encourages optimistic interpretation',
  "Treats DON'T BUILD as failure state to avoid",
] as const;

// ── Decision Rule ────────────────────────────────────────────
export const DECISION_RULE =
  'If net signal is negative, DO NOT MERGE. Rewrite or reject.';

// ── Contract signal assessment helper ────────────────────────
export type SignalDirection = 'positive' | 'negative';

export interface SignalAssessment {
  signal: string;
  direction: SignalDirection;
}

/**
 * Returns whether a given signal is a recognized positive or negative signal.
 * Useful for UI components that display contract alignment.
 */
export function classifySignal(signal: string): SignalAssessment | null {
  const normalized = signal.trim();
  if ((POSITIVE_SIGNALS as readonly string[]).includes(normalized)) {
    return { signal: normalized, direction: 'positive' };
  }
  if ((NEGATIVE_SIGNALS as readonly string[]).includes(normalized)) {
    return { signal: normalized, direction: 'negative' };
  }
  return null;
}

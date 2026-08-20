'use client';

/**
 * Confidence tagging — Section 6.4 of the Viableo Master Spec.
 *
 * Two exports:
 *
 * - `ConfidenceTag` — a small status chip rendered next to each material
 *   input. Three states, each with a distinct muted tint (low-opacity bg +
 *   full-strength text, matching the DecisionBadge tint pattern):
 *     🟢 Provided   — user typed it.           (muted emerald tint)
 *     🟡 Estimated  — Viableo suggested it.   (muted amber tint)
 *     🟠 Assumption — modeling assumption.    (muted neutral)
 *
 *   The chip is intentionally tiny (text-[10px]) so it sits inline next to an
 *   input label without disturbing the form layout.
 *
 * - `ConfidenceScoreCard` — the project-level confidence summary card:
 *     - large mono numerals for the 0–100 score
 *     - the plain-language label ("High confidence" / "Moderate confidence" /
 *       "Material uncertainty" / "Low confidence")
 *     - a one-line summary ("Strong on labor inputs, relies on estimated
 *       revenue improvement.")
 *     - a weighted breakdown bar showing each input's contribution
 */
import * as React from 'react';
import { cn } from '@/lib/utils';
import type { InputStatus } from '@/lib/calculations/confidence';
import {
  computeConfidenceScore,
  confidenceLabel,
  confidenceSummary,
  INPUT_LABELS,
  CONFIDENCE_WEIGHTS,
} from '@/lib/calculations/confidence';

// ── Confidence tag colors ──────────────────────────────────
// Same low-opacity-bg + full-strength-text pattern as DECISION_COLORS.
// Provided/Estimated deliberately echo the build/consider tints so the
// reader's eye groups them with the verdict vocabulary. Assumption is a
// neutral stone — no decision-color association, since assumptions don't
// express a verdict, only a gap in evidence.
const STATUS_COLORS: Record<
  InputStatus,
  { text: string; bg: string; label: string; dot: string }
> = {
  provided: {
    text: '#34D399', // muted emerald — echoes BUILD (dark-tuned)
    bg: 'rgba(52, 211, 153, 0.12)',
    label: 'Provided',
    dot: '#34D399',
  },
  estimated: {
    text: '#FBBF24', // muted amber — echoes CONSIDER (dark-tuned)
    bg: 'rgba(251, 191, 36, 0.12)',
    label: 'Estimated',
    dot: '#FBBF24',
  },
  assumption: {
    text: '#A1A1AA', // muted neutral zinc (dark-tuned)
    bg: 'rgba(161, 161, 170, 0.12)',
    label: 'Assumption',
    dot: '#A1A1AA',
  },
};

export interface ConfidenceTagProps {
  status: InputStatus;
  className?: string;
}

/**
 * Small inline chip — `text-[10px]`, `rounded-sm`, dot prefix.
 * Renders next to a material input's label or hint.
 */
export function ConfidenceTag({ status, className }: ConfidenceTagProps) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.04em] whitespace-nowrap',
        className
      )}
      style={{ backgroundColor: colors.bg, color: colors.text }}
      aria-label={colors.label}
      title={colors.label}
    >
      <span
        aria-hidden="true"
        className="inline-block h-1 w-1 rounded-full"
        style={{ backgroundColor: colors.dot }}
      />
      {colors.label}
    </span>
  );
}

// ── Confidence score card ─────────────────────────────────

export interface ConfidenceScoreCardProps {
  /** Map of input-key → InputStatus, same shape `computeConfidenceScore` takes. */
  statuses: Record<string, InputStatus>;
  className?: string;
}

/**
 * The project-level confidence card (Section 6.4).
 *
 * The score is computed from `statuses` via the pure `computeConfidenceScore`
 * function so the card stays in sync with whatever statuses the parent form
 * has collected. No internal state.
 */
export function ConfidenceScoreCard({ statuses, className }: ConfidenceScoreCardProps) {
  const { score, breakdown } = computeConfidenceScore(statuses);
  const label = confidenceLabel(score);
  const summary = confidenceSummary(breakdown);

  // Score color mirrors the label thresholds — full-strength on a low-opacity
  // background, the same pattern as the DecisionBadge.
  const scoreColor =
    score >= 80
      ? '#34D399' // emerald — High (dark-tuned)
      : score >= 60
        ? '#34D399' // emerald — Moderate (still positive territory)
        : score >= 40
          ? '#FBBF24' // amber — Material uncertainty
          : '#F87171'; // red — Low (dark-tuned)

  // Breakdown bar segments — each input's contribution out of 100.
  // Rendered as a single flex row of 1px-gap segments. Provided = emerald,
  // estimated = amber, assumption = neutral. The width of each segment is
  // its contribution / 100 * 100% so the bar always sums to 100% of the
  // card's width (matching the spec's 0–100 weighting).
  const totalContribution = breakdown.reduce((sum, b) => sum + b.contribution, 0) || 1;

  return (
    <section
      className={cn(
        'rounded-lg border border-border bg-surface-raised p-5',
        className
      )}
      aria-label="Confidence score"
    >
      {/* Score + label row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-4xl font-semibold tabular-nums leading-none tracking-[-0.02em]"
            style={{ color: scoreColor }}
          >
            {score}
          </span>
          <span className="font-mono text-sm text-ink-muted tabular-nums">/100</span>
        </div>
        <span
          className="text-[11px] font-medium uppercase tracking-[0.04em]"
          style={{ color: scoreColor }}
        >
          {label}
        </span>
      </div>

      {/* One-line summary */}
      <p className="mt-3 text-sm leading-snug text-ink-muted">{summary}</p>

      {/* Weighted breakdown bar */}
      <div className="mt-4">
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.04em] text-ink-faint">
          Weighted contribution by input
        </div>
        <div
          className="flex h-2 w-full overflow-hidden rounded-sm"
          role="img"
          aria-label="Confidence contribution by input"
        >
          {breakdown.map((b) => {
            const widthPct = (b.contribution / totalContribution) * 100;
            const segColor = STATUS_COLORS[b.status].dot;
            const inputLabel =
              INPUT_LABELS[b.input as keyof typeof INPUT_LABELS] ?? b.input;
            return (
              <div
                key={b.input}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: segColor,
                  opacity: b.status === 'provided' ? 1 : b.status === 'estimated' ? 0.8 : 0.55,
                }}
                title={`${inputLabel} — ${b.status} (weight ${b.weight})`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-muted">
          {(['provided', 'estimated', 'assumption'] as InputStatus[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[s].dot }}
              />
              {STATUS_COLORS[s].label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

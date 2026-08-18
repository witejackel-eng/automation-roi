'use client';

/**
 * ConfidenceExplained — P0 feature (Section 11, 6.4).
 *
 * Shows the confidence score with qualitative band:
 *   LOW (0–39), MODERATE (40–59), HIGH (60–100).
 *
 * Lists each input and its status (provided/estimated/assumption) with
 * the weight and multiplier. Lets the user interactively upgrade an
 * input from assumption → estimated → provided and see confidence rise
 * in real-time. Always pairs the number with a plain-language rationale.
 * Never shows false precision — round to whole number, show the band.
 */
import * as React from 'react';
import {
  computeConfidenceScore,
  confidenceSummary,
  CONFIDENCE_WEIGHTS,
  INPUT_LABELS,
  STATUS_MULTIPLIERS,
  type InputStatus,
  type ConfidenceBreakdownRow,
} from '@/lib/calculations/confidence';
import { ConfidenceTag } from './confidence-tag';
import { Dot } from './dot';
import { cn } from '@/lib/utils';

// ── Qualitative bands (spec says LOW 0-39, MODERATE 40-59, HIGH 60-100) ──
type ConfidenceBand = 'LOW' | 'MODERATE' | 'HIGH';

function getBand(score: number): ConfidenceBand {
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

const BAND_COLORS: Record<ConfidenceBand, { text: string; bg: string }> = {
  HIGH: { text: '#0D6B3F', bg: '#D1F2DF' },
  MODERATE: { text: '#8B5E0A', bg: '#FDE9B0' },
  LOW: { text: '#9B0A2E', bg: '#FDDEE5' },
};

// ── Upgrade order ──────────────────────────────────────────────
const UPGRADE_ORDER: InputStatus[] = ['assumption', 'estimated', 'provided'];

function nextStatus(current: InputStatus): InputStatus | null {
  const idx = UPGRADE_ORDER.indexOf(current);
  return idx < UPGRADE_ORDER.length - 1 ? UPGRADE_ORDER[idx + 1] : null;
}

// ── Props ──────────────────────────────────────────────────────

export interface ConfidenceExplainedProps {
  /** Map of input-key → InputStatus. */
  statuses: Record<string, InputStatus>;
  /** Callback when the user upgrades an input's status. */
  onStatusChange?: (inputKey: string, newStatus: InputStatus) => void;
  className?: string;
}

export function ConfidenceExplained({
  statuses,
  onStatusChange,
  className,
}: ConfidenceExplainedProps) {
  const { score, breakdown } = computeConfidenceScore(statuses);
  const band = getBand(score);
  const colors = BAND_COLORS[band];
  const summary = confidenceSummary(breakdown);

  return (
    <section
      className={cn('rounded-lg border border-border bg-surface p-5 md:p-6', className)}
      aria-label="Confidence, explained"
    >
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.005em] text-ink-muted">
          <Dot size="sm" />
          Confidence
        </div>
        <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-ink">
          How much of this rests on real data?
        </h3>
      </div>

      {/* Score + Band */}
      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-mono text-4xl font-semibold tabular-nums leading-none tracking-[-0.02em]"
            style={{ color: colors.text }}
          >
            {score}
          </span>
          <span className="font-mono text-sm text-ink-muted tabular-nums">/100</span>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em]"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {band}
        </span>
      </div>

      {/* One-line plain-language rationale */}
      <p className="mt-3 text-[14px] leading-snug text-ink-muted">{summary}</p>

      {/* Breakdown table */}
      <div className="mt-6">
        <h4 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
          What feeds this score
        </h4>
        <div className="space-y-2">
          {breakdown.map((row) => (
            <ConfidenceRow
              key={row.input}
              row={row}
              onUpgrade={
                onStatusChange
                  ? () => {
                      const next = nextStatus(row.status);
                      if (next) onStatusChange(row.input, next);
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Legend: multiplier explanation */}
      <div className="mt-5 rounded-md border border-border bg-canvas p-3">
        <p className="text-[12px] text-ink-muted">
          <span className="font-medium text-ink">Provided</span> counts fully (×1.0).{' '}
          <span className="font-medium text-ink">Estimated</span> counts 60% (×0.6).{' '}
          <span className="font-medium text-ink">Assumption</span> counts 30% (×0.3).
          Upgrade an input to see confidence rise in real-time.
        </p>
      </div>
    </section>
  );
}

// ── Individual row ─────────────────────────────────────────────

function ConfidenceRow({
  row,
  onUpgrade,
}: {
  row: ConfidenceBreakdownRow;
  onUpgrade?: () => void;
}) {
  const label = INPUT_LABELS[row.input as keyof typeof INPUT_LABELS] ?? row.input;
  const multiplier = STATUS_MULTIPLIERS[row.status];
  const canUpgrade = onUpgrade != null && nextStatus(row.status) != null;

  return (
    <div className="flex items-center gap-3 min-h-[44px]">
      {/* Label */}
      <span className="w-36 shrink-0 text-[13px] font-medium text-ink truncate">
        {label}
      </span>

      {/* Status tag */}
      <ConfidenceTag status={row.status} />

      {/* Weight */}
      <span className="w-14 shrink-0 text-right font-mono tnum text-[12px] text-ink-muted">
        {row.weight}wt
      </span>

      {/* Multiplier */}
      <span className="w-12 shrink-0 text-right font-mono tnum text-[12px] text-ink-muted">
        ×{multiplier}
      </span>

      {/* Contribution */}
      <span className="w-14 shrink-0 text-right font-mono tnum text-[12px] font-medium text-ink">
        {Math.round(row.contribution)}
      </span>

      {/* Upgrade button */}
      {canUpgrade ? (
        <button
          type="button"
          onClick={onUpgrade}
          className="shrink-0 rounded-sm border border-border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.04em] text-ink-muted transition-colors hover:border-brand hover:text-brand min-h-[44px] flex items-center"
          aria-label={`Upgrade ${label} from ${row.status} to ${nextStatus(row.status)}`}
        >
          ↑ {nextStatus(row.status)}
        </button>
      ) : (
        <span className="w-16 shrink-0" />
      )}
    </div>
  );
}

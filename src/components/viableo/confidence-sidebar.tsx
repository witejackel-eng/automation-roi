'use client';

/**
 * ConfidenceSidebar — Live confidence tracker for the wizard (Section 11).
 *
 * Sticky-positioned sidebar that shows:
 *   1. Progress bar (score/maxScore)
 *   2. Per-input breakdown with status icons and points
 *   3. Improvement suggestion
 *   4. Material uncertainty band warning when confidence < 60
 */
import * as React from 'react';
import { Dot } from './dot';
import { cn } from '@/lib/utils';
import { getImprovementSuggestion } from '@/lib/recommendation-helpers';

// ── Types ──────────────────────────────────────────────────

export interface ConfidenceBreakdownItem {
  name: string;
  points: number;
  status: 'measured' | 'estimated' | 'assumed';
}

export interface ConfidenceSidebarProps {
  score: number;
  maxScore: number;
  breakdown: ConfidenceBreakdownItem[];
  className?: string;
}

// ── Status config ──────────────────────────────────────────

const STATUS_CONFIG: Record<
  ConfidenceBreakdownItem['status'],
  { color: string; label: string }
> = {
  measured: { color: '#1F8A5A', label: 'Measured' },
  estimated: { color: '#C98A1B', label: 'Estimated' },
  assumed: { color: '#6F6C72', label: 'Assumed' },
};

// ── Confidence band helpers ────────────────────────────────

type Band = 'HIGH' | 'MODERATE' | 'LOW';

function getBand(score: number): Band {
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

const BAND_STYLES: Record<Band, { text: string; bg: string; label: string }> = {
  HIGH: { text: '#0D6B3F', bg: '#E7F4ED', label: 'HIGH' },
  MODERATE: { text: '#8B5E0A', bg: '#FBF1E0', label: 'MODERATE' },
  LOW: { text: '#9B0A2E', bg: '#FBE9EE', label: 'LOW' },
};

// ── Component ──────────────────────────────────────────────

export function ConfidenceSidebar({
  score,
  maxScore,
  breakdown,
  className,
}: ConfidenceSidebarProps) {
  const band = getBand(score);
  const bandStyle = BAND_STYLES[band];
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  // Build improvement suggestion
  const improvementInputs = breakdown.map((b) => ({
    name: b.name,
    status: b.status,
    points: b.points,
  }));
  const suggestion = getImprovementSuggestion(score, improvementInputs);

  // Progress bar color
  const barColor =
    score >= 60
      ? '#0D6B3F'
      : score >= 40
        ? '#8B5E0A'
        : '#9B0A2E';

  return (
    <aside
      className={cn(
        'sticky top-6 w-full max-w-xs space-y-5 self-start rounded-lg border border-border bg-surface p-5',
        className,
      )}
      aria-label="Confidence tracker"
    >
      {/* Header */}
      <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.005em] text-ink-muted">
        <Dot size="sm" />
        Confidence
      </div>

      {/* Score + Band tag */}
      <div className="flex items-baseline gap-2">
        <span
          className="font-mono text-3xl font-semibold tabular-nums leading-none tracking-[-0.02em]"
          style={{ color: bandStyle.text }}
        >
          {score}
        </span>
        <span className="font-mono text-sm text-ink-muted tabular-nums">
          /{maxScore}
        </span>
        <span
          className={cn(
            'ml-auto rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em]',
          )}
          style={{ backgroundColor: bandStyle.bg, color: bandStyle.text }}
        >
          {bandStyle.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={maxScore}
          aria-label={`Confidence: ${score} of ${maxScore}`}
        />
      </div>

      {/* Material uncertainty warning */}
      {score < 60 && (
        <div className="rounded-md border border-dont-build-bg bg-dont-build-bg p-3">
          <p className="text-[12px] font-medium text-dont-build">
            Material uncertainty band
          </p>
          <p className="mt-1 text-[12px] text-ink-muted">
            Confidence is below 60. This returns CONSIDER regardless of how
            good the economics look. Upgrade inputs to move into BUILD
            territory.
          </p>
        </div>
      )}

      {/* Per-input breakdown */}
      <div>
        <h4 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
          Breakdown
        </h4>
        <div className="space-y-2">
          {breakdown.map((item) => {
            const config = STATUS_CONFIG[item.status];
            return (
              <div
                key={item.name}
                className="flex items-center gap-2.5 min-h-[44px]"
              >
                {/* Status dot */}
                <span
                  className={cn(
                    'inline-block h-2 w-2 shrink-0 rounded-full',
                  )}
                  style={{ backgroundColor: config.color }}
                  title={config.label}
                  aria-label={`${item.name}: ${config.label}`}
                />
                {/* Name */}
                <span className="flex-1 truncate text-[13px] text-ink">
                  {item.name}
                </span>
                {/* Points */}
                <span className="shrink-0 font-mono tnum text-[12px] font-medium text-ink">
                  {Math.round(item.points)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement suggestion */}
      <div className="rounded-md border border-border bg-canvas p-3">
        <p className="text-[12px] text-ink-muted">{suggestion}</p>
      </div>
    </aside>
  );
}

'use client';

/**
 * WhatWouldKillThisCase — Shows top 3 most sensitive factors (Section 31).
 *
 * Presents the breaking points as a clean card layout, each factor showing:
 *   - Name
 *   - Break-even value
 *   - Current value
 *   - Headroom percentage (how far the current value is from the break point)
 *
 * Uses the existing verdict color tokens for the headroom indicator.
 */
import * as React from 'react';
import { Dot } from './dot';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────

export interface BreakingPoint {
  label: string;
  breakValue: number;
  currentValue: number;
  unit: string;
}

export interface WhatWouldKillThisCaseProps {
  breakingPoints: BreakingPoint[];
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────

/** Format a number with the given unit for display. */
function formatWithUnit(value: number, unit: string): string {
  if (unit === '%') return `${(value * 100).toFixed(0)}%`;
  if (unit === '$') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (unit === 'mo') return `${value.toFixed(1)} months`;
  return `${value.toFixed(1)} ${unit}`;
}

/** Compute headroom as a percentage. Positive = safe, negative = already past. */
function computeHeadroom(current: number, breakValue: number, isInverse: boolean): number {
  // For "cost"-type levers (higher = worse), headroom = (break - current) / current
  // For "benefit"-type levers (lower = worse), headroom = (current - break) / current
  if (isInverse) {
    return current === 0 ? 0 : ((breakValue - current) / current) * 100;
  }
  return current === 0 ? 0 : ((current - breakValue) / current) * 100;
}

/** Determine if the lever is "inverse" — higher values make it worse. */
function isInverseLever(label: string): boolean {
  const inverseKeywords = ['cost', 'fee', 'expense'];
  return inverseKeywords.some((k) => label.toLowerCase().includes(k));
}

/** Get headroom color class based on percentage. */
function getHeadroomStyle(headroomPct: number): { text: string; bg: string } {
  if (headroomPct >= 30) return { text: '#0D6B3F', bg: '#E7F4ED' };
  if (headroomPct >= 10) return { text: '#8B5E0A', bg: '#FBF1E0' };
  return { text: '#9B0A2E', bg: '#FBE9EE' };
}

// ── Component ──────────────────────────────────────────────

export function WhatWouldKillThisCase({
  breakingPoints,
  className,
}: WhatWouldKillThisCaseProps) {
  // Sort by headroom ascending (most at-risk first), take top 3
  const sorted = [...breakingPoints]
    .map((bp) => ({
      ...bp,
      headroomPct: computeHeadroom(bp.currentValue, bp.breakValue, isInverseLever(bp.label)),
    }))
    .sort((a, b) => a.headroomPct - b.headroomPct)
    .slice(0, 3);

  return (
    <section
      className={cn('rounded-lg border border-border bg-surface p-5 md:p-6', className)}
      aria-label="What would kill this case"
    >
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.005em] text-ink-muted">
          <Dot size="sm" />
          Sensitivity
        </div>
        <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-ink">
          What would kill this case
        </h3>
        <p className="mt-1 text-[14px] leading-snug text-ink-muted">
          The assumptions closest to their breaking point.
        </p>
      </div>

      {/* Factor cards */}
      <div className="space-y-3">
        {sorted.map((factor, i) => {
          const colors = getHeadroomStyle(factor.headroomPct);
          const headroomLabel =
            factor.headroomPct >= 0
              ? `+${Math.round(factor.headroomPct)}%`
              : `${Math.round(factor.headroomPct)}%`;

          return (
            <div
              key={factor.label}
              className={cn(
                'rounded-md border border-border p-4 transition-colors',
                'hover:bg-canvas/50',
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: rank + name + values */}
                <div className="flex items-start gap-3 min-h-[44px]">
                  <span className="font-mono tnum text-[12px] font-medium text-ink-muted pt-0.5">
                    #{i + 1}
                  </span>
                  <div>
                    <div className="text-[13px] font-medium text-ink">
                      {factor.label}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[12px]">
                      <span className="text-ink-muted">Current:</span>
                      <span className="font-mono tnum font-medium text-ink">
                        {formatWithUnit(factor.currentValue, factor.unit)}
                      </span>
                      <span className="text-ink-muted">Breaks at:</span>
                      <span className="font-mono tnum font-medium text-ink">
                        {formatWithUnit(factor.breakValue, factor.unit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: headroom badge */}
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center rounded-sm px-2 py-1 text-[11px] font-bold tabular-nums',
                  )}
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {headroomLabel} headroom
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <p className="mt-4 text-[12px] text-ink-muted">
        Headroom is the percentage the current value can move before the
        verdict changes. Lower headroom = higher risk.
      </p>
    </section>
  );
}

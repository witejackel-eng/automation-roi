/**
 * Viableo — the Threshold Line.
 *
 * The signature visual motif. Every Viableo answer is a position relative to a
 * boundary: one horizontal axis, one marked threshold, one position marker.
 * The whole product is that picture.
 *
 * Invariant rules (mandate §H, enforced):
 *  1. Always horizontal. No radial / gauge / dial variant.
 *  2. Exactly one threshold tick, labelled with a real number from the engine.
 *  3. Exactly one position marker.
 *  4. The favourable side is filled in the verdict colour; the unfavourable side is empty.
 *  5. `thresholdLabel` and `positionLabel` are REQUIRED props with no defaults.
 *     A threshold line cannot be rendered without real numbers.
 *  6. No 'use client', no useState/useEffect, no motion. Server-renderable.
 *  7. Every instance on the marketing site traces its numbers to computeBreakEven,
 *     calculateScenario, or computeSensitivity.
 *
 * The marker may translate into place over DURATION with EASE_OUT where allowed,
 * wrapped so the FINAL position is what server-renders. Under prefers-reduced-motion
 * it must not move. (The CSS @media block in globals.css + MotionConfig at the root
 * handle the reduction; this component itself emits only the final state.)
 */
import * as React from 'react';
import { DECISION_COLORS } from '@/lib/brand';
import type { DecisionKey } from '@/lib/brand';

export type ThresholdScale = 'hero' | 'divider' | 'inline';
export type Favourable = 'below' | 'above';

export interface ThresholdLineProps {
  scale: ThresholdScale;
  /** Axis lower bound. */
  min: number;
  /** Axis upper bound. */
  max: number;
  /** The boundary; renders as a labelled tick. Must be a real number from the engine. */
  threshold: number;
  /** This case's value; renders as the marker. Must be a real number from the engine. */
  position: number;
  /** Drives the fill colour. */
  verdict: DecisionKey;
  /** REQUIRED. Must contain a formatted real number (e.g. "$149,860"). No default. */
  thresholdLabel: string;
  /** REQUIRED. Must contain a formatted real number. No default. */
  positionLabel: string;
  /** Which side of the threshold is good. */
  favourable: Favourable;
  /** Optional accessible summary override. Defaults to a constructed sentence. */
  'aria-label'?: string;
}

function verdictHex(verdict: DecisionKey): string {
  return DECISION_COLORS[verdict].text;
}

/** Map a value to an x-coordinate in [0, 100] (viewBox percentage). */
function toX(value: number, min: number, max: number): number {
  if (max === min) return 50;
  const v = Math.min(Math.max(value, min), max);
  return ((v - min) / (max - min)) * 100;
}

/**
 * Hero scale: 72px tall, full content width. Axis 1px #635F6B, threshold tick 2px
 * full-height verdict colour, position marker a 10px filled circle, both labels as
 * real <text> + a visually-hidden text summary for screen readers.
 */
function HeroThresholdLine(props: ThresholdLineProps): React.ReactElement {
  const { min, max, threshold, position, verdict, thresholdLabel, positionLabel, favourable } = props;
  const tickX = toX(threshold, min, max);
  const markerX = toX(position, min, max);
  const fill = verdictHex(verdict);
  // Favourable region: from 0->tickX (below) or tickX->100 (above).
  const fillX = favourable === 'below' ? 0 : tickX;
  const fillW = favourable === 'below' ? tickX : 100 - tickX;
  const summary = props['aria-label'] ??
    `Position ${positionLabel} against threshold ${thresholdLabel}. The favourable side is ${favourable} the threshold.`;
  return (
    <svg
      role="img"
      aria-label={summary}
      viewBox="0 0 100 72"
      preserveAspectRatio="none"
      className="h-[72px] w-full"
      aria-hidden={false}
    >
      {/* Favourable region fill (verdict colour, low opacity) */}
      {fillW > 0 && (
        <rect x={fillX} y={20} width={fillW} height={32} fill={fill} opacity={0.12} />
      )}
      {/* Axis (1px stroke, full width) */}
      <line x1="0" y1="36" x2="100" y2="36" stroke="#A1A1AA" strokeWidth={0.4} />
      {/* End labels (rendered as real <text>, stacked beneath axis at hero scale) */}
      <text x="0" y="68" textAnchor="start" fontSize="4.5" fill="#A1A1AA" fontFamily="var(--font-mono)">
        {formatAxisLabel(min)}
      </text>
      <text x="100" y="68" textAnchor="end" fontSize="4.5" fill="#A1A1AA" fontFamily="var(--font-mono)">
        {formatAxisLabel(max)}
      </text>
      {/* Threshold tick (2px full-height, verdict colour) */}
      <line x1={tickX} y1="20" x2={tickX} y2="52" stroke={fill} strokeWidth={0.6} />
      <text x={tickX} y="16" textAnchor="middle" fontSize="5" fill={fill} fontFamily="var(--font-mono)" fontWeight="600">
        {thresholdLabel}
      </text>
      {/* Position marker (10px filled circle, verdict colour) */}
      <circle cx={markerX} cy={36} r={1.8} fill={fill} stroke="#09090B" strokeWidth={0.3} />
      <text x={markerX} y={60} textAnchor="middle" fontSize="4.5" fill="#F4F4F5" fontFamily="var(--font-mono)">
        {positionLabel}
      </text>
    </svg>
  );
}

/**
 * Divider scale: 24px tall, spans the section boundary. Axis 1px #A8A5AA (hairline,
 * non-text so its 2.33 ratio is permissible). One 8px tick at the threshold
 * position. No labels, no marker. Replaces every decorative divider on the site.
 */
function DividerThresholdLine(props: ThresholdLineProps): React.ReactElement {
  const { min, max, threshold, verdict, thresholdLabel, positionLabel } = props;
  const tickX = toX(threshold, min, max);
  const fill = verdictHex(verdict);
  const summary = `Section divider. Threshold ${thresholdLabel}; position ${positionLabel}.`;
  return (
    <svg
      role="img"
      aria-label={summary}
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className="h-[24px] w-full"
      aria-hidden={false}
    >
      <line x1="0" y1="12" x2="100" y2="12" stroke="#3A3A42" strokeWidth={0.3} />
      <line x1={tickX} y1="6" x2={tickX} y2="18" stroke={fill} strokeWidth={0.5} />
    </svg>
  );
}

/**
 * Inline scale: 64×12. Axis 1px, tick 1px, marker a 6px square. No visible labels;
 * the accessible name comes from aria-label carrying both numbers. Legible at a
 * glance, no axis labels, verdict-coloured.
 */
function InlineThresholdLine(props: ThresholdLineProps): React.ReactElement {
  const { min, max, threshold, position, verdict, favourable, thresholdLabel, positionLabel } = props;
  const tickX = toX(threshold, min, max);
  const markerX = toX(position, min, max);
  const fill = verdictHex(verdict);
  const fillX = favourable === 'below' ? 0 : tickX;
  const fillW = favourable === 'below' ? tickX : 100 - tickX;
  const summary = `Inline threshold: ${positionLabel} against ${thresholdLabel}. Favourable: ${favourable} the threshold.`;
  return (
    <svg
      role="img"
      aria-label={summary}
      viewBox="0 0 64 12"
      preserveAspectRatio="none"
      className="h-[12px] w-[64px] inline-block align-middle"
      aria-hidden={false}
    >
      {fillW > 0 && <rect x={fillX} y={3} width={fillW} height={6} fill={fill} opacity={0.18} />}
      <line x1="0" y1="6" x2="64" y2="6" stroke="#A1A1AA" strokeWidth={0.5} />
      <line x1={tickX} y1="2" x2={tickX} y2="10" stroke={fill} strokeWidth={0.6} />
      <rect x={markerX - 1} y="4" width="2" height="4" fill={fill} />
    </svg>
  );
}

function formatAxisLabel(n: number): string {
  if (Math.abs(n) >= 1000) return `$${Math.round(n).toLocaleString()}`;
  return `$${Math.round(n)}`;
}

/**
 * The Threshold Line. A pure server-renderable SVG. Pick the scale; the geometry
 * and labels are derived entirely from the real numbers you pass in.
 */
export function ThresholdLine(props: ThresholdLineProps): React.ReactElement {
  // Rule 5: required props with no defaults. Throw at render-time if absent so a
  // misuse is loud, not silent.
  if (props.thresholdLabel == null || props.thresholdLabel === '') {
    throw new Error('ThresholdLine: thresholdLabel is required (mandate §H rule 5).');
  }
  if (props.positionLabel == null || props.positionLabel === '') {
    throw new Error('ThresholdLine: positionLabel is required (mandate §H rule 5).');
  }
  switch (props.scale) {
    case 'hero':
      return <HeroThresholdLine {...props} />;
    case 'divider':
      return <DividerThresholdLine {...props} />;
    case 'inline':
      return <InlineThresholdLine {...props} />;
  }
}

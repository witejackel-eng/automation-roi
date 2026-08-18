'use client';

/**
 * Decision badge — BUILD / CONSIDER / DON'T BUILD (Section 9.3).
 *
 * A major Viableo signature: strong typography, shared geometry, semantic color,
 * and shape/symbol differentiation (color is NOT the only differentiator).
 *
 *   BUILD       → filled emerald circle (●) + "BUILD" in bold caps
 *   CONSIDER    → ring amber circle (◎) + "CONSIDER" in bold caps
 *   DON'T BUILD → X mark in crimson (✕) + "DON'T BUILD" in bold caps
 *
 * Background = 10–12% tint of the decision color, text/icon = full-strength
 * decision color. Uppercase label, bold weight, generous tracking.
 *
 * These colors are scoped ONLY to this component (Section 5.1 exception).
 * They never appear as buttons, links, section backgrounds, or chart colors.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { DECISION_COLORS, type DecisionKey } from '@/lib/brand';

interface DecisionBadgeProps {
  decision: DecisionKey;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Animate the symbol "drop" into place (decision-reveal, Section 10.3). */
  animate?: boolean;
}

const SIZE_CLASSES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1.5',
  md: 'text-[11px] px-3 py-1 gap-2',
  lg: 'text-[13px] px-3.5 py-1.5 gap-2',
} as const;

const SYMBOL_SIZE = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

export function DecisionBadge({ decision, size = 'md', className, animate }: DecisionBadgeProps) {
  const colors = DECISION_COLORS[decision];
  const animateClass = animate ? 'dot-drop' : '';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold uppercase tracking-[0.02em]',
        SIZE_CLASSES[size],
        className
      )}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        className={cn('inline-flex items-center justify-center', SYMBOL_SIZE[size], animateClass)}
        aria-hidden="true"
      >
        <DecisionSymbol decision={decision} />
      </span>
      {colors.label}
    </span>
  );
}

/**
 * Distinctive symbol for each decision — shape + fill differentiates
 * beyond color alone (accessibility: not color-only differentiation).
 *
 *   BUILD       → filled circle (●)   — complete, positive
 *   CONSIDER    → ring / donut (◎)    — uncertain, open
 *   DON'T BUILD → X mark (✕)          — rejected, negative
 */
function DecisionSymbol({ decision }: { decision: DecisionKey }) {
  switch (decision) {
    case 'build':
      /* Filled circle — complete, positive, go */
      return (
        <svg viewBox="0 0 12 12" fill="none" className="h-full w-full">
          <circle cx="6" cy="6" r="5" fill="currentColor" />
        </svg>
      );
    case 'consider':
      /* Ring / donut — uncertain, open, needs more info */
      return (
        <svg viewBox="0 0 12 12" fill="none" className="h-full w-full">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'dont_build':
      /* X mark — rejected, negative, stop */
      return (
        <svg viewBox="0 0 12 12" fill="none" className="h-full w-full">
          <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

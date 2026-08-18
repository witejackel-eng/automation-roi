'use client';

/**
 * Decision badge — BUILD / PILOT / CONSIDER / DON'T BUILD (Section 9.3).
 *
 * Background = 10–12% tint of the decision color, text/icon = full-strength
 * decision color, small dot-icon prefix (the recurring brand device).
 * Uppercase label, medium weight, +0.5% tracking.
 *
 * These four colors are scoped ONLY to this component (Section 5.1 exception).
 * They never appear as buttons, links, section backgrounds, or chart colors.
 * The four decisions form a MECE ladder:
 *   BUILD (emerald) → PILOT (steel blue) → CONSIDER (amber) → DON'T BUILD (crimson).
 */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { DECISION_COLORS, type DecisionKey } from '@/lib/brand';

interface DecisionBadgeProps {
  decision: DecisionKey;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Animate the dot "drop" into place (decision-reveal, Section 10.3). */
  animate?: boolean;
}

const SIZE_CLASSES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-[11px] px-2.5 py-1 gap-1.5',
  lg: 'text-[13px] px-3 py-1.5 gap-1.5',
} as const;

const DOT_SIZE = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
} as const;

export function DecisionBadge({ decision, size = 'md', className, animate }: DecisionBadgeProps) {
  const colors = DECISION_COLORS[decision];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium uppercase tracking-[0.005em]',
        SIZE_CLASSES[size],
        className
      )}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        className={cn('inline-block rounded-full', DOT_SIZE[size], animate && 'dot-drop')}
        style={{ backgroundColor: colors.text }}
        aria-hidden="true"
      />
      {colors.label}
    </span>
  );
}

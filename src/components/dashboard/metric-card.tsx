'use client';

/**
 * MetricCard — the Pulse-style metric tile used in the Overview section.
 *
 * Layout (top → bottom):
 *   - Icon pill (top-left) + trend badge (top-right)
 *   - Big mono value (or em-dash when the metric is unavailable)
 *   - Tiny uppercase label
 *
 * Used by overview-content for the 4 KPIs. The card stays inside the dark
 * editorial surface system — no white cards, no light shadows.
 */
import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AccentColor = 'brand' | 'build' | 'consider' | 'dont_build' | 'muted';

interface MetricCardProps {
  label: string;
  /** Numeric value to count up to. */
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** When `unavailable` is true we render an em-dash and a tooltip hint. */
  unavailable?: boolean;
  hint?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  /** Whether the trend direction is good (green) or bad (red). Defaults to neutral. */
  trendGood?: boolean;
  icon: LucideIcon;
  accentColor?: AccentColor;
}

const ICON_TEXT: Record<AccentColor, string> = {
  brand: 'text-brand',
  build: 'text-build',
  consider: 'text-consider',
  dont_build: 'text-dont-build',
  muted: 'text-ink-muted',
};

const ICON_BG: Record<AccentColor, string> = {
  brand: 'bg-brand-subtle',
  build: 'bg-build-bg',
  consider: 'bg-consider-bg',
  dont_build: 'bg-dont-build-bg',
  muted: 'bg-surface',
};

export function MetricCard({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  unavailable = false,
  hint,
  trend,
  trendValue,
  trendGood,
  icon: Icon,
  accentColor = 'brand',
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendTone =
    trendGood === undefined
      ? 'text-ink-muted'
      : trendGood
        ? 'text-build'
        : 'text-dont-build';

  // Format the big number with thousands separators.
  const formattedValue = React.useMemo(() => {
    const fixed = value.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }, [value, decimals]);

  return (
    <div
      className={cn(
        'group relative rounded-lg border border-border bg-surface-raised p-4 transition-colors',
        'hover:border-border-strong',
      )}
      title={hint}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', ICON_BG[accentColor])}>
          <Icon className={cn('h-4 w-4', ICON_TEXT[accentColor])} strokeWidth={1.5} aria-hidden="true" />
        </div>
        {trend && trendValue ? (
          <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium', trendTone)}>
            <TrendIcon className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
            {trendValue}
          </span>
        ) : null}
      </div>
      <div className="mb-1.5">
        {unavailable ? (
          <p className="font-mono text-[26px] font-semibold leading-none text-ink-faint">—</p>
        ) : (
          <p className="font-mono text-[26px] font-semibold leading-none tabular-nums text-ink">
            {prefix}
            {formattedValue}
            {suffix}
          </p>
        )}
      </div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">{label}</p>
      {hint && unavailable && (
        <p className="mt-1 text-[10px] text-ink-faint">{hint}</p>
      )}
    </div>
  );
}

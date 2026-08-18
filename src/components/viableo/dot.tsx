/**
 * The dot — Viableo's recurring brand device (Section 5.4).
 *
 * Used as: nav/footer separators, the primary loading indicator (pulsing coral
 * dot), decision-reveal animation, bullet markers, and section dividers.
 * One strong, consistent use per context — a signature, not wallpaper.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

interface DotProps {
  /** Coral by default. Pass a color token class to override. */
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

const SIZES = { xs: 'h-1 w-1', sm: 'h-1.5 w-1.5', md: 'h-2 w-2' };

/** A static coral dot — used as separators, bullet markers, dividers. */
export function Dot({ className, size = 'sm' }: DotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 rounded-full bg-brand',
        SIZES[size],
        className
      )}
    />
  );
}

/** Separator between items: A • B • C (Section 5.4 nav/footer separators). */
export function DotSeparator({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('mx-2 inline-block', className)}>
      <Dot size="xs" className="opacity-50" />
    </span>
  );
}

/**
 * The primary loading indicator everywhere in the app (Section 10.5).
 * A single coral dot pulsing scale 0.8↔1.2 / opacity 0.4↔1, ~800ms loop.
 * Replaces any generic spinner.
 */
export function LoadingDot({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-flex items-center justify-center', className)}
    >
      <span className="viableo-dot-loading" />
    </span>
  );
}

/** A full-width row of dots used as a sparing section divider. */
export function DotRule({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('flex items-center justify-center gap-1.5 py-6', className)}>
      <Dot size="xs" className="opacity-30" />
      <Dot size="xs" className="opacity-60" />
      <Dot size="sm" />
      <Dot size="xs" className="opacity-60" />
      <Dot size="xs" className="opacity-30" />
    </div>
  );
}

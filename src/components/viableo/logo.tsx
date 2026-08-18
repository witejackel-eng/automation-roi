/**
 * Viableo logo system — four lockups per Section 5.3.
 *
 * Construction: V shape (Viable) + check secondary read (verified economics)
 * + forward-leaning stroke (growth) + dot beneath the V (the decision point).
 *
 * The dot is the most important, most reusable piece — see <Dot /> in dot.tsx.
 * Minimum live size: 24px for the symbol. Favicon uses symbol only.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'compact' | 'monochrome' | 'reverse';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: Variant;
  /** Show the wordmark beside the symbol (primary + monochrome + reverse only). */
  withWordmark?: boolean;
}

const SYMBOL_PATH = (
  <>
    {/* The V: two strokes meeting bottom-left, right stroke lifts into a check. */}
    <path
      d="M5 7 L15 24 L25 7"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* The dot beneath the V vertex — the decision point. */}
    <circle cx="15" cy="28" r="2.1" fill="currentColor" />
  </>
);

const WORDMARK = 'Viableo';

export function Logo({ variant = 'primary', withWordmark = true, className, ...props }: LogoProps) {
  const showWord = withWordmark && variant !== 'compact';

  // Color treatment per variant.
  const symbolColor =
    variant === 'monochrome'
      ? 'text-ink'
      : variant === 'reverse'
        ? 'text-white'
        : 'text-brand'; // primary + compact

  const wordmarkClass =
    variant === 'monochrome'
      ? 'text-ink'
      : variant === 'reverse'
        ? 'text-white'
        : 'text-ink';

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        role="img"
        aria-label="Viableo"
        className={cn('h-7 w-7 shrink-0', symbolColor)}
        {...props}
      >
        {SYMBOL_PATH}
      </svg>
      {showWord && (
        <span
          className={cn(
            'font-display text-[18px] font-bold leading-none tracking-[-0.02em]',
            wordmarkClass
          )}
        >
          {WORDMARK}
        </span>
      )}
    </span>
  );
}

/** Compact symbol-only lockup — app sidebar, collapsed nav, social avatar. */
export function LogoCompact({ className }: { className?: string }) {
  return <Logo variant="compact" withWordmark={false} className={className} />;
}

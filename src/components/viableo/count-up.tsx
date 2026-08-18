'use client';

/**
 * Count-up number animation (Section 10.1).
 *
 * Trigger: element enters viewport (homepage) or calculation completes (app).
 * Effect: animate from 0 (or previous value) to target using tabular numerals
 * so layout never shifts. Duration ~900ms, ease-out-expo. On completion, a
 * brief 150ms scale pulse (1.0 → 1.03 → 1.0) on the number only.
 *
 * Respects prefers-reduced-motion: shows the final value immediately.
 * Safety: if IntersectionObserver never fires (headless browsers, SSR), a
 * fallback timeout after 2s shows the final value.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

interface CountUpProps {
  /** Target numeric value. */
  value: number;
  /** Number of decimal places to display. */
  decimals?: number;
  /** Optional prefix (e.g. "$"). */
  prefix?: string;
  /** Optional suffix (e.g. "×", " mo", "+"). */
  suffix?: string;
  /** Duration in ms; default 900. */
  duration?: number;
  className?: string;
  /** Re-trigger when value changes (e.g. scenario slider). */
  retriggerOnValueChange?: boolean;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 900,
  className,
  retriggerOnValueChange = false,
}: CountUpProps) {
  const reduced = usePrefersReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = React.useState(reduced ? value : 0);
  const [pulse, setPulse] = React.useState(false);
  const startedRef = React.useRef(false);
  const animFrameRef = React.useRef<number>(0);

  const run = React.useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const start = performance.now();
    const to = value;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // ease-out-expo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(to * eased);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
        setPulse(true);
        window.setTimeout(() => setPulse(false), 160);
      }
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, [value, duration]);

  // Re-run when value changes (scenario slider / new calc).
  const valueKey = retriggerOnValueChange ? value : null;
  React.useEffect(() => {
    startedRef.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (reduced) {
      setDisplay(value);
      return;
    }
    setDisplay(0);
  }, [valueKey, reduced, value]);

  React.useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node) return;

    // Check if element is already in viewport (handles headless browsers
    // and SSR hydration where IntersectionObserver may not fire).
    const rect = node.getBoundingClientRect();
    const inViewport =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;

    if (inViewport) {
      // Already visible — start animation on next frame.
      const raf = requestAnimationFrame(() => run());
      return () => cancelAnimationFrame(raf);
    }

    // Not yet visible — observe for viewport entry.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(node);

    // Safety fallback: if observer never fires within 2.5s (headless browser,
    // offscreen render, etc.), show the final value directly.
    const fallback = window.setTimeout(() => {
      if (!startedRef.current) {
        startedRef.current = true;
        setDisplay(value);
      }
      io.disconnect();
    }, 2500);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [value, duration, reduced, run]);

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      ref={ref}
      className={cn('font-mono tnum tabular-nums', pulse && 'count-pulse', className)}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatusPillProps {
  variant: 'build' | 'consider' | 'dont_build' | 'draft' | 'paid';
  children: React.ReactNode;
  className?: string;
}

/**
 * Status pill — the ONLY element in the design system permitted to use the
 * `rounded-full` shape. Always carries visible text (never color alone).
 */
const VARIANT_STYLES: Record<StatusPillProps['variant'], string> = {
  build: 'bg-build-bg text-build',
  consider: 'bg-consider-bg text-consider',
  dont_build: 'bg-dont-build-bg text-dont-build',
  draft: 'bg-surface text-ink-muted',
  paid: 'bg-brand-subtle text-brand',
};

export function StatusPill({
  variant,
  children,
  className,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

'use client';

import * as React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface KpiCardProps {
  label: string;
  value: string; // pre-formatted via format helpers
  sublabel?: string;
  variant?: 'primary' | 'secondary'; // primary = metric-lg (40px), secondary = metric-md (24px)
  tone?: 'default' | 'build' | 'consider' | 'dont_build' | 'brand';
  delta?: { value: string; positive: boolean };
  loading?: boolean;
  className?: string;
}

const TONE_TEXT: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'text-ink',
  build: 'text-build',
  consider: 'text-consider',
  dont_build: 'text-dont-build',
  brand: 'text-brand',
};

export function KpiCard({
  label,
  value,
  sublabel,
  variant = 'primary',
  tone = 'default',
  delta,
  loading = false,
  className,
}: KpiCardProps) {
  const isPrimary = variant === 'primary';
  const toneText = TONE_TEXT[tone];
  const padding = isPrimary ? 'p-5' : 'p-4';

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-surface-raised',
          padding,
          className
        )}
        aria-busy="true"
      >
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton
          className={cn(isPrimary ? 'h-10 w-32' : 'h-6 w-24')}
        />
        {sublabel && <Skeleton className="h-3 w-20 mt-2" />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface-raised',
        padding,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] leading-tight text-ink-muted">
          {label}
        </span>
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-mono tnum',
              delta.positive
                ? 'bg-build-bg text-build'
                : 'bg-dont-build-bg text-dont-build'
            )}
            aria-label={delta.positive ? 'increased' : 'decreased'}
          >
            {delta.positive ? (
              <ArrowUpRight className="size-3" strokeWidth={1.75} />
            ) : (
              <ArrowDownRight className="size-3" strokeWidth={1.75} />
            )}
            {delta.value}
          </span>
        )}
      </div>
      <div
        className={cn(
          'font-mono tnum font-medium mt-2',
          toneText,
          isPrimary ? 'text-[40px] leading-none' : 'text-2xl leading-tight'
        )}
      >
        {value}
      </div>
      {sublabel && (
        <div className="text-[13px] text-ink-muted mt-1.5">{sublabel}</div>
      )}
    </div>
  );
}

'use client';

/**
 * UsageContent — the "Usage" section.
 *
 * Reads tier from useTier() and cases-this-month from the projects list.
 *
 * Starter: X/10 cases this month with progress bar + reset date +
 *   "Upgrade to Pro" CTA → go('pricing').
 * Pro: "Pro · Unlimited cases" + the features unlocked list.
 */
import * as React from 'react';
import {
  Wallet,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import { useTier } from '@/lib/store';
import { CASES_PER_MONTH, TIER_LABEL } from '@/lib/entitlement';
import type { SavedProject } from '@/lib/store';
import { casesThisMonth } from '../verdict';

interface UsageContentProps {
  projects: SavedProject[];
}

const PRO_FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: CheckCircle2, label: 'Unlimited cases per month' },
  { icon: CheckCircle2, label: 'Clean, unwatermarked client PDFs' },
  { icon: CheckCircle2, label: 'Agency branding (logo + brand color)' },
  { icon: CheckCircle2, label: 'Share links with approval tracking' },
  { icon: CheckCircle2, label: 'Client directory & case library' },
  { icon: CheckCircle2, label: 'Case versioning & challenge workflow' },
  { icon: CheckCircle2, label: 'Client history reuse' },
  { icon: CheckCircle2, label: 'Team seats' },
];

export function UsageContent({ projects }: UsageContentProps) {
  const tier = useTier();
  const go = useApp((s) => s.go);
  const startCalculator = useApp((s) => s.startCalculator);

  const used = casesThisMonth(projects);
  const isPro = tier === 'pro' || tier === 'agency' || tier === 'agency_pro';
  const limit = CASES_PER_MONTH[tier] ?? CASES_PER_MONTH.free;
  const isUnlimited = !Number.isFinite(limit);
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const remaining = isUnlimited ? Infinity : Math.max(0, limit - used);

  const resetDate = React.useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }, []);
  const resetLabel = resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="space-y-4">
      {/* ── Plan header ── */}
      <div className="rounded-lg border border-border bg-surface-raised p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-subtle">
              <Wallet className="h-4 w-4 text-brand" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-[14px] font-medium text-ink">{TIER_LABEL[tier]} plan</h2>
              <p className="text-[11px] text-ink-faint">
                {isUnlimited ? 'Unlimited cases — no monthly cap' : `${used} of ${limit} cases used this month`}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium',
              isPro ? 'bg-brand-subtle text-brand' : 'bg-surface text-ink-muted',
            )}
          >
            {TIER_LABEL[tier]}
          </span>
        </div>

        {!isUnlimited ? (
          <>
            <div className="mb-2 flex items-baseline justify-between text-[12px]">
              <span className="text-ink-muted">
                <span className="font-mono text-ink">{used}</span> / <span className="font-mono text-ink">{limit}</span> cases
              </span>
              <span className="text-ink-faint">Resets on {resetLabel}</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-surface"
              role="progressbar"
              aria-valuenow={used}
              aria-valuemin={0}
              aria-valuemax={limit}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  pct >= 100 ? 'bg-dont-build' : pct >= 75 ? 'bg-consider' : 'bg-brand',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-ink-faint">
              <span><span className="font-mono text-ink-muted">{remaining}</span> remaining this month</span>
              <span>{pct}% used</span>
            </div>

            {pct >= 75 && (
              <div className="mt-4 rounded-md border border-consider-bg bg-consider-bg/30 p-3">
                <p className="text-[12px] text-consider">
                  Approaching the Starter cap. Upgrade to Pro to keep running cases without interruption.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => go('pricing')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-cta px-4 py-2 text-[12px] font-medium text-brand-foreground transition-colors hover:bg-brand-cta-hover"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Upgrade to Pro
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </>
        ) : (
          <>
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              <span className="font-mono text-ink">{used}</span> case{used === 1 ? '' : 's'} this month. Pro unlocks unlimited cases and every product surface.
            </p>
            <button
              type="button"
              onClick={() => startCalculator()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-[12px] font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
            >
              <Zap className="h-3.5 w-3.5" strokeWidth={1.5} />
              Run another case
            </button>
          </>
        )}
      </div>

      {/* ── Pro features ── */}
      <div className="rounded-lg border border-border bg-surface-raised p-5">
        <h3 className="mb-3 text-[13px] font-medium text-ink">
          {isPro ? 'Included with your Pro plan' : 'Unlocked with Pro'}
        </h3>
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {PRO_FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <li key={f.label} className="flex items-center gap-2 text-[12.5px]">
                <Icon
                  className={cn('h-3.5 w-3.5 shrink-0', isPro ? 'text-build' : 'text-ink-faint')}
                  strokeWidth={1.5}
                />
                <span className={isPro ? 'text-ink' : 'text-ink-muted'}>{f.label}</span>
              </li>
            );
          })}
        </ul>
        {!isPro && (
          <button
            type="button"
            onClick={() => go('pricing')}
            className="mt-4 inline-flex items-center gap-1 text-[12px] text-brand transition-colors hover:text-brand-hover"
          >
            Compare Starter vs Pro
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}

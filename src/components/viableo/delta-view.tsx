'use client';

/**
 * DeltaView — before/after comparison display for a what-if challenge.
 *
 * Shows the original vs. challenged verdict, confidence, payback, and ROI
 * in a compact side-by-side layout. When the verdict changed, a prominent
 * transition callout is rendered.
 */
import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatRoi, formatPayback } from '@/lib/format';
import { DecisionBadge } from './decision-badge';
import type { DecisionKey } from '@/lib/brand';

interface ResultSummary {
  verdict: string;
  confidence: number;
  payback: number | null;
  roi: number | null;
}

interface DeltaViewProps {
  original: ResultSummary;
  challenged: ResultSummary;
  changedField: string;
  previousValue: number;
  newValue: number;
  unit?: string;
  onAccept?: () => void;
  onRevert?: () => void;
}

function formatFieldLabel(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function DeltaView({
  original,
  challenged,
  changedField,
  previousValue,
  newValue,
  unit = '',
  onAccept,
  onRevert,
}: DeltaViewProps) {
  const verdictChanged = original.verdict !== challenged.verdict;
  const previousDirection = Math.sign(newValue - previousValue);
  const sameValue = previousValue === newValue;

  return (
    <div className="space-y-4">
      {/* Verdict transition callout */}
      {verdictChanged && (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40">
          <DecisionBadge
            decision={original.verdict as DecisionKey}
            size="sm"
          />
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          <DecisionBadge
            decision={challenged.verdict as DecisionKey}
            size="sm"
            animate
          />
        </div>
      )}

      {/* Assumption change row */}
      <div className="rounded-lg border bg-muted/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Challenged assumption
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {formatFieldLabel(changedField)}
          </span>
          <span className="font-mono text-sm tabular-nums">
            {previousValue.toLocaleString()}{unit}
          </span>
          {!sameValue && (
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <span
            className={cn(
              'font-mono text-sm font-semibold tabular-nums',
              verdictChanged && !sameValue && 'text-amber-600 dark:text-amber-400',
            )}
          >
            {newValue.toLocaleString()}{unit}
          </span>
          {!sameValue && (
            <span className="text-xs text-muted-foreground">
              ({previousDirection > 0 ? '+' : ''}{((newValue - previousValue) / Math.max(Math.abs(previousValue), 1) * 100).toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-3">
        <ComparisonCard
          label="Current"
          verdict={original.verdict}
          confidence={original.confidence}
          payback={original.payback}
          roi={original.roi}
        />
        <ComparisonCard
          label="Challenged"
          verdict={challenged.verdict}
          confidence={challenged.confidence}
          payback={challenged.payback}
          roi={challenged.roi}
          highlight={verdictChanged}
        />
      </div>

      {/* Action buttons */}
      {(onAccept || onRevert) && (
        <div className="flex items-center gap-2 pt-1">
          {onAccept && (
            <button
              type="button"
              onClick={onAccept}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Accept new value
            </button>
          )}
          {onRevert && (
            <button
              type="button"
              onClick={onRevert}
              className="rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Revert
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Internal comparison card ──────────────────────────────────

interface ComparisonCardProps {
  label: string;
  verdict: string;
  confidence: number;
  payback: number | null;
  roi: number | null;
  highlight?: boolean;
}

function ComparisonCard({
  label,
  verdict,
  confidence,
  payback,
  roi,
  highlight,
}: ComparisonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 space-y-3',
        highlight && 'border-amber-400 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <DecisionBadge decision={verdict as DecisionKey} size="sm" />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <MetricRow label="Confidence" value={`${confidence}/100`} />
        <MetricRow label="Payback" value={formatPayback(payback)} />
        <MetricRow label="ROI" value={formatRoi(roi)} />
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm tabular-nums font-medium">{value}</span>
    </div>
  );
}

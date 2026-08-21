/**
 * Formatting helpers (Section 21). The single rule that makes the product read
 * as a financial instrument: every currency, percentage and payback figure is
 * rendered with tabular-nums mono numerals, and never NaN / Infinity / null.
 */
import type { ScenarioResult } from './calculations/engine';

/** Currency with comma grouping, no cents unless the value is under $10. */
export function formatCurrency(
  n: number | { toNumber(): number } | null | undefined,
  optsOrCurrency: { compact?: boolean } | string = {}
): string {
  // Accept Prisma Decimal ({ toNumber() }) or plain number.
  const v = n == null ? null : typeof n === 'number' ? n : n.toNumber();
  if (v == null || !Number.isFinite(v)) return '—';
  const compact = typeof optsOrCurrency === 'object' ? optsOrCurrency.compact : false;
  if (compact && Math.abs(v) >= 1_000_000) {
    const m = v / 1_000_000;
    return `$${m.toFixed(m >= 10 ? 1 : 2).replace(/\.0+$/, '')}M`;
  }
  const underTen = Math.abs(v) < 10;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: underTen ? 2 : 0,
    maximumFractionDigits: underTen ? 2 : 0,
  }).format(v);
}

/** Whole-percent for headlines, one-decimal for tables. */
export function formatPercent(
  n: number | null | undefined,
  opts: { decimals?: number } = {}
): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const decimals = opts.decimals ?? 0;
  return `${n.toFixed(decimals)}%`;
}

/** A percentage-point figure already expressed as a decimal (0.015 -> "1.5pp"). */
export function formatPercentagePoints(
  n: number | null | undefined,
  decimals = 1
): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(decimals)}pp`;
}

/** A 0–1 ratio rendered as a percent (0.20 -> "20%"). */
export function formatRatioAsPercent(
  n: number | null | undefined,
  decimals = 0
): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(decimals)}%`;
}

/** Payback months, with "Never" for null and "Immediate" for 0. */
export function formatPayback(
  months: number | null | undefined,
  opts: { compact?: boolean } = {}
): string {
  if (months == null || !Number.isFinite(months)) return 'Never';
  if (months === 0) return 'Immediate';
  if (opts.compact && months >= 12) {
    const yrs = months / 12;
    return `${yrs.toFixed(yrs >= 10 ? 0 : 1).replace(/\.0$/, '')} yr`;
  }
  return `${months.toFixed(months >= 10 ? 0 : 1)} months`;
}

/** ROI percent or "N/A". */
export function formatRoi(roiPct: number | null | undefined): string {
  if (roiPct == null || !Number.isFinite(roiPct)) return 'N/A';
  return `${Math.round(roiPct)}%`;
}

/** Integer count with comma grouping. */
export function formatCount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    Math.round(n)
  );
}

/** Verdict display label. */
export function verdictLabel(v: 'build' | 'consider' | 'dont_build'): string {
  switch (v) {
    case 'build':
      return 'BUILD';
    case 'consider':
      return 'CONSIDER';
    case 'dont_build':
      return "DON'T BUILD";
  }
}

/** "revenue opportunity" vs "gross profit" depending on margin availability. */
export function revenueLabel(result: ScenarioResult | { isRevenueOpportunityOnly: boolean }): string {
  return result.isRevenueOpportunityOnly ? 'revenue opportunity' : 'gross profit';
}

// ===========================================================================
// Founder Control Plane — admin display helpers
// Appended for the admin dashboard. These supplement the existing formatters.
// ===========================================================================
import { formatDistanceToNow, format as fnsFormat } from 'date-fns'

/** Compact currency for KPI cards: $1.2K, $3.4M. */
export function formatCompactCurrency(n: number | { toNumber(): number } | null | undefined, currency = 'USD'): string {
  const v = n == null ? null : typeof n === 'number' ? n : n.toNumber()
  if (v == null || !Number.isFinite(v)) return '—'
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return formatCurrency(v)
}

/** "3 hours ago", "2 days ago" — for relative timestamps in tables. */
export function timeAgo(date: Date | string | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return formatDistanceToNow(d, { addSuffix: true })
}

/** "Aug 21, 2025 · 3:45 PM" — for absolute timestamps. */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return fnsFormat(d, 'MMM d, yyyy · h:mm a')
}

/** "Aug 21, 2025" — for dates only. */
export function formatDate(date: Date | string | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return fnsFormat(d, 'MMM d, yyyy')
}

/** Truncate an ID for display: "cl_abcd1234ef…" */
export function shortId(id: string | null | undefined, len = 8): string {
  if (!id) return '—'
  return id.length <= len ? id : `${id.slice(0, len)}…`
}

/** "Caleb Jones" -> "CJ" */
export function initials(name?: string | null): string {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Shared verdict metadata for the dashboard.
 *
 * Mirrors the canonical VERDICT_META pattern used across the product so the
 * dashboard stays visually consistent with ResultsView, ProjectsView, etc.
 * The verdict tokens are the actual defined globals.css variables
 * (--color-build / --color-consider / --color-dont-build) routed through
 * Tailwind v4 utility names — never the unrelated success/warning/critical
 * aliases.
 */
import type { SavedProject } from '@/lib/store';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export type VerdictKey = 'build' | 'consider' | 'dont_build';

export interface VerdictMeta {
  key: VerdictKey;
  label: string;
  /** Capitalized label, e.g. "Build". */
  labelPretty: string;
  icon: LucideIcon;
  text: string;
  bg: string;
  bar: string;
  dot: string;
}

export const VERDICT_META: Record<VerdictKey, VerdictMeta> = {
  build: {
    key: 'build',
    label: 'BUILD',
    labelPretty: 'Build',
    icon: CheckCircle2,
    text: 'text-build',
    bg: 'bg-build-bg',
    bar: 'bg-build',
    dot: 'bg-build',
  },
  consider: {
    key: 'consider',
    label: 'CONSIDER',
    labelPretty: 'Consider',
    icon: AlertTriangle,
    text: 'text-consider',
    bg: 'bg-consider-bg',
    bar: 'bg-consider',
    dot: 'bg-consider',
  },
  dont_build: {
    key: 'dont_build',
    label: "DON\u2019T BUILD",
    labelPretty: "Don\u2019t Build",
    icon: XCircle,
    text: 'text-dont-build',
    bg: 'bg-dont-build-bg',
    bar: 'bg-dont-build',
    dot: 'bg-dont-build',
  },
};

/** Look up the verdict metadata for a project's recommendation. */
export function verdictMetaFor(recommendation: string): VerdictMeta {
  if (recommendation === 'build') return VERDICT_META.build;
  if (recommendation === 'consider') return VERDICT_META.consider;
  return VERDICT_META.dont_build;
}

/**
 * Format a relative-time string (e.g. "2h ago", "3d ago") from an ISO
 * timestamp. Matches the existing dashboard-view formatter so the right rail
 * activity feed stays consistent with the recent-cases list.
 */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '\u2014';
  const now = Date.now();
  const diffMs = now - date.getTime();
  if (diffMs < 0) return 'just now';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

/** Count cases created this calendar month. */
export function casesThisMonth(projects: SavedProject[]): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return projects.filter((p) => new Date(p.createdAt) >= monthStart).length;
}

/** Count cases created last calendar month (for trend deltas). */
export function casesLastMonth(projects: SavedProject[]): number {
  const now = new Date();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return projects.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= lastMonthStart && d < thisMonthStart;
  }).length;
}

/** Cases created in the last N days. */
export function casesInLastDays(projects: SavedProject[], days: number): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return projects.filter((p) => new Date(p.createdAt).getTime() >= cutoff).length;
}

/** Share-status label for a project, derived from shareEngagement.decisionState. */
export function shareStatusLabel(
  project: SavedProject,
): { label: string; tone: 'idle' | 'viewed' | 'approved' | 'changes' | 'none' } {
  const eng = project.shareEngagement;
  if (!eng) return { label: 'Not shared', tone: 'none' };
  if (eng.viewCount === 0) return { label: 'Sent', tone: 'idle' };
  const state = eng.decisionState;
  if (state === 'approved') return { label: 'Approved', tone: 'approved' };
  if (state === 'changes_requested') return { label: 'Changes requested', tone: 'changes' };
  if (state === 'viewed') return { label: 'Viewed', tone: 'viewed' };
  return { label: `${eng.viewCount} ${eng.viewCount === 1 ? 'view' : 'views'}`, tone: 'viewed' };
}

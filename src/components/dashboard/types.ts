/**
 * Shared types for the Viableo dashboard shell (Pulse-style 3-column console).
 *
 * The dashboard lives inside the existing `/start` authenticated workspace.
 * It owns its own `activeSection` state (like Pulse) but reads projects +
 * entitlement from the existing `useApp()` store + `/api/projects` +
 * `/api/entitlement`.
 */

/** The set of navigable dashboard sections. */
export type Section =
  | 'overview'
  | 'cases'
  | 'performance'
  | 'risk'
  | 'usage'
  | 'clients'
  | 'library'
  | 'reports'
  | 'settings';

/** Per-section header copy. Viableo-specific — no incident/deployment language. */
export const SECTION_META: Record<
  Section,
  { title: string; subtitle: string }
> = {
  overview: {
    title: 'Overview',
    subtitle: 'Your automation decision workspace',
  },
  cases: {
    title: 'Cases',
    subtitle: 'Every ROI analysis you have run',
  },
  performance: {
    title: 'ROI Performance',
    subtitle: 'Per-case economics, when available',
  },
  risk: {
    title: 'Risk',
    subtitle: 'CONSIDER and DON\u2019T BUILD verdicts',
  },
  usage: {
    title: 'Usage',
    subtitle: 'Cases this period, plan limits',
  },
  clients: {
    title: 'Clients',
    subtitle: 'Where your client directory lives',
  },
  library: {
    title: 'Library',
    subtitle: 'Your saved analyses',
  },
  reports: {
    title: 'Reports',
    subtitle: 'Client PDFs generated per case',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Agency branding, clients, team',
  },
};

/** All sections, in sidebar order. */
export const ALL_SECTIONS: Section[] = [
  'overview',
  'cases',
  'performance',
  'risk',
  'usage',
  'clients',
  'library',
  'reports',
  'settings',
];

/** A single recent-activity entry shown in the right rail. */
export interface ActivityEntry {
  id: string;
  kind:
    | 'case_saved'
    | 'case_updated'
    | 'verdict_changed'
    | 'pdf_generated'
    | 'share_sent'
    | 'share_viewed';
  title: string;
  /** ISO timestamp. */
  at: string;
}

/** Decorative time-range options for the section header. */
export type TimeRange = '7d' | '30d' | '90d';

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

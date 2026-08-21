'use client';

/**
 * DashboardView — the Viableo authenticated dashboard.
 *
 * Renders the new Pulse-style three-column console (`<DashboardShell />`)
 * inside the existing `/start` workspace. Kept as a thin wrapper so the
 * existing `DashboardView` export + `'use client'` directive continue to
 * work — `/start` keeps rendering this view when `view === 'dashboard'`.
 *
 * The shell owns its own `activeSection` state (Overview / Cases / Risk / …)
 * but reads projects + entitlement from the existing `useApp()` store and
 * fetches `/api/projects` + `/api/entitlement` on mount. The calculation
 * engine, entitlement system, PDF generation, share links, admin routes,
 * and the `?start=1` / `?example=apex` query-param behaviour are unchanged.
 *
 * See `src/components/dashboard/shell.tsx` for the layout and
 * `src/components/dashboard/content/*` for each section's body.
 */
import { DashboardShell } from '@/components/dashboard/shell';

export function DashboardView() {
  return <DashboardShell />;
}

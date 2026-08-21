'use client';

/**
 * Viableo — the application entry route (`/start`).
 *
 * The marketing homepage lives at `/` (a server component). This route is the
 * full product: a Zustand view-switcher rendering LandingView / CalculatorView /
 * ResultsView / ProjectsView / SettingsView / PricingView by store state. It is
 * a client component because it calls useSearchParams() + useApp() + a useEffect
 * that fetches /api/entitlement.
 *
 * The `?start=1` query param (linked from marketing CTAs) auto-launches the
 * calculator so the flow is one click. `?example=apex` pre-fills Apex inputs.
 *
 * On mount, we fetch the current entitlement from /api/entitlement so the UI
 * gates Save / Report / Proposal / Branding correctly. The pricing page emits
 * an `entitlement:refresh` event on purchase so we re-fetch without a reload.
 *
 * BUILD NOTE: `useSearchParams()` must be wrapped in a <Suspense> boundary for
 * static generation (next build) — otherwise the build fails with
 * "missing-suspense-with-csr-bailout". The default export `StartPage` renders the
 * Suspense wrapper; the actual app logic lives in `StartApp`.
 */
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { AppShell } from '@/components/app-shell';
import { DashboardView } from '@/components/views/dashboard-view';
import { LandingView } from '@/components/views/landing-view';
import { CalculatorView } from '@/components/views/calculator-view';
import { ResultsView } from '@/components/views/results-view';
import { ProjectsView } from '@/components/views/projects-view';
import { SettingsView } from '@/components/views/settings-view';
import { PricingView } from '@/components/views/pricing-view';
import { useApp } from '@/lib/store';
import { entitlementFor, type Entitlement } from '@/lib/entitlement';
import { APEX_INPUTS } from '@/lib/golden-case';

function StartApp() {
  const { view, entitlement, setEntitlement, startCalculator } = useApp(
    useShallow((s) => ({
      view: s.view,
      entitlement: s.entitlement,
      setEntitlement: s.setEntitlement,
      startCalculator: s.startCalculator,
    }))
  );

  const searchParams = useSearchParams();

  const refreshEntitlement = React.useCallback(async () => {
    try {
      const res = await fetch('/api/entitlement');
      if (!res.ok) {
        // Fallback to free tier so the app remains usable offline / first-load.
        setEntitlement(entitlementFor('free'));
        return;
      }
      const data = (await res.json()) as Entitlement;
      setEntitlement(data);
    } catch {
      setEntitlement(entitlementFor('free'));
    }
  }, [setEntitlement]);

  React.useEffect(() => {
    void refreshEntitlement();
    const handler = () => void refreshEntitlement();
    window.addEventListener('entitlement:refresh', handler);
    return () => window.removeEventListener('entitlement:refresh', handler);
  }, [refreshEntitlement]);

  // Auto-launch the calculator when arriving via ?start=1 (from marketing CTAs).
  // Runs once on mount; reads the query param + the apex example flag.
  const didAutoStart = React.useRef(false);
  React.useEffect(() => {
    if (didAutoStart.current) return;
    const shouldStart = searchParams.get('start') === '1';
    const useApex = searchParams.get('example') === 'apex';
    if (shouldStart) {
      didAutoStart.current = true;
      startCalculator(useApex ? APEX_INPUTS : undefined);
    }
  }, [searchParams, startCalculator]);

  // Render a minimal placeholder until entitlement loads so gating doesn't
  // flash "locked then unlocked". Once loaded, render the chosen view.
  return (
    <AppShell>
      {!entitlement && view !== 'landing' && view !== 'calculator' && view !== 'dashboard' ? (
        <div className="mx-auto w-full max-w-[1200px] px-4 py-16 md:px-6">
          <div className="h-7 w-1/3 animate-pulse rounded bg-surface" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-surface" />
            ))}
          </div>
        </div>
      ) : view === 'dashboard' ? (
        <DashboardView />
      ) : view === 'landing' ? (
        <LandingView />
      ) : view === 'calculator' ? (
        <CalculatorView />
      ) : view === 'results' ? (
        <ResultsView />
      ) : view === 'projects' ? (
        <ProjectsView />
      ) : view === 'settings' ? (
        <SettingsView />
      ) : view === 'pricing' ? (
        <PricingView />
      ) : (
        <LandingView />
      )}
    </AppShell>
  );
}

/**
 * Default export — wraps `StartApp` in a Suspense boundary so that
 * `useSearchParams()` inside `StartApp` doesn't break static generation
 * during `next build` (CSR bailout requires a Suspense boundary).
 */
export default function StartPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1200px] px-4 py-16 md:px-6">
          <div className="h-7 w-1/3 animate-pulse rounded bg-surface" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-surface" />
            ))}
          </div>
        </div>
      }
    >
      <StartApp />
    </React.Suspense>
  );
}

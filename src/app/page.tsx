'use client';

/**
 * Viableo — Automation ROI. The app entry route (`/`).
 *
 * The marketing homepage + the full product (calculator, results, projects,
 * settings, pricing) render inside this page. "Pages" are client views switched
 * by the Zustand store — the calculator/results/projects/settings flow is
 * ephemeral state that doesn't survive a refresh by design (a full /app/*
 * authenticated persistence layer is the next architectural phase).
 *
 * Marketing content pages (/pricing, /methodology, /solutions/*, /resources/*)
 * are real App Router routes rendered server-side with their own metadata —
 * those are NOT handled here.
 *
 * The `?start=1` query param (linked from marketing routes + the hero CTA on
 * marketing pages) auto-launches the calculator so the flow is one click.
 * The `?example=apex` param pre-fills the Apex golden-case inputs.
 *
 * On mount, we fetch the current entitlement from /api/entitlement so the UI
 * gates Save / Report / Proposal / Branding correctly. The pricing page emits
 * an `entitlement:refresh` event on purchase so we re-fetch without a reload.
 *
 * BUILD NOTE: `useSearchParams()` must be wrapped in a <Suspense> boundary for
 * static generation (next build) — otherwise the build fails with
 * "missing-suspense-with-csr-bailout". The default export `Home` renders the
 * Suspense wrapper; the actual app logic lives in `HomeContent`.
 */
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { AppShell } from '@/components/app-shell';
import { LandingView } from '@/components/views/landing-view';
import { CalculatorView } from '@/components/views/calculator-view';
import { ResultsView } from '@/components/views/results-view';
import { ProjectsView } from '@/components/views/projects-view';
import { SettingsView } from '@/components/views/settings-view';
import { PricingView } from '@/components/views/pricing-view';
import { useApp } from '@/lib/store';
import { entitlementFor, type Entitlement } from '@/lib/entitlement';
import { APEX_INPUTS } from '@/lib/golden-case';

function HomeContent() {
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
      {!entitlement && view !== 'landing' && view !== 'calculator' ? (
        <div className="mx-auto w-full max-w-[1200px] px-4 py-16 md:px-6">
          <div className="h-7 w-1/3 animate-pulse rounded bg-surface" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-surface" />
            ))}
          </div>
        </div>
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
 * Default export — wraps `HomeContent` in a Suspense boundary so that
 * `useSearchParams()` inside `HomeContent` doesn't break static generation
 * during `next build` (CSR bailout requires a Suspense boundary).
 */
export default function Home() {
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
      <HomeContent />
    </React.Suspense>
  );
}

/**
 * Client-side app state (Zustand). The whole app renders inside a single
 * route (`/`), so "pages" are store views switched here.
 */
import { create } from 'zustand';
import type { CalculatorInputs, ScenarioResult, Recommendation } from '@/lib/calculations/engine';
import type { ScenarioName } from '@/lib/calculations/scenarios';
import type { Entitlement, Tier } from '@/lib/entitlement';

export type View =
  | 'landing'
  | 'pricing'
  | 'calculator'
  | 'results'
  | 'projects'
  | 'settings';

export interface SavedReport {
  id: string;
  pdfUrl: string;
  reportType: 'client_report' | 'proposal';
  createdAt: string;
}

export interface SavedProject {
  id: string;
  clientName: string;
  recommendation: 'build' | 'consider' | 'dont_build';
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  view: View;

  // Entitlement
  entitlement: Entitlement | null;
  setEntitlement: (e: Entitlement | null) => void;

  // Calculator → Results payload
  inputs: CalculatorInputs | null;
  results: Record<ScenarioName, ScenarioResult> | null;
  recommendation: { recommendation: Recommendation; reason: string; copy: string } | null;
  activeScenario: ScenarioName;
  setActiveScenario: (s: ScenarioName) => void;

  // Saved projects + reports
  savedProjectId: string | null;
  savedReports: SavedReport[];
  setSavedReports: (r: SavedReport[]) => void;
  addSavedReport: (r: SavedReport) => void;
  projects: SavedProject[];
  setProjects: (p: SavedProject[]) => void;

  // Settings / branding snapshot (live UI; brand color only applies to PDF)
  branding: {
    name: string;
    website: string;
    contactEmail: string;
    phone: string;
    logoUrl: string;
    brandColorHex: string;
  } | null;
  setBranding: (b: AppState['branding']) => void;

  // Navigation
  go: (v: View) => void;

  // Calculator complete → set results + go to results
  setCalculation: (
    inputs: CalculatorInputs,
    results: Record<ScenarioName, ScenarioResult>,
    recommendation: { recommendation: Recommendation; reason: string; copy: string }
  ) => void;

  // Open the calculator with optional pre-filled inputs (Apex example)
  startCalculator: (initialInputs?: CalculatorInputs) => void;

  // View the Apex example report (pre-filled, then calculate)
  viewExampleReport: () => void;

  /**
   * Reopen a saved analysis by id — fetches the full project payload
   * from /api/projects/[id], restores inputs + results + recommendation
   * into the store, sets the savedProjectId, and navigates to the
   * results view. Returns true on success, false on failure.
   *
   * On failure the caller is responsible for surfacing a toast — the
   * store stays unchanged so the user's current state is preserved.
   */
  reopenProject: (id: string) => Promise<boolean>;
  /** Remove a project from the local list after server-side delete. */
  deleteProject: (id: string) => void;
  /** Clear the saved-project id (used when starting a fresh analysis). */
  clearSavedProject: () => void;
}

export const useApp = create<AppState>((set) => ({
  view: 'landing',
  entitlement: null,
  setEntitlement: (e) => set({ entitlement: e }),

  inputs: null,
  results: null,
  recommendation: null,
  activeScenario: 'expected',
  setActiveScenario: (s) => set({ activeScenario: s }),

  savedProjectId: null,
  savedReports: [],
  setSavedReports: (r) => set({ savedReports: r }),
  addSavedReport: (r) => set((s) => ({ savedReports: [r, ...s.savedReports].slice(0, 20) })),
  projects: [],
  setProjects: (p) => set({ projects: p }),

  branding: null,
  setBranding: (b) => set({ branding: b }),

  go: (v) => {
    set({ view: v });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  },

  setCalculation: (inputs, results, recommendation) =>
    set({
      inputs,
      results,
      recommendation,
      activeScenario: 'expected',
      view: 'results',
    }),
  startCalculator: (initialInputs) =>
    set({
      inputs: initialInputs ?? null,
      results: null,
      recommendation: null,
      view: 'calculator',
    }),
  viewExampleReport: () =>
    set({
      // The calculator's Wizard handles initialInputs → summary → calculate,
      // so this just opens the calculator pre-filled with APEX_INPUTS.
      view: 'calculator',
    }),

  reopenProject: async (id) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) return false;
      const data = (await res.json()) as {
        id: string;
        clientName: string;
        inputs: CalculatorInputs;
        results: Record<ScenarioName, ScenarioResult>;
        recommendation: { recommendation: Recommendation; reason: string; copy: string };
      };
      set({
        savedProjectId: data.id,
        inputs: data.inputs,
        results: data.results,
        recommendation: data.recommendation,
        // Default to the Expected scenario — the recommendation was
        // originally computed against Expected (Master Spec §11 invariant).
        activeScenario: 'expected',
        view: 'results',
      });
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
      return true;
    } catch {
      return false;
    }
  },

  deleteProject: (id) => set({ projects: get().projects.filter((p) => p.id !== id) }),

  clearSavedProject: () => set({ savedProjectId: null }),
}));

/** Convenience selector hook for tier gating in components. */
export function useTier(): Tier {
  return useApp((s) => s.entitlement?.tier ?? 'free');
}

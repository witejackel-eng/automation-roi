'use client';

/**
 * Calculator view — wraps the 3-step Wizard and forwards the result into the
 * store on completion.
 *
 * The Wizard renders its own header ("Viableo Analysis" via `TERM.analysis`).
 * This wrapper is intentionally thin: it maps the store's `inputs` (used to
 * pre-fill from the Apex example) and the `setCalculation` action onto the
 * Wizard's props. Viableo voice lives inside the Wizard and its step copy.
 */
import { useEffect, useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Wizard, type WizardCompletePayload } from '@/components/calculator/wizard';
import { useApp } from '@/lib/store';
import { APEX_INPUTS } from '@/lib/golden-case';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CalculatorView() {
  const { go, setCalculation, inputs, savedProjectId, startCalculator } = useApp(
    useShallow((s) => ({
      go: s.go,
      setCalculation: s.setCalculation,
      inputs: s.inputs,
      savedProjectId: s.savedProjectId,
      startCalculator: s.startCalculator,
    }))
  );

  // Pre-fill only when the user came in via "View Example Report".
  // Detect this by checking whether the current inputs match APEX_INPUTS.
  const initial =
    inputs && inputs.clientName === APEX_INPUTS.clientName ? APEX_INPUTS : undefined;

  // ── Autosave / Draft recovery ──────────────────────────────────────
  const DRAFT_KEY = `viableo-draft-${savedProjectId ?? 'new'}`;
  const [draftDismissed, setDraftDismissed] = useState(false);

  // Check for a recovered draft on mount via lazy initializer.
  const [draft, setDraft] = useState<{ inputs: typeof APEX_INPUTS; savedAt: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { inputs: typeof APEX_INPUTS; savedAt: string };
        if (parsed.inputs && parsed.savedAt) return parsed;
      }
    } catch {
      /* ignore corrupt drafts */
    }
    return null;
  });

  const restoreDraft = useCallback(() => {
    if (draft && !draftDismissed) {
      setDraftDismissed(true);
      startCalculator(draft.inputs);
      setDraft(null);
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [draft, draftDismissed, DRAFT_KEY, startCalculator]);

  const discardDraft = useCallback(() => {
    setDraftDismissed(true);
    setDraft(null);
    localStorage.removeItem(DRAFT_KEY);
  }, [DRAFT_KEY]);

  // 1.5s debounced autosave of current inputs to localStorage.
  useEffect(() => {
    if (!inputs) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ inputs, savedAt: new Date().toISOString() }),
        );
      } catch {
        /* localStorage full — silently skip */
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [inputs, DRAFT_KEY]);

  return (
    <>
      {draft && !draftDismissed && (
        <Alert className="mb-4">
          <AlertDescription>
            We recovered an unsaved draft from{' '}
            {formatTimeAgo(draft.savedAt)} —{' '}
            <button
              type="button"
              className="underline font-medium"
              onClick={restoreDraft}
            >
              Restore
            </button>{' '}
            /{' '}
            <button
              type="button"
              className="underline font-medium"
              onClick={discardDraft}
            >
              Discard
            </button>
          </AlertDescription>
        </Alert>
      )}
      <Wizard
        initialInputs={initial}
        onCancel={() => go('landing')}
        onComplete={(payload: WizardCompletePayload) => {
          setCalculation(payload.inputs, payload.results, payload.recommendation);
        }}
      />
    </>
  );
}

/** Simple relative-time formatter for the draft banner. */
function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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
import { useShallow } from 'zustand/react/shallow';
import { Wizard, type WizardCompletePayload } from '@/components/calculator/wizard';
import { useApp } from '@/lib/store';
import { APEX_INPUTS } from '@/lib/golden-case';

export function CalculatorView() {
  const { go, setCalculation, inputs } = useApp(
    useShallow((s) => ({
      go: s.go,
      setCalculation: s.setCalculation,
      inputs: s.inputs,
    }))
  );

  // Pre-fill only when the user came in via "View Example Report".
  // Detect this by checking whether the current inputs match APEX_INPUTS.
  const initial =
    inputs && inputs.clientName === APEX_INPUTS.clientName ? APEX_INPUTS : undefined;

  return (
    <Wizard
      initialInputs={initial}
      onCancel={() => go('landing')}
      onComplete={(payload: WizardCompletePayload) => {
        setCalculation(payload.inputs, payload.results, payload.recommendation);
      }}
    />
  );
}

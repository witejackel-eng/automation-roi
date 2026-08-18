'use client';

/**
 * Automation ROI Calculator — 3-step wizard (Task 2-b).
 *
 * Flow: Step 1 (Business) → Step 2 (Revenue) → Step 3 (Automation)
 *       → Calculation Summary review screen → POST /api/calculate → onComplete.
 *
 * Single `useForm` instance; per-step validation via `trigger([...stepFields])`.
 * On final submit, the wizard's `wizardResolver` produces a typed
 * `CalculatorInputs` (numbers, ratios) ready for the API.
 *
 * API contract:
 *   POST /api/calculate  body: CalculatorInputs JSON
 *   200 → { inputs, results: {conservative, expected, upside}, recommendation }
 *   422 → { error, issues: { fieldName: string[] } }  (mapped back to form errors)
 *   429 → toast "Too many calculations. Try again in a minute."
 *   network error → toast "Could not reach the calculation service. Check your connection."
 *
 * Voice: sentence case, plain verbs, numbers first. No emoji. Field errors
 * state what's wrong + what to do (the schema's messages already follow this).
 */
import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Beaker, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { APEX_INPUTS } from '@/lib/golden-case';
import { TERM } from '@/lib/brand';
import type { CalculatorInputs, ScenarioResult, Recommendation } from '@/lib/calculations/engine';
import type { ScenarioName } from '@/lib/calculations/scenarios';
import { Stepper, type StepId } from '@/components/calculator/stepper';
import {
  wizardResolver,
  toFormValues,
  EMPTY_FORM_VALUES,
  STEP_FIELDS,
  formValuesToInputs,
  type WizardFormValues,
} from '@/components/calculator/wizard-resolver';
import { BusinessStep } from '@/components/calculator/steps/business-step';
import { RevenueStep } from '@/components/calculator/steps/revenue-step';
import { AutomationStep } from '@/components/calculator/steps/automation-step';
import { SummaryStep } from '@/components/calculator/steps/summary-step';
import { LivePanel } from '@/components/viableo/live-panel';

export interface WizardCompletePayload {
  inputs: CalculatorInputs;
  results: Record<ScenarioName, ScenarioResult>;
  recommendation: {
    recommendation: Recommendation;
    reason: string;
    copy: string;
  };
}

interface WizardProps {
  onComplete: (payload: WizardCompletePayload) => void;
  onCancel: () => void;
  initialInputs?: CalculatorInputs;
}

const STEP_ORDER: StepId[] = ['business', 'revenue', 'automation', 'summary'];
const STEP_TITLES: Record<StepId, { title: string; subtitle: string }> = {
  business: {
    title: 'Business',
    subtitle: 'How much time and labor does the task cost today?',
  },
  revenue: {
    title: 'Revenue',
    subtitle: 'How big is the upside if the automation lifts conversion?',
  },
  automation: {
    title: 'Automation',
    subtitle: 'What will it cost to build and run?',
  },
  summary: {
    title: 'Review your assumptions',
    subtitle: 'Check for a typo before you see the numbers.',
  },
};

function nextStep(s: StepId): StepId | null {
  const i = STEP_ORDER.indexOf(s);
  return i >= 0 && i < STEP_ORDER.length - 1 ? STEP_ORDER[i + 1] : null;
}

function prevStep(s: StepId): StepId | null {
  const i = STEP_ORDER.indexOf(s);
  return i > 0 ? STEP_ORDER[i - 1] : null;
}

/** Jump to the first wizard step that has at least one form error. */
function firstStepWithError(
  issues: Record<string, unknown>,
): StepId | null {
  const order: StepId[] = ['business', 'revenue', 'automation'];
  for (const stepId of order) {
    const fields = STEP_FIELDS[stepId];
    if (fields.some((f) => f in issues)) return stepId;
  }
  return null;
}

export function Wizard({ onComplete, onCancel, initialInputs }: WizardProps) {
  // Initial step: if we were handed pre-filled inputs (the "View Example Report"
  // entry point), jump straight to the summary so the user can review & calculate.
  const [step, setStep] = React.useState<StepId>(
    initialInputs ? 'summary' : 'business',
  );
  const [maxReached, setMaxReached] = React.useState<StepId>(
    initialInputs ? 'summary' : 'business',
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();

  const form = useForm<WizardFormValues, unknown, CalculatorInputs>({
    resolver: wizardResolver,
    defaultValues: initialInputs ? toFormValues(initialInputs) : EMPTY_FORM_VALUES,
    mode: 'onTouched',
  });

  const { trigger, handleSubmit, setError, formState } = form;
  const apiErrors = formState.errors; // for sticky error banner

  // --- beforeunload guard — warn when the user has started filling in the form ---
  React.useEffect(() => {
    if (!formState.isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers require returnValue to be set; the actual string is ignored.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [formState.isDirty]);

  // --- Live preview panel (Section 6.6) ------------------------------------
  // Subscribe to all form values so the live business-case panel updates as the
  // user types. formValuesToInputs returns null while required math fields are
  // blank or non-numeric — LivePanel shows a placeholder in that case.
  const watchedValues = form.watch();
  const liveInputs = React.useMemo<CalculatorInputs | null>(
    () => formValuesToInputs(watchedValues),
    [watchedValues],
  );

  // --- Step navigation -----------------------------------------------------
  const goToStep = React.useCallback(
    (target: StepId) => {
      setStep(target);
      setMaxReached((prev) =>
        STEP_ORDER.indexOf(target) > STEP_ORDER.indexOf(prev) ? target : prev,
      );
      if (typeof window !== 'undefined') {
        // Scroll the form region into view; avoids the sticky mobile bar occluding the field.
        window.requestAnimationFrame(() => {
          document.getElementById('wizard-step-top')?.scrollIntoView({
            block: 'start',
            behavior: reduceMotion ? 'auto' : 'smooth',
          });
        });
      }
    },
    [reduceMotion],
  );

  const goNext = React.useCallback(async () => {
    if (step === 'summary') return; // footer's primary button handles submit here
    const fields = STEP_FIELDS[step] as ReadonlyArray<keyof WizardFormValues>;
    const ok = await trigger(fields as never);
    if (!ok) return;
    const next = nextStep(step);
    if (next) goToStep(next);
  }, [step, trigger, goToStep]);

  const goBack = React.useCallback(() => {
    if (step === 'business') {
      onCancel();
      return;
    }
    const prev = prevStep(step);
    if (prev) goToStep(prev);
  }, [step, onCancel, goToStep]);

  // --- Apex example fill ---------------------------------------------------
  const handleApex = React.useCallback(() => {
    form.reset(toFormValues(APEX_INPUTS));
    setMaxReached('summary');
    setStep('summary');
  }, [form]);

  // --- Submit / API call ---------------------------------------------------
  const onSubmit = handleSubmit(
    async (apiInputs: CalculatorInputs) => {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiInputs),
        });

        if (res.status === 429) {
          toast({
            title: 'Too many calculations.',
            description: 'Try again in a minute.',
            variant: 'destructive',
          });
          return;
        }

        if (res.status === 422) {
          let data: { error?: string; issues?: Record<string, string[]> } = {};
          try {
            data = (await res.json()) as typeof data;
          } catch {
            /* fall through to generic network error */
            toast({
              title: 'Could not reach the calculation service.',
              description: 'Check your connection.',
              variant: 'destructive',
            });
            return;
          }
          const issues = data.issues ?? {};
          // Map server-side issues → form errors.
          const errorMap: Record<string, { type: string; message: string }> = {};
          for (const [field, messages] of Object.entries(issues)) {
            if (Array.isArray(messages) && messages.length > 0) {
              errorMap[field] = { type: 'server', message: messages[0] };
            } else if (typeof messages === 'string') {
              errorMap[field] = { type: 'server', message: messages };
            }
          }
          if (Object.keys(errorMap).length > 0) {
            for (const [field, err] of Object.entries(errorMap)) {
              setError(field as keyof WizardFormValues, err as never);
            }
            const firstBad = firstStepWithError(errorMap);
            if (firstBad) {
              setStep(firstBad);
              setMaxReached((prev) =>
                STEP_ORDER.indexOf(firstBad) > STEP_ORDER.indexOf(prev)
                  ? firstBad
                  : prev,
              );
            }
            toast({
              title: 'Please review the highlighted fields.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Some inputs need a second look.',
              description: data.error ?? 'Please review the form.',
              variant: 'destructive',
            });
          }
          return;
        }

        if (!res.ok) {
          toast({
            title: 'Could not reach the calculation service.',
            description: 'Check your connection.',
            variant: 'destructive',
          });
          return;
        }

        const data = (await res.json()) as {
          inputs: CalculatorInputs;
          results: Record<ScenarioName, ScenarioResult>;
          recommendation: {
            recommendation: Recommendation;
            reason: string;
            copy: string;
          };
        };
        onComplete({
          inputs: data.inputs ?? apiInputs,
          results: data.results,
          recommendation: data.recommendation,
        });
      } catch {
        // Network error / JSON parse error / fetch rejection.
        toast({
          title: 'Could not reach the calculation service.',
          description: 'Check your connection.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    // onInvalid — client-side validation failed: jump to the first bad step.
    (errors) => {
      const firstBad = firstStepWithError(errors as Record<string, unknown>);
      if (firstBad) {
        setStep(firstBad);
        setMaxReached((prev) =>
          STEP_ORDER.indexOf(firstBad) > STEP_ORDER.indexOf(prev)
            ? firstBad
            : prev,
        );
      }
      toast({
        title: 'Please review the highlighted fields.',
        variant: 'destructive',
      });
    },
  );

  // --- Footer button config ----------------------------------------------
  const isSummary = step === 'summary';
  const primaryLabel = isSummary
    ? 'Calculate ROI'
    : step === 'automation'
      ? 'Review summary'
      : 'Continue';
  const showBack = step !== 'business';

  const handlePrimary = () => {
    if (isSummary) {
      void onSubmit();
    } else {
      void goNext();
    }
  };

  const stepMeta = STEP_TITLES[step];

  return (
    <FormProvider {...form}>
      <div className="flex min-h-screen flex-col bg-canvas">
        <WizardHeader onLoadApex={handleApex} onCancel={onCancel} />

        <Stepper
          currentStep={step}
          maxReachedStep={maxReached}
          onStepClick={goToStep}
        />

        {/*
         * Two-column layout on lg+: step content + footer in col 1, sticky
         * LivePanel in col 2. On mobile, LivePanel renders a fixed bottom bar
         * instead (handled inside LivePanel itself); pb-24 here keeps the
         * footer above that bar.
         */}
        <main
          id="wizard-step-top"
          className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:px-6 md:py-8 lg:pb-8"
        >
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
            <div className="min-w-0">
              <div className="mb-5 md:mb-6">
                <h2 className="font-display text-xl md:text-2xl text-ink">
                  {stepMeta.title}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">{stepMeta.subtitle}</p>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                >
                  {step === 'business' && <BusinessStep form={form} />}
                  {step === 'revenue' && <RevenueStep form={form} />}
                  {step === 'automation' && <AutomationStep form={form} />}
                  {step === 'summary' && (
                    <SummaryStep form={form} onEdit={(s) => goToStep(s)} />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Sticky-ish footer for the primary actions. */}
              <WizardFooter
                showBack={showBack}
                onBack={goBack}
                onPrimary={handlePrimary}
                primaryLabel={primaryLabel}
                isSubmitting={isSubmitting}
                hasErrors={Object.keys(apiErrors).length > 0}
              />
            </div>

            <LivePanel inputs={liveInputs} />
          </div>
        </main>
      </div>
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function WizardHeader({
  onLoadApex,
  onCancel,
}: {
  onLoadApex: () => void;
  onCancel: () => void;
}) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5">
        <div className="min-w-0">
          <h1 className="font-display text-2xl text-ink">
            {TERM.analysis}
          </h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Enter your assumptions. The engine does the math.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLoadApex}
            className="gap-1.5 text-ink-muted hover:text-ink"
          >
            <Beaker
              className="size-4"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Load Apex example
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-ink-muted hover:text-ink"
          >
            Cancel
          </Button>
        </div>
      </div>
    </header>
  );
}

function WizardFooter({
  showBack,
  onBack,
  onPrimary,
  primaryLabel,
  isSubmitting,
  hasErrors,
}: {
  showBack: boolean;
  onBack: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  isSubmitting: boolean;
  hasErrors: boolean;
}) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="gap-1.5 text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Back
          </Button>
        )}
        {hasErrors && (
          <p
            className="text-xs text-dont-build"
            role="status"
            aria-live="polite"
          >
            Some fields need attention.
          </p>
        )}
      </div>
      {/* Fixed-width-ish primary button so the loading spinner doesn't shift layout. */}
      <Button
        type="button"
        variant="default"
        onClick={onPrimary}
        disabled={isSubmitting}
        className="min-w-[10rem] gap-1.5 bg-brand text-brand-foreground hover:bg-brand-hover"
      >
        {isSubmitting ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span>Calculating…</span>
          </>
        ) : (
          <>
            <span>{primaryLabel}</span>
            <ArrowRight
              className="size-4"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </>
        )}
      </Button>
    </div>
  );
}

// --- Small useState helper that allows a lazy initial value ---------------
// (Removed — using React.useState directly above.)

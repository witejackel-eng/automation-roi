'use client';

/**
 * Wizard stepper (Section 3.6).
 *
 * 3 steps labelled by NOUN ("Business", "Revenue", "Automation"). Each step has
 * three states: `completed` (brand, click-to-return), `current` (ink), `upcoming`
 * (ink-faint, not clickable).
 *
 * Desktop (≥768px): a horizontal row of [1]·Noun — line — [2]·Noun — line — [3]·Noun.
 * Mobile (<768px): a sticky progress bar at the top reading
 *   "Step X of 3 · {noun}" with a 1px-tall brand fill at (X/3)·100% width.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

export type StepId = 'business' | 'revenue' | 'automation' | 'summary';

interface StepperStep {
  id: StepId;
  noun: string;
  index: number; // 1-based, shown inside the circle
}

const STEPS: StepperStep[] = [
  { id: 'business', noun: 'Business', index: 1 },
  { id: 'revenue', noun: 'Revenue', index: 2 },
  { id: 'automation', noun: 'Automation', index: 3 },
];

type StepState = 'completed' | 'current' | 'upcoming';

function resolveState(stepId: StepId, current: StepId, maxReached: StepId): StepState {
  const order: StepId[] = ['business', 'revenue', 'automation', 'summary'];
  const here = order.indexOf(stepId);
  const cur = order.indexOf(current);
  const max = order.indexOf(maxReached);
  if (here < cur) return 'completed';
  if (here === cur) return 'current';
  if (here <= max) return 'completed'; // reachable because it's been seen before
  return 'upcoming';
}

function circleClasses(state: StepState): string {
  switch (state) {
    case 'completed':
      return 'bg-brand text-brand-foreground border-brand';
    case 'current':
      return 'bg-surface-raised text-ink border-ink';
    case 'upcoming':
      return 'bg-surface-raised text-ink-faint border-border-strong';
  }
}

function labelClasses(state: StepState): string {
  switch (state) {
    case 'completed':
      return 'text-ink';
    case 'current':
      return 'text-ink';
    case 'upcoming':
      return 'text-ink-faint';
  }
}

function connectorClasses(leftState: StepState): string {
  // Line is brand only when the step to its left is completed.
  return cn(
    'h-px flex-1 min-w-[24px] transition-colors duration-panel ease-decelerate',
    leftState === 'completed' ? 'bg-brand' : 'bg-border-strong',
  );
}

interface StepperProps {
  currentStep: StepId;
  /** Highest step index the user has reached — clicks are allowed up to here. */
  maxReachedStep: StepId;
  onStepClick: (id: StepId) => void;
}

export function Stepper({ currentStep, maxReachedStep, onStepClick }: StepperProps) {
  return (
    <>
      {/* Desktop stepper */}
      <nav
        aria-label="Calculator progress"
        className="hidden md:flex items-center gap-2 px-6 py-4 border-b border-border bg-surface"
      >
        <ol className="mx-auto flex w-full max-w-3xl items-center gap-2">
          {STEPS.map((s, i) => {
            const state = resolveState(s.id, currentStep, maxReachedStep);
            const clickable = state !== 'upcoming';
            const isCurrent = state === 'current';
            return (
              <React.Fragment key={s.id}>
                <li className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!clickable}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`${s.noun} step${isCurrent ? ' (current)' : state === 'completed' ? ' (completed)' : ''}`}
                    onClick={() => clickable && onStepClick(s.id)}
                    className={cn(
                      'group flex items-center gap-2 rounded-sm px-1.5 py-1 outline-none transition-colors duration-panel ease-decelerate',
                      clickable ? 'cursor-pointer hover:bg-surface' : 'cursor-not-allowed',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border text-xs font-mono tnum transition-colors duration-panel ease-decelerate',
                        circleClasses(state),
                      )}
                    >
                      {s.index}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-medium font-display transition-colors duration-panel ease-decelerate',
                        labelClasses(state),
                      )}
                    >
                      {s.noun}
                    </span>
                  </button>
                </li>
                {i < STEPS.length - 1 && (
                  <li
                    aria-hidden="true"
                    className={connectorClasses(state)}
                  />
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>

      {/* Mobile sticky bar */}
      <div className="md:hidden sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 px-4 py-3">
        <MobileProgress currentStep={currentStep} />
      </div>
    </>
  );
}

function MobileProgress({ currentStep }: { currentStep: StepId }) {
  const idx = STEPS.findIndex((s) => s.id === currentStep);
  const activeStep = idx >= 0 ? STEPS[idx] : null;
  const summaryActive = currentStep === 'summary';
  const shownIndex = summaryActive ? STEPS.length : idx + 1;
  const shownNoun = summaryActive ? 'Review' : activeStep?.noun ?? '';
  const pctWidth = summaryActive ? 100 : Math.round(((idx + 1) / STEPS.length) * 100);

  return (
    <div>
      <div
        className="flex items-center justify-between text-xs text-ink-muted"
        aria-live="polite"
      >
        <span>
          Step <span className="font-mono tnum text-ink">{shownIndex}</span> of{' '}
          <span className="font-mono tnum text-ink">{STEPS.length}</span> · {shownNoun}
        </span>
        <span className="font-mono tnum text-ink-muted">{pctWidth}%</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-1 rounded-full bg-brand transition-[width] duration-panel ease-decelerate"
          style={{ width: `${pctWidth}%` }}
        />
      </div>
    </div>
  );
}

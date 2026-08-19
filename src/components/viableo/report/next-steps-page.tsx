/**
 * NextStepsPage — verdict-specific next-steps checklist.
 *
 * Different actionable checklists depending on the verdict:
 *   BUILD:       scope confirmation, pilot program, success metrics, risk mitigation
 *   CONSIDER:    assumptions to validate, data collection plan, re-evaluation triggers
 *   DON'T BUILD: required changes, alternatives, when to revisit
 */
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DECISION_COLORS, type DecisionKey } from '@/lib/brand';

type Verdict = 'build' | 'consider' | 'dont_build';

interface NextStepsPageProps {
  verdict: Verdict;
  className?: string;
}

// ── Per-verdict step lists ──────────────────────────────────

const BUILD_STEPS = [
  {
    heading: 'Confirm scope and timeline',
    body: 'Lock down the process boundaries, automation coverage, and target go-live date. Get written sign-off on the assumptions that drove the verdict.',
  },
  {
    heading: 'Define a pilot program',
    body: 'Start with a single workflow or team before scaling. Set a clear pilot window and criteria for expanding to full rollout.',
  },
  {
    heading: 'Set success metrics',
    body: 'Agree on the KPIs you will track — labor hours saved, error rate reduction, conversion lift — and the measurement cadence.',
  },
  {
    heading: 'Build a risk mitigation plan',
    body: 'Identify the two or three assumptions with the thinnest headroom. Decide what you will do if they prove wrong.',
  },
] as const;

const CONSIDER_STEPS = [
  {
    heading: 'Validate the weakest assumptions',
    body: 'The confidence score is below the BUILD threshold. Identify which inputs carry the lowest weight and collect real data to replace estimates.',
  },
  {
    heading: 'Build a data collection plan',
    body: 'Write down exactly what you need to measure, how you will measure it, and by when. Re-run the analysis once you have actuals.',
  },
  {
    heading: 'Narrow the first phase',
    body: 'Reduce scope to the subset of the process where the economics are strongest. A smaller, proven win builds organizational trust for the next round.',
  },
  {
    heading: 'Set re-evaluation triggers',
    body: 'Define the events that should trigger a fresh analysis: a pricing change, a volume shift, a new platform cost, or a confidence score crossing 60.',
  },
] as const;

const DONT_BUILD_STEPS = [
  {
    heading: 'Identify required changes',
    body: 'Review the breaking points. Which assumptions would need to change, and by how much, for this to become a BUILD? Write them down.',
  },
  {
    heading: 'Explore alternatives',
    body: 'Is there a smaller or different automation within the same process that does clear the bar? A manual workflow redesign instead of a build?',
  },
  {
    heading: 'Document the decision',
    body: 'Share the analysis with the stakeholder. A documented "don’t build" protects the team from future pressure to revisit without new data.',
  },
  {
    heading: 'Set when to revisit',
    body: 'Agree on the conditions under which this analysis should be re-run: a volume increase, a cost decrease, or a change in conversion rates.',
  },
] as const;

const STEPS_BY_VERDICT: Record<Verdict, readonly { heading: string; body: string }[]> = {
  build: BUILD_STEPS,
  consider: CONSIDER_STEPS,
  dont_build: DONT_BUILD_STEPS,
};

export function NextStepsPage({ verdict, className }: NextStepsPageProps) {
  const key = verdict as DecisionKey;
  const colors = DECISION_COLORS[key] ?? DECISION_COLORS.consider;
  const steps = STEPS_BY_VERDICT[verdict];

  return (
    <section className={cn('space-y-6', className)}>
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Recommended next steps</h2>
        <p className="text-sm text-muted-foreground">
          {verdict === 'build'
            ? 'The numbers support it. These steps protect the investment.'
            : verdict === 'consider'
              ? 'The case has potential. Close the gaps before committing.'
              : 'Not now. These steps keep the door open for later.'}
        </p>
      </div>

      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={step.heading} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
              >
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <div className="mt-1 h-full w-px bg-border" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold">{step.heading}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

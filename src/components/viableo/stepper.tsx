'use client';

/**
 * Stepper — idea → evidence → decision (Section 9.5, 10.3).
 *
 * Horizontal on desktop, vertical on mobile. Each stage: icon/number + label,
 * connected by a thin coral line that "draws" between stages on scroll-into-view
 * or interaction. Used for both the product demonstration (Section 7.4) and the
 * agency workflow (Section 7.8) at two different visual weights.
 *
 * Decision-reveal sequence (Section 10.3):
 *   Stage 1 Idea — static, visible.
 *   Stage 2 Analyze — connecting line draws, 600–800ms.
 *   Stage 3 Decision — dot "drops" into place.
 *   Stage 4 Business Case — thumbnail fades/slides in last.
 *   Total ~2–2.5s. Never loop automatically on the homepage; run once on view.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Lightbulb, Calculator, Check, FileText, type LucideIcon } from 'lucide-react';
import { Dot } from './dot';

interface StepperProps {
  /** "primary" for product demonstration (7.4), "secondary" for agency workflow (7.8). */
  weight?: 'primary' | 'secondary';
  className?: string;
}

interface StepDef {
  icon: LucideIcon;
  label: string;
}

const PRIMARY_STEPS: StepDef[] = [
  { icon: Lightbulb, label: 'Automation idea' },
  { icon: Calculator, label: 'Financial analysis' },
  { icon: Check, label: 'Viableo Decision' },
  { icon: FileText, label: 'Client business case' },
];

const SECONDARY_STEPS: StepDef[] = [
  { icon: Lightbulb, label: 'Discover' },
  { icon: Calculator, label: 'Prove' },
  { icon: Check, label: 'Propose' },
  { icon: FileText, label: 'Close' },
];

export function Stepper({ weight = 'primary', className }: StepperProps) {
  const steps = weight === 'primary' ? PRIMARY_STEPS : SECONDARY_STEPS;
  const isPrimary = weight === 'primary';

  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-3 md:flex-row md:items-center md:gap-0',
        className
      )}
    >
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isLast = i === steps.length - 1;
        const isDecisionStep = isPrimary && i === 2;
        return (
          <React.Fragment key={i}>
            <div
              className={cn(
                'reveal-on-enter flex flex-col items-center gap-2 text-center md:flex-shrink-0',
                visible && 'reveal-on-enter'
              )}
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border-2',
                  isPrimary ? 'h-12 w-12' : 'h-10 w-10',
                  isDecisionStep
                    ? 'border-build bg-build-bg text-build'
                    : 'border-border bg-surface text-ink'
                )}
              >
                {isDecisionStep ? (
                  <Dot size="md" className={visible ? 'dot-drop' : ''} />
                ) : (
                  <Icon className={isPrimary ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={1.75} />
                )}
              </div>
              <span
                className={cn(
                  'font-medium text-ink',
                  isPrimary ? 'text-[13px]' : 'text-[12px]'
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'relative mx-2 mb-1 h-px flex-1 md:mb-0',
                  'min-w-[24px]'
                )}
                aria-hidden="true"
              >
                <div
                  className={cn(
                    'absolute inset-0 origin-left bg-border',
                    visible && 'stepper-line-draw bg-brand'
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

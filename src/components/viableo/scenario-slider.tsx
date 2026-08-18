'use client';

/**
 * Scenario slider — three-position segmented control (Section 9.4, 10.2).
 *
 * Conservative / Expected / Upside — the three labeled anchors must always
 * be visible, not hidden behind a bare numeric slider. On change, dependent
 * figures cross-fade/count to new values over 400–600ms. If the Decision
 * badge's state changes, it performs a quick flip/cross-fade.
 *
 * SIGNATURE INTERACTION (Section 7.5): The active pill uses motion/react
 * layoutId for a smooth sliding animation when switching scenarios — this
 * is the "Viableo scenario switch" signature interaction.
 */
import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { SCENARIO_ORDER, SCENARIO_LABELS, type ScenarioName } from '@/lib/calculations/scenarios';
import { Dot } from './dot';

interface ScenarioSliderProps {
  value: ScenarioName;
  onChange: (s: ScenarioName) => void;
  className?: string;
  size?: 'sm' | 'md';
}

const SIZE = {
  sm: 'h-8 text-[11px]',
  md: 'h-10 text-[13px]',
} as const;

export function ScenarioSlider({ value, onChange, className, size = 'md' }: ScenarioSliderProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Viableo Scenarios"
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-surface p-1',
        SIZE[size],
        className
      )}
    >
      {SCENARIO_ORDER.map((name, i) => {
        const active = name === value;
        return (
          <React.Fragment key={name}>
            {i > 0 && <Dot size="xs" className="mx-1 opacity-30" />}
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(name)}
              className={cn(
                'relative rounded-full px-3 font-medium transition-colors duration-200 ease-out-expo',
                active ? 'text-white' : 'text-ink-muted hover:text-ink'
              )}
            >
              {/* Animated sliding pill — motion layoutId causes it to slide
                  smoothly between positions instead of remounting. */}
              {active && (
                <motion.span
                  layoutId="scenario-pill"
                  className="absolute inset-0 rounded-full bg-brand"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
              {SCENARIO_LABELS[name]}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

'use client';

/**
 * Wizard Step 2 — Revenue (noun label "Revenue").
 *
 * Fields (exact labels/helpers per the task spec):
 *  - Leads per month — integer, 0–1,000,000.
 *  - Current conversion rate — percent, 0–100% — OPTIONAL, descriptive.
 *  - Average customer value — currency, $1–$10,000,000.
 *    Helper: "Revenue or profit per won customer."
 *  - Gross margin % — percent, 0–100% — OPTIONAL.
 *    Helper: "If omitted, revenue figures are labeled 'revenue opportunity,' never 'profit.'"
 *    Inline note (only when empty): "Without a margin, the engine reports revenue opportunity, not profit."
 */
import * as React from 'react';
import { FieldShell, MoneyInput, IntegerInput, PercentInput } from '@/components/calculator/field';
import type { WizardFormInstance } from '@/components/calculator/wizard-resolver';

interface StepProps {
  form: WizardFormInstance;
}

export function RevenueStep({ form }: StepProps) {
  const errors = form.formState.errors;
  // Watch grossMarginPct so the inline note only appears when it's empty.
  const grossMarginPct = form.watch('grossMarginPct');
  const grossMarginEmpty = !grossMarginPct || grossMarginPct.trim() === '';

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FieldShell
        id="leadsPerMonth"
        label="Leads per month"
        required
        error={errors.leadsPerMonth?.message as string | undefined}
      >
        <IntegerInput
          id="leadsPerMonth"
          placeholder="e.g. 500"
          registration={form.register('leadsPerMonth')}
        />
      </FieldShell>

      <FieldShell
        id="currentConversionRate"
        label="Current conversion rate"
        helper="Today's conversion rate. Context only."
        error={errors.currentConversionRate?.message as string | undefined}
      >
        <PercentInput
          id="currentConversionRate"
          placeholder="Optional"
          registration={form.register('currentConversionRate')}
        />
      </FieldShell>

      <FieldShell
        id="averageCustomerValue"
        label="Average customer value"
        required
        helper="Revenue or profit per won customer."
        error={errors.averageCustomerValue?.message as string | undefined}
      >
        <MoneyInput
          id="averageCustomerValue"
          placeholder="e.g. 2000"
          registration={form.register('averageCustomerValue')}
        />
      </FieldShell>

      <FieldShell
        id="grossMarginPct"
        label="Gross margin %"
        helper="If omitted, revenue figures are labeled 'revenue opportunity,' never 'profit.'"
        note={grossMarginEmpty ? 'Without a margin, the engine reports revenue opportunity, not profit.' : undefined}
        error={errors.grossMarginPct?.message as string | undefined}
      >
        <PercentInput
          id="grossMarginPct"
          placeholder="Optional"
          registration={form.register('grossMarginPct')}
        />
      </FieldShell>
    </div>
  );
}

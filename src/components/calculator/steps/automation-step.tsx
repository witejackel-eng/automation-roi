'use client';

/**
 * Wizard Step 3 — Automation (noun label "Automation").
 *
 * Fields (exact labels/helpers per the task spec):
 *  - Expected automation % — percent, 1–100%. Helper: share of the task the automation will handle.
 *  - Expected error reduction % — percent, 0–100% — OPTIONAL, descriptive.
 *  - Expected conversion improvement (percentage points) — pp, 0–50pp. Helper: "1.5 = +1.5pp".
 *  - Implementation fee — currency, $0–$1,000,000. Helper: one-time build cost.
 *  - Monthly AI/API cost — currency ($ + "/mo"), $0–$100,000.
 *  - Monthly software/tool cost — currency ($ + "/mo"), $0–$100,000.
 *  - Other annual cost — currency, $0–$1,000,000. Helper: maintenance, training, etc.
 */
import * as React from 'react';
import {
  FieldShell,
  MoneyInput,
  PercentInput,
  PpInput,
} from '@/components/calculator/field';
import type { WizardFormInstance } from '@/components/calculator/wizard-resolver';

interface StepProps {
  form: WizardFormInstance;
}

export function AutomationStep({ form }: StepProps) {
  const errors = form.formState.errors;

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FieldShell
        id="expectedAutomationPct"
        label="Expected automation %"
        required
        helper="Share of the task the automation is expected to handle."
        error={errors.expectedAutomationPct?.message as string | undefined}
      >
        <PercentInput
          id="expectedAutomationPct"
          placeholder="e.g. 20"
          registration={form.register('expectedAutomationPct')}
        />
      </FieldShell>

      <FieldShell
        id="expectedErrorReductionPct"
        label="Expected error reduction %"
        helper="How much the error rate is expected to drop. Context only."
        error={errors.expectedErrorReductionPct?.message as string | undefined}
      >
        <PercentInput
          id="expectedErrorReductionPct"
          placeholder="Optional"
          registration={form.register('expectedErrorReductionPct')}
        />
      </FieldShell>

      <FieldShell
        id="expectedConversionImprovementPct"
        label="Expected conversion improvement (percentage points)"
        required
        helper="Lift in conversion rate, in percentage points (e.g. 1.5 = +1.5pp)."
        error={errors.expectedConversionImprovementPct?.message as string | undefined}
      >
        <PpInput
          id="expectedConversionImprovementPct"
          placeholder="e.g. 1.5"
          registration={form.register('expectedConversionImprovementPct')}
        />
      </FieldShell>

      <FieldShell
        id="implementationFee"
        label="Implementation fee"
        required
        helper="One-time build cost."
        error={errors.implementationFee?.message as string | undefined}
      >
        <MoneyInput
          id="implementationFee"
          placeholder="e.g. 18000"
          registration={form.register('implementationFee')}
        />
      </FieldShell>

      <FieldShell
        id="monthlyAiApiCost"
        label="Monthly AI/API cost"
        required
        error={errors.monthlyAiApiCost?.message as string | undefined}
      >
        <MoneyInput
          id="monthlyAiApiCost"
          placeholder="e.g. 450"
          suffix="/mo"
          registration={form.register('monthlyAiApiCost')}
        />
      </FieldShell>

      <FieldShell
        id="monthlySoftwareCost"
        label="Monthly software/tool cost"
        required
        error={errors.monthlySoftwareCost?.message as string | undefined}
      >
        <MoneyInput
          id="monthlySoftwareCost"
          placeholder="e.g. 200"
          suffix="/mo"
          registration={form.register('monthlySoftwareCost')}
        />
      </FieldShell>

      <FieldShell
        id="platformApiCost"
        label="Ongoing platform/API cost"
        required
        helper="Zapier, Make, n8n task costs."
        error={errors.platformApiCost?.message as string | undefined}
      >
        <MoneyInput
          id="platformApiCost"
          placeholder="e.g. 75"
          suffix="/mo"
          registration={form.register('platformApiCost')}
        />
      </FieldShell>

      <FieldShell
        id="otherAnnualCost"
        label="Other annual cost"
        required
        helper="Any other yearly cost (maintenance, training, etc.)."
        error={errors.otherAnnualCost?.message as string | undefined}
      >
        <MoneyInput
          id="otherAnnualCost"
          placeholder="e.g. 800"
          registration={form.register('otherAnnualCost')}
        />
      </FieldShell>
    </div>
  );
}

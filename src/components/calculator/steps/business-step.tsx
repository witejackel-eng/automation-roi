'use client';

/**
 * Wizard Step 1 — Business (noun label "Business").
 *
 * Fields (exact labels/helpers per the task spec):
 *  - Client / company name — text, required (1–120 chars).
 *  - Employees affected — integer, 1–500. Helper: time-on-task people count.
 *  - Hours per employee per week (on the task being automated) — decimal, 0.5–80.
 *  - Hourly labor cost — currency, $1–$500.
 *  - Monthly workload (tasks) — integer, 0–1,000,000 — OPTIONAL, descriptive.
 *  - Current error rate — percent, 0–100% — OPTIONAL, descriptive.
 */
import * as React from 'react';
import {
  FieldShell,
  MoneyInput,
  IntegerInput,
  DecimalInput,
  PercentInput,
  TextInput,
} from '@/components/calculator/field';
import type { WizardFormInstance } from '@/components/calculator/wizard-resolver';

interface StepProps {
  form: WizardFormInstance;
}

export function BusinessStep({ form }: StepProps) {
  const errors = form.formState.errors;

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FieldShell
        id="clientName"
        label="Client / company name"
        required
        error={errors.clientName?.message as string | undefined}
        className="md:col-span-2"
      >
        <TextInput
          id="clientName"
          placeholder="e.g. Apex Home Services"
          autoComplete="organization"
          registration={form.register('clientName')}
        />
      </FieldShell>

      <FieldShell
        id="employeesAffected"
        label="Employees affected"
        required
        helper="Number of people whose time on this task would be reduced or eliminated."
        error={errors.employeesAffected?.message as string | undefined}
      >
        <IntegerInput
          id="employeesAffected"
          placeholder="e.g. 12"
          registration={form.register('employeesAffected')}
        />
      </FieldShell>

      <FieldShell
        id="hoursPerWeek"
        label="Hours per employee per week (on the task being automated)"
        required
        helper="Time spent on the task being automated, not total working hours."
        error={errors.hoursPerWeek?.message as string | undefined}
      >
        <DecimalInput
          id="hoursPerWeek"
          placeholder="e.g. 25"
          registration={form.register('hoursPerWeek')}
        />
      </FieldShell>

      <FieldShell
        id="hourlyCost"
        label="Hourly labor cost"
        required
        error={errors.hourlyCost?.message as string | undefined}
      >
        <MoneyInput
          id="hourlyCost"
          placeholder="e.g. 28"
          registration={form.register('hourlyCost')}
        />
      </FieldShell>

      <FieldShell
        id="monthlyWorkload"
        label="Monthly workload (tasks)"
        helper="How many times this task runs per month. Used for context, not the math."
        error={errors.monthlyWorkload?.message as string | undefined}
      >
        <IntegerInput
          id="monthlyWorkload"
          placeholder="Optional"
          registration={form.register('monthlyWorkload')}
        />
      </FieldShell>

      <FieldShell
        id="currentErrorRate"
        label="Current error rate"
        helper="Today's error rate on this task. Context only."
        error={errors.currentErrorRate?.message as string | undefined}
      >
        <PercentInput
          id="currentErrorRate"
          placeholder="Optional"
          registration={form.register('currentErrorRate')}
        />
      </FieldShell>
    </div>
  );
}

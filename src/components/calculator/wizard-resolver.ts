'use client';

/**
 * Wizard resolver — wraps `zodResolver(calculatorInputsSchema)` so the form can
 * present percent fields in PERCENT-FORM (e.g. "4" for 4%) while the schema
 * itself validates ratios (0–1).
 *
 * Strategy:
 *  1. The form stores values as STRINGS (per the task's "forwards value as a string to react-hook-form").
 *  2. Before validation, percent/pp fields are divided by 100 → ratio form.
 *  3. The transformed object is validated with the original `calculatorInputsSchema`
 *     via `zodResolver` — so the API contract is honored unchanged.
 *  4. Any error messages that reference ratio-form min/max are rewritten to
 *     percent-form ("must not exceed 1" → "must not exceed 100%") so the user
 *     sees the value they actually entered.
 *
 * The output of a successful validation is a fully-typed `CalculatorInputs`
 * (numbers, ratios), ready to POST to /api/calculate.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver, UseFormReturn } from 'react-hook-form';
import { calculatorInputsSchema } from '@/lib/validation/schema';
import type { CalculatorInputs } from '@/lib/calculations/engine';

/** The form instance type the wizard and steps share. */
export type WizardFormInstance = UseFormReturn<WizardFormValues, any, any>;

/** Form values: all strings, percent fields in percent-form. */
export type WizardFormValues = {
  clientName: string;
  employeesAffected: string;
  hoursPerWeek: string;
  hourlyCost: string;
  monthlyWorkload: string;
  currentErrorRate: string;
  leadsPerMonth: string;
  currentConversionRate: string;
  averageCustomerValue: string;
  grossMarginPct: string;
  expectedAutomationPct: string;
  expectedErrorReductionPct: string;
  expectedConversionImprovementPct: string;
  implementationFee: string;
  monthlyAiApiCost: string;
  monthlySoftwareCost: string;
  otherAnnualCost: string;
};

/** Empty string defaults for every field — the schema normalises "" → undefined for optional fields. */
export const EMPTY_FORM_VALUES: WizardFormValues = {
  clientName: '',
  employeesAffected: '',
  hoursPerWeek: '',
  hourlyCost: '',
  monthlyWorkload: '',
  currentErrorRate: '',
  leadsPerMonth: '',
  currentConversionRate: '',
  averageCustomerValue: '',
  grossMarginPct: '',
  expectedAutomationPct: '',
  expectedErrorReductionPct: '',
  expectedConversionImprovementPct: '',
  implementationFee: '',
  monthlyAiApiCost: '',
  monthlySoftwareCost: '',
  otherAnnualCost: '',
};

/** Fields presented to the user in PERCENT-FORM; stored in the schema as 0–1 ratios. */
const PERCENT_FIELDS: ReadonlyArray<keyof WizardFormValues> = [
  'currentErrorRate',
  'currentConversionRate',
  'grossMarginPct',
  'expectedAutomationPct',
  'expectedErrorReductionPct',
];

/** Fields presented in PERCENTAGE-POINTS form; stored in the schema as 0–0.5 decimals. */
const PP_FIELDS: ReadonlyArray<keyof WizardFormValues> = [
  'expectedConversionImprovementPct',
];

const ALL_RATIO_FIELDS: ReadonlyArray<keyof WizardFormValues> = [
  ...PERCENT_FIELDS,
  ...PP_FIELDS,
];

/** Empty / null / undefined → undefined; numeric string → number / 100; non-numeric → passed through. */
function percentToRatio(v: unknown): unknown {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = typeof v === 'string' ? Number(v) : (v as number);
  if (typeof n !== 'number' || Number.isNaN(n)) return v;
  return n / 100;
}

/** Rewrite a single zod error message from ratio-form min/max → percent-form. */
function rewriteMessage(field: string, message: string): string {
  if (!ALL_RATIO_FIELDS.includes(field as keyof WizardFormValues)) return message;
  const isPp = PP_FIELDS.includes(field as keyof WizardFormValues);
  const unit = isPp ? 'pp' : '%';
  // "X must be at least 0.01." → "X must be at least 1%."
  // "X must not exceed 1." → "X must not exceed 100%."
  // Trailing period is preserved if present.
  return message
    .replace(
      /must be at least ([\d.]+)\.?/,
      (_, n: string) => `must be at least ${(+n * 100).toString()}${unit}.`,
    )
    .replace(
      /must not exceed ([\d.]+)\.?/,
      (_, n: string) => `must not exceed ${(+n * 100).toString()}${unit}.`,
    );
}

/** Walk a (possibly nested) errors object and rewrite any message on ratio fields. */
function rewriteErrors(errors: unknown, path: string[] = []): unknown {
  if (errors == null) return errors;
  if (Array.isArray(errors)) {
    return errors.map((e) => rewriteErrors(e, path));
  }
  if (typeof errors === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(errors as Record<string, unknown>)) {
      const nextPath = k === 'message' || k === 'type' || k === 'ref' ? path : [...path, k];
      if (k === 'message' && typeof v === 'string' && path.length > 0) {
        out[k] = rewriteMessage(path[path.length - 1], v);
      } else {
        out[k] = rewriteErrors(v, nextPath);
      }
    }
    return out;
  }
  return errors;
}

const innerResolver = zodResolver(calculatorInputsSchema);

export const wizardResolver: Resolver<WizardFormValues, unknown, CalculatorInputs> =
  async (values, context, options) => {
    // 1) Build the ratio-form object for the inner schema.
    const transformed: Record<string, unknown> = { ...values };
    for (const f of ALL_RATIO_FIELDS) {
      transformed[f] = percentToRatio((values as Record<string, unknown>)[f]);
    }

    // 2) Run the original schema-backed resolver.
    const result = await innerResolver(
      transformed as never,
      context as never,
      options as never,
    );

    // 3) Rewrite ratio-form min/max in messages back to percent-form for display.
    if (result.errors && Object.keys(result.errors).length > 0) {
      const rewritten = rewriteErrors(result.errors);
      return { values: {}, errors: rewritten } as never;
    }
    return result as never;
  };

/**
 * Convert a typed `CalculatorInputs` (ratios) into the percent-form string map
 * the form expects — used to pre-fill from APEX_INPUTS or `initialInputs`.
 */
export function toFormValues(inputs: CalculatorInputs): WizardFormValues {
  const num = (v: number | undefined | null): string =>
    v == null || !Number.isFinite(v) ? '' : String(v);
  const pct = (v: number | undefined | null): string =>
    v == null || !Number.isFinite(v) ? '' : String(v * 100);
  return {
    clientName: inputs.clientName,
    employeesAffected: num(inputs.employeesAffected),
    hoursPerWeek: num(inputs.hoursPerWeek),
    hourlyCost: num(inputs.hourlyCost),
    monthlyWorkload: num(inputs.monthlyWorkload),
    currentErrorRate: pct(inputs.currentErrorRate),
    leadsPerMonth: num(inputs.leadsPerMonth),
    currentConversionRate: pct(inputs.currentConversionRate),
    averageCustomerValue: num(inputs.averageCustomerValue),
    grossMarginPct: pct(inputs.grossMarginPct),
    expectedAutomationPct: pct(inputs.expectedAutomationPct),
    expectedErrorReductionPct: pct(inputs.expectedErrorReductionPct),
    expectedConversionImprovementPct: pct(inputs.expectedConversionImprovementPct),
    implementationFee: num(inputs.implementationFee),
    monthlyAiApiCost: num(inputs.monthlyAiApiCost),
    monthlySoftwareCost: num(inputs.monthlySoftwareCost),
    otherAnnualCost: num(inputs.otherAnnualCost),
  };
}

/** The list of form fields that belong to each wizard step (used by `trigger([...])`). */
export const STEP_FIELDS: Record<'business' | 'revenue' | 'automation', Array<keyof WizardFormValues>> = {
  business: [
    'clientName',
    'employeesAffected',
    'hoursPerWeek',
    'hourlyCost',
    'monthlyWorkload',
    'currentErrorRate',
  ],
  revenue: [
    'leadsPerMonth',
    'currentConversionRate',
    'averageCustomerValue',
    'grossMarginPct',
  ],
  automation: [
    'expectedAutomationPct',
    'expectedErrorReductionPct',
    'expectedConversionImprovementPct',
    'implementationFee',
    'monthlyAiApiCost',
    'monthlySoftwareCost',
    'otherAnnualCost',
  ],
};

// ── Live-preview conversion: percent-form strings → typed CalculatorInputs ──

/**
 * Parse a numeric-form string into a finite number, or `null` when blank /
 * non-numeric. Used by `formValuesToInputs` for live preview — permissive
 * (no zod validation, no error messages). Anything that fails to parse just
 * returns `null`.
 */
function parseNum(s: string | undefined | null): number | null {
  if (s == null || s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Convert a percent-form / pp-form string back into its ratio-form value
 * (divide by 100), or `null` when blank / non-numeric. Mirrors what the
 * `wizardResolver` does for the inner schema before validation.
 */
function parseRatio(s: string | undefined | null): number | null {
  const n = parseNum(s);
  return n == null ? null : n / 100;
}

/**
 * Build a typed `CalculatorInputs` from the wizard's percent-form string
 * values, for the LIVE PREVIEW panel (Section 6.6).
 *
 * Returns `null` when any required math field is blank or non-numeric — the
 * caller should then show a "Enter your assumptions to see the live business
 * case" placeholder instead of computing with half-empty data.
 *
 * Optional descriptive fields (monthlyWorkload, currentErrorRate,
 * currentConversionRate, expectedErrorReductionPct, grossMarginPct) are passed
 * through as `undefined` when blank. `grossMarginPct` blank → the engine treats
 * the case as a "revenue opportunity only" case (additionalGrossProfit = 0).
 */
export function formValuesToInputs(
  v: WizardFormValues,
): CalculatorInputs | null {
  // Required numeric fields. Bail out on the first blank / non-numeric.
  const employeesAffected = parseNum(v.employeesAffected);
  if (employeesAffected == null) return null;
  const hoursPerWeek = parseNum(v.hoursPerWeek);
  if (hoursPerWeek == null) return null;
  const hourlyCost = parseNum(v.hourlyCost);
  if (hourlyCost == null) return null;
  const leadsPerMonth = parseNum(v.leadsPerMonth);
  if (leadsPerMonth == null) return null;
  const averageCustomerValue = parseNum(v.averageCustomerValue);
  if (averageCustomerValue == null) return null;
  const implementationFee = parseNum(v.implementationFee);
  if (implementationFee == null) return null;
  const monthlyAiApiCost = parseNum(v.monthlyAiApiCost);
  if (monthlyAiApiCost == null) return null;
  const monthlySoftwareCost = parseNum(v.monthlySoftwareCost);
  if (monthlySoftwareCost == null) return null;
  const otherAnnualCost = parseNum(v.otherAnnualCost);
  if (otherAnnualCost == null) return null;

  // Required ratio fields (entered in percent-form).
  const expectedAutomationPct = parseRatio(v.expectedAutomationPct);
  if (expectedAutomationPct == null) return null;
  const expectedConversionImprovementPct = parseRatio(
    v.expectedConversionImprovementPct,
  );
  if (expectedConversionImprovementPct == null) return null;

  // Optional fields (undefined when blank — engine handles it).
  const monthlyWorkload = parseNum(v.monthlyWorkload) ?? undefined;
  const currentErrorRate = parseRatio(v.currentErrorRate) ?? undefined;
  const currentConversionRate =
    parseRatio(v.currentConversionRate) ?? undefined;
  const expectedErrorReductionPct =
    parseRatio(v.expectedErrorReductionPct) ?? undefined;
  const grossMarginPct = parseRatio(v.grossMarginPct) ?? undefined;

  return {
    clientName: v.clientName ?? '',
    employeesAffected,
    hoursPerWeek,
    hourlyCost,
    monthlyWorkload,
    currentErrorRate,
    leadsPerMonth,
    currentConversionRate,
    averageCustomerValue,
    grossMarginPct,
    expectedAutomationPct,
    expectedErrorReductionPct,
    expectedConversionImprovementPct,
    implementationFee,
    monthlyAiApiCost,
    monthlySoftwareCost,
    otherAnnualCost,
  };
}

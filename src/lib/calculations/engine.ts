/**
 * Calculation engine — pure functions (Section 11).
 *
 * Every dollar in a report traces to one of the formulas below. The
 * descriptive-only inputs (monthlyWorkload, currentErrorRate,
 * currentConversionRate, expectedErrorReductionPct) never feed the dollar math.
 */
import {
  resolveScenarioAssumptions,
  type ScenarioName,
} from './scenarios';

// ── Input validation helpers ──────────────────────────────────────────

/** All numeric fields that must be finite and non-negative. */
const REQUIRED_NUMERIC_FIELDS: Array<keyof CalculatorInputs> = [
  'employeesAffected',
  'hoursPerWeek',
  'hourlyCost',
  'leadsPerMonth',
  'averageCustomerValue',
  'expectedAutomationPct',
  'expectedConversionImprovementPct',
  'implementationFee',
  'monthlyAiApiCost',
  'monthlySoftwareCost',
  'otherAnnualCost',
];

/** Fields that must be in [0, 1] when provided. */
const PERCENT_FIELDS: Array<keyof CalculatorInputs> = [
  'expectedAutomationPct',
  'expectedConversionImprovementPct',
];

/**
 * Validate all numeric inputs before calculation.
 * Throws a descriptive error if any input is invalid.
 * Does NOT change formulas — purely defensive.
 */
function validateInputs(inputs: CalculatorInputs): void {
  for (const field of REQUIRED_NUMERIC_FIELDS) {
    const value = inputs[field];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(
        `Invalid input: "${field}" must be a finite number, got ${value}.`
      );
    }
    if (value < 0) {
      throw new Error(
        `Invalid input: "${field}" must be non-negative, got ${value}.`
      );
    }
  }

  // grossMarginPct is optional, but if provided must be valid
  if (inputs.grossMarginPct != null) {
    if (typeof inputs.grossMarginPct !== 'number' || !Number.isFinite(inputs.grossMarginPct)) {
      throw new Error(
        `Invalid input: "grossMarginPct" must be a finite number when provided, got ${inputs.grossMarginPct}.`
      );
    }
    if (inputs.grossMarginPct < 0 || inputs.grossMarginPct > 1) {
      throw new Error(
        `Invalid input: "grossMarginPct" must be in [0, 1], got ${inputs.grossMarginPct}.`
      );
    }
  }

  // Percentage fields must be in [0, 1]
  for (const field of PERCENT_FIELDS) {
    const value = inputs[field] as number;
    if (value > 1) {
      throw new Error(
        `Invalid input: "${field}" must be in [0, 1] (a decimal percentage), got ${value}.`
      );
    }
  }

  // Guard against zero employees × zero hours producing trivially zero results
  // that would cause misleading ROI/payback outputs.
  if (inputs.employeesAffected === 0 && inputs.hoursPerWeek === 0 && inputs.leadsPerMonth === 0) {
    throw new Error(
      'Invalid input: at least one of employeesAffected, hoursPerWeek, or leadsPerMonth must be positive to produce a meaningful result.'
    );
  }
}

export interface CalculatorInputs {
  clientName: string;
  employeesAffected: number;
  hoursPerWeek: number;
  hourlyCost: number; // USD
  monthlyWorkload?: number; // descriptive only
  currentErrorRate?: number; // 0–1, descriptive only
  leadsPerMonth: number;
  currentConversionRate?: number; // 0–1, descriptive only
  averageCustomerValue: number; // USD
  grossMarginPct?: number; // 0–1; omit -> label as "revenue opportunity"
  expectedAutomationPct: number; // 0–1
  expectedErrorReductionPct?: number; // 0–1, descriptive only
  expectedConversionImprovementPct: number; // 0–1 (percentage points as decimal, e.g. 0.015 = 1.5pp)
  implementationFee: number; // USD
  monthlyAiApiCost: number; // USD
  monthlySoftwareCost: number; // USD
  otherAnnualCost: number; // USD
}

export interface ScenarioResult {
  scenario: ScenarioName;
  automationPct: number; // effective automation % used (post-multiplier)
  conversionImprovementPct: number; // effective pp used (post-multiplier)
  annualLaborCost: number;
  annualLaborSavings: number;
  annualRecurringCost: number;
  totalFirstYearCost: number;
  additionalCustomers: number;
  additionalAnnualRevenue: number;
  additionalGrossProfit: number; // 0 if grossMarginPct omitted
  totalAnnualBenefit: number;
  netAnnualBenefit: number;
  roiPct: number | null; // null => display "N/A"
  monthlyNetBenefit: number;
  paybackMonths: number | null; // null => display "Never"
  isRevenueOpportunityOnly: boolean; // true when grossMarginPct omitted
}

export type Recommendation = 'build' | 'consider' | 'dont_build';

/**
 * Compute a single scenario. Pure: same inputs in, same numbers out.
 */
export function calculateScenario(
  inputs: CalculatorInputs,
  scenario: ScenarioName
): ScenarioResult {
  // Defensive: validate before any math runs.
  validateInputs(inputs);

  const { automationPct, conversionImprovementPct } = resolveScenarioAssumptions(
    inputs.expectedAutomationPct,
    inputs.expectedConversionImprovementPct,
    scenario
  );

  const isRevenueOpportunityOnly = inputs.grossMarginPct == null;

  // --- Formulas (Section 11) ---
  const annualLaborCost =
    inputs.employeesAffected * inputs.hoursPerWeek * inputs.hourlyCost * 52;

  const annualLaborSavings = annualLaborCost * automationPct;

  const annualRecurringCost =
    inputs.monthlyAiApiCost * 12 +
    inputs.monthlySoftwareCost * 12 +
    inputs.otherAnnualCost;

  const totalFirstYearCost = inputs.implementationFee + annualRecurringCost;

  const additionalCustomers =
    inputs.leadsPerMonth * conversionImprovementPct * 12;

  const additionalAnnualRevenue =
    additionalCustomers * inputs.averageCustomerValue;

  const additionalGrossProfit = isRevenueOpportunityOnly
    ? 0
    : additionalAnnualRevenue * (inputs.grossMarginPct as number);

  const totalAnnualBenefit = annualLaborSavings + additionalGrossProfit;

  const netAnnualBenefit = totalAnnualBenefit - totalFirstYearCost;

  // ROI: never divide by zero.
  const roiPct =
    totalFirstYearCost === 0 ? null : (netAnnualBenefit / totalFirstYearCost) * 100;

  const monthlyNetBenefit = netAnnualBenefit / 12;

  // Payback: never negative, never Infinity.
  const paybackMonths =
    monthlyNetBenefit <= 0 ? null : inputs.implementationFee / monthlyNetBenefit;

  return {
    scenario,
    automationPct,
    conversionImprovementPct,
    annualLaborCost,
    annualLaborSavings,
    annualRecurringCost,
    totalFirstYearCost,
    additionalCustomers,
    additionalAnnualRevenue,
    additionalGrossProfit,
    totalAnnualBenefit,
    netAnnualBenefit,
    roiPct,
    monthlyNetBenefit,
    paybackMonths,
    isRevenueOpportunityOnly,
  };
}

/** Compute all three scenarios at once. */
export function calculateAllScenarios(
  inputs: CalculatorInputs
): Record<ScenarioName, ScenarioResult> {
  return {
    conservative: calculateScenario(inputs, 'conservative'),
    expected: calculateScenario(inputs, 'expected'),
    upside: calculateScenario(inputs, 'upside'),
  };
}

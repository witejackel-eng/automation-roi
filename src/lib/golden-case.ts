/**
 * Golden test case — "Apex Home Services" (Section 12).
 *
 * Canonical worked example used by: the landing page's "View Example Report",
 * the calculator's demo-data fill button, and the unit test suite.
 */
import type { CalculatorInputs } from '../calculations/engine';

export const APEX_INPUTS: CalculatorInputs = {
  clientName: 'Apex Home Services',
  employeesAffected: 12,
  hoursPerWeek: 25,
  hourlyCost: 28,
  monthlyWorkload: 1800,
  currentErrorRate: 0.04,
  leadsPerMonth: 500,
  currentConversionRate: 0.2,
  averageCustomerValue: 2000,
  grossMarginPct: 0.4,
  expectedAutomationPct: 0.2,
  expectedErrorReductionPct: 0.7,
  expectedConversionImprovementPct: 0.015,
  implementationFee: 18000,
  monthlyAiApiCost: 450,
  monthlySoftwareCost: 200,
  otherAnnualCost: 800,
};

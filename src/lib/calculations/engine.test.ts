import { describe, it, expect } from 'vitest';
import { calculateScenario } from './engine';

const apexInputs = {
  clientName: 'Apex Home Services',
  employeesAffected: 12,
  hoursPerWeek: 25,
  hourlyCost: 28,
  monthlyWorkload: 1800,
  currentErrorRate: 0.04,
  leadsPerMonth: 500,
  currentConversionRate: 0.20,
  averageCustomerValue: 2000,
  grossMarginPct: 0.40,
  expectedAutomationPct: 0.20,
  expectedErrorReductionPct: 0.70,
  expectedConversionImprovementPct: 0.015,
  implementationFee: 18000,
  monthlyAiApiCost: 450,
  monthlySoftwareCost: 200,
  platformApiCost: 75,
  otherAnnualCost: 800,
};

describe('calculateScenario — Apex Home Services (golden case)', () => {
  it('computes the Expected scenario exactly', () => {
    const r = calculateScenario(apexInputs, 'expected');
    expect(r.annualLaborCost).toBe(436_800);
    expect(r.annualLaborSavings).toBe(87_360);
    expect(r.totalFirstYearCost).toBe(27_500); // re-derived: includes platformApiCost*12
    expect(r.additionalCustomers).toBe(90);
    expect(r.additionalAnnualRevenue).toBe(180_000);
    expect(r.additionalGrossProfit).toBe(72_000);
    expect(r.totalAnnualBenefit).toBe(159_360);
    expect(r.netAnnualBenefit).toBe(131_860); // re-derived: 159_360 - 27_500
    expect(Math.round(r.roiPct as number)).toBe(479); // re-derived: round(131_860 / 27_500 * 100)
    expect(r.paybackMonths).toBeCloseTo(1.63, 1);
  });

  it('computes the Conservative scenario exactly', () => {
    const r = calculateScenario(apexInputs, 'conservative');
    expect(r.annualLaborSavings).toBe(56_784);
    expect(r.additionalCustomers).toBe(0);
    expect(r.netAnnualBenefit).toBe(29_284); // re-derived: 56_784 - 27_500
    expect(Math.round(r.roiPct as number)).toBe(106); // re-derived: round(29_284 / 27_500 * 100)
  });

  it('computes the Upside scenario exactly', () => {
    const r = calculateScenario(apexInputs, 'upside');
    expect(r.additionalCustomers).toBe(135);
    expect(r.netAnnualBenefit).toBe(189_700); // re-derived: 217_200 - 27_500
    expect(Math.round(r.roiPct as number)).toBe(690); // re-derived: round(189_700 / 27_500 * 100)
  });
});

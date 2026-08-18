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
  otherAnnualCost: 800,
};

describe('calculateScenario — Apex Home Services (golden case)', () => {
  it('computes the Expected scenario exactly', () => {
    const r = calculateScenario(apexInputs, 'expected');
    expect(r.annualLaborCost).toBe(436_800);
    expect(r.annualLaborSavings).toBe(87_360);
    expect(r.totalFirstYearCost).toBe(26_600);
    expect(r.additionalCustomers).toBe(90);
    expect(r.additionalAnnualRevenue).toBe(180_000);
    expect(r.additionalGrossProfit).toBe(72_000);
    expect(r.totalAnnualBenefit).toBe(159_360);
    expect(r.netAnnualBenefit).toBe(132_760);
    expect(Math.round(r.roiPct as number)).toBe(499);
    expect(r.paybackMonths).toBeCloseTo(1.63, 1);
  });

  it('computes the Conservative scenario exactly', () => {
    const r = calculateScenario(apexInputs, 'conservative');
    expect(r.annualLaborSavings).toBe(56_784);
    expect(r.additionalCustomers).toBe(0);
    expect(r.netAnnualBenefit).toBe(30_184);
    expect(Math.round(r.roiPct as number)).toBe(113);
  });

  it('computes the Upside scenario exactly', () => {
    const r = calculateScenario(apexInputs, 'upside');
    expect(r.additionalCustomers).toBe(135);
    expect(r.netAnnualBenefit).toBe(190_600);
    expect(Math.round(r.roiPct as number)).toBe(717);
  });
});

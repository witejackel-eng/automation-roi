/**
 * Stress-test + break-even intelligence (Master Spec §29, §30, §31).
 *
 * Pure functions that compute the thresholds at which an automation project
 * stops making financial sense. Every threshold is a deterministic solve
 * against the same calculation engine — no invented numbers.
 *
 * The four break-even questions (Section 30):
 *   1. Implementation cost > $X → net drops below zero
 *   2. Automation coverage < X% → net drops below zero
 *   3. Monthly operating cost > $X → net drops below zero
 *   4. Payback > 12 months → the BUILD target is missed
 *
 * Sensitivity (Section 31): which input moves the result the most?
 * Computed by varying each input ±20% and measuring the ROI delta.
 */
import { calculateScenario } from './engine';
import type { CalculatorInputs, ScenarioResult } from './engine';
import type { ScenarioName } from './scenarios';

export interface BreakEvenThresholds {
  /** Implementation fee above which net annual benefit drops to zero (expected scenario). */
  implementationFee: number | null;
  /** Automation coverage below which net annual benefit drops to zero (expected scenario, as 0–1). */
  automationPct: number | null;
  /** Combined monthly AI/API + software cost above which net drops to zero (expected scenario). */
  monthlyOperatingCost: number | null;
  /** True if any of the three thresholds is already breached (net already ≤ 0). */
  alreadyBroken: boolean;
}

export interface SensitivityItem {
  label: string;
  /** Absolute ROI swing when the input moves ±20%. Higher = more sensitive. */
  impact: number;
  /** 'high' if impact >= 50pp, 'medium' if >= 15pp, else 'low'. */
  level: 'high' | 'medium' | 'low';
  /** The ±20% ROI values, for display. */
  lowRoi: number | null;
  highRoi: number | null;
}

/**
 * Compute the break-even thresholds for the expected scenario.
 *
 * Each threshold is a direct algebraic solve:
 *
 *   net = totalAnnualBenefit - totalFirstYearCost
 *
 * where totalAnnualBenefit = annualLaborSavings + additionalGrossProfit,
 * and totalFirstYearCost = implementationFee + monthlyCost*12 + otherAnnualCost.
 *
 * Setting net = 0 and solving for one variable (holding the others fixed at
 * their expected-scenario values) gives the break-even.
 */
export function computeBreakEven(
  inputs: CalculatorInputs,
  scenario: ScenarioName = 'expected'
): BreakEvenThresholds {
  const base = calculateScenario(inputs, scenario);

  // If already broken (net ≤ 0), flag it. Thresholds are still computed so the
  // user can see how far past break-even they are.
  const alreadyBroken = base.netAnnualBenefit <= 0;

  // 1. Implementation fee break-even: totalAnnualBenefit - annualRecurringCost
  //    (implementationFee is a pure add to totalFirstYearCost, so the solve is direct).
  const implementationFee = base.totalAnnualBenefit - base.annualRecurringCost;
  const implThreshold = implementationFee >= 0 ? implementationFee : null;

  // 2. Automation coverage break-even:
  //    totalAnnualBenefit = annualLaborCost * automationPct + additionalGrossProfit
  //    → automationPct = (totalFirstYearCost - additionalGrossProfit) / annualLaborCost
  const denomLabor = base.annualLaborCost;
  const automationPct =
    denomLabor > 0
      ? (base.totalFirstYearCost - base.additionalGrossProfit) / denomLabor
      : null;
  const automationThreshold =
    automationPct != null && automationPct >= 0 && automationPct <= 1
      ? automationPct
      : automationPct != null && automationPct > 1
        ? 1 // would need > 100% automation to break even
        : null; // negative → already broken even at 0%

  // 3. Monthly operating cost break-even:
  //    (monthlyAiApi + monthlySoftware) = (totalAnnualBenefit - implementationFee - otherAnnualCost) / 12
  const monthlyOperating =
    (base.totalAnnualBenefit - inputs.implementationFee - inputs.otherAnnualCost) / 12;
  const monthlyThreshold = monthlyOperating >= 0 ? monthlyOperating : null;

  return {
    implementationFee: implThreshold,
    automationPct: automationThreshold,
    monthlyOperatingCost: monthlyThreshold,
    alreadyBroken,
  };
}

/**
 * Compute sensitivity: how much does the ROI move when each key input varies ±20%?
 *
 * This answers "what could go wrong?" (Section 31). The inputs tested are the
 * four material levers: automation coverage, implementation cost, monthly
 * AI/API cost, and conversion improvement.
 */
export function computeSensitivity(
  inputs: CalculatorInputs,
  scenario: ScenarioName = 'expected'
): SensitivityItem[] {
  const base = calculateScenario(inputs, scenario);
  const baseRoi = base.roiPct;

  const vary = (modified: CalculatorInputs): number | null => {
    const r = calculateScenario(modified, scenario);
    return r.roiPct;
  };

  const items: { label: string; key: keyof CalculatorInputs; }[] = [
    { label: 'Automation coverage', key: 'expectedAutomationPct' },
    { label: 'Implementation cost', key: 'implementationFee' },
    { label: 'Monthly AI/API cost', key: 'monthlyAiApiCost' },
    { label: 'Conversion improvement', key: 'expectedConversionImprovementPct' },
  ];

  return items.map((item) => {
    const original = inputs[item.key] as number;
    if (!Number.isFinite(original) || original === 0) {
      return { label: item.label, impact: 0, level: 'low' as const, lowRoi: baseRoi, highRoi: baseRoi };
    }
    const low = { ...inputs, [item.key]: original * 0.8 } as CalculatorInputs;
    const high = { ...inputs, [item.key]: original * 1.2 } as CalculatorInputs;
    const lowRoi = vary(low);
    const highRoi = vary(high);
    // Impact = the absolute swing. Use the max deviation from base.
    const lowDelta = lowRoi != null ? Math.abs(lowRoi - (baseRoi ?? 0)) : 0;
    const highDelta = highRoi != null ? Math.abs(highRoi - (baseRoi ?? 0)) : 0;
    const impact = Math.max(lowDelta, highDelta);
    const level: SensitivityItem['level'] =
      impact >= 50 ? 'high' : impact >= 15 ? 'medium' : 'low';
    return { label: item.label, impact, level, lowRoi, highRoi };
  }).sort((a, b) => b.impact - a.impact);
}

/**
 * The "still viable" headline (Voice Spec §5.11):
 * "Still viable. — Payback holds until implementation cost passes $27,400."
 *
 * Returns the single most useful break-even statement, or null if the case
 * is already broken.
 */
export function stillViableStatement(
  thresholds: BreakEvenThresholds,
  inputs: CalculatorInputs
): string | null {
  if (thresholds.alreadyBroken) return null;
  // Prefer the implementation-fee threshold (most intuitive lever).
  if (thresholds.implementationFee != null) {
    const headroom = thresholds.implementationFee - inputs.implementationFee;
    if (headroom > 0) {
      return `Payback holds until implementation cost passes $${Math.round(thresholds.implementationFee).toLocaleString()}.`;
    }
  }
  return null;
}

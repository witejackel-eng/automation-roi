/**
 * Scenario engine — named, configurable multipliers (Section 9).
 *
 * Conservative zeroes out the conversion-improvement benefit entirely and
 * discounts the automation rate by 35%. Expected uses the user's entered
 * assumptions unchanged. Upside uplifts automation rate by 25% and conversion
 * improvement by 50%, both capped so upside automation % never exceeds 95%.
 *
 * Cost inputs are held constant across all three scenarios — only the benefit
 * assumptions vary. This is a deliberate simplification stated in the
 * Assumptions section of every report.
 */

export const SCENARIO_MULTIPLIERS = {
  conservative: { automationMultiplier: 0.65, conversionImprovementMultiplier: 0 },
  expected: { automationMultiplier: 1.0, conversionImprovementMultiplier: 1.0 },
  upside: { automationMultiplier: 1.25, conversionImprovementMultiplier: 1.5 },
} as const;

export type ScenarioName = keyof typeof SCENARIO_MULTIPLIERS;

export const SCENARIO_ORDER: ScenarioName[] = ['conservative', 'expected', 'upside'];

/** Hard ceiling on the automation rate in the upside scenario (Section 9). */
export const UPSIDE_AUTOMATION_CEILING = 0.95;

/**
 * Resolve the effective automation % and conversion improvement (in percentage
 * points, as a decimal) for a given scenario from the user's base inputs.
 *
 * The Expected scenario never clamps the automation rate — that is the user's
 * own claim and is surfaced as entered. Only the Upside scenario clamps to 95%.
 */
export function resolveScenarioAssumptions(
  baseAutomationPct: number,
  baseConversionImprovementPct: number,
  scenario: ScenarioName
): { automationPct: number; conversionImprovementPct: number } {
  const m = SCENARIO_MULTIPLIERS[scenario];
  let automationPct = baseAutomationPct * m.automationMultiplier;
  if (scenario === 'upside') {
    automationPct = Math.min(automationPct, UPSIDE_AUTOMATION_CEILING);
  }
  const conversionImprovementPct =
    baseConversionImprovementPct * m.conversionImprovementMultiplier;
  return { automationPct, conversionImprovementPct };
}

export const SCENARIO_LABELS: Record<ScenarioName, string> = {
  conservative: 'Conservative',
  expected: 'Expected',
  upside: 'Upside',
};

export const SCENARIO_DESCRIPTIONS: Record<ScenarioName, string> = {
  conservative:
    'Discounts the automation rate by 35% and credits no conversion improvement.',
  expected: 'Uses the entered assumptions unchanged.',
  upside:
    'Uplifts the automation rate by 25% and conversion improvement by 50%, automation capped at 95%.',
};

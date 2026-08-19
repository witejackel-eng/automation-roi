import { describe, it, expect } from 'vitest';
import { calculateScenario } from '@/lib/calculations/engine';
import { recommend } from '@/lib/calculations/recommendation';
import { APEX_INPUTS } from '@/lib/golden-case';
import type { ScenarioName } from '@/lib/calculations/scenarios';

const FIELDS_TO_COMPARE = [
  'annualLaborCost',
  'annualLaborSavings',
  'netAnnualBenefit',
  'totalCost',
  'roi',
  'paybackMonths',
  'confidenceScore',
] as const;

describe('output consistency across saved case / report / proposal / share', () => {
  const scenarios: ScenarioName[] = ['conservative', 'expected', 'upside'];
  const goldenResults = Object.fromEntries(
    scenarios.map((s) => [s, calculateScenario(APEX_INPUTS, s)]),
  ) as Record<ScenarioName, ReturnType<typeof calculateScenario>>;
  const goldenRecommendation = recommend(goldenResults.expected);

  const persistedResultsJson = JSON.stringify(goldenResults);
  const persistedRecommendation = goldenRecommendation;

  it('re-parsed persisted results match the original calculation exactly, field by field, for all three scenarios', () => {
    const reparsed = JSON.parse(persistedResultsJson) as Record<ScenarioName, ReturnType<typeof calculateScenario>>;
    for (const scenario of scenarios) {
      for (const field of FIELDS_TO_COMPARE) {
        expect(reparsed[scenario][field as keyof typeof reparsed[typeof scenario]]).toStrictEqual(
          goldenResults[scenario][field as keyof typeof goldenResults[typeof scenario]],
        );
      }
    }
  });

  it('recommend() applied to the persisted expected-scenario result is identical to the original recommendation', () => {
    const reparsed = JSON.parse(persistedResultsJson) as Record<ScenarioName, ReturnType<typeof calculateScenario>>;
    const recomputedFromPersisted = recommend(reparsed.expected);
    expect(recomputedFromPersisted).toStrictEqual(persistedRecommendation);
  });

  it('serializing and re-parsing does not introduce floating point drift across all scenario fields', () => {
    const reparsed = JSON.parse(persistedResultsJson) as Record<ScenarioName, ReturnType<typeof calculateScenario>>;
    for (const scenario of scenarios) {
      expect(JSON.stringify(reparsed[scenario])).toBe(JSON.stringify(goldenResults[scenario]));
    }
  });
});

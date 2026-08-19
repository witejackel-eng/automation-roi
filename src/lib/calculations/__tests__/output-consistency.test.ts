const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
if (!TEST_DATABASE_URL) {
  throw new Error(
    'output-consistency requires TEST_DATABASE_URL. This test must not be skipped — ' +
    'it verifies that persisted case results match recomputed results. FOUNDER/CI ACTION: provide TEST_DATABASE_URL.'
  );
}

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { calculateScenario } from '@/lib/calculations/engine';
import { recommend } from '@/lib/calculations/recommendation';
import { APEX_INPUTS } from '@/lib/golden-case';
import type { ScenarioName } from '@/lib/calculations/scenarios';
import { db } from '@/lib/db';
import { tenant } from '@/lib/tenant';

type ScenarioResult = ReturnType<typeof calculateScenario>;

const FIELDS_TO_COMPARE = [
  'annualLaborCost',
  'annualLaborSavings',
  'netAnnualBenefit',
  'totalCost',
  'roi',
  'paybackMonths',
  'confidenceScore',
] as const;

const scenarios: ScenarioName[] = ['conservative', 'expected', 'upside'];

let orgId: string;
let projectId: string;
let cleanupOrgIds: string[] = [];

describe('output consistency', () => {
  beforeAll(async () => {
    // Create an org for the test
    const org = await db.organization.create({
      data: { name: 'Output Consistency Test Org' },
    });
    orgId = org.id;
    cleanupOrgIds.push(orgId);

    // Compute the golden results
    const goldenResults = Object.fromEntries(
      scenarios.map((s) => [s, calculateScenario(APEX_INPUTS, s)]),
    ) as Record<ScenarioName, ScenarioResult>;
    const goldenRecommendation = recommend(goldenResults.expected);

    // Persist via tenant()
    const project = await tenant(orgId).projects.create({
      data: {
        clientName: APEX_INPUTS.clientName,
        inputs: JSON.stringify(APEX_INPUTS),
        results: JSON.stringify(goldenResults),
        recommendation: goldenRecommendation.decision,
      },
    });
    projectId = project.id;
  });

  afterAll(async () => {
    // Clean up
    for (const id of cleanupOrgIds) {
      try {
        await db.project.deleteMany({ where: { organizationId: id } });
        await db.organization.delete({ where: { id } });
      } catch {
        // Best effort
      }
    }
  });

  it('persists and retrieves correctly — recomputed results match persisted results', async () => {
    // Read back via tenant()
    const persisted = await tenant(orgId).projects.findUnique({ id: projectId });
    expect(persisted).not.toBeNull();

    // Parse persisted data
    const parsedInputs = JSON.parse(persisted!.inputs);
    const parsedResults = JSON.parse(persisted!.results) as Record<ScenarioName, ScenarioResult>;
    const persistedRecommendation = persisted!.recommendation;

    // Recompute from the persisted inputs
    const recomputedResults = Object.fromEntries(
      scenarios.map((s) => [s, calculateScenario(parsedInputs, s)]),
    ) as Record<ScenarioName, ScenarioResult>;

    const recomputedRecommendation = recommend(recomputedResults.expected);

    // Compare field by field for each scenario
    for (const scenario of scenarios) {
      for (const field of FIELDS_TO_COMPARE) {
        expect(
          parsedResults[scenario][field as keyof ScenarioResult],
          `${scenario}.${field}: persisted vs recomputed mismatch`,
        ).toStrictEqual(
          recomputedResults[scenario][field as keyof ScenarioResult],
        );
      }
    }

    // Recommendation should match
    expect(persistedRecommendation).toBe(recomputedRecommendation.decision);
  });
});

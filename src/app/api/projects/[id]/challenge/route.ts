/**
 * POST /api/projects/[id]/challenge — Live Challenge / What-If endpoint.
 *
 * Accepts a single field override, recalculates with the engine, and returns
 * a delta comparing original vs. challenged results — including whether the
 * verdict changed.
 *
 * Authentication: required via requireOrg().
 * Tenant isolation: enforced via tenant(orgId).projects.findUnique().
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { tenant } from '@/lib/tenant';
import { calculateAllScenarios, type CalculatorInputs, type ScenarioResult } from '@/lib/calculations/engine';
import { recommendWithConfidence } from '@/lib/calculations/recommendation';
import { computeConfidenceScore } from '@/lib/calculations/confidence';
import type { ScenarioName } from '@/lib/calculations/scenarios';

type Verdict = 'build' | 'consider' | 'dont_build';

interface ChallengeBody {
  field: string;
  newValue: number;
  note?: string;
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  try {
    const org = await requireOrg();

    // ── Parse & validate request body ─────────────────────────
    let body: ChallengeBody;
    try {
      body = (await req.json()) as ChallengeBody;
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 422 },
      );
    }

    if (!body.field || typeof body.field !== 'string') {
      return NextResponse.json(
        { error: 'Field "field" is required and must be a string.' },
        { status: 422 },
      );
    }

    if (typeof body.newValue !== 'number' || !Number.isFinite(body.newValue)) {
      return NextResponse.json(
        { error: 'Field "newValue" is required and must be a finite number.' },
        { status: 422 },
      );
    }

    if (body.newValue < 0) {
      return NextResponse.json(
        { error: 'Field "newValue" must be non-negative.' },
        { status: 422 },
      );
    }

    // ── Fetch project with tenant isolation ───────────────────
    const project = await tenant(org.id).projects.findUnique({ id });
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    let inputs: CalculatorInputs;
    let results: Record<ScenarioName, ScenarioResult>;
    try {
      inputs = JSON.parse(project.inputs) as CalculatorInputs;
      results = JSON.parse(project.results) as Record<ScenarioName, ScenarioResult>;
    } catch {
      return NextResponse.json(
        { error: 'Project data is corrupted.' },
        { status: 500 },
      );
    }

    // ── Verify the field exists on inputs ─────────────────────
    if (!(body.field in inputs)) {
      return NextResponse.json(
        { error: `Field "${body.field}" is not a valid input field.` },
        { status: 422 },
      );
    }

    const previousValue = inputs[body.field as keyof CalculatorInputs] as number;

    // ── Build challenged inputs & recalculate ─────────────────
    const challengedInputs: CalculatorInputs = {
      ...inputs,
      [body.field]: body.newValue,
    };

    let challengedResults: Record<ScenarioName, ScenarioResult>;
    try {
      challengedResults = calculateAllScenarios(challengedInputs);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Calculation failed with challenged inputs.';
      return NextResponse.json({ error: message }, { status: 422 });
    }

    // ── Derive verdicts (confidence-aware) ────────────────────
    // Use a default confidence map (all 'provided' since these are
    // user-supplied overrides in a what-if context).
    const defaultStatuses: Record<string, 'provided'> = {
      hourlyCost: 'provided',
      hoursPerWeek: 'provided',
      implementationFee: 'provided',
      expectedAutomationPct: 'provided',
      expectedConversionImprovementPct: 'provided',
      platformApiCost: 'provided',
      otherAnnualCost: 'provided',
      expectedErrorReductionPct: 'provided',
    };

    const originalConfidence = computeConfidenceScore(defaultStatuses);
    const challengedConfidence = computeConfidenceScore(defaultStatuses);

    const originalVerdict = recommendWithConfidence({
      expected: results.expected,
      conservative: results.conservative,
      confidenceScore: originalConfidence.score,
    }).recommendation;

    const challengedVerdict = recommendWithConfidence({
      expected: challengedResults.expected,
      conservative: challengedResults.conservative,
      confidenceScore: challengedConfidence.score,
    }).recommendation;

    // ── Build delta response ───────────────────────────────────
    return NextResponse.json({
      originalResults: {
        verdict: originalVerdict,
        confidence: originalConfidence.score,
        payback: results.expected.paybackMonths,
        roi: results.expected.roiPct,
        netAnnualBenefit: results.expected.netAnnualBenefit,
      },
      challengedResults: {
        verdict: challengedVerdict,
        confidence: challengedConfidence.score,
        payback: challengedResults.expected.paybackMonths,
        roi: challengedResults.expected.roiPct,
        netAnnualBenefit: challengedResults.expected.netAnnualBenefit,
      },
      delta: {
        field: body.field,
        previousValue,
        newValue: body.newValue,
        verdictChanged: originalVerdict !== challengedVerdict,
        previousVerdict: originalVerdict,
        newVerdict: challengedVerdict,
      },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

/**
 * POST /api/projects — save a project (pro+).
 * GET  /api/projects — list projects for the demo organization (agency+).
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDemoOrganization } from '@/lib/session';
import { getActiveEntitlement, has } from '@/lib/entitlement';
import { calculatorInputsSchema } from '@/lib/validation/schema';
import { calculateAllScenarios } from '@/lib/calculations/engine';
import { recommend } from '@/lib/calculations/recommendation';
import type { ScenarioName } from '@/lib/calculations/scenarios';
import type { CalculatorInputs, ScenarioResult, Recommendation } from '@/lib/calculations/engine';

export const runtime = 'nodejs';

interface SaveBody {
  inputs: CalculatorInputs;
  results?: Record<ScenarioName, ScenarioResult>;
  recommendation?: { recommendation: Recommendation; reason: string; copy: string };
  clientName?: string;
}

export async function POST(req: NextRequest) {
  const org = await getDemoOrganization();
  const entitlement = await getActiveEntitlement(org.id);
  if (!has(entitlement, 'save_project')) {
    return NextResponse.json(
      { error: 'Saving projects requires Pro or higher.', requiredTier: 'pro' },
      { status: 403 }
    );
  }

  let body: SaveBody;
  try {
    body = (await req.json()) as SaveBody;
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 422 });
  }

  const parsed = calculatorInputsSchema.safeParse(body.inputs);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid inputs.' }, { status: 422 });
  }
  const inputs = parsed.data;

  const results = body.results ?? calculateAllScenarios(inputs);
  const recommendation =
    body.recommendation ?? recommend(results.expected);

  const project = await db.project.create({
    data: {
      organizationId: org.id,
      clientName: inputs.clientName,
      inputs: JSON.stringify(inputs),
      results: JSON.stringify(results),
      recommendation: recommendation.recommendation,
    },
  });

  return NextResponse.json({
    id: project.id,
    clientName: project.clientName,
    recommendation: project.recommendation,
    createdAt: project.createdAt,
  });
}

export async function GET() {
  const org = await getDemoOrganization();
  const entitlement = await getActiveEntitlement(org.id);
  if (!has(entitlement, 'client_history')) {
    return NextResponse.json(
      { error: 'Project history requires Agency or higher.', requiredTier: 'agency' },
      { status: 403 }
    );
  }

  const projects = await db.project.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      clientName: true,
      recommendation: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ projects });
}

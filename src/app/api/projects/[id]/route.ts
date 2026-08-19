/**
 * GET /api/projects/[id] — fetch a saved project (pro+).
 * DELETE /api/projects/[id] — delete a saved project (pro+).
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { tenant, getOrgEntitlement } from '@/lib/tenant';
import { has } from '@/lib/entitlement';
import type { CalculatorInputs, ScenarioResult, Recommendation } from '@/lib/calculations/engine';
import type { ScenarioName } from '@/lib/calculations/scenarios';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
  const org = await requireOrg();
  const entitlement = await getOrgEntitlement(org.id);
  if (!has(entitlement, 'save_project')) {
    return NextResponse.json(
      { error: 'Saved projects require Pro or higher.', requiredTier: 'case_pack' },
      { status: 403 }
    );
  }

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
    return NextResponse.json({ error: 'Project data is corrupted.' }, { status: 500 });
  }

  return NextResponse.json({
    id: project.id,
    clientName: project.clientName,
    inputs,
    results,
    recommendation: project.recommendation as Recommendation,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
  const org = await requireOrg();
  const entitlement = await getOrgEntitlement(org.id);
  if (!has(entitlement, 'save_project')) {
    return NextResponse.json(
      { error: 'Saved projects require Pro or higher.', requiredTier: 'case_pack' },
      { status: 403 }
    );
  }

  const project = await tenant(org.id).projects.findUnique({ id });
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  await tenant(org.id).projects.delete({ id });
  return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

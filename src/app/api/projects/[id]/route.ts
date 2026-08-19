/**
 * GET    /api/projects/[id] — fetch a saved project (pro+).
 * PATCH  /api/projects/[id] — partial update (pro+).
 * DELETE /api/projects/[id] — delete a saved project (pro+).
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { tenant, getOrgEntitlement } from '@/lib/tenant';
import { has } from '@/lib/entitlement';
import { recommend } from '@/lib/calculations/recommendation';
import { calculatorInputsSchema } from '@/lib/validation/schema';
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
      { error: 'Saved projects require Pro or higher.', requiredTier: 'pro' },
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

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
  const org = await requireOrg();
  const entitlement = await getOrgEntitlement(org.id);
  if (!has(entitlement, 'save_project')) {
    return NextResponse.json(
      { error: 'Saved projects require Pro or higher.', requiredTier: 'pro' },
      { status: 403 }
    );
  }

  let body: {
    clientName?: string;
    inputs?: CalculatorInputs;
    results?: Record<ScenarioName, ScenarioResult>;
    recommendation?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 422 });
  }

  const existing = await tenant(org.id).projects.findUnique({ id });
  if (!existing) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  // If inputs are provided, validate them.
  if (body.inputs) {
    const parsed = calculatorInputsSchema.safeParse(body.inputs);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid inputs.' }, { status: 422 });
    }
  }

  const data: Record<string, unknown> = {};
  if (body.clientName !== undefined) data.clientName = body.clientName;
  if (body.inputs !== undefined) data.inputs = JSON.stringify(body.inputs);
  if (body.results !== undefined) data.results = JSON.stringify(body.results);

  // If results are being updated, always re-derive the recommendation
  // server-side — NEVER trust a client-supplied recommendation.
  if (body.results) {
    const rec = recommend(body.results.expected);
    data.recommendation = rec.recommendation;
  }

  const updated = await tenant(org.id).projects.update({
    where: { id },
    data,
  });

  return NextResponse.json({
    id: updated.id,
    clientName: updated.clientName,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
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
      { error: 'Saved projects require Pro or higher.', requiredTier: 'pro' },
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

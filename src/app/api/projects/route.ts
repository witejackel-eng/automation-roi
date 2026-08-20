/**
 * POST /api/projects — save a project (pro+).
 * GET  /api/projects — list projects for the demo organization (agency+).
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { tenant } from "@/lib/tenant";
import { getEffectiveEntitlement } from "@/lib/entitlement-session";
import { has } from '@/lib/entitlement';
// db import removed — all access now via tenant() per Phase 6 F-6 fix.
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
  try {
  const org = await requireOrg();
  const entitlement = await getEffectiveEntitlement(org.id);
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

  // ── Server-side re-derivation (Section 33 — engine hardening) ────────
  // Always re-derive results and recommendation from validated inputs.
  // Client-provided results/recommendation are NEVER trusted — they could
  // be manipulated. This guarantees data integrity in the persistence layer.
  const results = calculateAllScenarios(inputs);
  const recommendation = recommend(results.expected);

  const project = await tenant(org.id).projects.create({
    data: {
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
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[api/projects]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
  const org = await requireOrg();
  const entitlement = await getEffectiveEntitlement(org.id);
  if (!has(entitlement, 'client_history')) {
    return NextResponse.json(
      { error: 'Project history requires Agency or higher.', requiredTier: 'agency' },
      { status: 403 }
    );
  }

  // Phase 6 (F-6 fix): route through tenant(org.id) so organizationId is
  // baked into the WHERE clause by the wrapper, not by caller discipline.
  // The tenant delegate's findMany accepts the full Prisma args object —
  // it just overrides where.organizationId. The nested shares/events
  // includes are unchanged; they're scoped to each project's row.
  const projects = await tenant(org.id).projects.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      clientName: true,
      recommendation: true,
      createdAt: true,
      updatedAt: true,
      shares: {
        where: { revokedAt: null },
        select: {
          id: true,
          shareId: true,
          decisionState: true,
          events: {
            where: { eventType: 'view' },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
            take: 1,
          },
          _count: {
            select: { events: { where: { eventType: 'view' } } },
          },
        },
        take: 1,
      },
    },
  });

  // Map share engagement data onto the project response.
  const projectsWithEngagement = projects.map((p) => {
    const share = p.shares[0]; // most recent non-revoked share
    const shareEngagement = share
      ? {
          viewCount: share._count.events,
          lastViewed: share.events[0]?.createdAt?.toISOString() ?? null,
          decisionState: share.decisionState,
        }
      : null;
    const { shares: _shares, ...rest } = p;
    return { ...rest, shareEngagement };
  });

  return NextResponse.json({ projects: projectsWithEngagement });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[api/projects]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

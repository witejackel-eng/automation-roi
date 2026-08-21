/**
 * POST /api/projects — save a project.
 *   Starter: allowed up to 10 cases/calendar month (enforced via checkCaseLimit).
 *   Pro:     unlimited.
 *   Superadmin: bypasses via getEffectiveEntitlement (returns Pro).
 *
 * GET  /api/projects — list projects for the current org.
 *   Starter + Pro both have read access to their own org's projects.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { tenant } from "@/lib/tenant";
import { getEffectiveEntitlement } from "@/lib/entitlement-session";
import { checkCaseLimit } from '@/lib/entitlement';
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

  // Starter (free) can save up to 10 cases/month; Pro is unlimited.
  // checkCaseLimit enforces the monthly counter for Starter.
  const caseLimit = await checkCaseLimit(org.id);
  if (!caseLimit.allowed) {
    return NextResponse.json(
      {
        error: `You've reached the Starter limit of ${caseLimit.limit} cases this month. Upgrade to Pro for unlimited cases.`,
        requiredTier: 'pro',
        limit: caseLimit.limit,
        remaining: caseLimit.remaining,
      },
      { status: 402 } // Payment Required — nudges upgrade.
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
  // Both Starter and Pro can list their own org's projects.
  await getEffectiveEntitlement(org.id);

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

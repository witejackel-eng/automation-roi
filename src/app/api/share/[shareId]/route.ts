/**
 * GET /api/share/[shareId] — public, read-only share data (Master Spec §45).
 *
 * No auth required (the opaque shareId IS the access credential). Returns
 * only the data needed to render a read-only client report: client name
 * (prepared-for label), the three scenarios, recommendation, and inputs.
 *
 * NO internal agency notes, NO sensitive metadata, NO project id.
 *
 * Returns 410 Gone if revoked or expired.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { CalculatorInputs, ScenarioResult, Recommendation } from '@/lib/calculations/engine';
import type { ScenarioName } from '@/lib/calculations/scenarios';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;

  // Validate shareId format — 24 hex chars (12 random bytes). Prevents
  // arbitrary string queries against the database (Section 10).
  if (!/^[0-9a-f]{24}$/.test(shareId)) {
    return NextResponse.json({ error: 'Invalid share ID format.' }, { status: 400 });
  }

  const share = await db.share.findUnique({
    where: { shareId },
    include: {
      project: {
        select: {
          clientName: true,
          inputs: true,
          results: true,
          recommendation: true,
          organization: {
            select: {
              name: true,
              website: true,
              brandColorHex: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!share) {
    return NextResponse.json({ error: 'Share not found.' }, { status: 404 });
  }

  if (share.revokedAt) {
    return NextResponse.json(
      { error: 'This share link has been revoked.' },
      { status: 410 }
    );
  }

  if (share.expiresAt && share.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'This share link has expired.' },
      { status: 410 }
    );
  }

  let inputs: CalculatorInputs;
  let results: Record<ScenarioName, ScenarioResult>;
  try {
    inputs = JSON.parse(share.project.inputs) as CalculatorInputs;
    results = JSON.parse(share.project.results) as Record<ScenarioName, ScenarioResult>;
  } catch {
    return NextResponse.json(
      { error: 'Share data could not be read.' },
      { status: 500 }
    );
  }

  const recommendation = share.project.recommendation as Recommendation;

  return NextResponse.json({
    shareId: share.shareId,
    createdAt: share.createdAt,
    clientName: share.project.clientName,
    agency: {
      name: share.project.organization.name,
      website: share.project.organization.website,
      brandColorHex: share.project.organization.brandColorHex,
      logoUrl: share.project.organization.logoUrl,
    },
    inputs,
    results,
    recommendation,
  });
}

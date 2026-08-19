/**
 * GET /api/admin/analytics/engagement — aggregated, anonymized engagement metrics.
 *
 * Returns total views, average time on page, and verdict distribution
 * across all shares. Requires superadmin role.
 *
 * Privacy boundary (Viableo Production Architecture §8.2): this endpoint
 * returns only aggregated, anonymized statistics — no project content,
 * user PII, or organization-identifiable data.
 */
import { NextResponse } from 'next/server';
import { requireSuperAdmin, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  // Total views across all shares.
  const totalViews = await db.shareEvent.count({
    where: { eventType: 'view' },
  });

  // Average time on page.
  const timeStats = await db.shareEvent.aggregate({
    where: { eventType: 'time_on_page', value: { not: null } },
    _avg: { value: true },
    _count: true,
  });
  const avgTimeOnPage = timeStats._count > 0
    ? Math.round((timeStats._avg.value ?? 0))
    : 0;

  // Verdict distribution across all projects.
  const verdictGroups = await db.project.groupBy({
    by: ['recommendation'],
    _count: true,
  });
  const verdictDistribution: Record<string, number> = {
    build: 0,
    consider: 0,
    dont_build: 0,
  };
  for (const g of verdictGroups) {
    verdictDistribution[g.recommendation] = g._count;
  }

  // Shares by decision state.
  const decisionGroups = await db.share.groupBy({
    by: ['decisionState'],
    _count: true,
  });
  const decisionStateDistribution: Record<string, number> = {};
  for (const g of decisionGroups) {
    decisionStateDistribution[g.decisionState] = g._count;
  }

  // Total shares.
  const totalShares = await db.share.count();

  // Top sections scrolled (aggregated across all shares).
  const topSections = await db.shareEvent.groupBy({
    by: ['section'],
    where: {
      eventType: 'section_scroll',
      section: { not: null },
    },
    _count: true,
    orderBy: { _count: { section: 'desc' } },
    take: 10,
  });

  return NextResponse.json({
    totalViews,
    avgTimeOnPage,
    verdictDistribution,
    totalShares,
    decisionStateDistribution,
    topSections: topSections.map((s) => ({
      section: s.section,
      count: s._count,
    })),
  });
}

/**
 * GET /api/share/[shareId]/analytics — aggregated engagement analytics for a share link.
 *
 * Returns aggregated ShareEvent data: total views, average time on page,
 * section-level engagement, and verdict distribution. Requires auth +
 * share ownership (via project org).
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> },
) {
  try {
    const org = await requireOrg();
    const { shareId } = await params;

    if (!/^[0-9a-f]{24}$/.test(shareId)) {
      return NextResponse.json({ error: 'Invalid share ID format.' }, { status: 400 });
    }

    // Lookup the share and verify org ownership.
    const share = await db.share.findUnique({
      where: { shareId },
      include: {
        project: { select: { organizationId: true, recommendation: true } },
      },
    });

    if (!share) {
      return NextResponse.json({ error: 'Share not found.' }, { status: 404 });
    }

    if (share.project.organizationId !== org.id) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    // Aggregate events for this share.
    const events = await db.shareEvent.findMany({
      where: { shareId: share.id, organizationId: org.id },
      select: {
        eventType: true,
        section: true,
        value: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Total views.
    const viewEvents = events.filter((e) => e.eventType === 'view');
    const totalViews = viewEvents.length;

    // Average time on page (from time_on_page events).
    const timeEvents = events.filter((e) => e.eventType === 'time_on_page' && e.value != null);
    const avgTimeOnPage = timeEvents.length > 0
      ? Math.round(timeEvents.reduce((sum, e) => sum + (e.value ?? 0), 0) / timeEvents.length)
      : 0;

    // Section-level scroll engagement.
    const sectionEngagement: Record<string, { scrollCount: number; avgDepth: number }> = {};
    for (const e of events) {
      if (e.eventType === 'section_scroll' && e.section) {
        const entry = sectionEngagement[e.section] ?? { scrollCount: 0, avgDepth: 0 };
        entry.scrollCount += 1;
        // Track depths for averaging.
        const depths = (sectionEngagement[e.section]?._depths as number[] | undefined) ?? [];
        depths.push(e.value ?? 0);
        (sectionEngagement[e.section] as typeof entry & { _depths: number[] })._depths = depths;
      }
    }
    // Compute final averages.
    for (const key of Object.keys(sectionEngagement)) {
      const raw = sectionEngagement[key] as { scrollCount: number; avgDepth: number; _depths: number[] };
      raw.avgDepth = raw._depths.length > 0
        ? Math.round((raw._depths.reduce((a, b) => a + b, 0) / raw._depths.length) * 100)
        : 0;
      delete (raw as Record<string, unknown>)._depths;
    }

    // Verdict distribution (from the project recommendation).
    const verdictDistribution: Record<string, number> = { build: 0, consider: 0, dont_build: 0 };
    verdictDistribution[share.project.recommendation] = 1;

    // Approval activity.
    const approvals = await db.shareApproval.findMany({
      where: { shareId: share.id },
      select: { action: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      shareId: share.shareId,
      decisionState: share.decisionState,
      totalViews,
      avgTimeOnPage,
      sectionEngagement,
      verdictDistribution,
      recentApprovals: approvals.slice(0, 10).map((a) => ({
        action: a.action,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

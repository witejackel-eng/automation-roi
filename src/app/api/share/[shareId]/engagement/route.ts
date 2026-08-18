/**
 * GET /api/share/[shareId]/engagement — return engagement summary for a share.
 *
 * Requires auth + org ownership (the agency owner can see engagement data;
 * the public client cannot query this endpoint).
 *
 * Returns: view count, first/last viewed timestamps, section breakdown
 * (section → count of section_scroll events), and the share's decisionState.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const org = await requireOrg();
    const { shareId } = await params;

    // Validate shareId format.
    if (!/^[0-9a-f]{24}$/.test(shareId)) {
      return NextResponse.json({ error: 'Invalid share ID format.' }, { status: 400 });
    }

    const share = await db.share.findUnique({
      where: { shareId },
      include: {
        project: {
          select: { organizationId: true },
        },
        events: {
          orderBy: { createdAt: 'asc' },
          select: {
            eventType: true,
            section: true,
            value: true,
            createdAt: true,
          },
        },
      },
    });

    if (!share) {
      return NextResponse.json({ error: 'Share not found.' }, { status: 404 });
    }

    // Org ownership check: the share's project must belong to the requesting org.
    if (share.project.organizationId !== org.id) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    // Compute engagement summary.
    const viewEvents = share.events.filter((e) => e.eventType === 'view');
    const viewCount = viewEvents.length;
    const firstViewed = viewEvents.length > 0 ? viewEvents[0].createdAt : null;
    const lastViewed = viewEvents.length > 0 ? viewEvents[viewEvents.length - 1].createdAt : null;

    // Section breakdown: count section_scroll events by section.
    const sectionBreakdown: Record<string, number> = {};
    for (const e of share.events) {
      if (e.eventType === 'section_scroll' && e.section) {
        sectionBreakdown[e.section] = (sectionBreakdown[e.section] ?? 0) + 1;
      }
    }

    // Time-on-page summary: sum of all time_on_page event values.
    const totalTimeOnPage = share.events
      .filter((e) => e.eventType === 'time_on_page' && e.value != null)
      .reduce((sum, e) => sum + (e.value ?? 0), 0);

    return NextResponse.json({
      shareId: share.shareId,
      decisionState: share.decisionState,
      viewCount,
      firstViewed: firstViewed ? firstViewed.toISOString() : null,
      lastViewed: lastViewed ? lastViewed.toISOString() : null,
      sectionBreakdown,
      totalTimeOnPage: Math.round(totalTimeOnPage),
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

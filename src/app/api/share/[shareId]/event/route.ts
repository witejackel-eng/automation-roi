/**
 * POST /api/share/[shareId]/event — record a share engagement event
 * (view, section_scroll, time_on_page, approval).
 *
 * Public (the opaque shareId IS the access credential — no auth required).
 * Validates the shareId format and checks that the share is not revoked/expired.
 *
 * On the first 'view' event, updates the Share's decisionState from 'sent'
 * to 'viewed' (Phase 2.1).
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

const VALID_EVENT_TYPES = new Set(['view', 'section_scroll', 'time_on_page', 'approval']);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;

  // Validate shareId format — 24 hex chars (same as the share GET route).
  if (!/^[0-9a-f]{24}$/.test(shareId)) {
    return NextResponse.json({ error: 'Invalid share ID format.' }, { status: 400 });
  }

  const share = await db.share.findUnique({
    where: { shareId },
    select: { id: true, revokedAt: true, expiresAt: true, decisionState: true, projectId: true },
  });

  if (!share) {
    return NextResponse.json({ error: 'Share not found.' }, { status: 404 });
  }

  if (share.revokedAt) {
    return NextResponse.json({ error: 'This share link has been revoked.' }, { status: 410 });
  }

  if (share.expiresAt && share.expiresAt < new Date()) {
    return NextResponse.json({ error: 'This share link has expired.' }, { status: 410 });
  }

  let body: {
    eventType?: string;
    section?: string;
    value?: number;
    metadata?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 422 });
  }

  const { eventType, section, value, metadata } = body;

  if (!eventType || !VALID_EVENT_TYPES.has(eventType)) {
    return NextResponse.json(
      { error: `eventType must be one of: ${Array.from(VALID_EVENT_TYPES).join(', ')}` },
      { status: 422 }
    );
  }

  // Look up the organizationId via the project for the share event record.
  const project = await db.project.findUnique({
    where: { id: share.projectId },
    select: { organizationId: true },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  // Create the ShareEvent record.
  const event = await db.shareEvent.create({
    data: {
      shareId: share.id,
      organizationId: project.organizationId,
      eventType,
      section: section ?? null,
      value: value != null ? value : null,
      metadata: metadata != null ? JSON.stringify(metadata) : null,
    },
  });

  // On the first 'view' event, transition the Share's decisionState from 'sent' → 'viewed'.
  if (eventType === 'view' && share.decisionState === 'sent') {
    await db.share.update({
      where: { id: share.id },
      data: { decisionState: 'viewed' },
    });
  }

  return NextResponse.json({ ok: true, eventId: event.id }, { status: 201 });
}

/**
 * POST /api/share/[shareId]/approve — client approval action (Phase 2.2).
 *
 * Public (no auth required — the client does NOT need an account).
 * The opaque shareId is the access credential.
 *
 * Accepts: action ('approve' | 'request_changes'), name (required),
 *          email (optional), comment (optional).
 *
 * Creates a ShareApproval record and updates the Share's decisionState to
 * 'approved' or 'changes_requested'.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

const VALID_ACTIONS = new Set(['approve', 'request_changes']);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;

  // Validate shareId format.
  if (!/^[0-9a-f]{24}$/.test(shareId)) {
    return NextResponse.json({ error: 'Invalid share ID format.' }, { status: 400 });
  }

  // Phase 6 (F-6 fix): PUBLIC route — opaque shareId is the access
  // credential. Sanctioned exception to orgId scoping (Master Spec §45).
  // All subsequent operations (share.update, shareEvent.create) are
  // scoped to this share.id which was resolved from the shareId —
  // no cross-tenant leak is possible because the shareId format
  // (24 hex chars = 12 random bytes) is unguessable.
  const share = await db.share.findUnique({
    where: { shareId },
    select: { id: true, revokedAt: true, expiresAt: true, projectId: true },
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
    action?: string;
    name?: string;
    email?: string;
    comment?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 422 });
  }

  const { action, name, email, comment } = body;

  if (!action || !VALID_ACTIONS.has(action)) {
    return NextResponse.json(
      { error: `action must be one of: ${Array.from(VALID_ACTIONS).join(', ')}` },
      { status: 422 }
    );
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name is required.' }, { status: 422 });
  }

  // Create the ShareApproval record.
  const approval = await db.shareApproval.create({
    data: {
      shareId: share.id,
      action,
      name: name.trim(),
      email: email?.trim() || null,
      comment: comment?.trim() || null,
    },
  });

  // Update the Share's decisionState.
  const decisionState = action === 'approve' ? 'approved' : 'changes_requested';
  await db.share.update({
    where: { id: share.id },
    data: { decisionState },
  });

  // Also record an 'approval' ShareEvent for the engagement timeline.
  const project = await db.project.findUnique({
    where: { id: share.projectId },
    select: { organizationId: true },
  });
  if (project) {
    await db.shareEvent.create({
      data: {
        shareId: share.id,
        organizationId: project.organizationId,
        eventType: 'approval',
        section: null,
        value: null,
        metadata: JSON.stringify({ action, name: name.trim(), approvalId: approval.id }),
      },
    });
  }

  return NextResponse.json({
    ok: true,
    approvalId: approval.id,
    decisionState,
  }, { status: 201 });
}

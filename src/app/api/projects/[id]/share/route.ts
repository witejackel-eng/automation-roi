/**
 * POST /api/projects/[id]/share — create a shareable client-report link.
 *
 * Entitlement: `share_links` (Agency Pro+). The share uses an opaque random
 * `shareId` (never the project id, never the client name) so the URL carries
 * no sensitive data (Master Spec §45, §58).
 *
 * The share is read-only, noindex, and optional expiry. Access can be revoked
 * via DELETE on the same route.
 *
 * Returns: { shareId, url } where `url` is the absolute /r/[shareId] path.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDemoOrganization } from '@/lib/session';
import { getActiveEntitlement, has } from '@/lib/entitlement';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

function generateShareId(): string {
  // 12 bytes → 24 hex chars. Opaque, unguessable, no client data embedded.
  return randomBytes(12).toString('hex');
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const org = await getDemoOrganization();
  const entitlement = await getActiveEntitlement(org.id);
  if (!has(entitlement, 'share_links')) {
    return NextResponse.json(
      {
        error: 'Share links require Agency Pro.',
        requiredTier: 'agency_pro',
      },
      { status: 403 }
    );
  }

  const { id: projectId } = await params;

  // Authorization: the project must belong to the requesting organization.
  // A user must never access another organization's project by modifying an
  // id in the URL (Master Spec §58).
  const project = await db.project.findFirst({
    where: { id: projectId, organizationId: org.id },
    select: { id: true },
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  const shareId = generateShareId();
  const share = await db.share.create({
    data: {
      shareId,
      projectId,
    },
    select: { shareId: true, createdAt: true },
  });

  return NextResponse.json({
    shareId: share.shareId,
    url: `/r/${share.shareId}`,
    createdAt: share.createdAt,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const org = await getDemoOrganization();
  const entitlement = await getActiveEntitlement(org.id);
  if (!has(entitlement, 'share_links')) {
    return NextResponse.json(
      { error: 'Share links require Agency Pro.' },
      { status: 403 }
    );
  }

  const { id: projectId } = await params;

  // Authorization: verify the project belongs to the requesting organization
  // to prevent IDOR — a user must not revoke shares on another org's project.
  const project = await db.project.findFirst({
    where: { id: projectId, organizationId: org.id },
    select: { id: true },
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 403 });
  }

  // Revoke all shares for this project (set revokedAt).
  await db.share.updateMany({
    where: { projectId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

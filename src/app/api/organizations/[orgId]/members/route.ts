/**
 * GET  /api/organizations/[orgId]/members — list memberships with user details.
 * POST /api/organizations/[orgId]/members — invite a member (requires owner role).
 *
 * Both require auth + org membership. POST additionally requires the
 * requesting user to have the 'owner' role on this org.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const auth = await requireAuth();
    const { orgId } = await params;

    // Ensure the user belongs to this org.
    if (auth.organizationId !== orgId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const memberships = await db.membership.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      members: memberships.map((m) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.createdAt,
        user: m.user,
      })),
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const auth = await requireAuth();
    const { orgId } = await params;

    // Ensure the user belongs to this org and is an owner.
    if (auth.organizationId !== orgId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }
    if (auth.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only organization owners can invite members.' },
        { status: 403 },
      );
    }

    let body: { email: string; role?: string };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 422 },
      );
    }

    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 422 },
      );
    }

    const role = body.role === 'owner' ? 'owner' : 'member';

    // Look up the target user by email.
    const targetUser = await db.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'No account found with that email address.' },
        { status: 404 },
      );
    }

    // Check for existing membership (idempotent).
    const existing = await db.membership.findUnique({
      where: { userId_organizationId: { userId: targetUser.id, organizationId: orgId } },
    });
    if (existing) {
      return NextResponse.json({
        id: existing.id,
        userId: targetUser.id,
        email: body.email,
        role: existing.role,
        joinedAt: existing.createdAt,
        alreadyMember: true,
      });
    }

    const membership = await db.membership.create({
      data: {
        userId: targetUser.id,
        organizationId: orgId,
        role,
      },
    });

    return NextResponse.json(
      {
        id: membership.id,
        userId: targetUser.id,
        email: body.email,
        role: membership.role,
        joinedAt: membership.createdAt,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

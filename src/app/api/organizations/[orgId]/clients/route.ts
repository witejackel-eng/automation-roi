/**
 * GET  /api/organizations/[orgId]/clients — list clients with case count.
 * POST /api/organizations/[orgId]/clients — create a new client.
 *
 * Both require auth + org membership.
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

    const clients = await db.client.findMany({
      where: { organizationId: orgId },
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      clients: clients.map((c) => ({
        id: c.id,
        name: c.name,
        industry: c.industry,
        defaultAssumptions: c.defaultAssumptions,
        projectCount: c._count.projects,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
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

    // Ensure the user belongs to this org.
    if (auth.organizationId !== orgId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    let body: {
      name?: string;
      industry?: string;
      defaultAssumptions?: unknown;
    };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 422 },
      );
    }

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Client name is required.' },
        { status: 422 },
      );
    }

    const client = await db.client.create({
      data: {
        organizationId: orgId,
        name: body.name.trim(),
        industry: body.industry?.trim() || null,
        defaultAssumptions: body.defaultAssumptions ?? undefined,
      },
    });

    return NextResponse.json(
      {
        id: client.id,
        name: client.name,
        industry: client.industry,
        defaultAssumptions: client.defaultAssumptions,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
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

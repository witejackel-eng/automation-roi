/**
 * GET /api/projects/[id]/versions — return CaseVersion history for a project.
 *
 * Newest first. Requires auth + project ownership (via org).
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { tenant } from '@/lib/tenant';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const org = await requireOrg();
    const { id } = await params;

    // Verify the project belongs to this org.
    const project = await tenant(org.id).projects.findUnique({ id });
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const versions = await db.caseVersion.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        inputHash: true,
        verdict: true,
        confidenceScore: true,
        createdBy: true,
        source: true,
        parentVersionId: true,
      },
    });

    return NextResponse.json({ versions });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

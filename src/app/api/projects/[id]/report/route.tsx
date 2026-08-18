/**
 * POST /api/projects/[id]/report — render + store the client report PDF.
 *
 * Renders via the deterministic @react-pdf/renderer pipeline and stores the
 * PDF blob in /public/reports/{projectId}-{reportId}.pdf so the URL is
 * resolvable from the live app. Records a Report row.
 *
 * @react-pdf/renderer is dynamically imported inside the handler so the heavy
 * PDF dependency tree is never loaded into the dev-server's memory unless a
 * report is actually being generated.
 */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { db } from '@/lib/db';
import { getDemoOrganization } from '@/lib/session';
import { getActiveEntitlement, has } from '@/lib/entitlement';
import { recommend } from '@/lib/calculations/recommendation';
import type { CalculatorInputs, ScenarioResult } from '@/lib/calculations/engine';
import type { ScenarioName } from '@/lib/calculations/scenarios';

export const runtime = 'nodejs';

const REPORTS_DIR = path.join(process.cwd(), 'public', 'reports');

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getDemoOrganization();
  const entitlement = await getActiveEntitlement(org.id);
  if (!has(entitlement, 'client_report')) {
    return NextResponse.json(
      { error: 'Client report generation requires Pro or higher.', requiredTier: 'pro' },
      { status: 403 }
    );
  }

  const project = await db.project.findUnique({ where: { id } });
  if (!project || project.organizationId !== org.id) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  let body: { implementationApproach?: string } = {};
  try {
    body = (await req.json().catch(() => ({}))) as { implementationApproach?: string };
  } catch {
    /* allow empty body */
  }

  let inputs: CalculatorInputs;
  let results: Record<ScenarioName, ScenarioResult>;
  try {
    inputs = JSON.parse(project.inputs) as CalculatorInputs;
    results = JSON.parse(project.results) as Record<ScenarioName, ScenarioResult>;
  } catch {
    return NextResponse.json({ error: 'Project data is corrupted.' }, { status: 500 });
  }

  const recommendation = recommend(results.expected);
  const agencyTierCanBrand = has(entitlement, 'agency_branding');
  const branding = agencyTierCanBrand
    ? {
        name: org.name,
        website: org.website ?? undefined,
        contactEmail: org.contactEmail ?? undefined,
        phone: org.phone ?? undefined,
        logoUrl: org.logoUrl ?? undefined,
        brandColorHex: org.brandColorHex ?? undefined,
      }
    : null;

  let pdfBuffer: Buffer;
  try {
    // Dynamic import: keeps @react-pdf/renderer out of the dev-server's
    // resident memory until a report is actually requested.
    const { renderToBuffer } = await import('@react-pdf/renderer');
    const { ClientReport } = await import('@/lib/pdf/client-report');
    const { registerFonts } = await import('@/lib/pdf/fonts');
    registerFonts();
    pdfBuffer = await renderToBuffer(
      <ClientReport
        inputs={inputs}
        results={results}
        recommendation={recommendation}
        branding={branding}
        agencyTierCanBrand={agencyTierCanBrand}
        generatedAt={new Date()}
      />
    );
  } catch (err) {
    console.error('PDF render failed:', err);
    return NextResponse.json({ error: 'Could not render the report.' }, { status: 500 });
  }

  await fs.mkdir(REPORTS_DIR, { recursive: true });
  const fileName = `${id}-report-${Date.now()}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);
  await fs.writeFile(filePath, pdfBuffer);

  const report = await db.report.create({
    data: {
      projectId: id,
      reportType: 'client_report',
      pdfUrl: `/reports/${fileName}`,
    },
  });

  return NextResponse.json({
    id: report.id,
    pdfUrl: report.pdfUrl,
    createdAt: report.createdAt,
  });
}

/**
 * POST /api/projects/[id]/report — render + store the client report PDF.
 *
 * Renders via the deterministic @react-pdf/renderer pipeline and stores the
 * PDF using the storage abstraction (Vercel Blob in production, local FS in
 * dev). Records a Report row with the persistent URL.
 *
 * @react-pdf/renderer is dynamically imported inside the handler so the heavy
 * PDF dependency tree is never loaded into the dev-server's memory unless a
 * report is actually being generated.
 */
import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { db } from '@/lib/db';
import { requireOrg, AuthError } from '@/lib/session';
import { tenant, getOrgEntitlement } from '@/lib/tenant';
import { has } from '@/lib/entitlement';
import { recommend } from '@/lib/calculations/recommendation';
import { storePdf } from '@/lib/storage';
import type { CalculatorInputs, ScenarioResult } from '@/lib/calculations/engine';
import type { ScenarioName } from '@/lib/calculations/scenarios';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
  const org = await requireOrg();
  const entitlement = await getOrgEntitlement(org.id);
  if (!has(entitlement, 'client_report')) {
    return NextResponse.json(
      { error: 'Client report generation requires Pro or higher.', requiredTier: 'case_pack' },
      { status: 403 }
    );
  }

  const project = await tenant(org.id).projects.findUnique({ id });
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  try { await req.json().catch(() => ({})); } catch { /* allow empty body */ }

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
    // Output-integrity guard (Prompt 3, Task 3.1): the values passed to the
    // PDF renderer MUST be exactly what is persisted — never a fresh
    // recalculation.
    const persistedResultsCheck = JSON.parse(project.results) as typeof results;
    if (JSON.stringify(persistedResultsCheck) !== JSON.stringify(results)) {
      const { logSystemEvent } = await import('@/lib/observability/system-event');
      await logSystemEvent({
        eventType: 'OUTPUT_INTEGRITY_VIOLATION',
        organizationId: org.id,
        severity: 'error',
        metadata: { projectId: id, route: 'report' },
      });
      return NextResponse.json({ error: 'Internal error: output integrity check failed.' }, { status: 500 });
    }
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

  const fileName = `${id}-report-${Date.now()}.pdf`;
  const stored = await storePdf(fileName, pdfBuffer);

  const report = await db.report.create({
    data: {
      projectId: id,
      reportType: 'client_report',
      pdfUrl: stored.url,
    },
  });

  return NextResponse.json({
    id: report.id,
    pdfUrl: report.pdfUrl,
    createdAt: report.createdAt,
  });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

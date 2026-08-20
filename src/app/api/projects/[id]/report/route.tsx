/**
 * POST /api/projects/[id]/report — generate + store the client business-case PDF.
 *
 * Entitlement: `client_report` (Pro+). Superadmin bypasses via
 * getEffectiveEntitlement.
 *
 * Re-derives the results from the stored inputs (never trusts stored
 * results — single source of truth via the calculation engine), renders
 * the PDF via @react-pdf/renderer, stores it via storePdf(), creates a
 * Report record, and returns { pdfUrl }.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { tenant } from '@/lib/tenant';
import { getEffectiveEntitlement } from '@/lib/entitlement-session';
import { has } from '@/lib/entitlement';
import { calculateAllScenarios } from '@/lib/calculations/engine';
import { recommend } from '@/lib/calculations/recommendation';
import { storePdf } from '@/lib/storage';
import { ClientReport } from '@/lib/pdf/client-report';
import type { CalculatorInputs } from '@/lib/calculations/engine';
import { renderToBuffer } from '@react-pdf/renderer';
import * as React from 'react';

export const runtime = 'nodejs';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await requireOrg();
    const entitlement = await getEffectiveEntitlement(org.id);
    if (!has(entitlement, 'client_report')) {
      return NextResponse.json(
        { error: 'Client report requires Pro or higher.', requiredTier: 'pro' },
        { status: 403 }
      );
    }

    const { id: projectId } = await params;
    const project = await tenant(org.id).projects.findUnique({ id: projectId });
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Re-derive from stored inputs — single source of truth.
    const inputs = JSON.parse(project.inputs) as CalculatorInputs;
    const results = calculateAllScenarios(inputs);
    const recommendation = recommend(results.expected);

    // Branding: Agency+ can use org branding; Pro gets unwatermarked Viableo.
    const canBrand = entitlement.capabilities.agency_branding;
    const branding = canBrand
      ? { name: org.name, logoUrl: org.logoUrl ?? undefined, brandColorHex: org.brandColorHex ?? undefined }
      : null;

    const fileName = `client-report-${projectId}-${Date.now()}.pdf`;

    const buffer = await renderToBuffer(
      <ClientReport
        inputs={inputs}
        results={results}
        recommendation={recommendation}
        branding={branding}
        agencyTierCanBrand={canBrand}
        generatedAt={new Date()}
      />
    );

    const stored = await storePdf(fileName, buffer as unknown as Buffer);

    // Create Report record (tenant reports.create takes { data, projectId }).
    await tenant(org.id).reports.create({
      data: {
        reportType: 'client_report',
        pdfUrl: stored.url,
      },
      projectId,
    });

    return NextResponse.json({ pdfUrl: stored.url });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/projects/report]', err);
    return NextResponse.json(
      { error: 'Failed to generate the report.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/report — generate + store the client business-case PDF.
 *
 * Entitlement (canonical two-tier model):
 *   Starter ($0) — can generate, but the PDF is watermarked "for evaluation".
 *   Pro ($49)    — clean, unwatermarked PDF + agency branding when configured.
 *   Superadmin   — bypasses via getEffectiveEntitlement (returns Pro).
 *
 * Re-derives the results from the stored inputs (never trusts stored
 * results — single source of truth via the calculation engine), renders
 * the PDF via @react-pdf/renderer, stores it via storePdf(), creates a
 * Report record, and returns { pdfUrl, watermarked }.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg, AuthError } from '@/lib/session';
import { tenant } from '@/lib/tenant';
import { getEffectiveEntitlement } from '@/lib/entitlement-session';
import { calculateAllScenarios } from '@/lib/calculations/engine';
import { recommend } from '@/lib/calculations/recommendation';
import { storePdf } from '@/lib/storage';
import { ClientReport } from '@/lib/pdf/client-report';
import { shouldWatermark } from '@/lib/pdf/watermark';
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

    const { id: projectId } = await params;
    const project = await tenant(org.id).projects.findUnique({ id: projectId });
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Re-derive from stored inputs — single source of truth.
    const inputs = JSON.parse(project.inputs) as CalculatorInputs;
    const results = calculateAllScenarios(inputs);
    const recommendation = recommend(results.expected);

    // Branding: Pro (or superadmin) can use org branding; Starter gets Viableo default.
    const canBrand = entitlement.capabilities.agency_branding;
    const branding = canBrand
      ? { name: org.name, website: org.website ?? undefined, contactEmail: org.contactEmail ?? undefined, phone: org.phone ?? undefined, logoUrl: org.logoUrl ?? undefined, brandColorHex: org.brandColorHex ?? undefined }
      : null;

    // Watermark: Starter-tier PDFs are watermarked "for evaluation"; Pro is clean.
    const watermarked = shouldWatermark(entitlement.tier);

    const fileName = `client-report-${projectId}-${Date.now()}.pdf`;

    const buffer = await renderToBuffer(
      <ClientReport
        inputs={inputs}
        results={results}
        recommendation={recommendation}
        branding={branding}
        agencyTierCanBrand={canBrand}
        generatedAt={new Date()}
        watermark={watermarked}
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

    return NextResponse.json({ pdfUrl: stored.url, watermarked });
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

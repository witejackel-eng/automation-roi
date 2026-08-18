/**
 * /r/[shareId] — the shared client-report page (Master Spec §45).
 *
 * NOINDEX (private). Uses an opaque random shareId — no client name, no
 * project id, no sensitive data in the URL.
 *
 * Server component: fetches the share data server-side (so the page renders
 * even if the client has JS disabled for the first paint), then passes it
 * to the client <ShareReportView> for the interactive scenario slider +
 * CountUp.
 *
 * Read-only. No internal agency notes. No edit/save actions.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import type { CalculatorInputs, ScenarioResult, Recommendation } from '@/lib/calculations/engine';
import type { ScenarioName } from '@/lib/calculations/scenarios';
import { ShareReportView } from '@/components/views/share-report-view';
import { COMPANY_NAME } from '@/lib/brand';

export const dynamic = 'force-dynamic';

// NOINDEX — private client reports must never be indexed (Master Spec §10).
export const metadata: Metadata = {
  title: 'Shared analysis',
  description: 'A shared Viableo automation business case.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title: `${COMPANY_NAME} — Shared analysis`,
    description: 'A shared automation business case.',
  },
};

export default async function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const share = await db.share.findUnique({
    where: { shareId },
    include: {
      project: {
        select: {
          clientName: true,
          inputs: true,
          results: true,
          recommendation: true,
          organization: {
            select: {
              name: true,
              website: true,
              brandColorHex: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!share || share.revokedAt || (share.expiresAt && share.expiresAt < new Date())) {
    notFound();
  }

  let inputs: CalculatorInputs;
  let results: Record<ScenarioName, ScenarioResult>;
  try {
    inputs = JSON.parse(share.project.inputs) as CalculatorInputs;
    results = JSON.parse(share.project.results) as Record<ScenarioName, ScenarioResult>;
  } catch {
    notFound();
  }

  const recommendation = share.project.recommendation as Recommendation;

  return (
    <ShareReportView
      shareId={share.shareId}
      createdAt={share.createdAt.toISOString()}
      clientName={share.project.clientName}
      agency={share.project.organization}
      inputs={inputs}
      results={results}
      recommendation={recommendation}
    />
  );
}

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

// A valid shareId is a 24-hex string (12 random bytes). Validate the
// format BEFORE touching the database so an obviously-invalid path like
// /r/example short-circuits to a clean 404 instead of hitting the DB
// (and potentially 500ing on a Prisma coercion error). Matches the
// hardening in src/app/api/share/[shareId]/route.ts.
const SHARE_ID_RE = /^[0-9a-f]{24}$/;

function ShareUnavailable() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', gap: '1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>This link is no longer available</h1>
      <p style={{ maxWidth: '32rem', opacity: 0.75 }}>
        This shared analysis has been revoked, has expired, or never existed. If you were expecting to see something here, ask the person who shared it with you for a new link.
      </p>
    </div>
  );
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  if (!SHARE_ID_RE.test(shareId)) {
    return <ShareUnavailable />;
  }

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
    return <ShareUnavailable />;
  }

  let inputs: CalculatorInputs;
  let results: Record<ScenarioName, ScenarioResult>;
  try {
    inputs = JSON.parse(share.project.inputs) as CalculatorInputs;
    results = JSON.parse(share.project.results) as Record<ScenarioName, ScenarioResult>;
  } catch {
    return <ShareUnavailable />;
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

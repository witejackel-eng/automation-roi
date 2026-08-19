/**
 * Proposal PDF (Section 17). Shorter than the client report:
 *   1. Cover
 *   2. Business Challenge
 *   3. Proposed Solution
 *   4. Expected Outcome (KPI row)
 *   5. Investment
 *   6. ROI & Payback
 *   7. Implementation Approach (editable; placeholder if blank)
 *   8. Next Steps (3 bullets, editable)
 *
 * Never fabricate technical detail the user did not provide — the
 * "Implementation Approach" is left as an editable placeholder if blank.
 */
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  PDF_COLORS,
  PDF_SANS,
  PDF_DISPLAY,
  PDF_MONO,
  PDF_STYLES,
  PAGE_MARGIN,
  brandColor,
  pdfCurrency,
  pdfPayback,
  pdfRoi,
  pdfRatioAsPercent,
  pdfCount,
} from './shared';
import { PdfVerdictStamp } from './verdict-stamp';
import type { CalculatorInputs, ScenarioResult } from '@/lib/calculations/engine';
import type { Branding } from './shared';
import { recommend } from '@/lib/calculations/recommendation';

const styles = StyleSheet.create({
  ...PDF_STYLES,
  sectionTitle: { fontFamily: PDF_DISPLAY, fontWeight: 600, fontSize: 16, color: PDF_COLORS.ink, marginBottom: 8 },
  kpiLabel: { fontFamily: PDF_SANS, fontSize: 8, color: PDF_COLORS.inkMuted, letterSpacing: 1, marginBottom: 2 },
  kpiValue: { fontFamily: PDF_MONO, fontSize: 16, color: PDF_COLORS.ink },
  kpiCard: { flex: 1, borderWidth: 1, borderColor: PDF_COLORS.border, borderRadius: 4, padding: 10 },
} as Record<string, any>);

interface ProposalProps {
  inputs: CalculatorInputs;
  results: Record<'conservative' | 'expected' | 'upside', ScenarioResult>;
  recommendation: ReturnType<typeof recommend>;
  branding: Branding | null;
  agencyTierCanBrand: boolean;
  generatedAt: Date;
  implementationApproach?: string;
  nextSteps?: string[];
}

export function Proposal({
  inputs,
  results,
  recommendation,
  branding,
  agencyTierCanBrand,
  generatedAt,
  implementationApproach,
  nextSteps,
}: ProposalProps) {
  const expected = results.expected;
  const brand = agencyTierCanBrand && branding ? brandColor(branding) : PDF_COLORS.brand;
  const agencyName = branding?.name ?? 'Viableo';
  const formattedDate = generatedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const approachText =
    implementationApproach && implementationApproach.trim().length > 0
      ? implementationApproach.trim()
      : '[Describe the implementation approach — discovery, build, integration, handover. Replace this placeholder with your own scope before sending.]';

  const steps =
    nextSteps && nextSteps.filter((s) => s.trim().length > 0).length > 0
      ? nextSteps.filter((s) => s.trim().length > 0).slice(0, 3)
      : [
          'Approve the engagement and confirm the implementation fee.',
          'Schedule a kickoff to validate the assumptions in this proposal against live operating data.',
          'Begin the build against the agreed milestones.',
        ];

  return (
    <Document
      title={`${inputs.clientName} — Viableo Proposal`}
      author={agencyName}
      subject="Viableo Proposal"
    >
      {/* Page 1 — Cover */}
      <Page size="LETTER" style={styles.page}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontFamily: PDF_DISPLAY, fontWeight: 700, fontSize: 16, color: PDF_COLORS.ink }}>
            {agencyName}
          </Text>
        </View>
        <View style={{ height: 4, width: '100%', backgroundColor: brand, marginBottom: 28 }} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontFamily: PDF_DISPLAY, fontWeight: 700, fontSize: 32, color: PDF_COLORS.ink }}>
            Automation Proposal
          </Text>
          <Text style={{ fontFamily: PDF_SANS, fontSize: 12, color: PDF_COLORS.inkMuted, marginTop: 8 }}>
            {inputs.clientName}
          </Text>
          <View style={{ marginTop: 28 }}>
            <Text style={{ fontFamily: PDF_SANS, fontSize: 9, color: PDF_COLORS.inkMuted, letterSpacing: 1, marginBottom: 4 }}>PREPARED BY</Text>
            <Text style={{ fontFamily: PDF_SANS, fontSize: 11, color: PDF_COLORS.ink }}>{agencyName}</Text>
            {branding?.contactEmail ? (
              <Text style={{ fontFamily: PDF_SANS, fontSize: 10, color: PDF_COLORS.inkMuted, marginTop: 2 }}>{branding.contactEmail}</Text>
            ) : null}
            <Text style={{ fontFamily: PDF_SANS, fontSize: 10, color: PDF_COLORS.inkMuted, marginTop: 6 }}>{formattedDate}</Text>
          </View>
        </View>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 8, color: PDF_COLORS.inkFaint }}>
          Proposal. Figures are estimates based on assumptions and have not been independently audited.
        </Text>
        <PageFooter agency={agencyName} page={1} total={3} />
      </Page>

      {/* Page 2 — Challenge / Solution / Outcome / Investment / ROI */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Business Challenge</Text>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 11, color: PDF_COLORS.ink, lineHeight: 1.55, marginBottom: 14 }}>
          {inputs.clientName} currently operates the target task with {pdfCount(inputs.employeesAffected)} employees spending {inputs.hoursPerWeek} hours per week each, at {pdfCurrency(inputs.hourlyCost)}/hr. The annual labor cost of this task is {pdfCurrency(expected.annualLaborCost)}. Conversion improvement and error reduction are additional levers the proposed automation is expected to influence.
        </Text>

        <Text style={styles.sectionTitle}>Proposed Solution</Text>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 11, color: PDF_COLORS.ink, lineHeight: 1.55, marginBottom: 14 }}>
          An AI automation expected to handle {pdfRatioAsPercent(expected.automationPct, 1)} of the current workload, with a {expected.conversionImprovementPct > 0 ? `${(expected.conversionImprovementPct * 100).toFixed(1)}pp` : '0pp'} lift in conversion. First-year cost is {pdfCurrency(expected.totalFirstYearCost)}, comprised of a one-time implementation fee and recurring AI/API, software, and operational costs.
        </Text>

        <Text style={styles.sectionTitle}>Expected Outcome</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>NET ANNUAL BENEFIT</Text>
            <Text style={styles.kpiValue}>{pdfCurrency(expected.netAnnualBenefit, { compact: true })}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>PAYBACK</Text>
            <Text style={styles.kpiValue}>{pdfPayback(expected.paybackMonths)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>ROI</Text>
            <Text style={styles.kpiValue}>{pdfRoi(expected.roiPct)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Investment</Text>
        <View style={{ borderTopWidth: 0.5, borderTopColor: PDF_COLORS.border, marginBottom: 14 }}>
          {[
            ['Implementation fee (one-time)', pdfCurrency(inputs.implementationFee)],
            ['Monthly AI/API cost', pdfCurrency(inputs.monthlyAiApiCost)],
            ['Monthly software/tool cost', pdfCurrency(inputs.monthlySoftwareCost)],
            ['Other annual cost', pdfCurrency(inputs.otherAnnualCost)],
            ['Total first-year cost', pdfCurrency(expected.totalFirstYearCost)],
          ].map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0.5, borderBottomColor: PDF_COLORS.border, paddingVertical: 4 }}>
              <Text style={{ fontFamily: PDF_SANS, fontSize: 10, color: PDF_COLORS.ink }}>{r[0]}</Text>
              <Text style={{ fontFamily: PDF_MONO, fontSize: 10, color: PDF_COLORS.ink }}>{r[1]}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>ROI &amp; Payback</Text>
        <View style={{ marginTop: 6, marginBottom: 8 }}>
          <PdfVerdictStamp
            recommendation={recommendation.recommendation}
            paybackMonths={expected.paybackMonths}
            netAnnualBenefit={expected.netAnnualBenefit}
            brandHex={brand}
            size="md"
          />
        </View>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 11, color: PDF_COLORS.ink, lineHeight: 1.55 }}>
          {recommendation.copy}
        </Text>

        <PageFooter agency={agencyName} page={2} total={3} />
      </Page>

      {/* Page 3 — Implementation Approach + Next Steps */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Implementation Approach</Text>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 11, color: PDF_COLORS.ink, lineHeight: 1.6, marginBottom: 16 }}>
          {approachText}
        </Text>

        <Text style={styles.sectionTitle}>Next Steps</Text>
        {steps.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 6 }}>
            <Text style={{ fontFamily: PDF_SANS, fontSize: 11, color: PDF_COLORS.inkMuted, marginRight: 8 }}>{i + 1}.</Text>
            <Text style={{ fontFamily: PDF_SANS, fontSize: 11, color: PDF_COLORS.ink, flex: 1 }}>{s}</Text>
          </View>
        ))}

        <Text style={styles.disclaimer}>
          Figures are estimates based on assumptions provided by {agencyName} and its client and have not been independently audited. Validate against actual operating data before finalizing investment decisions.
        </Text>
        <PageFooter agency={agencyName} page={3} total={3} />
      </Page>
    </Document>
  );
}

function PageFooter({ agency, page, total }: { agency: string; page: number; total: number }) {
  return (
    <View style={{ position: 'absolute', bottom: 28, left: PAGE_MARGIN, right: PAGE_MARGIN }} fixed>
      <View style={{ height: 0.5, backgroundColor: PDF_COLORS.border, marginBottom: 6 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 8, color: PDF_COLORS.inkFaint }}>
          Prepared by {agency}
        </Text>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 8, color: PDF_COLORS.inkFaint }}>
          Page {page} of {total}
        </Text>
      </View>
    </View>
  );
}

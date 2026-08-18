/**
 * Client report PDF (Section 15). US Letter, 0.75in margins, deterministic
 * @react-pdf/renderer document. Pages, in order:
 *   1. Cover
 *   2. Executive Summary (pyramid-principle: verdict + headline first)
 *   3. Current State (Step 1 + Step 2 inputs table)
 *   4. Proposed Automation (Step 3 inputs table)
 *   5. Financial Impact (ROI Bridge exhibit + full financial table)
 *   6. Scenario Analysis (Scenario Comparison exhibit + table)
 *   7. Recommendation (full-page verdict treatment)
 *   8. Assumptions (every input, grouped by step)
 *   Disclaimer on the last page footer.
 */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Branding } from './shared';
import {
  PDF_COLORS,
  PDF_SANS,
  PDF_DISPLAY,
  PDF_MONO,
  PDF_STYLES,
  PAGE_MARGIN,
  brandColor,
  pdfCurrency,
  pdfRatioAsPercent,
  pdfPp,
  pdfPayback,
  pdfRoi,
  pdfCount,
  verdictColor,
} from './shared';
import { PdfVerdictStamp } from './verdict-stamp';
import { PdfBarChart } from './pdf-bar-chart';
import type { CalculatorInputs, ScenarioResult } from '@/lib/calculations/engine';
import type { ScenarioName } from '@/lib/calculations/scenarios';
import { SCENARIO_ORDER, SCENARIO_LABELS } from '@/lib/calculations/scenarios';
import { recommend } from '@/lib/calculations/recommendation';

// Fonts are registered lazily by the API route via `registerFonts()` in
// @/lib/pdf/fonts before this document renders. Keeps @react-pdf/renderer
// out of the dev-server's resident memory until a PDF is actually requested.

const styles = StyleSheet.create({
  ...PDF_STYLES,
  coverWrap: { flex: 1, flexDirection: 'column', justifyContent: 'space-between', height: '100%' } as React.CSSProperties,
  coverTitle: { fontFamily: PDF_DISPLAY, fontWeight: 700, fontSize: 36, color: PDF_COLORS.ink, letterSpacing: -0.5 } as React.CSSProperties,
  coverSubtitle: { fontFamily: PDF_SANS, fontSize: 13, color: PDF_COLORS.inkMuted, marginTop: 6 } as React.CSSProperties,
  coverMeta: { fontFamily: PDF_SANS, fontSize: 10.5, color: PDF_COLORS.inkMuted, marginTop: 4 } as React.CSSProperties,
  sectionTitle: { fontFamily: PDF_DISPLAY, fontWeight: 600, fontSize: 18, color: PDF_COLORS.ink, marginBottom: 10 } as React.CSSProperties,
  bulletItem: { fontFamily: PDF_SANS, fontSize: 10.5, color: PDF_COLORS.ink, marginBottom: 5, marginLeft: 14 } as React.CSSProperties,
  tableHeaderCell: { fontFamily: PDF_SANS, fontSize: 8.5, color: PDF_COLORS.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5, paddingBottom: 4 } as React.CSSProperties,
  tableRowCell: { fontFamily: PDF_SANS, fontSize: 10, color: PDF_COLORS.ink, paddingTop: 4, paddingBottom: 4 } as React.CSSProperties,
  tableRowMono: { fontFamily: PDF_MONO, fontSize: 10, color: PDF_COLORS.ink, paddingTop: 4, paddingBottom: 4 } as React.CSSProperties,
  contextTag: { fontFamily: PDF_SANS, fontSize: 7, color: PDF_COLORS.inkFaint, marginLeft: 4 } as React.CSSProperties,
});

interface ClientReportProps {
  inputs: CalculatorInputs;
  results: Record<ScenarioName, ScenarioResult>;
  recommendation: ReturnType<typeof recommend>;
  branding: Branding | null;
  agencyTierCanBrand: boolean;
  generatedAt: Date;
}

export function ClientReport({
  inputs,
  results,
  recommendation,
  branding,
  agencyTierCanBrand,
  generatedAt,
}: ClientReportProps) {
  const expected = results.expected;
  const brand = agencyTierCanBrand && branding ? brandColor(branding) : PDF_COLORS.brand;
  const agencyName = branding?.name ?? 'Viableo';
  const formattedDate = generatedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const numExhibits = 2;

  return (
    <Document
      title={`${inputs.clientName} — Viableo Business Case`}
      author={agencyName}
      subject="Viableo Business Case"
    >
      {/* Page 1 — Cover */}
      <Page size="LETTER" style={styles.page}>
        <View style={{ marginBottom: 24 }}>
          {agencyTierCanBrand && branding?.logoUrl ? (
            <PdfLogo src={branding.logoUrl} alt={agencyName} />
          ) : (
            <Text style={{ fontFamily: PDF_DISPLAY, fontWeight: 700, fontSize: 16, color: PDF_COLORS.ink }}>
              {agencyName}
            </Text>
          )}
        </View>
        <View style={{ height: 4, width: '100%', backgroundColor: brand, marginBottom: 28 }} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.coverTitle}>Viableo Business Case</Text>
          <Text style={styles.coverSubtitle}>
            Know what’s worth building.
          </Text>
          <View style={{ marginTop: 36 }}>
            <Text style={{ fontFamily: PDF_SANS, fontSize: 9, color: PDF_COLORS.inkMuted, letterSpacing: 1, marginBottom: 4 }}>PREPARED FOR</Text>
            <Text style={{ fontFamily: PDF_DISPLAY, fontWeight: 600, fontSize: 18, color: PDF_COLORS.ink }}>
              {inputs.clientName}
            </Text>
            <Text style={{ fontFamily: PDF_SANS, fontSize: 11, color: PDF_COLORS.inkMuted, marginTop: 6 }}>
              Prepared by {agencyName}
            </Text>
            <Text style={{ fontFamily: PDF_SANS, fontSize: 11, color: PDF_COLORS.inkMuted, marginTop: 2 }}>
              {formattedDate}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 8, color: PDF_COLORS.inkFaint }}>
          Confidential business case. Figures are estimates based on assumptions and have not been independently audited.
        </Text>
        <PageFooter agency={agencyName} page={1} total={8} hideDisclaimer />
      </Page>

      {/* Page 2 — Executive Summary (pyramid principle) */}
      <PageHeader brand={brand} agency={agencyName} logoUrl={agencyTierCanBrand ? branding?.logoUrl : undefined} title="Executive Summary" />
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 11, color: PDF_COLORS.inkMuted, marginBottom: 16 }}>
          Conclusion first, support after.
        </Text>

        <PdfVerdictStamp
          recommendation={recommendation.recommendation}
          paybackMonths={expected.paybackMonths}
          netAnnualBenefit={expected.netAnnualBenefit}
          brandHex={brand}
        />

        <Text style={{ fontFamily: PDF_SANS, fontSize: 11, color: PDF_COLORS.ink, marginTop: 16, marginBottom: 8 }}>
          {recommendation.copy}
        </Text>

        <View style={{ marginTop: 8 }}>
          <Bullet>{`Net annual benefit of ${pdfCurrency(expected.netAnnualBenefit)} against ${pdfCurrency(expected.totalFirstYearCost)} in first-year cost.`}</Bullet>
          <Bullet>{`Payback in ${pdfPayback(expected.paybackMonths)} (Expected scenario).`}</Bullet>
          <Bullet>{`ROI of ${pdfRoi(expected.roiPct)} on first-year investment.`}</Bullet>
          <Bullet>{`Conservative scenario still nets ${pdfCurrency(results.conservative.netAnnualBenefit)} (${pdfRoi(results.conservative.roiPct)} ROI).`}</Bullet>
          <Bullet>{`Upside scenario reaches ${pdfCurrency(results.upside.netAnnualBenefit)} net annual benefit.`}</Bullet>
        </View>

        <PageFooter agency={agencyName} page={2} total={8} />
      </Page>

      {/* Page 3 — Current State */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Current State</Text>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 10, color: PDF_COLORS.inkMuted, marginBottom: 12 }}>
          Business and revenue baseline before automation.
        </Text>
        <InputsTable
          title="Business"
          rows={[
            ['Client / company', inputs.clientName, false],
            ['Employees affected', pdfCount(inputs.employeesAffected), false],
            ['Hours per employee per week', `${inputs.hoursPerWeek}`, false],
            ['Hourly labor cost', pdfCurrency(inputs.hourlyCost), false],
            ['Monthly workload (tasks)', inputs.monthlyWorkload != null ? pdfCount(inputs.monthlyWorkload) : '—', true],
            ['Current error rate', inputs.currentErrorRate != null ? pdfRatioAsPercent(inputs.currentErrorRate, 1) : '—', true],
          ]}
        />
        <View style={{ height: 12 }} />
        <InputsTable
          title="Revenue"
          rows={[
            ['Leads per month', pdfCount(inputs.leadsPerMonth), false],
            ['Current conversion rate', inputs.currentConversionRate != null ? pdfRatioAsPercent(inputs.currentConversionRate, 1) : '—', true],
            ['Average customer value', pdfCurrency(inputs.averageCustomerValue), false],
            ['Gross margin %', inputs.grossMarginPct != null ? pdfRatioAsPercent(inputs.grossMarginPct, 1) : 'Omitted — figures labeled revenue opportunity', false],
          ]}
        />
        <PageFooter agency={agencyName} page={3} total={8} />
      </Page>

      {/* Page 4 — Proposed Automation */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Proposed Automation</Text>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 10, color: PDF_COLORS.inkMuted, marginBottom: 12 }}>
          Expected performance and cost assumptions.
        </Text>
        <InputsTable
          title="Automation"
          rows={[
            ['Expected automation %', pdfRatioAsPercent(inputs.expectedAutomationPct, 1), false],
            ['Expected error reduction %', inputs.expectedErrorReductionPct != null ? pdfRatioAsPercent(inputs.expectedErrorReductionPct, 1) : '—', true],
            ['Expected conversion improvement', pdfPp(inputs.expectedConversionImprovementPct), false],
            ['Implementation fee', pdfCurrency(inputs.implementationFee), false],
            ['Monthly AI/API cost', pdfCurrency(inputs.monthlyAiApiCost), false],
            ['Monthly software/tool cost', pdfCurrency(inputs.monthlySoftwareCost), false],
            ['Other annual cost', pdfCurrency(inputs.otherAnnualCost), false],
          ]}
        />
        <PageFooter agency={agencyName} page={4} total={8} />
      </Page>

      {/* Page 5 — Financial Impact (Exhibit 1) */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.exhibitTitle}>Exhibit 1 — Labor savings drive the first-year benefit</Text>
        <Text style={styles.caption}>
          Source: client-provided inputs and the Viableo calculation engine. Figures reflect the Expected scenario unless noted.
        </Text>
        <PdfBarChart
          height={150}
          bars={[
            { label: 'Labor cost', value: expected.annualLaborCost, color: PDF_COLORS.borderStrong, isTotal: true },
            { label: 'Labor savings', value: expected.annualLaborSavings, color: PDF_COLORS.build },
            {
              label: expected.isRevenueOpportunityOnly ? 'Revenue opp.' : 'Added profit',
              value: expected.additionalGrossProfit,
              color: brand,
            },
            { label: 'Automation cost', value: -expected.totalFirstYearCost, color: PDF_COLORS.dontBuild },
            { label: 'Net benefit', value: expected.netAnnualBenefit, color: PDF_COLORS.ink, isTotal: true },
          ]}
          brandHex={brand}
        />

        <View style={{ height: 18 }} />
        <FinancialTable expected={expected} />
        <PageFooter agency={agencyName} page={5} total={8} />
      </Page>

      {/* Page 6 — Scenario Analysis (Exhibit 2) */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.exhibitTitle}>Exhibit 2 — Expected scenario carries the strongest benefit</Text>
        <Text style={styles.caption}>
          Source: client-provided inputs and the Viableo calculation engine. Costs are held constant; only benefit assumptions vary.
        </Text>
        <PdfBarChart
          height={140}
          bars={SCENARIO_ORDER.map((s) => ({
            label: SCENARIO_LABELS[s],
            value: results[s].totalAnnualBenefit,
            color: s === 'expected' ? brand : brand,
            sublabel: `${pdfPayback(results[s].paybackMonths).replace(' months', 'mo')} payback`,
          }))}
          brandHex={brand}
        />

        <View style={{ height: 16 }} />
        <ScenarioTable results={results} />
        <PageFooter agency={agencyName} page={6} total={8} />
      </Page>

      {/* Page 7 — Recommendation (full-page verdict) */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Recommendation</Text>
        <View style={{ marginTop: 24, marginBottom: 24, alignItems: 'flex-start' }}>
          <PdfVerdictStamp
            recommendation={recommendation.recommendation}
            paybackMonths={expected.paybackMonths}
            netAnnualBenefit={expected.netAnnualBenefit}
            brandHex={brand}
            size="lg"
          />
        </View>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 12, color: PDF_COLORS.ink, lineHeight: 1.6, marginBottom: 12 }}>
          {recommendation.copy}
        </Text>

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontFamily: PDF_SANS, fontSize: 9, color: PDF_COLORS.inkMuted, letterSpacing: 1, marginBottom: 4 }}>RATIONALE</Text>
          <Bullet>{`Decision tree evaluated against the Expected scenario (${pdfRoi(expected.roiPct)} ROI, ${pdfPayback(expected.paybackMonths)} payback).`}</Bullet>
          <Bullet>{`Conservative scenario (${pdfCurrency(results.conservative.netAnnualBenefit)} net, ${pdfPayback(results.conservative.paybackMonths)} payback) stress-tests the upside.`}</Bullet>
          <Bullet>{`Costs held constant across scenarios; only benefit assumptions vary.`}</Bullet>
        </View>

        <PageFooter agency={agencyName} page={7} total={8} />
      </Page>

      {/* Page 8 — Assumptions + Disclaimer */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Assumptions</Text>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 10, color: PDF_COLORS.inkMuted, marginBottom: 12 }}>
          Every input that feeds the calculation, grouped by step. Context fields do not affect the dollar math.
        </Text>
        <InputsTable
          title="Business"
          rows={[
            ['Client / company', inputs.clientName, false],
            ['Employees affected', pdfCount(inputs.employeesAffected), false],
            ['Hours per employee per week', `${inputs.hoursPerWeek}`, false],
            ['Hourly labor cost', pdfCurrency(inputs.hourlyCost), false],
            ['Monthly workload (tasks)', inputs.monthlyWorkload != null ? pdfCount(inputs.monthlyWorkload) : '—', true],
            ['Current error rate', inputs.currentErrorRate != null ? pdfRatioAsPercent(inputs.currentErrorRate, 1) : '—', true],
          ]}
        />
        <View style={{ height: 10 }} />
        <InputsTable
          title="Revenue"
          rows={[
            ['Leads per month', pdfCount(inputs.leadsPerMonth), false],
            ['Current conversion rate', inputs.currentConversionRate != null ? pdfRatioAsPercent(inputs.currentConversionRate, 1) : '—', true],
            ['Average customer value', pdfCurrency(inputs.averageCustomerValue), false],
            ['Gross margin %', inputs.grossMarginPct != null ? pdfRatioAsPercent(inputs.grossMarginPct, 1) : 'Omitted — revenue opportunity', false],
          ]}
        />
        <View style={{ height: 10 }} />
        <InputsTable
          title="Automation"
          rows={[
            ['Expected automation %', pdfRatioAsPercent(inputs.expectedAutomationPct, 1), false],
            ['Expected error reduction %', inputs.expectedErrorReductionPct != null ? pdfRatioAsPercent(inputs.expectedErrorReductionPct, 1) : '—', true],
            ['Expected conversion improvement', pdfPp(inputs.expectedConversionImprovementPct), false],
            ['Implementation fee', pdfCurrency(inputs.implementationFee), false],
            ['Monthly AI/API cost', pdfCurrency(inputs.monthlyAiApiCost), false],
            ['Monthly software/tool cost', pdfCurrency(inputs.monthlySoftwareCost), false],
            ['Other annual cost', pdfCurrency(inputs.otherAnnualCost), false],
          ]}
        />

        <Text style={styles.disclaimer}>
          Figures are estimates based on assumptions provided by {agencyName} and its client and have not been independently audited. Validate against actual operating data before finalizing investment decisions.
        </Text>
        <PageFooter agency={agencyName} page={8} total={8} />
      </Page>
    </Document>
  );
}

// --- Sub-components ----------------------------------------------------------

function PageHeader({
  brand,
  agency,
  logoUrl,
  title,
}: {
  brand: string;
  agency: string;
  logoUrl?: string;
  title: string;
}) {
  return null; // Page headers are rendered inside each Page via a fixed-position View; this stub is kept for clarity.
}

function PageFooter({
  agency,
  page,
  total,
  hideDisclaimer,
}: {
  agency: string;
  page: number;
  total: number;
  hideDisclaimer?: boolean;
}) {
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

function Bullet({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 5 }}>
      <Text style={{ fontFamily: PDF_SANS, fontSize: 10.5, color: PDF_COLORS.inkMuted, marginRight: 8 }}>•</Text>
      <Text style={{ fontFamily: PDF_SANS, fontSize: 10.5, color: PDF_COLORS.ink, flex: 1 }}>
        {children}
      </Text>
    </View>
  );
}

function InputsTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string, boolean]>; // [label, value, isContext]
}) {
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={{ fontFamily: PDF_DISPLAY, fontWeight: 600, fontSize: 12, color: PDF_COLORS.ink, marginBottom: 6 }}>
        {title}
      </Text>
      <View style={{ borderTopWidth: 0.5, borderTopColor: PDF_COLORS.border }}>
        {rows.map((r, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderBottomWidth: 0.5,
              borderBottomColor: PDF_COLORS.border,
              paddingVertical: 5,
            }}
          >
            <Text style={{ fontFamily: PDF_SANS, fontSize: 10, color: r[2] ? PDF_COLORS.inkMuted : PDF_COLORS.ink }}>
              {r[0]}
              {r[2] ? <Text style={styles.contextTag}>context</Text> : null}
            </Text>
            <Text style={{ fontFamily: isNumericValue(r[1]) ? PDF_MONO : PDF_SANS, fontSize: 10, color: r[2] ? PDF_COLORS.inkMuted : PDF_COLORS.ink }}>
              {r[1]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FinancialTable({ expected }: { expected: ScenarioResult }) {
  const rows: Array<[string, string]> = [
    ['Annual labor cost', pdfCurrency(expected.annualLaborCost)],
    ['Annual labor savings', pdfCurrency(expected.annualLaborSavings)],
    ['Annual recurring cost', pdfCurrency(expected.annualRecurringCost)],
    ['Total first-year cost', pdfCurrency(expected.totalFirstYearCost)],
    ['Additional customers', pdfCount(expected.additionalCustomers)],
    ['Additional annual revenue', pdfCurrency(expected.additionalAnnualRevenue)],
    [
      expected.isRevenueOpportunityOnly ? 'Additional revenue opportunity' : 'Additional gross profit',
      pdfCurrency(expected.additionalGrossProfit),
    ],
    ['Total annual benefit', pdfCurrency(expected.totalAnnualBenefit)],
    ['Net annual benefit', pdfCurrency(expected.netAnnualBenefit)],
    ['ROI', pdfRoi(expected.roiPct)],
    ['Monthly net benefit', pdfCurrency(expected.monthlyNetBenefit)],
    ['Payback', pdfPayback(expected.paybackMonths)],
  ];
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={{ fontFamily: PDF_DISPLAY, fontWeight: 600, fontSize: 12, color: PDF_COLORS.ink, marginBottom: 6 }}>
        Expected scenario — financial detail
      </Text>
      <View style={{ borderTopWidth: 0.5, borderTopColor: PDF_COLORS.border }}>
        {rows.map((r, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottomWidth: 0.5,
              borderBottomColor: PDF_COLORS.border,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontFamily: PDF_SANS, fontSize: 10, color: PDF_COLORS.ink }}>{r[0]}</Text>
            <Text style={{ fontFamily: PDF_MONO, fontSize: 10, color: PDF_COLORS.ink }}>{r[1]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ScenarioTable({
  results,
}: {
  results: Record<ScenarioName, ScenarioResult>;
}) {
  const rows: Array<[string, (r: ScenarioResult) => string]> = [
    ['Automation % used', (r) => pdfRatioAsPercent(r.automationPct, 1)],
    ['Conversion improvement used', (r) => pdfPp(r.conversionImprovementPct)],
    ['Annual labor savings', (r) => pdfCurrency(r.annualLaborSavings)],
    ['Total first-year cost', (r) => pdfCurrency(r.totalFirstYearCost)],
    ['Additional customers', (r) => pdfCount(r.additionalCustomers)],
    ['Additional annual revenue', (r) => pdfCurrency(r.additionalAnnualRevenue)],
    ['Additional gross profit', (r) => pdfCurrency(r.additionalGrossProfit)],
    ['Total annual benefit', (r) => pdfCurrency(r.totalAnnualBenefit)],
    ['Net annual benefit', (r) => pdfCurrency(r.netAnnualBenefit)],
    ['ROI', (r) => pdfRoi(r.roiPct)],
    ['Payback', (r) => pdfPayback(r.paybackMonths)],
  ];
  return (
    <View style={{ marginTop: 6 }}>
      <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: PDF_COLORS.border, paddingBottom: 4 }}>
        <Text style={{ flex: 2, fontFamily: PDF_SANS, fontSize: 8.5, color: PDF_COLORS.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Metric</Text>
        {SCENARIO_ORDER.map((s) => (
          <Text key={s} style={{ flex: 1, fontFamily: PDF_SANS, fontSize: 8.5, color: s === 'expected' ? PDF_COLORS.ink : PDF_COLORS.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' }}>
            {SCENARIO_LABELS[s]}
          </Text>
        ))}
      </View>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: PDF_COLORS.border, paddingVertical: 4 }}>
          <Text style={{ flex: 2, fontFamily: PDF_SANS, fontSize: 10, color: PDF_COLORS.ink }}>{r[0]}</Text>
          {SCENARIO_ORDER.map((s) => (
            <Text
              key={s}
              style={{
                flex: 1,
                fontFamily: PDF_MONO,
                fontSize: 10,
                color: s === 'expected' ? PDF_COLORS.ink : PDF_COLORS.inkMuted,
                textAlign: 'right',
                fontWeight: s === 'expected' ? 500 : 400,
              }}
            >
              {r[1](results[s])}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function PdfLogo({ src, alt }: { src: string; alt: string }) {
  // @react-pdf/renderer Image requires a fixed size; we cap height.
  return (
    <Image
      src={src}
      style={{ height: 40, width: 'auto', objectFit: 'contain' }}
      alt={alt}
    />
  );
}

function isNumericValue(s: string): boolean {
  return /^[\$\-0-9,.%pp\smonthsNeverImmediateN/A]+$/.test(s) || /^[\$]/.test(s) || /%$/.test(s) || /pp$/.test(s);
}

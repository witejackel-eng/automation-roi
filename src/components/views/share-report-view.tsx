'use client';

/**
 * ShareReportView — the read-only client report rendered at /r/[shareId]
 * (Master Spec §41, §45).
 *
 * Shows: agency branding, "Prepared for [Client]", the verdict, the three
 * headline figures (Annual opportunity / ROI / Payback), the scenario slider
 * (read-only — switches the displayed numbers), and a collapsible
 * assumptions panel.
 *
 * NO edit/save/share actions. NO internal agency notes. NO sensitive data.
 * The scenario slider only changes which computed scenario is displayed —
 * it never re-runs the calculation (the numbers are frozen at share time).
 */
import * as React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import {
  DecisionBadge,
  CountUp,
  ScenarioSlider,
  Dot,
  DotSeparator,
  DotRule,
  Logo,
} from '@/components/viableo';
import { DECISION_LABELS } from '@/lib/brand';
import { recommend } from '@/lib/calculations/recommendation';
import { formatCurrency, formatPayback, formatRoi } from '@/lib/format';
import { SCENARIO_LABELS, SCENARIO_ORDER } from '@/lib/calculations/scenarios';
import type { ScenarioName } from '@/lib/calculations/scenarios';
import type { CalculatorInputs, ScenarioResult, Recommendation } from '@/lib/calculations/engine';
import { cn } from '@/lib/utils';

interface Agency {
  name: string | null;
  website: string | null;
  brandColorHex: string | null;
  logoUrl: string | null;
}

interface ShareReportViewProps {
  shareId: string;
  createdAt: string;
  clientName: string;
  agency: Agency;
  inputs: CalculatorInputs;
  results: Record<ScenarioName, ScenarioResult>;
  recommendation: Recommendation;
}

export function ShareReportView({
  shareId,
  createdAt,
  clientName,
  agency,
  inputs,
  results,
  recommendation,
}: ShareReportViewProps) {
  const [activeScenario, setActiveScenario] = React.useState<ScenarioName>('expected');
  const [showAssumptions, setShowAssumptions] = React.useState(false);

  const active = results[activeScenario];
  const activeRec = recommend(active);

  const created = new Date(createdAt);
  const createdLabel = created.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* Brand signature top-rule */}
      <div aria-hidden="true" className="h-0.5 w-full bg-brand" />

      {/* Header — agency branding + prepared-for */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-3">
            {agency.logoUrl ? (
              <img
                src={agency.logoUrl}
                alt={agency.name ?? 'Agency logo'}
                className="h-8 max-w-[160px] object-contain"
              />
            ) : (
              <span className="font-display text-lg font-semibold text-ink">
                {agency.name ?? 'Viableo'}
              </span>
            )}
          </div>
          <div className="text-[13px] text-ink-muted">
            Prepared for <span className="font-medium text-ink">{clientName}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-12 md:px-6 md:py-16">
        {/* Verdict section — the headline IS the verdict (Voice Spec §5.9) */}
        <section aria-labelledby="verdict-heading">
          <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.005em] text-ink-muted">
            <Dot size="sm" />
            Viableo Decision
          </div>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <DecisionBadge decision={recommendation} size="lg" />
              <h1 id="verdict-heading" className="mt-4 text-4xl font-bold leading-[0.98] tracking-[-0.02em] text-ink md:text-5xl">
                {DECISION_LABELS[recommendation]}
              </h1>
              <p className="mt-3 max-w-[480px] text-[16px] leading-[1.55] text-ink-muted">
                {recommendation === 'build'
                  ? 'The numbers hold up \u2014 even in the worst case.'
                  : recommendation === 'pilot'
                    ? 'The upside is real. The risk needs a smaller bet first.'
                    : recommendation === 'consider'
                      ? 'The math works. The timeline might not.'
                      : 'The numbers don\u2019t support it. Better to know now than after the invoice.'}
              </p>
            </div>
          </div>
        </section>

        <div className="my-10">
          <DotRule />
        </div>

        {/* Scenario selector — read-only, switches displayed numbers only */}
        <section aria-labelledby="scenarios-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 id="scenarios-heading" className="text-xl font-semibold tracking-[-0.02em] text-ink">
              See the upside, the floor, and the expected.
            </h2>
          </div>
          <div className="mt-4">
            <ScenarioSlider
              value={activeScenario}
              onChange={(s) => setActiveScenario(s)}
            />
          </div>

          {/* Three headline figures — count up on scenario change */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <HeadlineFigure
              label="Annual opportunity"
              value={active.totalAnnualBenefit}
              format="currency"
            />
            <HeadlineFigure
              label="First-year ROI"
              value={active.roiPct ?? 0}
              format="roi"
            />
            <HeadlineFigure
              label="Payback"
              value={active.paybackMonths ?? 0}
              format="payback"
            />
          </div>

          {/* What changed in this scenario */}
          <div className="mt-6 rounded-md border border-border bg-surface p-4">
            <p className="text-[13px] text-ink-muted">
              <span className="font-medium text-ink">{SCENARIO_LABELS[activeScenario]}</span>
              {activeScenario === 'conservative' && (
                <span> — Automation effectiveness is discounted and no conversion lift is credited.</span>
              )}
              {activeScenario === 'expected' && (
                <span> — Uses the entered assumptions as-is.</span>
              )}
              {activeScenario === 'upside' && (
                <span> — Automation effectiveness and conversion improvement are modeled above the expected case, within defined caps.</span>
              )}
            </p>
          </div>
        </section>

        <div className="my-10">
          <DotRule />
        </div>

        {/* Scenario comparison table */}
        <section aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-xl font-semibold tracking-[-0.02em] text-ink">
            All three scenarios
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.005em] text-ink-muted">
                  <th className="py-2 pr-4 font-medium">Metric</th>
                  {SCENARIO_ORDER.map((s) => (
                    <th key={s} className={cn('py-2 px-2 font-medium text-right', s === activeScenario && 'text-brand')}>
                      {SCENARIO_LABELS[s]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono tnum text-ink">
                <ComparisonRow label="Annual benefit" scenarioResults={results} active={activeScenario} field="totalAnnualBenefit" format="currency" />
                <ComparisonRow label="Annual labor savings" scenarioResults={results} active={activeScenario} field="annualLaborSavings" format="currency" />
                <ComparisonRow label="Revenue opportunity" scenarioResults={results} active={activeScenario} field="revenueOpportunity" format="currency" />
                <ComparisonRow label="First-year cost" scenarioResults={results} active={activeScenario} field="totalFirstYearCost" format="currency" />
                <ComparisonRow label="Net annual benefit" scenarioResults={results} active={activeScenario} field="netAnnualBenefit" format="currency" />
                <ComparisonRow label="ROI" scenarioResults={results} active={activeScenario} field="roiPct" format="roi" />
                <ComparisonRow label="Payback (months)" scenarioResults={results} active={activeScenario} field="paybackMonths" format="payback" />
              </tbody>
            </table>
          </div>
        </section>

        <div className="my-10">
          <DotRule />
        </div>

        {/* Assumptions — collapsible */}
        <section aria-labelledby="assumptions-heading">
          <button
            type="button"
            onClick={() => setShowAssumptions((v) => !v)}
            className="flex w-full items-center justify-between text-left"
            aria-expanded={showAssumptions}
          >
            <h2 id="assumptions-heading" className="text-xl font-semibold tracking-[-0.02em] text-ink">
              View assumptions
            </h2>
            <span className="text-[13px] text-ink-muted">
              {showAssumptions ? 'Hide' : 'Show'}
            </span>
          </button>
          {showAssumptions && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AssumptionRow label="Client / company" value={inputs.clientName} />
              <AssumptionRow label="Employees affected" value={String(inputs.employeesAffected)} />
              <AssumptionRow label="Hours per employee / week" value={String(inputs.hoursPerWeek)} />
              <AssumptionRow label="Hourly labor cost" value={`$${inputs.hourlyLaborCost}`} />
              <AssumptionRow label="Automation coverage" value={`${(inputs.automationPct * 100).toFixed(0)}%`} />
              <AssumptionRow label="Implementation fee" value={formatCurrency(inputs.implementationFee)} />
              <AssumptionRow label="Monthly AI/API cost" value={formatCurrency(inputs.monthlyAiApiCost)} />
              <AssumptionRow label="Monthly software cost" value={formatCurrency(inputs.monthlySoftwareCost)} />
            </div>
          )}
        </section>
      </main>

      {/* Footer — trust + meta */}
      <footer className="mt-auto border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-3 px-4 py-6 text-[12px] text-ink-muted md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex flex-wrap items-center gap-1">
            <Logo variant="compact" withWordmark={false} style={{ width: 14, height: 14 }} aria-label="Viableo" />
            <DotSeparator />
            <span>Powered by Viableo</span>
            {agency.website && (
              <>
                <DotSeparator />
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-ink"
                >
                  {agency.name ?? 'Agency'}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            <span>Generated {createdLabel}</span>
            <DotSeparator />
            <span>Read-only share</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function HeadlineFigure({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format: 'currency' | 'roi' | 'payback';
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <div className="text-[12px] uppercase tracking-[0.005em] text-ink-muted">{label}</div>
      <div className="mt-2 font-mono tnum text-3xl font-bold tracking-[-0.02em] text-ink">
        {format === 'currency' && <CountUp value={value} prefix="$" />}
        {format === 'roi' && <CountUp value={value / 100} decimals={1} suffix="×" />}
        {format === 'payback' && (
          value > 0 ? <CountUp value={value} decimals={1} suffix=" mo" /> : <span>Never</span>
        )}
      </div>
    </div>
  );
}

function ComparisonRow({
  label,
  scenarioResults,
  active,
  field,
  format,
}: {
  label: string;
  scenarioResults: Record<ScenarioName, ScenarioResult>;
  active: ScenarioName;
  field: keyof ScenarioResult;
  format: 'currency' | 'roi' | 'payback';
}) {
  return (
    <tr className="border-b border-border/50">
      <td className="py-2.5 pr-4 font-sans text-[13px] text-ink-muted">{label}</td>
      {SCENARIO_ORDER.map((s) => {
        const val = scenarioResults[s][field] as number | null;
        const isActive = s === active;
        return (
          <td
            key={s}
            className={cn(
              'py-2.5 px-2 text-right tabular-nums',
              isActive ? 'font-semibold text-brand' : 'text-ink'
            )}
          >
            {val == null
              ? '\u2014'
              : format === 'currency'
                ? formatCurrency(val)
                : format === 'roi'
                  ? formatRoi(val)
                  : formatPayback(val)}
          </td>
        );
      })}
    </tr>
  );
}

function AssumptionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/50 py-2">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className="font-mono tnum text-[13px] text-ink">{value}</span>
    </div>
  );
}

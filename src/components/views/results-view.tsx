'use client';

/**
 * Results dashboard (Section 13) — Viableo voice.
 *
 * Layout, top to bottom:
 *   1. Back + "Prepared for {client}" row
 *   2. Page header — "Viableo Analysis" + the Viableo Decision subhead
 *   3. Hero summary card — ScenarioSlider + DecisionBadge (cross-fades on
 *      scenario change) + 3 big figures (Annual Opportunity, ROI ×, Payback)
 *      driven by the active scenario, animated via CountUp
 *   4. Verdict Stamp — the detailed sign-off, also driven by the active
 *      scenario (kept per Task 4-b: the signature double-rule element)
 *   5. Recommendation copy (active scenario)
 *   6. Three secondary KPI cards (savings, profit/revenue, first-year cost)
 *   7. Exhibit 1 — ROI Bridge waterfall (active scenario)
 *   8. Exhibit 2 — Scenario Comparison (all three scenarios)
 *   9. Scenario detail table (all three, with the active column highlighted)
 *  10. Assumptions
 *  11. Sticky actions: Save, Generate Client Report, Generate Proposal
 *      (last two gated behind entitlement — show lock + "Included in Pro")
 *
 * The store's `recommendation` (project-level, Expected scenario) is preserved
 * for save / report / proposal persistence. Display figures use the active
 * scenario, computed client-side via `recommend()`.
 */
import * as React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'motion/react';
import { Save, FileText, FileSignature, ArrowLeft, Share2, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { has } from '@/lib/entitlement';
import { VerdictStamp } from '@/components/verdict-stamp';
import { KpiCard } from '@/components/kpi-card';
import { RoiBridge } from '@/components/charts/roi-bridge';
import { ScenarioComparison } from '@/components/charts/scenario-comparison';
import { AssumptionsTable } from '@/components/assumptions-table';
import { EntitlementButton } from '@/components/entitlement-button';
import {
  DecisionBadge,
  ScenarioSlider,
  CountUp,
  LoadingDot,
  WhyRecommendation,
  StressTestSection,
  BreakingPointSlider,
  ConfidenceExplained,
  VerdictReveal,
  RecurringEconomicsView,
} from '@/components/viableo';
import { computeSensitivity } from '@/lib/calculations/stress-test';
import { computeConfidenceScore, type InputStatus } from '@/lib/calculations/confidence';
import { TERM, DECISION_LABELS, type DecisionKey } from '@/lib/brand';
import { recommend } from '@/lib/calculations/recommendation';
import {
  formatCurrency,
  formatPayback,
  formatRatioAsPercent,
  formatRoi,
} from '@/lib/format';
import { SCENARIO_ORDER, SCENARIO_LABELS } from '@/lib/calculations/scenarios';
import type { ScenarioName } from '@/lib/calculations/scenarios';
import type { ScenarioResult, CalculatorInputs } from '@/lib/calculations/engine';
import { cn } from '@/lib/utils';

export function ResultsView() {
  const {
    inputs,
    results,
    recommendation,
    entitlement,
    go,
    activeScenario,
    setActiveScenario,
  } = useApp(
    useShallow((s) => ({
      inputs: s.inputs,
      results: s.results,
      recommendation: s.recommendation,
      entitlement: s.entitlement,
      go: s.go,
      activeScenario: s.activeScenario,
      setActiveScenario: s.setActiveScenario,
    }))
  );

  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [reportLoading, setReportLoading] = React.useState(false);
  const [proposalLoading, setProposalLoading] = React.useState(false);
  const [shareLoading, setShareLoading] = React.useState(false);
  // Mirror the store's savedProjectId locally so the existing handlers keep
  // working unchanged, but ALSO sync it back to the store on save so that
  // the reopen flow (which sets the store's savedProjectId before navigating
  // here) is respected — re-saving after a reopen updates the same project
  // rather than creating a duplicate.
  const storeSavedProjectId = useApp((s) => s.savedProjectId);
  const [savedProjectId, setSavedProjectId] = React.useState<string | null>(
    storeSavedProjectId
  );
  // If the store's savedProjectId changes (e.g. user reopened a project),
  // sync the local state.
  React.useEffect(() => {
    setSavedProjectId(storeSavedProjectId);
  }, [storeSavedProjectId]);

  if (!inputs || !results || !recommendation) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 md:px-6">
        <EmptyResults onBack={() => go('calculator')} />
      </div>
    );
  }

  // Active scenario drives every displayed figure. The store's
  // `recommendation` (Expected) is preserved for the saved-project record.
  const active: ScenarioResult = results[activeScenario];
  const activeRec = recommend(active);
  const activeDecision = activeRec.recommendation as DecisionKey;
  const ent = entitlement;
  const canSave = !!ent && has(ent, 'save_project');
  const canReport = !!ent && has(ent, 'client_report');
  const canProposal = !!ent && has(ent, 'proposal');
  const canShare = !!ent && has(ent, 'share_links');

  // ROI as a multiplier (499% → "5.0×"). Null when totalFirstYearCost = 0.
  const roiMultiple =
    active.roiPct == null ? null : active.roiPct / 100;

  const handleSave = async () => {
    if (!canSave) {
      go('pricing');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs,
          results,
          recommendation,
          clientName: inputs.clientName,
        }),
      });
      if (res.status === 403) {
        toast({ title: 'Saving projects requires Pro.', variant: 'destructive' });
        go('pricing');
        return;
      }
      if (!res.ok) {
        toast({ title: 'Could not save the project.', variant: 'destructive' });
        return;
      }
      const data = (await res.json()) as { id: string };
      setSavedProjectId(data.id);
      toast({ title: 'Project saved.' });
    } catch {
      toast({ title: 'Could not reach the service.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleReport = async () => {
    if (!canReport) {
      go('pricing');
      return;
    }
    if (!savedProjectId) {
      await handleSave();
    }
    const projectId = savedProjectId;
    if (!projectId) {
      toast({ title: 'Save the project first.', description: 'Then generate the report.' });
      return;
    }
    setReportLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.status === 403) {
        toast({ title: 'Client report requires Pro.', variant: 'destructive' });
        go('pricing');
        return;
      }
      if (!res.ok) {
        toast({ title: 'Could not generate the report.', variant: 'destructive' });
        return;
      }
      const data = (await res.json()) as { pdfUrl: string };
      toast({ title: 'Report generated.' });
      window.open(data.pdfUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast({ title: 'Could not reach the service.', variant: 'destructive' });
    } finally {
      setReportLoading(false);
    }
  };

  const handleProposal = async () => {
    if (!canProposal) {
      go('pricing');
      return;
    }
    if (!savedProjectId) {
      await handleSave();
    }
    const projectId = savedProjectId;
    if (!projectId) {
      toast({ title: 'Save the project first.', description: 'Then generate the proposal.' });
      return;
    }
    setProposalLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.status === 403) {
        toast({ title: 'Proposal generation requires Pro.', variant: 'destructive' });
        go('pricing');
        return;
      }
      if (!res.ok) {
        toast({ title: 'Could not generate the proposal.', variant: 'destructive' });
        return;
      }
      const data = (await res.json()) as { pdfUrl: string };
      toast({ title: 'Proposal generated.' });
      window.open(data.pdfUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast({ title: 'Could not reach the service.', variant: 'destructive' });
    } finally {
      setProposalLoading(false);
    }
  };

  const handleShare = async () => {
    if (!canShare) {
      go('pricing');
      return;
    }
    if (!savedProjectId) {
      await handleSave();
    }
    const projectId = savedProjectId;
    if (!projectId) {
      toast({ title: 'Save the project first.', description: 'Then create a share link.' });
      return;
    }
    setShareLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.status === 403) {
        toast({ title: 'Share links require Agency Pro.', variant: 'destructive' });
        go('pricing');
        return;
      }
      if (!res.ok) {
        toast({ title: 'Could not create the share link.', variant: 'destructive' });
        return;
      }
      const data = (await res.json()) as { shareId: string; url: string };
      // Copy to clipboard + use Web Share API where supported (Master Spec §46).
      const fullUrl = `${window.location.origin}${data.url}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Viableo — Shared analysis',
            text: 'A shared automation business case.',
            url: fullUrl,
          });
        } catch {
          /* user dismissed — still copy below */
        }
      }
      try {
        await navigator.clipboard.writeText(fullUrl);
        toast({
          title: 'Link copied.',
          description: 'Share it with your client.',
        });
      } catch {
        toast({
          title: 'Share link created.',
          description: fullUrl,
        });
      }
    } catch {
      toast({ title: 'Could not reach the service.', variant: 'destructive' });
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-6 md:py-12">
      <ScrollToTop />

      {/* ── Mobile sticky top bar: verdict + confidence + headline figures ──
          Visible only on small screens. Stays pinned so the key decision
          numbers are always visible while scrolling through detailed exhibits. */}
      <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-border bg-canvas/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-canvas/80 md:hidden" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DecisionBadge decision={activeDecision} size="sm" />
            <span className="font-mono tnum text-[13px] font-semibold text-ink" role="status">
              {formatCurrency(active.netAnnualBenefit)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono tnum text-[12px] text-ink-muted" role="status">
              {roiMultiple == null ? 'N/A' : `${roiMultiple.toFixed(1)}×`}
            </span>
            <span className="text-[11px] text-ink-faint">·</span>
            <span className="font-mono tnum text-[12px] text-ink-muted" role="status">
              {active.paybackMonths == null ? 'Never' : formatPayback(active.paybackMonths)}
            </span>
          </div>
        </div>
      </div>

      {/* Back + prepared-for row */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => go('calculator')}
          className="min-h-[44px] gap-1.5 text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Edit assumptions
        </Button>
        <p className="text-[13px] text-ink-muted">
          Prepared for <span className="font-medium text-ink">{inputs.clientName}</span>
        </p>
      </div>

      {/* Page header — references TERM.analysis + TERM.decision */}
      <header className="mb-8">
        <h1 className="font-display text-[32px] font-bold leading-[1.02] tracking-[-0.02em] text-ink md:text-[40px]">
          {TERM.analysis}
        </h1>
        <p className="mt-2 max-w-[640px] text-[15px] leading-[1.55] text-ink-muted">
          The {TERM.decision} and the figures that justify it. Switch scenarios to see how the
          numbers hold up under conservative and upside assumptions.
        </p>
      </header>

      {/* Hero summary card — ScenarioSlider + DecisionBadge + 3 headline figures */}
      <section
        aria-label="Viableo Decision summary"
        className="mb-10 rounded-lg border border-border bg-surface-raised p-5 md:p-6"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ScenarioSlider value={activeScenario} onChange={setActiveScenario} />
          {/* Cross-fade on decision change via key + reveal-on-enter animation. */}
          <div
            key={activeDecision}
            className="reveal-on-enter flex items-center gap-2"
            aria-live="polite"
          >
            <span className="text-[11px] uppercase tracking-wide text-ink-muted">
              {TERM.decision}
            </span>
            <DecisionBadge decision={activeDecision} size="lg" animate />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeScenario}
            initial={{ opacity: 0.6, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.6, y: -4 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8"
          >
          {/* Annual Opportunity ($) */}
          <HeroFigure
            label="Annual opportunity"
            sublabel={
              active.isRevenueOpportunityOnly
                ? 'Revenue opportunity, net of first-year cost'
                : 'Net annual benefit, net of first-year cost'
            }
          >
            <CountUp
              value={active.netAnnualBenefit}
              prefix="$"
              decimals={0}
              retriggerOnValueChange
              className="text-[40px] font-medium leading-none text-ink"
            />
          </HeroFigure>

          {/* ROI (×) */}
          <HeroFigure label="ROI" sublabel="Return on first-year cost">
            {roiMultiple == null ? (
              <span className="font-mono tnum text-[40px] font-medium leading-none text-ink-muted" role="status">
                N/A
              </span>
            ) : (
              <CountUp
                value={roiMultiple}
                suffix="×"
                decimals={1}
                retriggerOnValueChange
                className="text-[40px] font-medium leading-none text-ink"
              />
            )}
          </HeroFigure>

          {/* Payback (months) */}
          <HeroFigure label="Payback" sublabel="Months to recoup first-year cost">
            {active.paybackMonths == null ? (
              <span className="font-mono tnum text-[40px] font-medium leading-none text-ink-muted" role="status">
                Never
              </span>
            ) : (
              <CountUp
                value={active.paybackMonths}
                suffix=" mo"
                decimals={active.paybackMonths >= 10 ? 0 : 1}
                retriggerOnValueChange
                className="text-[40px] font-medium leading-none text-ink"
              />
            )}
          </HeroFigure>
        </motion.div>
        </AnimatePresence>
      </section>

      {/* Verdict Stamp — the detailed sign-off (kept per Task 4-b). */}
      <div className="mb-8 flex justify-center md:justify-start">
        <VerdictStamp
          recommendation={activeRec.recommendation}
          paybackMonths={active.paybackMonths}
          roiPct={active.roiPct}
          netAnnualBenefit={active.netAnnualBenefit}
          size="lg"
        />
      </div>

      {/* Why this recommendation? (Section 6.9) — expandable bullet rationale,
          each reason backed by a real number from the active scenario. */}
      <WhyRecommendation
        inputs={inputs}
        results={results}
        recommendation={activeRec}
        className="mb-8"
      />

      {/* Recommendation copy (active scenario) */}
      <p className="mb-10 max-w-[760px] text-[15px] leading-[1.55] text-ink-muted">
        {activeRec.copy}
      </p>

      {/* Secondary KPI row */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Annual labor savings"
          value={formatCurrency(active.annualLaborSavings)}
          variant="secondary"
        />
        <KpiCard
          label={
            active.isRevenueOpportunityOnly
              ? 'Additional revenue opportunity'
              : 'Additional gross profit'
          }
          value={formatCurrency(active.additionalGrossProfit)}
          variant="secondary"
        />
        <KpiCard
          label="First-year cost"
          value={formatCurrency(active.totalFirstYearCost)}
          variant="secondary"
        />
      </div>

      {/* Stress test + break-even thresholds (Master Spec §29, §30, §31).
          Placed after the key financials and before the exhibits, per the
          §33 results-page section order: decision → financials → why →
          confidence → stress test → break-even → ROI bridge → comparison →
          assumptions → actions. */}
      <StressTestSection inputs={inputs} activeScenario={activeScenario} />

      {/* Breaking point slider (Phase 3.1) — the product's most distinctive moment.
          Integrates after the stress test section. */}
      <BreakingPointSlider inputs={inputs} activeScenario={activeScenario} />

      {/* Confidence, explained (Phase 3.2) — below the verdict. */}
      <ConfidenceExplainedSection inputs={inputs} />

      {/* Verdict reveal with count-up (Phase 3.3) */}
      <VerdictReveal
        confidenceScore={computeConfidenceScore({}).score}
        roiMultiple={roiMultiple}
        netAnnualBenefit={active.netAnnualBenefit}
        className="mb-10"
      />

      {/* Recurring economics view (Phase 3.4) — first-class monthly view */}
      <RecurringEconomicsView
        result={active}
        monthlyAiApiCost={inputs.monthlyAiApiCost}
        monthlySoftwareCost={inputs.monthlySoftwareCost}
        platformApiCost={inputs.platformApiCost}
        className="mb-10"
      />

      {/* Top drivers callout (Phase 2.4) */}
      <TopDriversCallout inputs={inputs} activeScenario={activeScenario} />

      {/* Exhibit 1 — ROI Bridge (active scenario) */}
      <React.Suspense
        fallback={
          <ChartSkeleton title="Exhibit 1 — Labor savings drive the first-year benefit" />
        }
      >
        <div className="mb-10">
          <RoiBridge
            result={active}
            isRevenueOpportunityOnly={active.isRevenueOpportunityOnly}
          />
        </div>
      </React.Suspense>

      {/* Exhibit 2 — Scenario Comparison (all three) */}
      <React.Suspense
        fallback={
          <ChartSkeleton title="Exhibit 2 — Expected scenario carries the strongest benefit" />
        }
      >
        <div className="mb-10">
          <ScenarioComparison
            results={results}
            isRevenueOpportunityOnly={active.isRevenueOpportunityOnly}
          />
        </div>
      </React.Suspense>

      {/* Scenario detail table (numeric, for the audit trail) */}
      <ScenarioTable
        results={results}
        activeScenario={activeScenario}
        onSelect={setActiveScenario}
      />

      {/* Assumptions — collapsible on mobile via progressive disclosure */}
      <div className="mb-10 mt-12">
        <h2 className="mb-4 font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">
          Assumptions
        </h2>
        <p className="mb-4 text-[14px] text-ink-muted">
          Every input that feeds the calculation. Fields tagged &quot;context&quot; do not
          affect the dollar math.
        </p>
        {/* Desktop: full table. Mobile: progressive disclosure wrapper. */}
        <div className="md:block">
          <AssumptionsTable inputs={inputs} />
        </div>
      </div>

      {/* Sticky secondary actions */}
      <div className="sticky bottom-0 -mx-4 mt-8 border-t border-border bg-canvas/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-canvas/80 md:static md:mx-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <EntitlementButton
            allowed={canSave}
            requiredTierLabel="Pro"
            onClick={handleSave}
            loading={saving}
            variant="secondary"
            icon={<Save className="size-4" strokeWidth={1.75} aria-hidden="true" />}
          >
            Save project
          </EntitlementButton>
          <EntitlementButton
            allowed={canReport}
            requiredTierLabel="Pro"
            onClick={handleReport}
            loading={reportLoading}
            icon={<FileText className="size-4" strokeWidth={1.75} aria-hidden="true" />}
          >
            Generate Client Report
          </EntitlementButton>
          <EntitlementButton
            allowed={canProposal}
            requiredTierLabel="Pro"
            onClick={handleProposal}
            loading={proposalLoading}
            icon={<FileSignature className="size-4" strokeWidth={1.75} aria-hidden="true" />}
          >
            Generate Proposal
          </EntitlementButton>
          <EntitlementButton
            allowed={canShare}
            requiredTierLabel="Agency Pro"
            onClick={handleShare}
            loading={shareLoading}
            icon={<Share2 className="size-4" strokeWidth={1.75} aria-hidden="true" />}
          >
            Create share link
          </EntitlementButton>
        </div>
      </div>
    </div>
  );
}

// ── Hero figure cell ───────────────────────────────────────────────────────

function HeroFigure({
  label,
  sublabel,
  children,
}: {
  label: string;
  sublabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <div className="font-mono tnum">{children}</div>
      <span className="text-[12px] text-ink-muted">{sublabel}</span>
    </div>
  );
}

// Small helper: derive the DecisionKey from a scenario result, so the table's
// last row uses the canonical DECISION_LABELS instead of a hardcoded string.
function scenarioDecisionKey(r: ScenarioResult): DecisionKey {
  return recommend(r).recommendation as DecisionKey;
}

// ── Scenario detail table ──────────────────────────────────────────────────

function ScenarioTable({
  results,
  activeScenario,
  onSelect,
}: {
  results: Record<ScenarioName, ScenarioResult>;
  activeScenario: ScenarioName;
  onSelect: (s: ScenarioName) => void;
}) {
  // Build rows by reading known fields off the ScenarioResult type.
  const rows: Array<[string, (r: ScenarioResult) => string]> = [
    ['Automation % used', (r) => formatRatioAsPercent(r.automationPct, 1)],
    ['Conversion improvement used', (r) => `${(r.conversionImprovementPct * 100).toFixed(1)}pp`],
    ['Annual labor cost', (r) => formatCurrency(r.annualLaborCost)],
    ['Annual labor savings', (r) => formatCurrency(r.annualLaborSavings)],
    ['Total first-year cost', (r) => formatCurrency(r.totalFirstYearCost)],
    ['Additional customers', (r) => r.additionalCustomers.toLocaleString('en-US', { maximumFractionDigits: 0 })],
    ['Additional annual revenue', (r) => formatCurrency(r.additionalAnnualRevenue)],
    ['Additional gross profit', (r) => formatCurrency(r.additionalGrossProfit)],
    ['Total annual benefit', (r) => formatCurrency(r.totalAnnualBenefit)],
    ['Net annual benefit', (r) => formatCurrency(r.netAnnualBenefit)],
    ['ROI', (r) => formatRoi(r.roiPct)],
    ['Payback', (r) => formatPayback(r.paybackMonths)],
    ['Viableo Decision', (r) => DECISION_LABELS[scenarioDecisionKey(r)]],
  ];

  return (
    <div className="rounded-lg border border-border bg-surface-raised">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-display text-[15px] font-semibold tracking-[-0.02em] text-ink">
          Scenario detail
        </h3>
        <p className="text-[12px] text-ink-muted">
          Costs held constant across all scenarios; only benefit assumptions vary.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-5 py-2.5 text-left font-medium text-ink-muted">Metric</th>
              {SCENARIO_ORDER.map((s) => (
                <th
                  key={s}
                  className={`px-5 py-2.5 text-right font-medium ${
                    s === activeScenario ? 'text-ink' : 'text-ink-muted'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(s)}
                    className="min-h-[44px] hover:text-ink"
                  >
                    {SCENARIO_LABELS[s]}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border last:border-b-0 hover:bg-surface/50">
                <td className="px-5 py-2.5 text-ink">{r[0]}</td>
                {SCENARIO_ORDER.map((s) => {
                  const val = r[1](results[s]);
                  const isActive = s === activeScenario;
                  return (
                    <td
                      key={s}
                      className={`px-5 py-2.5 text-right font-mono tnum ${
                        isActive ? 'text-ink' : 'text-ink-muted'
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Skeletons + empty state ────────────────────────────────────────────────

function ChartSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-6">
      <div className="mb-3 flex items-center gap-2">
        <LoadingDot />
        <span className="text-[13px] text-ink-muted">{title}</span>
      </div>
      <div className="h-[320px] animate-pulse rounded bg-surface" />
    </div>
  );
}

function EmptyResults({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <FileText className="size-8 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
      <div>
        <p className="font-display text-[18px] font-semibold text-ink">
          No {TERM.analysis.toLowerCase()} yet.
        </p>
        <p className="mt-1 text-[14px] text-ink-muted">
          Run the calculator to see the {TERM.decision.toLowerCase()} and the exhibits.
        </p>
      </div>
      <Button
        onClick={onBack}
        className="mt-2 min-h-[44px] bg-brand-cta text-white hover:bg-brand-cta-hover"
      >
        Open the calculator
      </Button>
    </div>
  );
}

/** Floating scroll-to-top button — appears after 400px scroll. */
function ScrollToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 right-4 z-20 flex size-10 items-center justify-center rounded-full border border-border bg-surface shadow-floating text-ink-muted hover:text-ink transition-colors duration-hover md:bottom-6"
      aria-label="Back to top"
    >
      <ArrowUp className="size-4" strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

/** Top drivers callout — shows the top 3 sensitivity items (Phase 2.4). */
function TopDriversCallout({
  inputs,
  activeScenario,
}: {
  inputs: CalculatorInputs;
  activeScenario: ScenarioName;
}) {
  const sensitivity = React.useMemo(
    () => computeSensitivity(inputs, activeScenario),
    [inputs, activeScenario]
  );
  const top3 = sensitivity.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div className="mt-8 mb-10 rounded-md border border-border bg-surface p-5">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
        Top drivers of this outcome
      </h3>
      <div className="mt-3 space-y-2">
        {top3.map((item, i) => (
          <div key={item.label} className="flex items-center gap-3 text-[14px]">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-raised font-mono tnum text-[12px] font-medium text-ink-muted">
              {i + 1}
            </span>
            <span className="font-medium text-ink">{item.label}</span>
            <span className={cn(
              'ml-auto font-mono tnum text-[12px]',
              item.level === 'high' ? 'text-dont-build' :
              item.level === 'medium' ? 'text-consider' : 'text-build'
            )}>
              ±{Math.round(item.impact)}pp ROI
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-ink-muted">
        These assumptions move the verdict the most. Confirm them before committing.
      </p>
    </div>
  );
}

/** ConfidenceExplained section wrapper — manages input statuses for the ConfidenceExplained component. */
function ConfidenceExplainedSection({
  inputs,
}: {
  inputs: CalculatorInputs;
}) {
  // Default all inputs to 'provided' since the user entered them.
  // In a real app, these would come from the store with their actual statuses.
  const [statuses, setStatuses] = React.useState<Record<string, InputStatus>>({
    hourlyLaborCost: 'provided',
    workloadVolume: 'provided',
    implementationFee: 'provided',
    automationCoverage: 'estimated',
    conversionImprovement: 'estimated',
    platformApiCost: 'assumption',
    otherInputs: 'provided',
    errorCost: 'assumption',
  });

  const handleStatusChange = React.useCallback((inputKey: string, newStatus: InputStatus) => {
    setStatuses((prev) => ({ ...prev, [inputKey]: newStatus }));
  }, []);

  return (
    <div className="mb-10">
      <ConfidenceExplained
        statuses={statuses}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

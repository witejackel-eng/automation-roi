'use client';

/**
 * ShareReportView — the read-only client report rendered at /r/[shareId]
 * (Master Spec §41, §45).
 *
 * Phase 2 additions:
 *   - Engagement tracking: view event on mount, section scroll depth via
 *     IntersectionObserver, time-on-page via beforeunload.
 *   - Client approval: "Approve" and "Request changes" buttons with a
 *     frictionless form (name required, email + comment optional).
 *     No account required.
 *
 * NO edit/save/share actions. NO internal agency notes. NO sensitive data.
 * The scenario slider only changes which computed scenario is displayed —
 * it never re-runs the calculation (the numbers are frozen at share time).
 */
import * as React from 'react';
import { ShieldCheck, ExternalLink, CheckCircle2, MessageSquare } from 'lucide-react';
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

// Sections to track scroll engagement for.
const TRACKED_SECTIONS = [
  { id: 'verdict-section', label: 'Verdict' },
  { id: 'scenarios-section', label: 'Scenarios' },
  { id: 'comparison-section', label: 'Comparison' },
  { id: 'assumptions-section', label: 'Assumptions' },
];

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

  // Approval state
  const [approvalSubmitted, setApprovalSubmitted] = React.useState(false);
  const [approvalLoading, setApprovalLoading] = React.useState(false);
  const [showApprovalForm, setShowApprovalForm] = React.useState(false);
  const [approvalAction, setApprovalAction] = React.useState<'approve' | 'request_changes' | null>(null);
  const [approvalName, setApprovalName] = React.useState('');
  const [approvalEmail, setApprovalEmail] = React.useState('');
  const [approvalComment, setApprovalComment] = React.useState('');

  const active = results[activeScenario];
  const activeRec = recommend(active);

  const created = new Date(createdAt);
  const createdLabel = created.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ── Engagement tracking (Phase 2.1) ──────────────────────────────
  const mountTimeRef = React.useRef(Date.now());
  const viewSentRef = React.useRef(false);

  // Record 'view' event on mount.
  React.useEffect(() => {
    if (viewSentRef.current) return;
    viewSentRef.current = true;

    fetch(`/api/share/${shareId}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'view' }),
    }).catch(() => { /* silent */ });
  }, [shareId]);

  // Track section scroll depth using IntersectionObserver.
  React.useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observers: IntersectionObserver[] = [];

    for (const section of TRACKED_SECTIONS) {
      const el = document.getElementById(section.id);
      if (!el) continue;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              fetch(`/api/share/${shareId}/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventType: 'section_scroll',
                  section: section.label,
                  value: entry.intersectionRatio,
                }),
              }).catch(() => { /* silent */ });
            }
          }
        },
        { threshold: [0.25, 0.5, 0.75, 1.0] }
      );

      observer.observe(el);
      observers.push(observer);
    }

    return () => {
      for (const obs of observers) obs.disconnect();
    };
  }, [shareId]);

  // Track time-on-page with beforeunload handler and visibilitychange.
  React.useEffect(() => {
    const handleUnload = () => {
      const secondsOnPage = (Date.now() - mountTimeRef.current) / 1000;
      // Use sendBeacon for reliability during page unload.
      const payload = JSON.stringify({
        eventType: 'time_on_page',
        value: Math.round(secondsOnPage),
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`/api/share/${shareId}/event`, payload);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const secondsOnPage = (Date.now() - mountTimeRef.current) / 1000;
        const payload = JSON.stringify({
          eventType: 'time_on_page',
          value: Math.round(secondsOnPage),
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(`/api/share/${shareId}/event`, payload);
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shareId]);

  // ── Approval handler (Phase 2.2) ────────────────────────────────
  const handleSubmitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalAction || !approvalName.trim()) return;

    setApprovalLoading(true);
    try {
      const res = await fetch(`/api/share/${shareId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: approvalAction,
          name: approvalName.trim(),
          email: approvalEmail.trim() || undefined,
          comment: approvalComment.trim() || undefined,
        }),
      });
      if (res.ok) {
        setApprovalSubmitted(true);
      }
    } catch {
      /* silent */
    } finally {
      setApprovalLoading(false);
    }
  };

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
        <section id="verdict-section" aria-labelledby="verdict-heading">
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
        <section id="scenarios-section" aria-labelledby="scenarios-heading">
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
        <section id="comparison-section" aria-labelledby="comparison-heading">
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
                <ComparisonRow label="Additional gross profit" scenarioResults={results} active={activeScenario} field="additionalGrossProfit" format="currency" />
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
        <section id="assumptions-section" aria-labelledby="assumptions-heading">
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
              <AssumptionRow label="Hourly labor cost" value={`$${inputs.hourlyCost}`} />
              <AssumptionRow label="Automation coverage" value={`${(inputs.expectedAutomationPct * 100).toFixed(0)}%`} />
              <AssumptionRow label="Implementation fee" value={formatCurrency(inputs.implementationFee)} />
              <AssumptionRow label="Monthly AI/API cost" value={formatCurrency(inputs.monthlyAiApiCost)} />
              <AssumptionRow label="Monthly software cost" value={formatCurrency(inputs.monthlySoftwareCost)} />
            </div>
          )}
        </section>

        <div className="my-10">
          <DotRule />
        </div>

        {/* Client approval section (Phase 2.2) */}
        <section aria-labelledby="approval-heading">
          {approvalSubmitted ? (
            <div className="rounded-md border border-build/30 bg-build/5 p-6 text-center">
              <CheckCircle2 className="mx-auto size-8 text-build" strokeWidth={1.75} aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                {approvalAction === 'approve' ? 'Approved' : 'Feedback sent'}
              </h3>
              <p className="mt-1 text-[14px] text-ink-muted">
                {approvalAction === 'approve'
                  ? 'Thank you. Your approval has been recorded.'
                  : 'Thank you. Your change request has been sent.'}
              </p>
            </div>
          ) : showApprovalForm ? (
            <div className="rounded-md border border-border bg-surface p-6">
              <h3 id="approval-heading" className="font-display text-lg font-semibold text-ink">
                {approvalAction === 'approve' ? 'Confirm approval' : 'Request changes'}
              </h3>
              <p className="mt-1 text-[14px] text-ink-muted">
                {approvalAction === 'approve'
                  ? 'Confirm that you approve this business case.'
                  : 'Describe what needs to change before you can approve.'}
              </p>
              <form onSubmit={handleSubmitApproval} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="approval-name" className="block text-[13px] font-medium text-ink">
                    Your name <span className="text-dont-build">*</span>
                  </label>
                  <input
                    id="approval-name"
                    type="text"
                    required
                    value={approvalName}
                    onChange={(e) => setApprovalName(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-border bg-canvas px-3 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="approval-email" className="block text-[13px] font-medium text-ink">
                    Email <span className="text-ink-faint">(optional)</span>
                  </label>
                  <input
                    id="approval-email"
                    type="email"
                    value={approvalEmail}
                    onChange={(e) => setApprovalEmail(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-border bg-canvas px-3 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="approval-comment" className="block text-[13px] font-medium text-ink">
                    Comment <span className="text-ink-faint">(optional)</span>
                  </label>
                  <textarea
                    id="approval-comment"
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40"
                    placeholder={approvalAction === 'request_changes' ? 'What needs to change?' : 'Any additional notes'}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={approvalLoading || !approvalName.trim()}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand px-5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {approvalLoading ? 'Sending\u2026' : approvalAction === 'approve' ? 'Confirm approval' : 'Send request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowApprovalForm(false); setApprovalAction(null); }}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-border px-5 text-[14px] font-medium text-ink-muted transition-colors hover:bg-surface"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-md border border-border bg-surface p-6">
              <h3 id="approval-heading" className="font-display text-lg font-semibold text-ink">
                Your decision
              </h3>
              <p className="mt-1 text-[14px] text-ink-muted">
                Review the analysis above, then let us know where you stand.
              </p>
              {/* Mobile-first: buttons are full-width, thumb-reachable at bottom */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => { setApprovalAction('approve'); setShowApprovalForm(true); }}
                  className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-build px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <CheckCircle2 className="size-5" strokeWidth={2} aria-hidden="true" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => { setApprovalAction('request_changes'); setShowApprovalForm(true); }}
                  className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-consider bg-consider/5 px-6 text-[15px] font-semibold text-consider transition-colors hover:bg-consider/10"
                >
                  <MessageSquare className="size-5" strokeWidth={2} aria-hidden="true" />
                  Request changes
                </button>
              </div>
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

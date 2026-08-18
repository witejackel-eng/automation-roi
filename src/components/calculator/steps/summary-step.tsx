'use client';

/**
 * Wizard — Calculation Summary (Section 21).
 *
 * A condensed read-only view of every entered input, grouped by the three steps,
 * shown BEFORE the results page renders — so the user can catch a typo before
 * seeing a dramatic number. Each group has an "Edit" affordance that jumps the
 * wizard back to that step. The primary "Calculate ROI" + ghost "Back" buttons
 * live in the wizard footer (handled by Wizard.tsx), not here.
 *
 * Numbers always render in `font-mono tnum` per the design system. Empty optional
 * fields are omitted (not shown as "—") so the summary stays compact.
 */
import * as React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  formatCurrency,
  formatCount,
  formatPercent,
} from '@/lib/format';
import type { WizardFormInstance } from '@/components/calculator/wizard-resolver';
import type { StepId } from '@/components/calculator/stepper';
import { cn } from '@/lib/utils';

interface SummaryStepProps {
  form: WizardFormInstance;
  onEdit: (step: StepId) => void;
}

interface Row {
  label: string;
  value: string;
  /** Render with mono tabular-nums (default true for every numeric field). */
  mono?: boolean;
}

function num(v: string | undefined): number | undefined {
  if (!v || v.trim() === '') return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function currencyCell(v: string | undefined): string {
  const n = num(v);
  return n == null ? '' : formatCurrency(n);
}

function percentCell(v: string | undefined): string {
  const n = num(v);
  return n == null ? '' : formatPercent(n, { decimals: n % 1 === 0 ? 0 : 2 });
}

function ppCell(v: string | undefined): string {
  const n = num(v);
  if (n == null) return '';
  // Value is already in pp-form (e.g. "1.5" means 1.5pp). Append "pp".
  const decimals = n % 1 === 0 ? 0 : 1;
  return `${n.toFixed(decimals)}pp`;
}

function countCell(v: string | undefined): string {
  const n = num(v);
  return n == null ? '' : formatCount(n);
}

function decimalCell(v: string | undefined): string {
  const n = num(v);
  if (n == null) return '';
  // Show up to 2 decimals, no trailing zeros.
  return n.toString();
}

/** Filter out rows whose value is empty (optional fields the user skipped). */
function nonEmpty(rows: Row[]): Row[] {
  return rows.filter((r) => r.value !== '' && r.value != null);
}

function SummaryRow({ row }: { row: Row }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <dt className="text-sm text-ink-muted">{row.label}</dt>
      <dd
        className={cn(
          'text-sm text-ink text-right whitespace-nowrap',
          row.mono !== false && 'font-mono tnum',
        )}
      >
        {row.value}
      </dd>
    </div>
  );
}

function SummaryGroup({
  title,
  stepId,
  onEdit,
  children,
}: {
  title: string;
  stepId: StepId;
  onEdit: (step: StepId) => void;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={`${title} inputs`}
      className="rounded-lg border border-border bg-surface-raised"
    >
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="font-display text-sm font-semibold tracking-tight text-ink">
          {title}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(stepId)}
          className="h-8 gap-1.5 px-2 text-xs text-ink-muted hover:text-ink"
        >
          <Pencil className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Edit
        </Button>
      </header>
      <div className="px-5 py-2">
        <dl className="space-y-0">{children}</dl>
      </div>
    </section>
  );
}

export function SummaryStep({ form, onEdit }: SummaryStepProps) {
  const v = form.getValues();

  const businessRows: Row[] = nonEmpty([
    { label: 'Client / company name', value: v.clientName, mono: false },
    { label: 'Employees affected', value: countCell(v.employeesAffected) },
    { label: 'Hours per employee per week', value: decimalCell(v.hoursPerWeek) },
    { label: 'Hourly labor cost', value: currencyCell(v.hourlyCost) },
    { label: 'Monthly workload (tasks)', value: countCell(v.monthlyWorkload) },
    { label: 'Current error rate', value: percentCell(v.currentErrorRate) },
  ]);

  const revenueRows: Row[] = nonEmpty([
    { label: 'Leads per month', value: countCell(v.leadsPerMonth) },
    { label: 'Current conversion rate', value: percentCell(v.currentConversionRate) },
    { label: 'Average customer value', value: currencyCell(v.averageCustomerValue) },
    { label: 'Gross margin %', value: percentCell(v.grossMarginPct) },
  ]);

  const automationRows: Row[] = nonEmpty([
    { label: 'Expected automation %', value: percentCell(v.expectedAutomationPct) },
    { label: 'Expected error reduction %', value: percentCell(v.expectedErrorReductionPct) },
    { label: 'Expected conversion improvement', value: ppCell(v.expectedConversionImprovementPct) },
    { label: 'Implementation fee', value: currencyCell(v.implementationFee) },
    { label: 'Monthly AI/API cost', value: `${currencyCell(v.monthlyAiApiCost)}/mo` },
    { label: 'Monthly software/tool cost', value: `${currencyCell(v.monthlySoftwareCost)}/mo` },
    { label: 'Ongoing platform/API cost', value: `${currencyCell(v.platformApiCost)}/mo` },
    { label: 'Other annual cost', value: currencyCell(v.otherAnnualCost) },
  ]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">
        Review your assumptions before running the calculation. Numbers are shown exactly as the engine will receive them.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SummaryGroup title="Describe the automation" stepId="business" onEdit={onEdit}>
          {businessRows.map((r) => (
            <SummaryRow key={r.label} row={r} />
          ))}
        </SummaryGroup>
        <SummaryGroup title="What would it earn?" stepId="revenue" onEdit={onEdit}>
          {revenueRows.map((r) => (
            <SummaryRow key={r.label} row={r} />
          ))}
        </SummaryGroup>
        <SummaryGroup title="What does it cost today?" stepId="automation" onEdit={onEdit}>
          {automationRows.map((r) => (
            <SummaryRow key={r.label} row={r} />
          ))}
        </SummaryGroup>
      </div>
    </div>
  );
}

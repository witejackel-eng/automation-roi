'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  formatCount,
  formatRatioAsPercent,
  formatPercentagePoints,
} from '@/lib/format';
import type { CalculatorInputs } from '@/lib/calculations/engine';

interface AssumptionsTableProps {
  inputs: CalculatorInputs;
}

interface AssumptionItem {
  label: string;
  value: string;
  /** Descriptive-only fields are visually de-emphasized with text-ink-muted + "context" tag. */
  isContext?: boolean;
  /** Numeric values render in font-mono tnum; non-numeric in sans. */
  isNumeric?: boolean;
}

interface AssumptionSection {
  title: string;
  items: AssumptionItem[];
}

function buildSections(inputs: CalculatorInputs): AssumptionSection[] {
  return [
    {
      title: 'Business',
      items: [
        {
          label: 'Client name',
          value: inputs.clientName || '—',
        },
        {
          label: 'Employees affected',
          value: formatCount(inputs.employeesAffected),
          isNumeric: true,
        },
        {
          label: 'Hours per week',
          value: formatCount(inputs.hoursPerWeek),
          isNumeric: true,
        },
        {
          label: 'Hourly cost',
          value: formatCurrency(inputs.hourlyCost),
          isNumeric: true,
        },
        {
          label: 'Monthly workload',
          value: formatCount(inputs.monthlyWorkload ?? null),
          isContext: true,
          isNumeric: true,
        },
        {
          label: 'Current error rate',
          value: formatRatioAsPercent(inputs.currentErrorRate),
          isContext: true,
          isNumeric: true,
        },
      ],
    },
    {
      title: 'Revenue',
      items: [
        {
          label: 'Leads per month',
          value: formatCount(inputs.leadsPerMonth),
          isNumeric: true,
        },
        {
          label: 'Current conversion rate',
          value: formatRatioAsPercent(inputs.currentConversionRate),
          isContext: true,
          isNumeric: true,
        },
        {
          label: 'Average customer value',
          value: formatCurrency(inputs.averageCustomerValue),
          isNumeric: true,
        },
        {
          label: 'Gross margin',
          value: formatRatioAsPercent(inputs.grossMarginPct),
          isNumeric: true,
        },
      ],
    },
    {
      title: 'Automation',
      items: [
        {
          label: 'Expected automation rate',
          value: formatRatioAsPercent(inputs.expectedAutomationPct),
          isNumeric: true,
        },
        {
          label: 'Expected error reduction',
          value: formatRatioAsPercent(inputs.expectedErrorReductionPct),
          isContext: true,
          isNumeric: true,
        },
        {
          label: 'Expected conversion improvement',
          value: formatPercentagePoints(inputs.expectedConversionImprovementPct),
          isNumeric: true,
        },
        {
          label: 'Implementation fee',
          value: formatCurrency(inputs.implementationFee),
          isNumeric: true,
        },
        {
          label: 'Monthly AI API cost',
          value: formatCurrency(inputs.monthlyAiApiCost),
          isNumeric: true,
        },
        {
          label: 'Monthly software cost',
          value: formatCurrency(inputs.monthlySoftwareCost),
          isNumeric: true,
        },
        {
          label: 'Other annual cost',
          value: formatCurrency(inputs.otherAnnualCost),
          isNumeric: true,
        },
      ],
    },
  ];
}

function AssumptionItemRow({ item }: { item: AssumptionItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-ink-muted">{item.label}</span>
        {item.isContext && (
          <span className="text-[11px] uppercase tracking-wide text-ink-faint">
            context
          </span>
        )}
      </div>
      <div
        className={cn(
          'text-[15px]',
          item.isNumeric && 'font-mono tnum',
          item.isContext ? 'text-ink-muted' : 'text-ink'
        )}
      >
        {item.value}
      </div>
    </div>
  );
}

export function AssumptionsTable({ inputs }: AssumptionsTableProps) {
  const sections = buildSections(inputs);
  return (
    <div>
      {sections.map((section) => (
        <section key={section.title} className="mb-8 last:mb-0">
          <h4 className="text-[15px] font-semibold font-display text-ink border-t border-border pt-4 mb-4">
            {section.title}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {section.items.map((item) => (
              <AssumptionItemRow key={item.label} item={item} />
            ))}
          </div>
        </section>
      ))}
      <p className="text-[13px] text-ink-muted border-t border-border pt-4">
        Costs held constant across all scenarios; only benefit assumptions
        vary.
      </p>
    </div>
  );
}

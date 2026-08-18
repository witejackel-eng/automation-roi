'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  LabelList,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPayback } from '@/lib/format';
import {
  SCENARIO_ORDER,
  SCENARIO_LABELS,
  type ScenarioName,
} from '@/lib/calculations/scenarios';
import type { ScenarioResult } from '@/lib/calculations/engine';

/** Resolved design-token palette for SVG fills — recharts doesn't reliably
 * resolve CSS var() in SVG presentation attributes. */
const CHART_COLORS = {
  border: '#ECEAE8',
  surface: '#FAFAF9',
  ink: '#171516',
  inkMuted: '#727076',
  brand: '#FF164B',
  indigo: '#4338CA',
  emerald: '#1F8A5A',
} as const;

interface ScenarioComparisonProps {
  results: Record<ScenarioName, ScenarioResult>;
  isRevenueOpportunityOnly: boolean;
}

interface ChartDatum {
  name: string;
  value: number;
  fill: string;
  fillOpacity: number;
  paybackMonths: number | null;
}

function buildHeadline(
  results: Record<ScenarioName, ScenarioResult>
): string {
  const expected = results.expected.totalAnnualBenefit;
  const upside = results.upside.totalAnnualBenefit;
  if (expected > 0 && upside > expected * 1.3) {
    return 'Upside scenario nearly doubles expected benefit';
  }
  return 'Expected scenario carries the strongest benefit';
}

interface LabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number | number[];
  index?: number;
  payload?: ChartDatum & { payload?: ChartDatum };
}

/**
 * Build the value-label renderer with a closed-over reference to the data
 * array. recharts' `payload` shape is fragile across versions, so we look up
 * the datum by `index` instead — deterministic and version-independent.
 */
function makeScenarioValueLabel(data: ChartDatum[]) {
  return function ScenarioValueLabel(props: LabelProps) {
    const { x, y, width, value, index } = props;
    if (x == null || y == null || width == null) return null;
    if (value == null || !Number.isFinite(value as number)) return null;
    const datum = data[index ?? -1];
    const payback = datum?.paybackMonths;
    const paybackText = formatPayback(payback, { compact: true });
    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 22}
          textAnchor="middle"
          fill={CHART_COLORS.ink}
          style={{ fontSize: 12, fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
        >
          {formatCurrency(value as number, { compact: true })}
        </text>
        <text
          x={x + width / 2}
          y={y - 8}
          textAnchor="middle"
          fill={CHART_COLORS.inkMuted}
          style={{ fontSize: 11 }}
        >
          {paybackText} payback
        </text>
      </g>
    );
  };
}

interface TooltipContentProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}

function ScenarioTooltipContent(props: TooltipContentProps) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface-raised p-3 shadow-floating">
      <div className="text-[13px] text-ink-muted mb-1">{datum.name}</div>
      <div className="font-mono tnum text-sm text-ink">
        {formatCurrency(datum.value)}
      </div>
      <div className="font-mono tnum text-xs text-ink-muted mt-1">
        {formatPayback(datum.paybackMonths, { compact: true })} payback
      </div>
    </div>
  );
}

export function ScenarioComparison({
  results,
  isRevenueOpportunityOnly,
}: ScenarioComparisonProps) {
  const metricLabel = isRevenueOpportunityOnly
    ? 'Total benefit'
    : 'Total annual benefit';

  const data: ChartDatum[] = SCENARIO_ORDER.map((name) => {
    const r = results[name];
    const isExpected = name === 'expected';
    const isUpside = name === 'upside';
    return {
      name: SCENARIO_LABELS[name],
      value: r.totalAnnualBenefit,
      fill: isExpected ? CHART_COLORS.brand : CHART_COLORS.indigo,
      fillOpacity: isExpected ? 1 : isUpside ? 0.7 : 0.4,
      paybackMonths: r.paybackMonths,
    };
  });

  const yMax =
    Math.max(...data.map((d) => d.value), 1) * 1.2; // extra headroom for the two-line label

  const headline = buildHeadline(results);

  return (
    <div className={cn('rounded-lg border border-border bg-surface-raised p-6')} role="img" aria-label={`Scenario Comparison chart: ${headline}`}>
      <h3 className="text-[22px] leading-tight font-semibold font-display text-ink mb-1">
        Exhibit 2 — {headline}
      </h3>
      <p className="text-[13px] text-ink-muted mb-6">
        Source: client-provided inputs and Automation ROI calculation engine.
        Figures reflect each scenario's benefit assumptions; costs are held
        constant.
      </p>
      <div className="w-full" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 32, right: 16, bottom: 0, left: 8 }}
          >
            <CartesianGrid
              strokeDasharray="none"
              vertical={false}
              stroke={CHART_COLORS.border}
              strokeWidth={1}
            />
            <XAxis
              dataKey="name"
              tick={{
                fill: CHART_COLORS.inkMuted,
                fontSize: 11,
                fontFamily: 'var(--font-mono), ui-monospace, monospace',
              }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{
                fill: CHART_COLORS.inkMuted,
                fontSize: 11,
                fontFamily: 'var(--font-mono), ui-monospace, monospace',
              }}
              tickFormatter={(v: number) =>
                formatCurrency(v, { compact: true })
              }
              axisLine={false}
              tickLine={false}
              width={72}
              domain={[0, yMax]}
            />
            <RTooltip
              cursor={{ fill: CHART_COLORS.surface }}
              content={<ScenarioTooltipContent />}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.fill}
                  fillOpacity={entry.fillOpacity}
                />
              ))}
              <LabelList dataKey="value" content={makeScenarioValueLabel(data)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[13px] text-ink-muted mt-4">
        Metric: {metricLabel}. Expected bar in coral (brand); Conservative
        at 40% indigo; Upside at 70% indigo.
      </p>
    </div>
  );
}

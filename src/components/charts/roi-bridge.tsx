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
import { formatCurrency } from '@/lib/format';
import type { ScenarioResult } from '@/lib/calculations/engine';

/**
 * Resolved design-token palette for SVG fills. recharts renders `fill` as an
 * SVG presentation attribute, which does not reliably resolve CSS var()
 * substitution across browsers — so we pass the resolved hex directly. The CSS
 * variables in globals.css remain the source of truth; this object mirrors them.
 */
const CHART_COLORS = {
  borderStrong: '#CFCCC9',
  border: '#ECEAE8',
  surface: '#FAFAF9',
  ink: '#171516',
  inkMuted: '#727076',
  brand: '#FF164B',
  build: '#1F8A5A',
  dontBuild: '#B70F38',
} as const;

interface RoiBridgeProps {
  result: ScenarioResult; // typically the Expected scenario
  isRevenueOpportunityOnly: boolean;
}

/**
 * Each bar is rendered as a RANGE bar: `dataKey` returns `[start, end]` and
 * recharts draws a floating bar between them. This is the canonical recharts
 * waterfall pattern and avoids the fragile transparent-base-stack approach.
 */
interface ChartDatum {
  name: string;
  range: [number, number];
  fill: string;
  fillOpacity?: number;
  /** The signed value to render in the label / tooltip (may differ from bar height). */
  labelValue: number;
}

function buildHeadline(
  result: ScenarioResult,
  isRevenueOpportunityOnly: boolean
): string {
  if (isRevenueOpportunityOnly) return 'Labor savings drive the first-year benefit';
  if (result.additionalGrossProfit > result.annualLaborSavings) {
    return 'New revenue profit outweighs labor savings';
  }
  return 'Labor savings drive the majority of first-year benefit';
}

interface LabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number | number[];
  payload?: ChartDatum & { payload?: ChartDatum };
}

/**
 * Build the value-label renderer with a closed-over reference to the data
 * array. recharts' `payload` shape is fragile across versions, so we look up
 * the datum by `index` instead.
 */
function makeRoiBridgeValueLabel(data: ChartDatum[]) {
  return function RoiBridgeValueLabel(props: LabelProps) {
    const { x, y, width, index } = props;
    if (x == null || y == null || width == null) return null;
    const datum = data[index ?? -1];
    const display = datum?.labelValue;
    if (display == null || !Number.isFinite(display)) return null;
    return (
      <text
        x={x + width / 2}
        y={y - 6}
        textAnchor="middle"
        fill={CHART_COLORS.ink}
        style={{ fontSize: 12, fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
      >
        {formatCurrency(display, { compact: true })}
      </text>
    );
  };
}

interface TooltipContentProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}

function RoiBridgeTooltipContent(props: TooltipContentProps) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface-raised p-3 shadow-floating">
      <div className="text-[13px] text-ink-muted mb-1">{datum.name}</div>
      <div className="font-mono tnum text-sm text-ink">
        {formatCurrency(datum.labelValue)}
      </div>
    </div>
  );
}

export function RoiBridge({ result, isRevenueOpportunityOnly }: RoiBridgeProps) {
  const revenueLabel = isRevenueOpportunityOnly
    ? 'Revenue opportunity'
    : 'Additional profit';

  // Floating-bar coordinates: each bar is [start, end] on the Y axis.
  const labor = result.annualLaborCost;
  const savings = result.annualLaborSavings;
  const profit = result.additionalGrossProfit;
  const cost = result.totalFirstYearCost;
  const net = result.netAnnualBenefit;

  // The intermediate peak after the up-step.
  const peak = Math.max(labor, labor - savings + profit, result.totalAnnualBenefit, 1);
  const yMax = peak * 1.2;

  // When additionalGrossProfit is 0, render a tiny sliver so the slot exists.
  const profitIsZero = profit === 0;
  const profitSlotHeight = Math.max(peak * 0.01, 1);

  const data: ChartDatum[] = [
    {
      name: 'Current\nlabor cost',
      range: [0, labor],
      fill: CHART_COLORS.borderStrong,
      labelValue: labor,
    },
    {
      name: 'Labor\nsavings',
      range: [Math.max(0, labor - savings), labor],
      fill: CHART_COLORS.build,
      labelValue: -savings, // down-step
    },
    {
      name: revenueLabel,
      range: profitIsZero
        ? [Math.max(0, labor - savings), Math.max(0, labor - savings) + profitSlotHeight]
        : [Math.max(0, labor - savings), Math.max(0, labor - savings) + profit],
      fill: CHART_COLORS.brand,
      fillOpacity: profitIsZero ? 0.35 : 1,
      labelValue: profit,
    },
    {
      name: 'Automation\ncost',
      range: [Math.max(0, labor - savings + profit - cost), Math.max(0, labor - savings + profit)],
      fill: CHART_COLORS.dontBuild,
      fillOpacity: 0.7,
      labelValue: -cost, // down-step
    },
    {
      name: 'Net annual\nbenefit',
      range: [0, Math.max(0, net)],
      fill: net < 0 ? CHART_COLORS.dontBuild : CHART_COLORS.ink,
      fillOpacity: net < 0 ? 0.7 : 1,
      labelValue: net,
    },
  ];

  const headline = buildHeadline(result, isRevenueOpportunityOnly);

  return (
    <div className={cn('rounded-lg border border-border bg-surface-raised p-6')} role="img" aria-label={`ROI Bridge waterfall chart: ${headline}`}>
      <h3 className="text-[22px] leading-tight font-semibold font-display text-ink mb-1">
        Exhibit 1 — {headline}
      </h3>
      <p className="text-[13px] text-ink-muted mb-6">
        Source: client-provided inputs and Automation ROI calculation engine.
        Figures reflect the Expected scenario unless noted.
      </p>
      <div className="w-full" style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 28, right: 16, bottom: 8, left: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={CHART_COLORS.border}
            />
            <XAxis
              dataKey="name"
              tick={{
                fill: CHART_COLORS.inkMuted,
                fontSize: 12,
              }}
              axisLine={{ stroke: CHART_COLORS.border }}
              tickLine={false}
              interval={0}
              // Render multi-line names.
              tickFormatter={(v: string) => v}
            />
            <YAxis
              tick={{
                fill: CHART_COLORS.inkMuted,
                fontSize: 13,
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
              content={<RoiBridgeTooltipContent />}
            />
            <Bar dataKey="range" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.fill}
                  fillOpacity={entry.fillOpacity ?? 1}
                />
              ))}
              <LabelList dataKey="range" content={makeRoiBridgeValueLabel(data)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

/**
 * AssumptionsTable — Input quality breakdown (Section 6.4, 11).
 *
 * A responsive table showing each material input's status, weight,
 * contribution to the confidence score, and how to improve it.
 *
 * Status badges are color-coded:
 *   - Measured (green) — user provided
 *   - Estimated (amber) — Viableo suggested
 *   - Assumed (gray) — modeling assumption
 */
import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Dot } from './dot';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────

export interface AssumptionsRow {
  name: string;
  status: 'measured' | 'estimated' | 'assumed';
  weight: number;
  contribution: number;
  improvementAction: string;
}

export interface AssumptionsTableProps {
  inputs: AssumptionsRow[];
  className?: string;
}

// ── Status badge ───────────────────────────────────────────

const STATUS_STYLES: Record<
  AssumptionsRow['status'],
  { text: string; bg: string; label: string }
> = {
  measured: {
    text: '#1F8A5A',
    bg: '#E7F4ED',
    label: 'Measured',
  },
  estimated: {
    text: '#C98A1B',
    bg: '#FBF1E0',
    label: 'Estimated',
  },
  assumed: {
    text: '#6F6C72',
    bg: '#EFEDF0',
    label: 'Assumed',
  },
};

function StatusBadge({ status }: { status: AssumptionsRow['status'] }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.04em] whitespace-nowrap',
      )}
      style={{ backgroundColor: s.bg, color: s.text }}
      aria-label={s.label}
      title={s.label}
    >
      <span
        aria-hidden="true"
        className="inline-block h-1 w-1 rounded-full"
        style={{ backgroundColor: s.text }}
      />
      {s.label}
    </span>
  );
}

// ── Component ──────────────────────────────────────────────

export function AssumptionsTable({ inputs, className }: AssumptionsTableProps) {
  return (
    <section
      className={cn('rounded-lg border border-border bg-surface p-5 md:p-6', className)}
      aria-label="Assumptions breakdown"
    >
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.005em] text-ink-muted">
          <Dot size="sm" />
          Input quality
        </div>
        <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-ink">
          Every number, labelled
        </h3>
        <p className="mt-1 text-[14px] leading-snug text-ink-muted">
          Each input tagged by how it was sourced. Guess more, and confidence falls.
        </p>
      </div>

      {/* Table — responsive: horizontal scroll on small screens */}
      <div className="-mx-5 md:-mx-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[12px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
                Input
              </TableHead>
              <TableHead className="text-[12px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
                Status
              </TableHead>
              <TableHead className="text-right text-[12px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
                Weight
              </TableHead>
              <TableHead className="text-right text-[12px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
                Contribution
              </TableHead>
              <TableHead className="hidden sm:table-cell text-[12px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
                How to Improve
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inputs.map((row) => (
              <TableRow key={row.name} className="border-border">
                <TableCell className="text-[13px] font-medium text-ink whitespace-normal">
                  {row.name}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-right font-mono tnum text-[12px] text-ink-muted">
                  {row.weight}wt
                </TableCell>
                <TableCell className="text-right font-mono tnum text-[12px] font-medium text-ink">
                  {Math.round(row.contribution)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-[12px] text-ink-muted whitespace-normal">
                  {row.improvementAction}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile improvement actions — shown below table on small screens */}
      <div className="mt-4 sm:hidden space-y-2">
        {inputs
          .filter((r) => r.status !== 'measured')
          .map((row) => (
            <div
              key={`mobile-${row.name}`}
              className="rounded-md border border-border bg-canvas p-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-ink">{row.name}</span>
                <StatusBadge status={row.status} />
              </div>
              <p className="mt-1 text-[12px] text-ink-muted">{row.improvementAction}</p>
            </div>
          ))}
      </div>

      {/* Legend */}
      <div className="mt-4 rounded-md border border-border bg-canvas p-3">
        <p className="text-[12px] text-ink-muted">
          <span className="font-medium text-ink">Measured</span> counts fully (×1.0).{' '}
          <span className="font-medium text-ink">Estimated</span> counts 60% (×0.6).{' '}
          <span className="font-medium text-ink">Assumed</span> counts 30% (×0.3).
        </p>
      </div>
    </section>
  );
}

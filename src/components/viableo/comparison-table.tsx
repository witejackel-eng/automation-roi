'use client';

/**
 * Comparison table (Section 7.9, 9.6).
 *
 * Sticky header row on scroll within the section. The Viableo column gets a
 * persistent subtle background tint and coral checkmarks; all other columns
 * stay neutral gray/charcoal. On hover of any row, lightly highlight that
 * row's background across all columns to aid horizontal scanning.
 *
 * Mobile: horizontal scroll with the Viableo column pinned/sticky on the right.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';
import { COMPARISON_ROWS, COMPANY_NAME } from '@/lib/brand';

export function ComparisonTable({ className }: { className?: string }) {
  return (
    <div className={cn('w-full', className)}>
      {/* Desktop / tablet */}
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
                What agencies need
              </th>
              <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
                Generic AI tools
              </th>
              <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.005em] text-ink-muted">
                Spreadsheets
              </th>
              <th className="bg-brand-subtle px-4 py-3 text-center text-[12px] font-bold uppercase tracking-[0.005em] text-brand">
                {COMPANY_NAME}
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr
                key={row.need}
                className={cn(
                  'group border-b border-border transition-colors duration-hover',
                  i === COMPARISON_ROWS.length - 1 ? 'border-b-0' : '',
                  'hover:bg-canvas'
                )}
              >
                <td className="px-4 py-3 text-[14px] font-medium text-ink">
                  {row.need}
                </td>
                <td className="px-4 py-3 text-center">
                  <Cell mark={row.generic} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Cell mark={row.spreadsheet} />
                </td>
                <td className="bg-brand-subtle/60 px-4 py-3 text-center group-hover:bg-brand-subtle">
                  <Cell mark={row.viableo} highlight />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: horizontal scroll with Viableo column pinned right */}
      <div className="overflow-x-auto md:hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="sticky left-0 z-10 bg-surface px-3 py-2 text-left text-[11px] font-semibold uppercase text-ink-muted">
                Need
              </th>
              <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase text-ink-muted">AI</th>
              <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase text-ink-muted">Sheets</th>
              <th className="sticky right-0 z-10 bg-brand-subtle px-3 py-2 text-center text-[11px] font-bold uppercase text-brand">
                {COMPANY_NAME}
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.need} className="border-b border-border">
                <td className="sticky left-0 z-10 bg-surface px-3 py-2 text-[12px] font-medium text-ink">
                  {row.need}
                </td>
                <td className="px-3 py-2 text-center"><Cell mark={row.generic} /></td>
                <td className="px-3 py-2 text-center"><Cell mark={row.spreadsheet} /></td>
                <td className="sticky right-0 z-10 bg-brand-subtle px-3 py-2 text-center">
                  <Cell mark={row.viableo} highlight />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({ mark, highlight }: { mark: boolean; highlight?: boolean }) {
  if (mark) {
    return (
      <Check
        className={cn('mx-auto h-4 w-4', highlight ? 'text-brand' : 'text-ink-muted')}
        strokeWidth={2.25}
        aria-label="Yes"
      />
    );
  }
  return (
    <Minus className="mx-auto h-4 w-4 text-ink-faint" strokeWidth={2} aria-label="No" />
  );
}

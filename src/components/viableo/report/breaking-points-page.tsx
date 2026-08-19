/**
 * BreakingPointsPage — PDF section for sensitivity / breaking points.
 *
 * Displays a ranked list of sensitive factors with their exact
 * break-even values, current values, and headroom percentages.
 */
import { cn } from '@/lib/utils';
import { AlertTriangle, ArrowDownRight } from 'lucide-react';

interface BreakingFactor {
  label: string;
  breakValue: number;
  currentValue: number;
  headroomPct: number;
  unit: string;
}

interface BreakingPointsPageProps {
  factors: BreakingFactor[];
  className?: string;
}

/** Colour band based on how thin the headroom is. */
function headroomColor(headroomPct: number): string {
  if (headroomPct <= 10) return 'text-red-600 dark:text-red-400';
  if (headroomPct <= 25) return 'text-amber-600 dark:text-amber-400';
  return 'text-muted-foreground';
}

export function BreakingPointsPage({ factors, className }: BreakingPointsPageProps) {
  // Sort by headroom ascending — tightest first
  const sorted = [...factors].sort((a, b) => a.headroomPct - b.headroomPct);

  return (
    <section className={cn('space-y-6', className)}>
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">
          Where the answer breaks
        </h2>
        <p className="text-sm text-muted-foreground">
          Each factor shows the exact value at which the verdict flips.
          Smaller headroom means the assumption matters more.
        </p>
      </div>

      <div className="space-y-2">
        {sorted.map((factor, i) => {
          const isCritical = factor.headroomPct <= 10;
          return (
            <div
              key={factor.label}
              className={cn(
                'grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border px-4 py-3',
                isCritical && 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20',
              )}
            >
              {/* Rank */}
              <span className="text-xs font-bold text-muted-foreground tabular-nums">
                {i + 1}.
              </span>

              {/* Label + bar */}
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {factor.label}
                  </span>
                  {isCritical && (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono tabular-nums">
                    {factor.currentValue.toLocaleString()}{factor.unit}
                  </span>
                  <ArrowDownRight className="h-3 w-3 shrink-0" />
                  <span className="font-mono tabular-nums">
                    {factor.breakValue.toLocaleString()}{factor.unit}
                  </span>
                </div>
              </div>

              {/* Headroom % */}
              <span
                className={cn(
                  'font-mono text-sm font-semibold tabular-nums whitespace-nowrap',
                  headroomColor(factor.headroomPct),
                )}
              >
                {factor.headroomPct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

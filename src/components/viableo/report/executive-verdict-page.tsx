/**
 * ExecutiveVerdictPage — full-page hero treatment for the verdict.
 *
 * Designed as a PDF section component that occupies a full page with
 * large verdict typography, a confidence indicator bar, the rationale
 * copy, and a key metric callout.
 */
import { cn } from '@/lib/utils';
import { DECISION_COLORS, VERDICT_COPY, type DecisionKey } from '@/lib/brand';

interface ExecutiveVerdictPageProps {
  verdict: string;
  confidence: number;
  rationale: string;
  keyMetric: {
    label: string;
    value: string;
  };
  className?: string;
}

export function ExecutiveVerdictPage({
  verdict,
  confidence,
  rationale,
  keyMetric,
  className,
}: ExecutiveVerdictPageProps) {
  const key = verdict as DecisionKey;
  const colors = DECISION_COLORS[key] ?? DECISION_COLORS.consider;
  const copy = VERDICT_COPY[key];

  const confidenceBand =
    confidence >= 80
      ? 'High'
      : confidence >= 60
        ? 'Moderate'
        : confidence >= 40
          ? 'Material uncertainty'
          : 'Low';

  return (
    <div
      className={cn(
        'flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-8 py-16 text-center',
        className,
      )}
    >
      {/* Verdict hero */}
      <div className="space-y-6">
        {/* Large verdict text */}
        <h1
          className="text-5xl font-extrabold uppercase tracking-tight sm:text-6xl lg:text-7xl"
          style={{ color: colors.text }}
        >
          {colors.label}
        </h1>

        {/* Subhead from brand copy */}
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          {copy.subhead}
        </p>

        {/* Confidence indicator */}
        <div className="mx-auto max-w-md space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Confidence</span>
            <span className="font-mono tabular-nums">
              {confidence}/100 — {confidenceBand}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${confidence}%`,
                backgroundColor:
                  confidence >= 60 ? colors.text : '#8B5E0A',
              }}
            />
          </div>
        </div>

        {/* Key metric callout */}
        <div
          className="mx-auto inline-flex flex-col items-center rounded-xl border-2 px-8 py-5"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.bg,
          }}
        >
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {keyMetric.label}
          </span>
          <span
            className="mt-1 font-mono text-3xl font-bold tabular-nums sm:text-4xl"
            style={{ color: colors.text }}
          >
            {keyMetric.value}
          </span>
        </div>

        {/* Rationale */}
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
          {rationale}
        </p>
      </div>
    </div>
  );
}

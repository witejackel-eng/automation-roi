'use client';

/**
 * AiRisksSummary — "Top risks to this decision" (Phase 4.1, P1).
 *
 * Client component that fetches and displays the AI risk summary.
 * The risks are grounded in computed stress-test data, so generation
 * risk is near zero — the LLM summarizes, it does not invent.
 *
 * States:
 *   - Idle: "Summarize risks" button
 *   - Loading: skeleton shimmer
 *   - Success: numbered list of risks
 *   - Error: "Could not generate risk summary. Your analysis is safe."
 *
 * "Regenerate" button re-fetches.
 */
import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dot } from '@/components/viableo';
import type { SensitivityItem } from '@/lib/calculations/stress-test';

interface AiRisksSummaryProps {
  sensitivity: SensitivityItem[];
  baseRoi: number | null;
  recommendation?: 'build' | 'consider' | 'dont_build';
  alreadyBroken?: boolean;
  className?: string;
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export function AiRisksSummary({
  sensitivity,
  baseRoi,
  recommendation,
  alreadyBroken,
  className,
}: AiRisksSummaryProps) {
  const [state, setState] = React.useState<FetchState>('idle');
  const [risks, setRisks] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const fetchRisks = React.useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const res = await fetch('/api/ai/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sensitivity,
          baseRoi,
          recommendation,
          alreadyBroken,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Request failed');
      }
      const data = await res.json();
      setRisks(data.risks ?? '');
      setState('success');
    } catch {
      setError('Could not generate risk summary. Your analysis is safe.');
      setState('error');
    }
  }, [sensitivity, baseRoi, recommendation, alreadyBroken]);

  // Parse the numbered list from the AI response.
  const riskLines = React.useMemo(() => {
    if (!risks) return [];
    return risks
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [risks]);

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.005em] text-ink-muted">
          <Dot size="sm" />
          AI risk summary
        </div>
        {state === 'success' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRisks}
            className="h-7 gap-1.5 text-[12px] text-ink-muted"
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRisks}
              className="h-8 gap-2 text-[13px]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Summarize risks
            </Button>
            <span className="text-[12px] text-ink-faint">
              AI-generated, grounded in your stress-test data
            </span>
          </motion.div>
        )}

        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[70%]" />
          </motion.div>
        )}

        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="space-y-2">
              {riskLines.map((line, i) => (
                <p key={i} className="text-[14px] leading-[1.55] text-ink">
                  {line}
                </p>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-ink-faint">
              AI-generated summary — grounded in computed sensitivity data
            </p>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-md border border-border bg-surface p-3 text-[13px] text-ink-muted"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-ink-faint" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

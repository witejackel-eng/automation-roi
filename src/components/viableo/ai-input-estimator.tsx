'use client';

/**
 * AiInputEstimator — AI-assisted input estimation (Phase 4.2, P1).
 *
 * A component that appears in the calculator wizard when a field is empty.
 * "Get AI suggestion" button sends the current context (industry/role) to
 * the AI estimate endpoint, and shows the suggestion as a range with a
 * "Use typical value" button.
 *
 * When the user accepts a suggestion, the input automatically gets 'assumption'
 * status so the confidence model applies its 0.3x multiplier.
 *
 * DO NOT BUILD (Phase 4.4 exclusions):
 *   - No conversational chatbot for wizard input
 *   - No separate "AI confidence" score
 */
import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfidenceTag } from '@/components/viableo/confidence-tag';
import type { InputStatus } from '@/lib/calculations/confidence';

interface FieldEstimate {
  min: number;
  max: number;
  typical: number;
  unit: string;
  status: 'assumption';
}

interface AiInputEstimatorProps {
  /** The field name to estimate (e.g. 'automationPct', 'implementationFee'). */
  fieldName: string;
  /** Human-readable label for the field. */
  fieldLabel: string;
  /** Current industry/role context string. */
  context: string;
  /** Callback when the user accepts a suggestion. */
  onAccept: (value: number, status: InputStatus) => void;
  /** Whether this estimator is disabled (e.g. field already filled). */
  disabled?: boolean;
  className?: string;
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export function AiInputEstimator({
  fieldName,
  fieldLabel,
  context,
  onAccept,
  disabled = false,
  className,
}: AiInputEstimatorProps) {
  const [state, setState] = React.useState<FetchState>('idle');
  const [estimate, setEstimate] = React.useState<FieldEstimate | null>(null);
  const [errorText, setErrorText] = React.useState<string>('');

  const fetchEstimate = React.useCallback(async () => {
    if (!context.trim()) return;
    setState('loading');
    setErrorText('');
    try {
      const res = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          fields: [fieldName],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Request failed');
      }
      const data = await res.json();
      const fieldEstimate = data.estimates?.[fieldName];
      if (!fieldEstimate) {
        throw new Error('No estimate available for this field.');
      }
      setEstimate(fieldEstimate);
      setState('success');
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Could not get suggestion.');
      setState('error');
    }
  }, [context, fieldName]);

  const handleUseTypical = React.useCallback(() => {
    if (estimate) {
      onAccept(estimate.typical, 'assumption');
      setState('idle');
      setEstimate(null);
    }
  }, [estimate, onAccept]);

  // Format the value for display based on unit.
  const formatValue = React.useCallback(
    (n: number, unit: string) => {
      if (unit === 'decimal') {
        // Show as percentage for decimal fields.
        return `${(n * 100).toFixed(1)}%`;
      }
      if (unit === 'USD') {
        return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
      }
      return `${n}`;
    },
    []
  );

  if (disabled) return null;

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchEstimate}
              className="h-7 gap-1.5 text-[12px] text-ink-muted hover:text-ink"
              disabled={!context.trim()}
            >
              <Sparkles className="h-3 w-3" />
              Get AI suggestion
            </Button>
          </motion.div>
        )}

        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-muted" />
            <Skeleton className="h-4 w-32" />
          </motion.div>
        )}

        {state === 'success' && estimate && (
          <motion.div
            key="success"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1.5 rounded-md border border-border bg-surface p-2.5">
              <div className="flex items-center gap-2 text-[12px] text-ink-muted">
                <Sparkles className="h-3 w-3" />
                <span>AI suggestion for {fieldLabel}</span>
                <ConfidenceTag status="assumption" />
              </div>
              <div className="text-[13px] text-ink">
                {formatValue(estimate.min, estimate.unit)} – {formatValue(estimate.max, estimate.unit)}{' '}
                <span className="text-ink-muted">(typical: {formatValue(estimate.typical, estimate.unit)})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseTypical}
                className="mt-1 h-7 gap-1.5 text-[12px]"
              >
                <Check className="h-3 w-3" />
                Use typical value
              </Button>
            </div>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-[11px] text-ink-faint">{errorText}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

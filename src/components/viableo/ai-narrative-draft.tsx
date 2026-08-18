'use client';

/**
 * AiNarrativeDraft — AI-drafted narrative sections (Phase 4.3, P2).
 *
 * STRICTLY templated from structured inputs — not free-form generation.
 * Shows the AI-drafted "Current State" and "Proposed Automation" sections
 * in editable textareas. The draft is clearly labeled as AI-generated.
 *
 * Workflow:
 *   1. User clicks "Generate draft" → fetches from /api/ai/narrative
 *   2. Shows the two sections in editable textareas (Edit mode)
 *   3. User can edit freely → "Accept" saves the final text
 *   4. The draft is clearly labeled as AI-generated and editable
 *
 * All AI output must be editable by the user before export.
 *
 * DO NOT BUILD (Phase 4.4 exclusions):
 *   - No conversational chatbot for wizard input
 *   - No separate "AI confidence" score
 */
import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Pencil, Check, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dot } from '@/components/viableo';

interface NarrativeInputs {
  clientName: string;
  employeesAffected: number;
  hoursPerWeek: number;
  hourlyCost: number;
  annualLaborCost?: number;
  automationPct: number;
  implementationFee: number;
  monthlyOperatingCost?: number;
  industryContext?: string;
  processDescription?: string;
}

interface AiNarrativeDraftProps {
  inputs: NarrativeInputs;
  /** Callback when the user accepts the final draft. */
  onAccept: (currentState: string, proposedAutomation: string) => void;
  /** Pre-accepted values (if the draft was already accepted). */
  savedState?: string;
  savedAutomation?: string;
  className?: string;
}

type Phase = 'idle' | 'loading' | 'editing' | 'error';

export function AiNarrativeDraft({
  inputs,
  onAccept,
  savedState,
  savedAutomation,
  className,
}: AiNarrativeDraftProps) {
  const [phase, setPhase] = React.useState<Phase>('idle');
  const [currentState, setCurrentState] = React.useState('');
  const [proposedAutomation, setProposedAutomation] = React.useState('');
  const [errorText, setErrorText] = React.useState('');

  // If saved values exist, start in editing mode with those values.
  React.useEffect(() => {
    if (savedState && savedAutomation) {
      setCurrentState(savedState);
      setProposedAutomation(savedAutomation);
      setPhase('editing');
    }
  }, [savedState, savedAutomation]);

  const generateDraft = React.useCallback(async () => {
    setPhase('loading');
    setErrorText('');
    try {
      const res = await fetch('/api/ai/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Request failed');
      }
      const data = await res.json();
      setCurrentState(data.currentState ?? '');
      setProposedAutomation(data.proposedAutomation ?? '');
      setPhase('editing');
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Could not generate draft.');
      setPhase('error');
    }
  }, [inputs]);

  const handleAccept = React.useCallback(() => {
    if (currentState.trim() && proposedAutomation.trim()) {
      onAccept(currentState, proposedAutomation);
    }
  }, [currentState, proposedAutomation, onAccept]);

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.005em] text-ink-muted">
          <Dot size="sm" />
          Narrative draft
        </div>
        {phase === 'editing' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={generateDraft}
            className="h-7 gap-1.5 text-[12px] text-ink-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Regenerate
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
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
              onClick={generateDraft}
              className="h-8 gap-2 text-[13px]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate draft
            </Button>
            <span className="text-[12px] text-ink-faint">
              AI-drafted from your inputs — editable before export
            </span>
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div>
              <Skeleton className="mb-2 h-3 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div>
              <Skeleton className="mb-2 h-3 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          </motion.div>
        )}

        {phase === 'editing' && (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Current State */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <label className="text-[13px] font-medium text-ink">Current State</label>
                <span className="inline-flex items-center gap-1 rounded-sm bg-surface px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.04em] text-ink-muted">
                  <Pencil className="h-2.5 w-2.5" />
                  AI-drafted — editable
                </span>
              </div>
              <Textarea
                value={currentState}
                onChange={(e) => setCurrentState(e.target.value)}
                rows={3}
                className="text-[14px] leading-[1.55]"
                aria-label="Current State narrative — editable"
              />
            </div>

            {/* Proposed Automation */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <label className="text-[13px] font-medium text-ink">Proposed Automation</label>
                <span className="inline-flex items-center gap-1 rounded-sm bg-surface px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.04em] text-ink-muted">
                  <Pencil className="h-2.5 w-2.5" />
                  AI-drafted — editable
                </span>
              </div>
              <Textarea
                value={proposedAutomation}
                onChange={(e) => setProposedAutomation(e.target.value)}
                rows={3}
                className="text-[14px] leading-[1.55]"
                aria-label="Proposed Automation narrative — editable"
              />
            </div>

            {/* Accept button */}
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={handleAccept}
                disabled={!currentState.trim() || !proposedAutomation.trim()}
                className="h-8 gap-2 text-[13px]"
              >
                <Check className="h-3.5 w-3.5" />
                Accept
              </Button>
              <span className="text-[12px] text-ink-faint">
                Edit freely, then accept to save
              </span>
            </div>
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <p className="text-[13px] text-ink-muted">{errorText}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateDraft}
              className="h-7 gap-1.5 text-[12px] text-ink-muted"
            >
              <Loader2 className="h-3 w-3" />
              Try again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

/**
 * ChallengePanel — inline assumption challenge UI.
 *
 * Shows the current value of a field, a "Challenge This Assumption" button,
 * and on submit displays the DeltaView comparing original vs. challenged
 * results.
 */
import * as React from 'react';
import { Pencil, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DeltaView } from './delta-view';

export interface ChallengeResult {
  originalResults: {
    verdict: string;
    confidence: number;
    payback: number | null;
    roi: number | null;
    netAnnualBenefit: number;
  };
  challengedResults: {
    verdict: string;
    confidence: number;
    payback: number | null;
    roi: number | null;
    netAnnualBenefit: number;
  };
  delta: {
    field: string;
    previousValue: number;
    newValue: number;
    verdictChanged: boolean;
    previousVerdict: string;
    newVerdict: string;
  };
}

interface ChallengePanelProps {
  fieldName: string;
  currentValue: number;
  unit?: string;
  /** When provided, the challenge runs entirely client-side via this callback
   *  instead of hitting the /api/projects/[id]/challenge endpoint.
   *  Use this when no projectId is available (e.g. unsaved results view). */
  onChallenge?: (field: string, newValue: number) => Promise<ChallengeResult>;
  /** Legacy API-based mode — requires a saved project. Ignored when onChallenge is provided. */
  projectId?: string;
  onChallengeComplete?: (delta: ChallengeResult['delta']) => void;
}

function formatFieldLabel(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

type PanelState = 'idle' | 'editing' | 'loading' | 'result' | 'error';

export function ChallengePanel({
  fieldName,
  currentValue,
  unit = '',
  onChallenge,
  projectId,
  onChallengeComplete,
}: ChallengePanelProps) {
  const [state, setState] = React.useState<PanelState>('idle');
  const [newValue, setNewValue] = React.useState('');
  const [result, setResult] = React.useState<ChallengeResult | null>(null);
  const [errorMsg, setErrorMsg] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus the input when entering edit mode
  React.useEffect(() => {
    if (state === 'editing' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [state]);

  const handleChallenge = async () => {
    const parsed = parseFloat(newValue);
    if (isNaN(parsed) || parsed < 0) {
      setErrorMsg('Enter a valid non-negative number.');
      return;
    }
    if (parsed === currentValue) {
      setErrorMsg('New value must differ from the current value.');
      return;
    }

    setState('loading');
    setErrorMsg('');

    try {
      let data: ChallengeResult;

      if (onChallenge) {
        // Client-side mode — no API round-trip.
        data = await onChallenge(fieldName, parsed);
      } else if (projectId) {
        // Legacy API-based mode.
        const res = await fetch(`/api/projects/${projectId}/challenge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: fieldName, newValue: parsed }),
        });

        if (!res.ok) {
          const errBody = (await res.json()) as { error?: string };
          throw new Error(errBody.error ?? `Request failed (${res.status})`);
        }

        data = (await res.json()) as ChallengeResult;
      } else {
        throw new Error('No projectId or onChallenge handler provided.');
      }
      setResult(data);
      setState('result');
      onChallengeComplete?.(data.delta);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Challenge failed.');
      setState('error');
    }
  };

  const handleRevert = () => {
    setState('idle');
    setNewValue('');
    setResult(null);
    setErrorMsg('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleChallenge();
    } else if (e.key === 'Escape') {
      handleRevert();
    }
  };

  return (
    <div className="space-y-3">
      {/* Idle state: current value + challenge button */}
      {state === 'idle' && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {formatFieldLabel(fieldName)}
            </p>
            <p className="mt-0.5 font-mono text-lg tabular-nums">
              {currentValue.toLocaleString()}{unit}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setNewValue(String(currentValue));
              setState('editing');
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5',
              'text-sm font-medium text-muted-foreground',
              'hover:bg-muted hover:text-foreground transition-colors',
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            Challenge
          </button>
        </div>
      )}

      {/* Editing state: input + submit */}
      {(state === 'editing' || state === 'loading' || state === 'error') && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label
                htmlFor={`challenge-${fieldName}`}
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                {formatFieldLabel(fieldName)}
              </label>
              <Input
                ref={inputRef}
                id={`challenge-${fieldName}`}
                type="number"
                min={0}
                step="any"
                value={newValue}
                onChange={(e) => {
                  setNewValue(e.target.value);
                  setErrorMsg('');
                }}
                onKeyDown={handleKeyDown}
                disabled={state === 'loading'}
                className="mt-1 font-mono tabular-nums"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive">{errorMsg}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleChallenge}
              disabled={state === 'loading'}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2',
                'text-sm font-medium text-primary-foreground',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:pointer-events-none',
              )}
            >
              {state === 'loading' && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Run what-if
            </button>
            <button
              type="button"
              onClick={handleRevert}
              disabled={state === 'loading'}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-4 py-2',
                'text-sm font-medium text-muted-foreground',
                'hover:bg-muted transition-colors',
                'disabled:opacity-50 disabled:pointer-events-none',
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Result state: DeltaView */}
      {state === 'result' && result && (
        <DeltaView
          original={result.originalResults}
          challenged={result.challengedResults}
          changedField={result.delta.field}
          previousValue={result.delta.previousValue}
          newValue={result.delta.newValue}
          unit={unit}
          onRevert={handleRevert}
        />
      )}
    </div>
  );
}

'use client';

/**
 * ClientHistoryReuse — P1 feature.
 *
 * In the calculator wizard, when a user starts a new analysis, show a
 * "Reuse from prior client" option if the org has existing projects.
 * When selected, show a dropdown of prior client names. On selection,
 * pre-fill the wizard with the prior project's inputs.
 *
 * Uses the existing `client_history` capability flag.
 */
import * as React from 'react';
import { ChevronDown, History } from 'lucide-react';
import { useApp } from '@/lib/store';
import { has } from '@/lib/entitlement';
import type { CalculatorInputs } from '@/lib/calculations/engine';
import { cn } from '@/lib/utils';

interface ClientHistoryReuseProps {
  /** Called when the user selects a prior client to reuse inputs from. */
  onReuse: (inputs: CalculatorInputs) => void;
  className?: string;
}

export function ClientHistoryReuse({
  onReuse,
  className,
}: ClientHistoryReuseProps) {
  const { projects, entitlement } = useApp(
    React.useCallback(
      (s) => ({
        projects: s.projects,
        entitlement: s.entitlement,
      }),
      [],
    ),
  );

  const canUseClientHistory = !!entitlement && has(entitlement, 'client_history');
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click.
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleSelect = async (projectId: string) => {
    setIsOpen(false);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        inputs: CalculatorInputs;
      };
      if (data.inputs) {
        onReuse(data.inputs);
      }
    } catch {
      // Silently fail — the user can just fill in manually.
    }
  };

  // Only show if the org has the client_history capability AND has projects.
  if (!canUseClientHistory || projects.length === 0) return null;

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-[44px] items-center gap-2 rounded-md border border-border bg-canvas px-3 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <History className="size-4" strokeWidth={1.75} aria-hidden="true" />
        Reuse from prior client
        <ChevronDown
          className={cn(
            'ml-auto size-3.5 transition-transform',
            isOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Prior clients"
          className="absolute left-0 z-10 mt-1 w-72 max-h-64 overflow-y-auto rounded-md border border-border bg-surface shadow-floating"
        >
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(project.id)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-ink transition-colors hover:bg-surface-raised min-h-[44px]"
            >
              <span className="truncate font-medium">{project.clientName}</span>
              <span className="ml-auto shrink-0 text-[11px] text-ink-muted">
                {new Date(project.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

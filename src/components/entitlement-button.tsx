'use client';

import * as React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface EntitlementButtonProps {
  allowed: boolean;
  /** e.g. "Pro", "Agency" — used for the gated tooltip copy. */
  requiredTierLabel: string;
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Button that respects entitlement gating. When `allowed`, renders a normal
 * shadcn Button. When NOT allowed, the button remains visible (gated, not
 * hidden) with a Lock icon and a tooltip — clicking it calls `onClick` so the
 * parent can open the pricing flow.
 */
export function EntitlementButton({
  allowed,
  requiredTierLabel,
  onClick,
  children,
  variant = 'default',
  icon,
  loading = false,
  disabled = false,
}: EntitlementButtonProps) {
  if (allowed) {
    return (
      <Button
        variant={variant}
        onClick={onClick}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
      >
        {icon}
        {children}
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          onClick={onClick}
          disabled={disabled || loading}
          aria-busy={loading || undefined}
          aria-label={`Locked — included in ${requiredTierLabel}`}
          className={cn('bg-surface text-ink-muted hover:bg-surface')}
        >
          {icon}
          {children}
          <Lock className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Included in {requiredTierLabel}</TooltipContent>
    </Tooltip>
  );
}

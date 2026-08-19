'use client';

/**
 * VerificationBadge — "Numbers Verified" trust signal.
 *
 * A small, subtle footer-style component displaying a truncated SHA-256
 * hash and UTC timestamp to signal that the numbers have not been
 * tampered with since the report was generated.
 */
import { Lock } from 'lucide-react';

interface VerificationBadgeProps {
  hash: string;
  timestamp: string;
  className?: string;
}

export function VerificationBadge({ hash, timestamp, className }: VerificationBadgeProps) {
  const shortHash = hash.length > 8 ? hash.slice(0, 8) : hash;

  const date = new Date(timestamp);
  const formatted = `${shortHash} \u00b7 ${date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })} UTC`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground ${className ?? ''}`}
      title={`Inputs & results verified at ${timestamp}`}
    >
      <Lock className="h-3 w-3 shrink-0" />
      <span className="font-mono tabular-nums">Verified: {formatted}</span>
    </div>
  );
}

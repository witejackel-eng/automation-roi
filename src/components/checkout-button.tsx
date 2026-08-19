'use client';

import { useState } from 'react';
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowRight } from 'lucide-react';

interface CheckoutButtonProps {
  tier: string;
  tierName: string;
  className?: string;
  popular?: boolean;
}

export function CheckoutButton({ tier, tierName, className, popular }: CheckoutButtonProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      if (res.status === 503) {
        setError('This plan isn\'t available for purchase yet — please check back soon or contact hello@viableo.app.');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to start checkout');
        return;
      }
      const data = await res.json();
      setSessionId(data.sessionId);
    } catch {
      setError('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className}
        aria-label={`${tierName} — Buy ${tierName}`}
      >
        {loading ? 'Loading…' : `Buy ${tierName}`}
        <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
      </button>
      {error && (
        <p className="mt-2 text-[12px] leading-[1.4] text-ink-muted">{error}</p>
      )}
      <Dialog open={!!sessionId} onOpenChange={(open) => { if (!open) setSessionId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete your purchase</DialogTitle>
          </DialogHeader>
          {sessionId && (
            <WhopCheckoutEmbed
              sessionId={sessionId}
              returnUrl={`${window.location.origin}/billing/complete`}
              onComplete={() => {
                window.location.href = '/billing/complete?status=success';
              }}
              onPaymentError={(err) => {
                console.error('[checkout]', err);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

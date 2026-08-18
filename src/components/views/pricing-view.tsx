'use client';

/**
 * Pricing view — sparse, typography-first redesign (piplanning.io-inspired).
 *
 * Design rules applied:
 *   - Massive headline dominates the hero band.
 *   - Generous whitespace between cards and sections.
 *   - Primary CTAs are dark charcoal, never bright coral.
 *   - The "Most popular" accent on Agency is a quiet charcoal hairline,
 *     not a saturated coral top border. The single tiny coral accent left
 *     on this page is the italic tier-identity line (the quotable line
 *     per Voice Spec §5.4) — that is the ~5% accent budget.
 *   - Cards feel premium and airy: 32px padding, generous line-height,
 *     clear hierarchy, quiet borders.
 *
 * Activation logic is UNCHANGED: POST /api/entitlement/set, then dispatch
 * `entitlement:refresh` so AppRoot re-fetches. Whop integration untouched.
 */
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight } from 'lucide-react';
import { useTier } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PRICING_TIERS, COMPANY_NAME, CTA_PRIMARY } from '@/lib/brand';
import type { Tier } from '@/lib/entitlement';

interface Plan {
  tier: Tier;
  name: string;
  price: string;
  cadence: string;
  identity: string;
  positioning: string;
  features: string[];
  popular?: boolean;
}

// Per-tier feature lists — local to this view. Names / prices / cadence /
// "Most popular" / one-line identity all come from PRICING_TIERS so the
// canonical brand config stays the source of truth.
const FEATURES: Record<Tier, string[]> = {
  free: [
    'Calculator + all three scenarios',
    'BUILD / CONSIDER / DON\u2019T BUILD recommendation',
    'Live business-case panel',
    'No saved projects',
    'No PDF export',
  ],
  pro: [
    'Everything in Free',
    'Saved projects',
    'Client report PDF',
    'Proposal generator',
    'Why-this-recommendation breakdown',
  ],
  agency: [
    'Everything in Pro',
    'Agency branding on PDFs',
    'Reusable client templates',
    'Client history dashboard',
    'Unlimited client reports',
  ],
  agency_pro: [
    'Everything in Agency',
    'White-label PDFs',
    'Team seats',
    'Client-facing share links',
    'Priority support',
  ],
};

const PLANS: Plan[] = PRICING_TIERS.map((t) => ({
  tier: t.key as Tier,
  name: t.name,
  price: t.price,
  cadence: t.cadence,
  identity: t.identity,
  positioning: t.blurb,
  features: FEATURES[t.key as Tier],
  popular: t.popular,
}));

export function PricingView() {
  const currentTier = useTier();
  const { toast } = useToast();
  const router = useRouter();

  const handleSelect = React.useCallback(
    async (plan: Plan) => {
      try {
        const res = await fetch('/api/entitlement/set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: plan.tier }),
        });
        if (!res.ok) {
          toast({
            title: 'Could not update plan.',
            description: 'Try again in a moment.',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: `${plan.name} plan activated.`,
          description:
            plan.tier === 'free'
              ? 'You\u2019re on the Free tier.'
              : 'Premium capabilities are now unlocked.',
        });
        // Reload entitlement in the store via a fresh fetch (handled by AppRoot effect).
        window.dispatchEvent(new CustomEvent('entitlement:refresh'));
        // Navigate to the app (the / route with ?start=1 auto-launches the calculator).
        router.push('/?start=1');
      } catch {
        toast({
          title: 'Could not reach the service.',
          description: 'Check your connection.',
          variant: 'destructive',
        });
      }
    },
    [toast, router]
  );

  return (
    <div className="w-full bg-canvas">
      {/* ── Hero band — massive headline + short quiet subcopy ─────────── */}
      <section className="border-b border-border bg-canvas">
        <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6">
          <div className="py-24 md:py-36">
            <p className="mkt-eyebrow">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-ink-muted" />
              Pricing
            </p>
            <h1 className="mkt-display mt-8">
              One price.
              <br />
              Yours forever.
            </h1>
            <p className="mt-10 max-w-[600px] text-[17px] leading-[1.6] text-ink-muted md:text-[19px]">
              Start free. Pay once when you{"\u2019"}re ready to save, export, or brand a report.
              No monthly seat count, no renewal surprise. {COMPANY_NAME} handles activation
              via Whop; the demo activates each tier instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing cards — airy, quiet chrome, dark CTAs ──────────────── */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-20 md:px-6 md:py-28">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PLANS.map((plan) => {
              const isCurrent = currentTier === plan.tier;
              return (
                <div
                  key={plan.tier}
                  className={cn(
                    'mkt-card-quiet relative flex flex-col p-8',
                    plan.popular && 'mkt-lift'
                  )}
                >
                  {/* Quiet top accent on popular tier — charcoal hairline, not coral. */}
                  {plan.popular && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-0.5 bg-ink"
                    />
                  )}
                  {plan.popular && (
                    <div className="absolute -top-3 left-8">
                      <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="mt-2">
                    <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">
                      {plan.name}
                    </h3>
                    {/* Voice Spec §5.4 — one-line identity per tier, the quotable line.
                        This is the single tiny coral accent on the pricing page. */}
                    <p className="mt-1.5 text-[13px] font-medium italic text-brand">
                      {plan.identity}
                    </p>
                    <p className="mt-2 text-[13px] leading-[1.55] text-ink-muted">
                      {plan.positioning}
                    </p>
                  </div>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-mono tnum text-[clamp(2.25rem,4vw,3rem)] font-bold tracking-[-0.02em] text-ink">
                      {plan.price}
                    </span>
                    <span className="text-[13px] text-ink-muted">{plan.cadence}</span>
                  </div>

                  <ul className="mt-7 flex flex-1 flex-col gap-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] leading-[1.5] text-ink">
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-ink-muted"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => handleSelect(plan)}
                    disabled={isCurrent}
                    className={cn(
                      'mt-8 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-sm text-[14px] font-medium transition-colors duration-hover',
                      isCurrent
                        ? 'cursor-default border border-border bg-surface text-ink-muted opacity-60'
                        : plan.popular
                          ? 'bg-ink text-white hover:bg-ink-soft'
                          : 'border border-border-strong bg-surface-raised text-ink hover:bg-surface'
                    )}
                  >
                    {isCurrent ? (
                      'Current plan'
                    ) : (
                      <>
                        Choose {plan.name}
                        <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="mt-16 text-center text-[13px] text-ink-faint">
            Prices in USD, one-time. This demo activates each tier instantly; in production, Whop verifies
            the purchase before the license is written.
          </p>
        </div>
      </section>

      {/* ── Quiet closing CTA band ──────────────────────────────────────── */}
      <section className="bg-ink text-white">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-24 md:px-6 md:py-36">
          <h2 className="max-w-[760px] font-display text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.03em]">
            Build what pays back.
          </h2>
          <p className="mt-8 max-w-[520px] text-[17px] leading-[1.6] text-white/65 md:text-[18px]">
            Run the numbers before you commit the build.
          </p>
          <div className="mt-10">
            <a href="/?start=1" className="mkt-cta-dark">
              {CTA_PRIMARY}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

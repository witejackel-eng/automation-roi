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
 * Headline / subhead / footnote are imported from `brand.ts` so this view
 * cannot drift from the marketing surface.
 *
 * CTAs (P0-9 fix): the previous flow POSTed to a gated internal endpoint that
 * returns 403 in production ("Entitlement changes must go through Whop
 * payment flow"). A repo-wide grep found NO Whop checkout URL. The honest
 * interim state, per the mandate:
 *   - Free tier → /start?start=1 (a real, working path)
 *   - Paid tiers (Case pack / Agency / Agency Pro) → mailto:hello@viableo.app
 *     with the CTA label "Contact to buy"
 * Every CTA is a real <Link> (or <a href> for mailto). Nothing on this page
 * posts to a gated endpoint or returns a 403.
 */
import * as React from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PRICING_TIERS,
  PRICING_HEADLINE,
  PRICING_SUBHEAD,
  PRICING_FOOTNOTE,
  CTA_PRIMARY,
} from '@/lib/brand';

interface Plan {
  key: string;
  name: string;
  price: string;
  cadence: string;
  identity: string;
  positioning: string;
  features: string[];
  popular?: boolean;
  ctaHref: string;
  ctaLabel: string;
}

// Per-tier feature lists — local to this view. Names / prices / cadence /
// "Most popular" / one-line identity / blurb all come from PRICING_TIERS so
// the canonical brand config stays the source of truth.
//
// P0-8: the Free tier features list says "Watermarked document" — matching
// the brand.ts blurb ("Watermarked document"). It does NOT say "No PDF
// export". The Free tier exports a watermarked document; it does not gate
// the PDF behind a paywall and lie about it.
//
// P0-7: keys match PRICING_TIERS keys exactly (free / case_pack / agency /
// agency_pro). The previous `pro` key caused `FEATURES[t.key]` to return
// undefined and crash the page (dev log: TypeError at pricing-view.tsx:203).
const FEATURES: Record<string, string[]> = {
  free: [
    'Calculator + all three scenarios',
    'BUILD / CONSIDER / DON\u2019T BUILD recommendation',
    'Live business-case panel',
    'Confidence score on the recommendation',
    'Watermarked document',
  ],
  case_pack: [
    'Everything in Free, unwatermarked',
    'One case credit, no expiry',
    'Saved projects',
    'Client report PDF',
    'Why-this-recommendation breakdown',
  ],
  agency: [
    'Everything in Case pack',
    'Unlimited cases',
    'Agency branding on PDFs',
    'Reusable client templates',
    'Client history dashboard',
  ],
  agency_pro: [
    'Everything in Agency',
    'White-label PDFs',
    'Team seats',
    'Client-facing share links',
    'Per-client history \u2014 re-open any case',
  ],
};

// Honest interim CTA routing (mandate §VERIFY BEFORE IMPLEMENTATION):
// No Whop checkout URL exists in the repo. Free tier links to the live
// calculator; paid tiers link to an honestly-labelled contact route.
const FREE_CTA_HREF = '/start?start=1';
const PAID_CTA_HREF = 'mailto:hello@viableo.app?subject=Viableo%20pricing';
const PAID_CTA_LABEL = 'Contact to buy';

const PLANS: Plan[] = PRICING_TIERS.map((t) => {
  const isFree = t.key === 'free';
  return {
    key: t.key,
    name: t.name,
    price: t.price,
    cadence: t.cadence,
    identity: t.identity,
    positioning: t.blurb,
    features: FEATURES[t.key] ?? [],
    popular: t.popular,
    ctaHref: isFree ? FREE_CTA_HREF : PAID_CTA_HREF,
    ctaLabel: isFree ? `Choose ${t.name}` : PAID_CTA_LABEL,
  };
});

// Split the single-string PRICING_HEADLINE ("One price. Yours forever.") into
// two lines for visual impact, without hardcoding either sentence.
const HEADLINE_LINES = PRICING_HEADLINE.split('. ');

export function PricingView() {
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
              {HEADLINE_LINES.map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < HEADLINE_LINES.length - 1 ? '.' : ''}
                  {i < HEADLINE_LINES.length - 1 ? <br /> : null}
                </React.Fragment>
              ))}
            </h1>
            <p className="mt-10 max-w-[600px] text-[17px] leading-[1.6] text-ink-muted md:text-[19px]">
              {PRICING_SUBHEAD}
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing cards — airy, quiet chrome, dark CTAs ──────────────── */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-20 md:px-6 md:py-28">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PLANS.map((plan) => {
              const isMailto = plan.ctaHref.startsWith('mailto:');
              const ctaClass = cn(
                'mt-8 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-sm text-[14px] font-medium transition-colors duration-hover',
                plan.popular
                  ? 'bg-ink text-white hover:bg-ink-soft'
                  : 'border border-border-strong bg-surface-raised text-ink hover:bg-surface'
              );
              return (
                <div
                  key={plan.key}
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

                  {isMailto ? (
                    <a
                      href={plan.ctaHref}
                      className={ctaClass}
                      aria-label={`${plan.name} \u2014 ${plan.ctaLabel}`}
                    >
                      {plan.ctaLabel}
                      <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    </a>
                  ) : (
                    <Link
                      href={plan.ctaHref}
                      className={ctaClass}
                      aria-label={`${plan.name} \u2014 ${plan.ctaLabel}`}
                    >
                      {plan.ctaLabel}
                      <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-16 text-center text-[13px] text-ink-faint">
            {PRICING_FOOTNOTE}
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
            <Link href="/start?start=1" className="mkt-cta-dark">
              {CTA_PRIMARY}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

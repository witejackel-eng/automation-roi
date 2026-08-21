/**
 * Pricing view — renders ONLY from PRICING_TIERS in brand.ts.
 * No literal prices in JSX. No CheckoutButton. No dark CSS tokens.
 */
import Link from 'next/link';
import { Check } from 'lucide-react';
import {
  PRICING_TIERS,
  PRICING_HEADLINE,
  PRICING_SUBHEAD,
  PRICING_FOOTNOTE,
  CTA_PRIMARY,
} from '@/lib/brand';

const FEATURES: Record<string, string[]> = {
  free: [
    'Business-case analysis',
    'Scenarios (Conservative / Expected / Upside)',
    'Confidence scoring',
    'Stress testing',
    'BUILD / CONSIDER / DON\u2019T BUILD verdict',
  ],
  pro: [
    'Everything in Free',
    'Saved cases',
    'Client-ready reports',
    'Proposals',
    'Share links',
    'Agency workflow',
  ],
};

const CUSTOM_DESCRIPTION =
  'For teams that need custom workflows, advanced collaboration, integrations, or volume.';

export function PricingView() {
  return (
    <div className="w-full bg-[#F5F4F0] text-[#111]">
      {/* ── Hero band ───────────────────────────────────── */}
      <section className="border-b border-[#111]/[0.06]">
        <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
          <div className="py-24 md:py-36">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#111]/50">
              Pricing
            </p>
            <h1 className="mt-8 font-display text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.03em]">
              {PRICING_HEADLINE}
            </h1>
            <p className="mt-10 max-w-[600px] text-[17px] leading-[1.6] text-[#111]/60 md:text-[19px]">
              {PRICING_SUBHEAD}
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing cards ─────────────────────────── */}
      <section>
        <div className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-12 md:py-28">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PRICING_TIERS.map((tier) => {
              const isCustom = tier.key === 'custom';
              const isPro = tier.key === 'pro';
              const isFree = tier.key === 'free';
              const features = FEATURES[tier.key];

              return (
                <div
                  key={tier.key}
                  className="flex flex-col rounded-lg border border-[#111]/[0.06] bg-white p-8"
                >
                  {/* Name + identity */}
                  <div>
                    <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#111]">
                      {tier.name}
                    </h3>
                    <p className="mt-1.5 text-[13px] font-medium italic text-[#111]/50">
                      {tier.identity}
                    </p>
                  </div>

                  {/* Blurb */}
                  <p className="mt-3 text-[13px] leading-[1.55] text-[#111]/60">
                    {tier.blurb}
                  </p>

                  {/* Price + cadence */}
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-mono text-[clamp(2.25rem,4vw,3rem)] font-bold tracking-[-0.02em] text-[#111]">
                      {tier.price}
                    </span>
                    {tier.cadence && (
                      <span className="text-[13px] text-[#111]/50">{tier.cadence}</span>
                    )}
                  </div>

                  {/* Feature list or custom description */}
                  <div className="mt-7 flex flex-1 flex-col">
                    {isCustom ? (
                      <p className="text-[13px] leading-[1.55] text-[#111]/60">
                        {CUSTOM_DESCRIPTION}
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-3">
                        {features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2.5 text-[13px] leading-[1.5] text-[#111]"
                          >
                            <Check
                              className="mt-0.5 size-4 shrink-0 text-[#111]/40"
                              strokeWidth={1.75}
                              aria-hidden="true"
                            />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-8">
                    {isCustom ? (
                      <a
                        href="mailto:hello@viableo.com"
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[#111]/10 text-[14px] font-medium text-[#111]/60 transition-colors hover:border-[#111]/20 hover:text-[#111]/80"
                        aria-label="Talk to us about Custom plan"
                      >
                        Talk to us
                      </a>
                    ) : isFree ? (
                      <Link
                        href="/start?start=1"
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#111] text-[14px] font-medium text-white transition-colors hover:bg-[#333]"
                        aria-label="Run your first case — free"
                      >
                        Run your first case — free
                      </Link>
                    ) : (
                      <Link
                        href="/start?start=1"
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#111] text-[14px] font-medium text-white transition-colors hover:bg-[#333]"
                        aria-label="Start Pro"
                      >
                        Start Pro
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-16 text-center text-[13px] text-[#111]/40">
            {PRICING_FOOTNOTE}
          </p>
        </div>
      </section>

      {/* ── Final dark CTA band ──────────────────────── */}
      <section className="bg-[#111] text-white">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-24 md:px-12 md:py-36">
          <h2 className="max-w-[760px] font-display text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.03em]">
            Build what pays back.
          </h2>
          <p className="mt-8 max-w-[520px] text-[17px] leading-[1.6] text-white/65 md:text-[18px]">
            Run the numbers before you commit the build.
          </p>
          <div className="mt-10">
            <Link
              href="/start?start=1"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-8 text-[14px] font-medium text-[#111] transition-colors hover:bg-white/90"
            >
              {CTA_PRIMARY}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

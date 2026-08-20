"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRICING_TIERS } from "@/lib/brand";

/**
 * ComputePricing — real Automation ROI plans in the COMPUTE pricing structure.
 *
 * Ported from the COMPUTE template `components/landing/pricing-section.tsx`:
 * monthly/annual toggle, 3-col plan grid, highlight plan, feature lists.
 * Content = real PRICING_TIERS (Free/Pro/Agency + Agency Pro). Pricing values,
 * plan names, case limits UNCHANGED.
 */

// Map the real PRICING_TIERS to the display format.
// Free/Pro/Agency are monthly; Agency Pro is yearly.
const DISPLAY_PLANS = [
  {
    name: PRICING_TIERS[0].name,
    description: PRICING_TIERS[0].blurb,
    priceMonthly: "$0",
    priceYearly: "$0",
    cadence: "forever",
    features: [
      "1 case per month",
      "Confidence scoring",
      "Stress test (64 permutations)",
      "Conservative · Expected · Upside",
      "Watermarked document",
    ],
    cta: "Start free",
    href: "/start?start=1",
    highlight: false,
  },
  {
    name: PRICING_TIERS[1].name,
    description: PRICING_TIERS[1].blurb,
    priceMonthly: PRICING_TIERS[1].price,
    priceYearly: "$290",
    cadence: "per month",
    features: [
      "5 cases per month",
      "Unwatermarked PDFs",
      "Saved projects",
      "Share links",
      "Full business case export",
    ],
    cta: "Go Pro",
    href: "/pricing",
    highlight: true,
  },
  {
    name: PRICING_TIERS[2].name,
    description: PRICING_TIERS[2].blurb,
    priceMonthly: PRICING_TIERS[2].price,
    priceYearly: "$790",
    cadence: "per month",
    features: [
      "Unlimited cases",
      "Your branding on documents",
      "Client history",
      "Unwatermarked PDFs",
      "Share links",
    ],
    cta: "Go Agency",
    href: "/pricing",
    highlight: false,
  },
];

export function ComputePricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Header — dramatic offset (COMPUTE pattern) */}
        <div className="mb-16 grid gap-8 lg:grid-cols-12 lg:mb-20">
          <div className="lg:col-span-7">
            <span className="mb-8 inline-flex items-center gap-3 font-mono text-sm text-ink-muted">
              <span className="h-px w-12 bg-ink/30" />
              Pricing
            </span>
            <h2
              className={cn(
                "font-display text-[clamp(2.5rem,6vw,6rem)] leading-[0.95] tracking-tight text-ink transition-all duration-1000",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              )}
            >
              Free to start.
              <br />
              <span className="text-ink-muted">Upgrade when you need it.</span>
            </h2>
          </div>
          {/* Whale visual — the actual COMPUTE whale.png (preserved per directive) */}
          <div className="relative hidden h-64 w-64 justify-self-end lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/compute/pricing/whale.png"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Billing toggle */}
        <div className="mb-12 flex items-center gap-4">
          <span className={cn("text-lg transition-colors", !isAnnual ? "text-ink" : "text-ink-muted")}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative h-6 w-12 cursor-pointer rounded-full bg-ink/10 p-1"
            aria-label="Toggle billing cadence"
          >
            <div
              className={cn(
                "h-4 w-4 rounded-full bg-ink transition-transform duration-300",
                isAnnual ? "translate-x-6" : "translate-x-0",
              )}
            />
          </button>
          <span className={cn("text-lg transition-colors", isAnnual ? "text-ink" : "text-ink-muted")}>
            Yearly
          </span>
          <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1">
            <span className="text-xs font-medium text-amber-400">~2 months free</span>
          </div>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {DISPLAY_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col gap-6 p-8 transition-all duration-300",
                plan.highlight
                  ? "border border-amber-500/30 bg-ink/[0.04] shadow-[inset_0_1px_0_0_rgba(245,243,239,0.1)]"
                  : "border border-ink/10 bg-ink/[0.02]",
              )}
            >
              {/* Card head */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-normal text-ink">{plan.name}</span>
                  {plan.highlight && (
                    <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
                      <span className="text-xs font-medium text-amber-400">Popular</span>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl tracking-tight text-ink">
                    {isAnnual ? plan.priceYearly : plan.priceMonthly}
                  </span>
                  <span className="text-sm text-ink-muted">{plan.cadence}</span>
                </div>
                <p className="min-h-[60px] text-sm leading-relaxed text-ink-muted">
                  {plan.description}
                </p>
              </div>

              {/* CTA */}
              <Link
                href={plan.href}
                className={cn(
                  "w-full rounded-full px-4 py-3 text-center text-sm font-medium transition-all",
                  plan.highlight
                    ? "bg-ink text-canvas hover:bg-ink/90"
                    : "border border-ink/20 text-ink hover:bg-ink/5",
                )}
              >
                {plan.cta}
              </Link>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-ink/10" />
                <span className="text-xs text-ink-muted">Features</span>
                <div className="h-px flex-1 bg-ink/10" />
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-amber-400" />
                    <span className="text-sm text-ink-muted">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

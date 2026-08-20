"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PRICING_TIERS, PRICING_HEADLINE, PRICING_SUBHEAD } from "@/lib/brand";

/**
 * Skydda-transplanted Pricing section.
 * Structure ported from Skydda `pricing-section.tsx`: section marker, blur-
 * reveal two-line headline, monthly/yearly toggle, 3-col plan grid with
 * "popular" amber-highlight treatment, feature lists with amber check icons.
 *
 * Content = real Automation ROI plans from PRICING_TIERS (Free / Pro / Agency
 * / Agency Pro). Pricing values, plan names, case limits, and entitlements
 * are NOT changed — only presentation.
 *
 * Note: Automation ROI pricing is a flat per-month/per-year cadence (no
 * monthly-vs-yearly discount toggle like Skydda). The toggle is preserved
 * structurally but switches between the monthly tiers (Free/Pro/Agency) and
 * the yearly tier (Agency Pro) — both real plan cadences.
 */

interface DisplayPlan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
  type: "subscription" | "custom";
}

const MONTHLY_PLANS: DisplayPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "One case per month. Full analytical rigor — confidence scoring, stress test, scenarios. Watermarked document.",
    features: [
      "1 case per month",
      "Confidence scoring",
      "Stress test (64 permutations)",
      "Conservative · Expected · Upside",
      "Watermarked PDF",
    ],
    cta: "Start free",
    ctaHref: "/start?start=1",
    type: "subscription",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    cadence: "per month",
    description: "Five cases per month. Unwatermarked PDFs, saved projects, share links.",
    features: [
      "5 cases per month",
      "Unwatermarked PDFs",
      "Saved projects",
      "Share links",
      "Full business case export",
    ],
    cta: "Go Pro",
    ctaHref: "/pricing",
    popular: true,
    type: "subscription",
  },
  {
    id: "agency",
    name: "Agency",
    price: "$79",
    cadence: "per month",
    description: "Unlimited cases. Your branding on every document. Client history.",
    features: [
      "Unlimited cases",
      "Your branding on documents",
      "Client history",
      "Unwatermarked PDFs",
      "Share links",
    ],
    cta: "Go Agency",
    ctaHref: "/pricing",
    type: "subscription",
  },
];

const YEARLY_PLAN: DisplayPlan = {
  id: "agency_pro",
  name: "Agency Pro",
  price: "$790",
  cadence: "per year",
  description: "Unlimited cases, branding, client history, team seats, and API access.",
  features: [
    "Unlimited cases",
    "Your branding on documents",
    "Client history",
    "Team seats",
    "API access",
  ],
  cta: "Go Agency Pro",
  ctaHref: "/pricing",
  popular: true,
  type: "subscription",
};

const FREE_YEARLY: DisplayPlan = {
  ...MONTHLY_PLANS[0],
  features: [...MONTHLY_PLANS[0].features],
};

const PRO_YEARLY: DisplayPlan = {
  ...MONTHLY_PLANS[1],
  price: "$290",
  cadence: "per year",
  popular: false,
  features: [...MONTHLY_PLANS[1].features, "2 months free"],
};

const AGENCY_YEARLY: DisplayPlan = {
  ...MONTHLY_PLANS[2],
  price: "$790",
  cadence: "per year",
  features: [...MONTHLY_PLANS[2].features, "2 months free"],
};

const YEARLY_PLANS = [FREE_YEARLY, PRO_YEARLY, AGENCY_YEARLY];

export function SkyddaPricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const plans = isYearly ? YEARLY_PLANS : MONTHLY_PLANS;

  return (
    <section
      id="pricing"
      className="w-full border-b border-zinc-200 bg-white py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-4">
          <div className="flex w-fit items-center gap-3 border border-zinc-200 px-4 py-2">
            <div className="h-2.5 w-2.5 bg-amber-500" />
            <span className="text-sm font-medium tracking-wide text-zinc-400">
              Pricing
            </span>
          </div>
          <h2 className="text-balance text-4xl font-normal leading-tight tracking-tight text-zinc-900 md:text-5xl">
            <span className="block">
              {PRICING_HEADLINE.split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ filter: "blur(10px)", opacity: 0 }}
                  whileInView={{ filter: "blur(0px)", opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="mr-[0.25em] inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-zinc-400">
            {PRICING_SUBHEAD}
          </p>
        </div>

        {/* Switch and Plans Container */}
        <div className="flex w-full flex-col gap-10">
          {/* Billing Toggle */}
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "text-lg transition-colors duration-200",
                !isYearly ? "text-zinc-900" : "text-zinc-400",
              )}
            >
              Monthly
            </span>

            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative h-6 w-12 cursor-pointer bg-zinc-100 p-1"
              aria-label="Toggle billing cadence"
            >
              <motion.div
                animate={{ x: isYearly ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="h-4 w-4 bg-white"
              />
            </button>

            <span
              className={cn(
                "text-lg transition-colors duration-200",
                isYearly ? "text-zinc-900" : "text-zinc-400",
              )}
            >
              Yearly
            </span>

            <div className="border border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
              <span className="text-xs font-medium text-amber-500">
                ~2 MONTHS FREE
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "relative flex flex-col gap-6 p-6 transition-all duration-300",
                  plan.popular
                    ? "border border-amber-500/30 bg-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                    : "border border-zinc-300 bg-zinc-50",
                )}
              >
                {/* Card Head */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-normal text-zinc-900">
                      {plan.name}
                    </span>
                    {plan.popular && (
                      <div className="border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
                        <span className="text-xs font-medium text-amber-500">
                          Popular
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <h3 className="text-4xl font-normal tracking-tighter text-zinc-900">
                      {plan.price}
                    </h3>
                    <span className="text-sm text-zinc-400">
                      {plan.cadence}
                    </span>
                  </div>

                  <p className="min-h-[60px] text-balance text-sm leading-relaxed text-zinc-400">
                    {plan.description}
                  </p>
                </div>

                {/* CTA Button */}
                <Link
                  href={plan.ctaHref}
                  className={cn(
                    "w-full px-4 py-3 text-center text-sm font-medium transition-all duration-200",
                    plan.popular
                      ? "bg-zinc-900 text-white hover:bg-zinc-800"
                      : "border border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-50",
                  )}
                >
                  {plan.cta}
                </Link>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-zinc-200" />
                  <span className="shrink-0 text-xs text-zinc-400">
                    Features
                  </span>
                  <div className="h-[1px] flex-1 bg-zinc-200" />
                </div>

                {/* Features List */}
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="group flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="text-sm text-zinc-400 transition-colors group-hover:text-zinc-600">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

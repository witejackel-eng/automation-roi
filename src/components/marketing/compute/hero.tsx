"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HERO_EYEBROW,
  HERO_HEADLINE,
  HERO_SUBHEAD,
  HERO_CTA_PRIMARY,
  HERO_CTA_SECONDARY,
} from "@/lib/brand";
import {
  formatCurrency,
  formatPayback,
} from "@/lib/format";

/**
 * ComputeHero — full-viewport hero matching the COMPUTE visual composition.
 *
 * Ported from the COMPUTE template `components/landing/hero-section.tsx`:
 * min-h-screen, dark atmospheric background with subtle grid lines, left-
 * aligned oversized serif headline, monospace eyebrow, bottom-anchored
 * real Apex stats. Content = Automation ROI hero copy + real engine numbers.
 */

// Real Apex numbers passed from the server composition (via props).
export function ComputeHero({
  netAnnualBenefit,
  paybackMonths,
  breakPointFee,
}: {
  netAnnualBenefit: string;
  paybackMonths: string;
  breakPointFee: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-start justify-center overflow-hidden bg-black">
      {/* Background — atmospheric grid lines (COMPUTE pattern) */}
      <div className="absolute inset-0 z-[2] overflow-hidden opacity-20 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-white/10"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-white/10"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>
      {/* Radial atmospheric glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 30% 40%, rgba(245, 181, 68, 0.06) 0%, transparent 60%)",
        }}
      />
      {/* Vignette for text contrast */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] px-6 py-32 lg:px-12 lg:py-40">
        <div className="lg:max-w-[60%]">
          {/* Eyebrow */}
          <div
            className={`mb-8 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <span className="inline-flex items-center gap-3 font-mono text-sm text-white/60">
              <span className="h-px w-8 bg-white/30" />
              {HERO_EYEBROW}
            </span>
          </div>

          {/* Main headline — oversized serif */}
          <div className="mb-8">
            <h1
              className={`text-left font-display text-[clamp(2rem,6vw,7rem)] leading-[0.92] tracking-tight text-white transition-all duration-1000 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <span className="block whitespace-nowrap">Know what&apos;s</span>
              <span className="block whitespace-nowrap">worth building.</span>
            </h1>
          </div>

          {/* Supporting text */}
          <p
            className={`mb-10 max-w-xl text-lg leading-relaxed text-white/70 transition-all duration-700 delay-300 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {HERO_SUBHEAD}
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col gap-4 transition-all duration-700 delay-500 sm:flex-row ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <Link
              href="/start?start=1"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-white/90 active:scale-95"
            >
              {HERO_CTA_PRIMARY}
            </Link>
            <Link
              href="/start?start=1&example=apex"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 active:scale-95"
            >
              {HERO_CTA_SECONDARY}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats — 3 real Apex metrics (COMPUTE bottom-anchored pattern) */}
      <div
        className={`absolute bottom-12 left-0 right-0 px-6 transition-all duration-700 delay-700 lg:px-12 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-start gap-10 lg:gap-20">
          <div className="flex flex-col gap-2">
            <span className="font-display text-3xl text-white lg:text-4xl">
              {netAnnualBenefit}
            </span>
            <span className="text-xs leading-tight text-white/50">
              Expected first-year net
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-display text-3xl text-white lg:text-4xl">
              {paybackMonths}
            </span>
            <span className="text-xs leading-tight text-white/50">
              Payback period
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-display text-3xl text-white lg:text-4xl">
              {breakPointFee}
            </span>
            <span className="text-xs leading-tight text-white/50">
              Answer holds until
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

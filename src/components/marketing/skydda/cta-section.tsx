"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  FINAL_CTA_HEADLINE,
  FINAL_CTA_BODY,
  FINAL_CTA_PRIMARY,
} from "@/lib/brand";

/**
 * Skydda-transplanted final CTA section.
 * Structure ported from Skydda `cta-section.tsx`: full-width dark
 * atmospheric background (amber radial glow instead of the Skydda hero
 * image — Automation ROI-appropriate), blur-reveal headline, supporting
 * paragraph, prominent CTA. Content = real Automation ROI closing CTA.
 */
export function SkyddaCtaSection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image with Overlay — exact Skydda treatment using the
          supplied template's hero-bg.jpg asset */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-32 lg:py-40">
        <div className="max-w-2xl">
          <h2 className="text-balance text-4xl font-normal tracking-tight text-white md:text-5xl lg:text-6xl">
            {FINAL_CTA_HEADLINE.split(" ").map((word, i) => (
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
          </h2>
          <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-white/80 md:text-lg">
            {FINAL_CTA_BODY}
          </p>
          <Link
            href="/start?start=1"
            className="mt-8 inline-flex items-center gap-2 bg-white px-8 py-3 font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95"
          >
            {FINAL_CTA_PRIMARY}
          </Link>
        </div>
      </div>
    </section>
  );
}

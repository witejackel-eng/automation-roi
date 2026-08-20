"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { SkyddaHeader } from "./header";
import {
  HERO_EYEBROW,
  HERO_HEADLINE,
  HERO_SUBHEAD,
  HERO_CTA_PRIMARY,
  HERO_CTA_SECONDARY,
} from "@/lib/brand";

/**
 * Skydda-transplanted Hero — full viewport, navigation inside the hero
 * (transparent SkyddaHeader), centered animated headline (blur-to-sharp
 * word reveal), centered supporting paragraph, two CTA buttons, dark
 * atmospheric composition.
 *
 * Background uses the SUPPLIED Skydda template's actual `hero-bg.jpg` asset
 * with the same dark overlay treatment as the reference (bg-cover/bg-center
 * + slate-950/20 overlay) — per the master directive to use the template's
 * actual implementation and assets where appropriate. The asset is
 * product-neutral (dark atmospheric field) so it doesn't carry Skydda
 * product content.
 *
 * Structure ported from the supplied Skydda `components/hero.tsx`.
 * Content transplanted from Automation ROI's canonical brand constants.
 * CTAs wired to real Automation ROI routes.
 */
export function SkyddaHero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background — the supplied Skydda template hero-bg.jpg, same treatment */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      {/* Subtle overlay for text readability — exact Skydda treatment */}
      <div className="absolute inset-0 bg-zinc-950/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Navigation — shared transparent header (consistency across pages) */}
        <SkyddaHeader transparent />

        {/* Hero Content — centered */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="mb-8 flex items-center gap-3 border border-zinc-700/50 px-4 py-2"
          >
            <div className="h-2.5 w-2.5 bg-amber-500" />
            <span className="text-sm font-medium tracking-wide text-zinc-400">
              {HERO_EYEBROW}
            </span>
          </motion.div>

          {/* Headline — blur-to-sharp word reveal */}
          <h1 className="max-w-4xl text-balance text-5xl font-normal tracking-tight text-white md:text-6xl lg:text-7xl">
            {HERO_HEADLINE.split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ filter: "blur(10px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
                className="mr-[0.25em] inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Supporting paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-6 max-w-xl text-balance text-center text-base leading-relaxed text-white/70 md:text-lg"
          >
            {HERO_SUBHEAD}
          </motion.p>

          {/* Two CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link
              href="/start?start=1"
              className="bg-white px-8 py-3 font-semibold text-zinc-900 transition-all hover:bg-white/90 active:scale-95"
            >
              {HERO_CTA_PRIMARY}
            </Link>
            <Link
              href="/start?start=1&example=apex"
              className="border border-white/30 bg-transparent px-8 py-3 font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
            >
              {HERO_CTA_SECONDARY}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

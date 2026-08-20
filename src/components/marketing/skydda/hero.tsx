"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/viableo";
import {
  HERO_EYEBROW,
  HERO_HEADLINE,
  HERO_SUBHEAD,
  HERO_CTA_PRIMARY,
  HERO_CTA_SECONDARY,
} from "@/lib/brand";

/**
 * Skydda-transplanted Hero — full viewport, navigation inside the hero,
 * centered animated headline (blur-to-sharp word reveal), centered
 * supporting paragraph, two CTA buttons, dark atmospheric composition.
 *
 * Structure ported from the supplied Skydda `components/hero.tsx`.
 * Content transplanted from Automation ROI's canonical brand constants.
 * CTAs wired to real Automation ROI routes.
 */

const NAV_LINKS = [
  { href: "/automation-roi", label: "Product" },
  { href: "/methodology", label: "Methodology" },
  { href: "/solutions/automation-agencies", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources/automation-roi", label: "Resources" },
];

export function SkyddaHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-zinc-950">
      {/* Atmospheric dark background — radial amber glow + subtle grid */}
      <div className="absolute inset-0">
        {/* Deep base */}
        <div className="absolute inset-0 bg-zinc-950" />
        {/* Radial amber atmospheric glow (replaces Skydda hero image, Automation ROI-appropriate) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 35%, rgba(245, 181, 68, 0.10) 0%, rgba(245, 181, 68, 0.04) 35%, transparent 70%)",
          }}
        />
        {/* Subtle dot grid for analytical depth */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(244, 244, 245, 1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Vignette for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Navigation — inside hero, Skydda structure */}
        <nav className="relative z-50 px-6 py-6 md:px-12">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center" aria-label="Viableo — home">
              <Logo variant="reverse" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 text-sm text-zinc-300 lg:flex">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-normal tracking-wide transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/start?start=1"
                className="hidden text-sm font-medium text-white transition-colors hover:text-zinc-300 lg:block"
              >
                {HERO_CTA_PRIMARY}
              </Link>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white lg:hidden"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-700/30 lg:hidden"
              >
                <div className="flex flex-col gap-1 px-6 py-6">
                  {NAV_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="py-3 text-zinc-300 transition-colors hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/start?start=1"
                    className="mt-2 border-t border-zinc-700/30 py-3 font-medium text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {HERO_CTA_PRIMARY}
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

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
            className="mt-6 max-w-xl text-balance text-center text-base leading-relaxed text-zinc-300 md:text-lg"
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
              className="bg-white px-8 py-3 font-semibold text-zinc-900 transition-all hover:bg-zinc-200 active:scale-95"
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

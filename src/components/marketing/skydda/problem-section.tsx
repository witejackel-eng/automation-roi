"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  PROBLEM_HEADLINE,
  PROBLEM_SUBHEAD,
  PROBLEM_PARAS,
  HERO_CTA_PRIMARY,
  HERO_CTA_SECONDARY,
} from "@/lib/brand";

/**
 * Skydda-transplanted Problem section.
 * Structure ported from Skydda `problem-section.tsx`: zinc-900 bg, grain
 * overlay, centered amber-marker eyebrow, blur-reveal headline, centered
 * supporting paragraph, two CTA buttons. Content = Automation ROI problem
 * narrative (PROBLEM_HEADLINE / SUBHEAD / PARAS).
 */
export function SkyddaProblemSection() {
  return (
    <section className="relative w-full border-b border-zinc-700/30 bg-zinc-900 py-24 md:py-32">
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 result=%22noise%22 /></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23noise)%22 fill=%22%23ffffff%22/></svg>')",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center px-6 md:px-12 lg:px-16">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Amber-marker eyebrow */}
          <div className="flex w-fit items-center gap-3 border border-zinc-700 px-4 py-2">
            <div className="h-2.5 w-2.5 bg-amber-500" />
            <span className="text-sm font-medium tracking-wide text-zinc-400">
              The Problem
            </span>
          </div>

          {/* Blur-reveal headline */}
          <h2 className="text-balance text-5xl font-normal tracking-tight text-white md:text-6xl">
            {PROBLEM_HEADLINE.split(" ").map((word, i) => (
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

          {/* Supporting paragraph */}
          <p className="max-w-2xl text-balance text-lg leading-relaxed text-zinc-300 md:text-xl">
            {PROBLEM_SUBHEAD}
          </p>

          {/* Body paragraphs — Automation ROI's real problem narrative */}
          <div className="max-w-2xl space-y-5 text-left text-base leading-relaxed text-zinc-400 md:text-lg">
            {PROBLEM_PARAS.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Two CTAs */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-center">
            <Link
              href="/start?start=1"
              className="bg-white px-8 py-3 font-semibold text-zinc-900 transition-all hover:bg-zinc-100 active:scale-95"
            >
              {HERO_CTA_PRIMARY}
            </Link>
            <Link
              href="/start?start=1&example=apex"
              className="border border-white/30 px-8 py-3 font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
            >
              {HERO_CTA_SECONDARY}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

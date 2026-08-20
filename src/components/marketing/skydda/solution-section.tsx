"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Target, TrendingUp, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WHAT_HEADLINE,
  WHAT_SUBHEAD,
  WHAT_ITEMS,
} from "@/lib/brand";
import {
  APEX_INPUTS,
} from "@/lib/golden-case";
import {
  calculateScenario,
} from "@/lib/calculations/engine";
import { recommend } from "@/lib/calculations/recommendation";
import { computeBreakEven } from "@/lib/calculations/stress-test";
import {
  formatCurrency,
  formatPayback,
} from "@/lib/format";
import { ThresholdLine, DecisionBadge } from "@/components/viableo";

// ── Real Apex numbers, computed once ─────────────────────────────
const APEX_EXPECTED = calculateScenario(APEX_INPUTS, "expected");
const APEX_BREAK_EVEN = computeBreakEven(APEX_INPUTS, "expected");
const APEX_RECOMMENDATION = recommend(APEX_EXPECTED);
const APEX_VERDICT = APEX_RECOMMENDATION.recommendation;
const BREAK_POINT_FEE = APEX_BREAK_EVEN.implementationFee ?? 0;

interface SolutionStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: SolutionStep[] = [
  {
    id: 1,
    title: "1 — Scope the opportunity",
    description:
      "Drop in the workload, the labor cost, and the fee you're considering. Viableo takes one scope and returns the full economic picture.",
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 2,
    title: "2 — Model the economics",
    description:
      "ROI, payback, annual benefit, and net first-year value — computed deterministically from your inputs, with confidence scored on every field.",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: 3,
    title: "3 — Walk in with the answer",
    description:
      "A BUILD / CONSIDER / DON'T BUILD verdict, the fee where that verdict flips, and a business case your client can check line by line.",
    icon: <FileCheck className="h-5 w-5" />,
  },
];

/**
 * Skydda-transplanted Solution section.
 * Structure ported from Skydda `solution-section.tsx`: interactive step list
 * (left visual + right step buttons) with auto-advancing carousel + amber
 * progress bars. Content = Automation ROI product workflow.
 *
 * The "visual" slot renders REAL product UI (ThresholdLine + DecisionBadge
 * + real Apex numbers) instead of a static image — per the master spec's
 * "use real product UI where the template wants a visual".
 */
export function SkyddaSolutionSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="flex w-full flex-col items-center overflow-hidden border-b border-zinc-700/30 bg-zinc-900 py-24 text-white">
      <div className="max-w-7xl w-full space-y-12 px-6 md:px-12 lg:px-16">
        {/* Header Section */}
        <div className="flex max-w-[560px] flex-col gap-4">
          <div className="flex w-fit items-center gap-3 border border-zinc-700 px-4 py-2">
            <div className="h-2.5 w-2.5 bg-amber-500" />
            <span className="text-sm font-medium tracking-wide text-zinc-400">
              The Solution
            </span>
          </div>
          <h2 className="text-balance text-4xl font-normal leading-[1.1] tracking-tight text-white md:text-5xl">
            {WHAT_HEADLINE.split(" ").map((word, i) => (
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
          <p className="text-balance text-base leading-relaxed text-zinc-400">
            {WHAT_SUBHEAD}
          </p>
        </div>

        {/* Interactive Content Container */}
        <div className="grid min-h-[400px] grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: REAL product visual (replaces Skydda image) */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 flex flex-col justify-center p-8"
              >
                {/* The real analytical object for the active step */}
                {activeIndex === 0 && (
                  <div className="space-y-6">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Apex reference case · inputs
                    </p>
                    <dl className="grid grid-cols-2 gap-4 font-mono text-sm">
                      <div>
                        <dt className="text-zinc-500">Implementation fee</dt>
                        <dd className="mt-1 text-white">
                          {formatCurrency(APEX_INPUTS.implementationFee)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">Hourly labor cost</dt>
                        <dd className="mt-1 text-white">
                          {formatCurrency(APEX_INPUTS.hourlyCost)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">Hours / week</dt>
                        <dd className="mt-1 text-white">
                          {APEX_INPUTS.hoursPerWeek} hrs/wk
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">Automation coverage</dt>
                        <dd className="mt-1 text-white">
                          {Math.round(APEX_INPUTS.expectedAutomationPct * 100)}%
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
                {activeIndex === 1 && (
                  <div className="space-y-6">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Apex reference case · expected scenario
                    </p>
                    <ThresholdLine
                      scale="hero"
                      min={0}
                      max={160000}
                      threshold={BREAK_POINT_FEE}
                      position={APEX_INPUTS.implementationFee}
                      verdict={APEX_VERDICT}
                      thresholdLabel={formatCurrency(BREAK_POINT_FEE)}
                      positionLabel={formatCurrency(APEX_INPUTS.implementationFee)}
                      favourable="below"
                    />
                    <dl className="grid grid-cols-3 gap-4 font-mono">
                      <div>
                        <dt className="text-[11px] uppercase tracking-wider text-zinc-500">
                          Net (yr 1)
                        </dt>
                        <dd className="mt-1 text-lg text-white">
                          {formatCurrency(APEX_EXPECTED.netAnnualBenefit)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wider text-zinc-500">
                          Payback
                        </dt>
                        <dd className="mt-1 text-lg text-white">
                          {formatPayback(APEX_EXPECTED.paybackMonths)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wider text-zinc-500">
                          Holds until
                        </dt>
                        <dd className="mt-1 text-lg text-amber-500">
                          {formatCurrency(BREAK_POINT_FEE)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
                {activeIndex === 2 && (
                  <div className="space-y-6">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Apex reference case · verdict
                    </p>
                    <div className="flex items-center gap-4">
                      <DecisionBadge decision={APEX_VERDICT} size="lg" dark />
                      <div>
                        <p className="text-sm text-zinc-500">Recommendation</p>
                        <p className="font-display text-2xl font-bold uppercase tracking-tight text-white">
                          {APEX_VERDICT === "build"
                            ? "Build"
                            : APEX_VERDICT === "consider"
                              ? "Consider"
                              : "Don't build"}
                        </p>
                      </div>
                    </div>
                    <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
                      The verdict, the fee where it flips, and a document your
                      client can check line by line.
                    </p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Progress indicator */}
            <div className="absolute bottom-4 left-4 right-4 flex h-1 gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className="h-full flex-1 overflow-hidden bg-white/10"
                >
                  {activeIndex === idx && (
                    <motion.div
                      className="h-full bg-amber-500/80"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 8, ease: "linear" }}
                    />
                  )}
                  {idx < activeIndex && (
                    <div className="h-full w-full bg-amber-500/80" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Step List */}
          <div className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <motion.button
                key={step.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "group relative w-full p-6 text-left outline-none transition-all duration-300",
                  activeIndex === index
                    ? "border border-white/10 bg-white/[0.03]"
                    : "border border-transparent bg-transparent hover:bg-white/[0.01]",
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "mt-1 p-2 transition-colors duration-300",
                      activeIndex === index
                        ? "bg-amber-500 text-black"
                        : "bg-white/5 text-zinc-500",
                    )}
                  >
                    {step.icon}
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3
                      className={cn(
                        "text-xl font-medium transition-colors duration-300",
                        activeIndex === index ? "text-white" : "text-zinc-500",
                      )}
                    >
                      {step.title}
                    </h3>

                    <AnimatePresence>
                      {activeIndex === index && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden text-base leading-relaxed text-zinc-400"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div
                    className={cn(
                      "mt-1.5 transition-all duration-300",
                      activeIndex === index
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-2 opacity-0",
                    )}
                  >
                    <ChevronRight className="h-5 w-5 text-white/40" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer/CTA Area */}
        <div className="flex justify-center border-t border-white/5 pt-12">
          <motion.a
            href="/start?start=1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-white px-8 py-4 font-medium text-black"
          >
            Run your first case
            <ChevronRight className="h-4 w-4" />
          </motion.a>
        </div>
      </div>
    </section>
  );
}

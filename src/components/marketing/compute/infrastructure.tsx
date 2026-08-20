"use client";

import { useEffect, useState, useRef } from "react";
import {
  APEX_INPUTS,
} from "@/lib/golden-case";
import { calculateAllScenarios } from "@/lib/calculations/engine";
import { computeBreakEven, PERMUTATION_COUNT } from "@/lib/calculations/stress-test";
import { computeConfidenceScore, type InputStatus } from "@/lib/calculations/confidence";
import { formatCurrency } from "@/lib/format";

/**
 * ComputeInfrastructure — ported from the COMPUTE template
 * `components/landing/infrastructure-section.tsx`.
 *
 * For Viableo this becomes the DECISION FRAMEWORK section: the globe visual
 * + the SVG connecting-lines animation + the large stat (64 permutations)
 * + stacked stat cards (scenarios + confidence). The visual composition is
 * preserved exactly; the content is Viableo's decision-framework story.
 *
 * Image = the localized COMPUTE world.png (globe).
 */

const APEX_ALL = calculateAllScenarios(APEX_INPUTS);
const APEX_BREAK_EVEN = computeBreakEven(APEX_INPUTS, 'expected');
const BREAK_POINT_FEE = APEX_BREAK_EVEN.implementationFee ?? 0;
const APEX_CONFIDENCE_STATUSES: Record<string, InputStatus> = {
  hourlyCost: 'provided', leadsPerMonth: 'provided', implementationFee: 'provided',
  expectedAutomationPct: 'estimated', expectedConversionImprovementPct: 'estimated',
  errorCost: 'assumption', otherInputs: 'assumption',
};
const APEX_CONFIDENCE = computeConfidenceScore(APEX_CONFIDENCE_STATUSES);

const scenarios = [
  { name: "Conservative", value: formatCurrency(APEX_ALL.conservative.netAnnualBenefit), status: "modeled" },
  { name: "Expected", value: formatCurrency(APEX_ALL.expected.netAnnualBenefit), status: "modeled" },
  { name: "Upside", value: formatCurrency(APEX_ALL.upside.netAnnualBenefit), status: "modeled" },
  { name: "Breaking point", value: formatCurrency(BREAK_POINT_FEE), status: "threshold" },
];

export function ComputeInfrastructure() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeScenario, setActiveScenario] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScenario((prev) => (prev + 1) % scenarios.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="infra" ref={sectionRef} className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Header — globe image + title */}
        <div className="mb-16">
          <span
            className={`mb-8 inline-flex items-center gap-4 font-mono text-sm text-ink-muted transition-all duration-700 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="h-px w-12 bg-ink/20" />
            Decision framework
          </span>
          <div className="grid items-stretch gap-8 lg:grid-cols-[auto_1fr] lg:gap-16">
            {/* Globe image — left column, full height — localized COMPUTE world.png */}
            <div
              className={`w-48 shrink-0 transition-all duration-1000 lg:w-72 xl:w-80 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/marketing/compute/infrastructure/world.png"
                alt="Decision framework sphere"
                className="h-full w-full object-contain object-center"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2
                className={`font-display text-[clamp(2.5rem,10vw,8rem)] leading-[0.9] tracking-tight transition-all duration-1000 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                Robust by
                <br />
                <span className="text-ink-muted">default.</span>
              </h2>
              <p
                className={`mt-8 max-w-lg text-xl leading-relaxed text-ink-muted transition-all delay-100 duration-1000 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                The case is not accepted merely because the expected scenario
                looks good. It must survive scrutiny — three scenarios, confidence,
                and the breaking point where the verdict flips.
              </p>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Large stat card with animated SVG connecting lines + dots */}
          <div
            className={`relative overflow-hidden border border-ink/10 bg-ink/[0.02] p-8 lg:col-span-2 lg:p-12 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="absolute inset-0 opacity-70">
              <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
                <defs>
                  <style>{`
                    @keyframes drawLine {
                      0%   { stroke-dashoffset: 1000; opacity: 0; }
                      15%  { opacity: 1; }
                      70%  { opacity: 0.7; }
                      100% { stroke-dashoffset: 0; opacity: 0; }
                    }
                    .connecting-line {
                      stroke: #eca8d6;
                      stroke-width: 1.2;
                      fill: none;
                      stroke-dasharray: 1000;
                      animation: drawLine 3s ease-in-out infinite;
                    }
                  `}</style>
                </defs>
                {[...Array(19)].map((_, i) => {
                  const x1 = 10 + (i % 5) * 20;
                  const y1 = 10 + Math.floor(i / 5) * 25;
                  const x2 = 10 + ((i + 1) % 5) * 20;
                  const y2 = 10 + Math.floor((i + 1) / 5) * 25;
                  return (
                    <line
                      key={`line-${i}`}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      className="connecting-line"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  );
                })}
              </svg>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full bg-[#eca8d6]"
                  style={{
                    left: `${10 + (i % 5) * 20}%`,
                    top: `${10 + Math.floor(i / 5) * 25}%`,
                    animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
            </div>
            <div className="relative z-10">
              <div className="mb-4 flex items-baseline gap-2">
                <span className="font-display text-[8rem] leading-none lg:text-[10rem]">{PERMUTATION_COUNT}</span>
                <span className="text-2xl text-ink-muted">permutations</span>
              </div>
              <p className="max-w-md text-ink-muted">
                Every assumption swept ±20% across 64 permutations, so you walk in
                knowing exactly where the case is fragile.
              </p>
            </div>
          </div>

          {/* Stacked stat cards */}
          <div className="flex flex-col gap-6">
            <div
              className={`border border-ink/10 bg-ink/[0.02] p-8 transition-all delay-100 duration-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <span className="font-display text-5xl text-ink lg:text-6xl">{APEX_CONFIDENCE.score}</span>
              <span className="mt-2 block text-sm text-ink-muted">Confidence / 100</span>
            </div>
            <div
              className={`border border-ink/10 bg-ink/[0.02] p-8 transition-all delay-200 duration-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <span className="font-display text-5xl text-ink lg:text-6xl">{formatCurrency(BREAK_POINT_FEE)}</span>
              <span className="mt-2 block text-sm text-ink-muted">Breaking point</span>
            </div>
          </div>
        </div>

        {/* Scenario list */}
        <div
          className={`mt-12 grid grid-cols-2 gap-4 transition-all delay-300 duration-1000 lg:grid-cols-4 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {scenarios.map((scenario, index) => (
            <div
              key={scenario.name}
              className={`cursor-default border p-6 transition-all duration-300 ${
                activeScenario === index ? "border-ink/30 bg-ink/[0.04]" : "border-ink/10"
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full transition-colors ${
                    activeScenario === index ? "bg-[#eca8d6]" : "bg-ink/20"
                  }`}
                />
                <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                  {scenario.status}
                </span>
              </div>
              <span className="mb-1 block font-medium text-ink">{scenario.name}</span>
              <span className="text-sm text-ink-muted">{scenario.value}</span>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </section>
  );
}

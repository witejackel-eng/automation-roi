"use client";

import { useEffect, useRef, useState } from "react";
import {
  APEX_INPUTS,
} from "@/lib/golden-case";
import {
  calculateScenario,
} from "@/lib/calculations/engine";
import { recommend } from "@/lib/calculations/recommendation";
import { computeBreakEven } from "@/lib/calculations/stress-test";
import { computeConfidenceScore, type InputStatus } from "@/lib/calculations/confidence";
import { formatCurrency, formatPayback, formatRoi } from "@/lib/format";

/**
 * ComputeFeatures — ported from the COMPUTE template
 * `components/landing/features-section.tsx`.
 *
 * Preserves: the bento-grid large feature card with the particle
 * visualization canvas (mouse-reactive floating dots), the mirrored
 * feature image on the right, fade-edge overlays, hover transitions.
 *
 * Content = real Viableo capabilities + real Apex engine numbers.
 * Image = the localized COMPUTE features-visual.png.
 */

const APEX_EXPECTED = calculateScenario(APEX_INPUTS, 'expected');
const APEX_RECOMMENDATION = recommend(APEX_EXPECTED);
const APEX_BREAK_EVEN = computeBreakEven(APEX_INPUTS, 'expected');
const BREAK_POINT_FEE = APEX_BREAK_EVEN.implementationFee ?? 0;
const APEX_CONFIDENCE_STATUSES: Record<string, InputStatus> = {
  hourlyCost: 'provided', leadsPerMonth: 'provided', implementationFee: 'provided',
  expectedAutomationPct: 'estimated', expectedConversionImprovementPct: 'estimated',
  errorCost: 'assumption', otherInputs: 'assumption',
};
const APEX_CONFIDENCE = computeConfidenceScore(APEX_CONFIDENCE_STATUSES);

const features = [
  {
    number: "01",
    title: "Autonomous Execution",
    description: "Deploy AI agents that work independently. They analyze, decide, and execute complex multi-step tasks without human intervention.",
    stats: { value: "99.7%", label: "task completion" },
  },
  {
    number: "02",
    title: "Deterministic ROI model",
    description:
      "One scope in — ROI, payback, annual benefit, and net first-year value out. No black box, no vibes. Every number traces to an input.",
    stats: { value: formatRoi(APEX_EXPECTED.roiPct), label: "expected ROI" },
  },
  {
    number: "03",
    title: "Stress testing",
    description:
      "Sweep every assumption ±20% and watch what moves the answer. 64 permutations, so you walk in knowing where the case is fragile.",
    stats: { value: "64", label: "permutations swept" },
  },
  {
    number: "04",
    title: "Confidence scoring",
    description:
      "Every input is tagged measured, estimated, or assumed. The confidence score tells you how much weight the answer can carry.",
    stats: { value: String(APEX_CONFIDENCE.score), label: "confidence / 100" },
  },
];

// Floating dot particles visualization — exact COMPUTE canvas.
function ParticleVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const COUNT = 70;
    const particles = Array.from({ length: COUNT }, (_, i) => {
      const seed = i * 1.618;
      return {
        bx: (seed * 127.1) % 1,
        by: (seed * 311.7) % 1,
        phase: seed * Math.PI * 2,
        speed: 0.4 + (seed % 0.4),
        radius: 1.2 + (seed % 2.2),
      };
    });

    let time = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      particles.forEach((p) => {
        const flowX = Math.sin(time * p.speed * 0.4 + p.phase) * 38;
        const flowY = Math.cos(time * p.speed * 0.3 + p.phase * 0.7) * 24;
        const bx = p.bx * w;
        const by = p.by * h;
        const dx = p.bx - mx;
        const dy = p.by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist * 2.8);
        const x = bx + flowX + influence * Math.cos(time + p.phase) * 36;
        const y = by + flowY + influence * Math.sin(time + p.phase) * 36;
        const pulse = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
        const alpha = 0.08 + pulse * 0.18 + influence * 0.3;
        ctx.beginPath();
        ctx.arc(x, y, p.radius + pulse * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });
      time += 0.016;
      frameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-auto absolute inset-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export function ComputeFeatures() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Header — full width diagonal layout */}
        <div className="relative mb-24 lg:mb-32">
          <div className="grid items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-ink-muted">
                <span className="h-px w-12 bg-ink/30" />
                Capabilities
              </span>
              <h2
                className={`font-display text-[clamp(2.5rem,8vw,8rem)] leading-[0.9] tracking-tight text-ink transition-all duration-1000 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                What Viableo
                <br />
                <span className="text-ink-muted">answers.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-4">
              <p
                className={`text-xl leading-relaxed text-ink-muted transition-all delay-200 duration-1000 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                Four questions, answered before you quote. Is it worth building?
                Where does it stop being true? How much should you trust it?
                What do you hand the client?
              </p>
            </div>
          </div>
        </div>

        {/* Bento grid — large feature card with particle canvas + mirrored image */}
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div
            className={`group relative flex min-h-[500px] overflow-hidden border border-ink/10 bg-black transition-all duration-700 lg:col-span-12 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            {/* Left: text + particle canvas */}
            <div className="relative flex-1 bg-black p-8 lg:p-12">
              <ParticleVisualization />
              <div className="relative z-10">
                <span className="font-mono text-sm text-ink-muted">{features[0].number}</span>
                <h3 className="group-hover: translate-x-2 mt-4 mb-6 font-display text-3xl text-ink transition-transform duration-500 lg:text-4xl">
                  Deterministic ROI model
                </h3>
                <p className="mb-8 max-w-md text-lg leading-relaxed text-ink-muted">
                  One scope in — ROI, payback, annual benefit, and net first-year
                  value out. No black box, no vibes. Every number traces to an input.
                </p>
                <div>
                  <span className="font-display text-5xl text-ink lg:text-6xl">
                    {formatCurrency(APEX_EXPECTED.netAnnualBenefit)}
                  </span>
                  <span className="mt-2 block font-mono text-sm text-ink-muted">
                    expected first-year net
                  </span>
                </div>
              </div>
            </div>

            {/* Right: mirrored image, full height — localized COMPUTE features-visual.png */}
            <div className="relative hidden w-[42%] shrink-0 overflow-hidden lg:block">
              { }
              <img
                src="/marketing/compute/features/features-visual.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-center"
                style={{ transform: "scaleX(-1)" }}
              />
              {/* Fade left edge into black */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black" />
            </div>
          </div>

          {/* Three smaller feature cards */}
          {features.slice(1).map((feature, index) => (
            <div
              key={feature.number}
              className={`relative border border-ink/10 bg-ink/[0.02] p-8 transition-all duration-700 lg:col-span-4 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="mb-4 flex items-center gap-4">
                <span className="font-mono text-sm text-amber-400">{feature.number}</span>
                <div className="h-px flex-1 bg-ink/10" />
              </div>
              <h3 className="mb-3 font-display text-2xl text-ink">{feature.title}</h3>
              <p className="mb-6 text-sm leading-relaxed text-ink-muted">{feature.description}</p>
              <div>
                <span className="font-display text-3xl text-ink lg:text-4xl">{feature.stats.value}</span>
                <span className="mt-1 block font-mono text-xs text-ink-muted">{feature.stats.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

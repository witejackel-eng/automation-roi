"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ComputeHowItWorks — ported from the COMPUTE template
 * `components/landing/how-it-works-section.tsx`.
 *
 * Preserves: the tree image anchored bottom-right with left-edge fade,
 * the oversized 3-line headline (Define/Deploy/Scale → Scope/Model/Decide),
 * the 3-step interactive cards with animated progress bars + active indicator.
 *
 * Content = Viableo's Scope → Model → Stress-test → Decide process.
 * Image = the localized COMPUTE tree.png.
 */
const steps = [
  {
    number: "01",
    title: "Scope",
    subtitle: "the opportunity",
    description:
      "Drop in the workload, the labor cost, and the fee you\u2019re considering. Viableo takes one scope and returns the full economic picture.",
  },
  {
    number: "02",
    title: "Model",
    subtitle: "the economics",
    description:
      "ROI, payback, annual benefit, and net first-year value \u2014 computed deterministically from your inputs, with confidence scored on every field.",
  },
  {
    number: "03",
    title: "Decide",
    subtitle: "with a verdict",
    description:
      "A BUILD / CONSIDER / DON\u2019T BUILD verdict, the fee where that verdict flips, and a business case your client can check line by line.",
  },
];

export function ComputeHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden bg-[oklch(0.09_0.01_260)] py-24 text-white lg:py-32"
    >
      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-white/[0.02] blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Header — title + tree image */}
        <div className="relative mb-0 grid items-end gap-4 lg:grid-cols-2 lg:gap-12">
          <div className="overflow-hidden pb-0 lg:pb-32">
            <div className={`transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}>
              <span className="mb-8 inline-flex items-center gap-3 font-mono text-sm text-white/40">
                <span className="h-px w-12 bg-white/20" />
                Process
              </span>
            </div>
            <h2
              className={`font-display text-[clamp(3rem,10vw,8rem)] leading-[0.85] tracking-tight transition-all delay-100 duration-1000 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
              }`}
            >
              <span className="block">Scope.</span>
              <span className="block text-white/30">Model.</span>
              <span className="block text-white/10">Decide.</span>
            </h2>
          </div>

          {/* Tree image — anchored bottom, left-edge fade — localized COMPUTE tree.png */}
          <div
            className={`relative h-[320px] overflow-hidden transition-all delay-200 duration-1000 lg:h-[640px] ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            { }
            <img
              src="/marketing/compute/process/tree.png"
              alt=""
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-full w-full object-contain object-bottom"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[oklch(0.09_0.01_260)] via-transparent to-transparent" />
          </div>
        </div>

        {/* Horizontal steps layout */}
        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <button
              key={step.number}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`relative border p-8 text-left transition-all duration-500 lg:p-12 ${
                activeStep === index
                  ? "border-white/60 bg-black"
                  : "border-white/25 bg-black hover:border-white/50"
              }`}
            >
              <div className="mb-8 flex items-center gap-4">
                <span
                  className={`font-display text-4xl transition-colors duration-300 ${
                    activeStep === index ? "text-[#eca8d6]" : "text-white/20"
                  }`}
                >
                  {step.number}
                </span>
                <div className="h-px flex-1 overflow-hidden bg-white/10">
                  {activeStep === index && <div className="h-full bg-[#eca8d6]/50 animate-progress" />}
                </div>
              </div>
              <h3 className="mb-2 font-display text-3xl lg:text-4xl">{step.title}</h3>
              <span className="mb-6 block font-display text-xl text-white/40">{step.subtitle}</span>
              <p
                className={`leading-relaxed text-white/60 transition-opacity duration-300 ${
                  activeStep === index ? "opacity-100" : "opacity-60"
                }`}
              >
                {step.description}
              </p>
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 origin-left bg-[#eca8d6] transition-transform duration-500 ${
                  activeStep === index ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 6s linear forwards;
        }
      `}</style>
    </section>
  );
}

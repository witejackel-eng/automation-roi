"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  FINAL_CTA_HEADLINE,
  FINAL_CTA_BODY,
  FINAL_CTA_PRIMARY,
} from "@/lib/brand";

/**
 * ComputeCTA — the closing CTA section.
 *
 * Ported from the COMPUTE template `components/landing/cta-section.tsx`:
 * bordered container, mouse-tracking spotlight, oversized serif headline,
 * supporting copy, primary + secondary CTA. Content = Automation ROI's
 * real closing CTA.
 */
export function ComputeCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.2 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div
          ref={sectionRef}
          className={`relative border border-ink/20 transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight effect */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(245, 181, 68, 0.3), transparent 40%)`,
            }}
          />

          <div className="relative z-10 px-8 py-16 lg:px-16 lg:py-24">
            <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
              {/* Left content */}
              <div className="flex-1">
                <h2 className="mb-8 font-display text-[clamp(2rem,5vw,4.5rem)] leading-[0.95] tracking-tight text-ink">
                  {FINAL_CTA_HEADLINE}
                </h2>
                <p className="mb-12 max-w-xl text-lg leading-relaxed text-ink-muted">
                  {FINAL_CTA_BODY}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/start?start=1"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-3 text-base text-canvas transition-all hover:bg-ink/90"
                  >
                    {FINAL_CTA_PRIMARY}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/start?start=1&example=apex"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-8 py-3 text-base text-ink transition-all hover:bg-ink/5"
                  >
                    See a completed case
                  </Link>
                </div>
              </div>

              {/* Right image — the actual COMPUTE bridge.png (preserved per directive §4) */}
              <div className="hidden w-[600px] items-end justify-center lg:flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/marketing/compute/cta/bridge.png"
                  alt=""
                  aria-hidden="true"
                  className="h-[650px] w-full object-contain object-bottom"
                />
              </div>
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute right-0 top-0 h-32 w-32 border-b border-l border-ink/10" />
          <div className="absolute bottom-0 left-0 h-32 w-32 border-r border-t border-ink/10" />
        </div>
      </div>
    </section>
  );
}

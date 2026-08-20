"use client";

import { useState, useEffect, useRef } from "react";

/**
 * ComputeDevelopers — ported from the COMPUTE template
 * `components/landing/developers-section.tsx`.
 *
 * For Viableo this becomes the CLIENT BUSINESS CASE section: the large
 * bottom-right visual (developers-visual.png) stays, with text on the left
 * half describing the client-ready business case workflow.
 *
 * Image = the localized COMPUTE developers-visual.png (bottom-right, faded).
 */

const features = [
  { title: "Client-ready PDF", description: "Unwatermarked on Pro and above. Your branding on Agency." },
  { title: "Shareable link", description: "The recipient sees the same verdict without an account." },
  { title: "Scenario table", description: "Conservative, Expected, Upside — in the document." },
  { title: "Sensitivity analysis", description: "What moves the answer, laid out for the client." },
];

export function ComputeDevelopers() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="developers" ref={sectionRef} className="relative overflow-hidden py-24 lg:py-32">
      {/* Image — absolute, bottom-right, behind all content — localized COMPUTE developers-visual.png */}
      <div
        className={`pointer-events-none absolute bottom-0 right-0 h-[85%] w-[55%] transition-all delay-300 duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/compute/developers/developers-visual.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-left-top"
        />
        {/* Fade left edge */}
        <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/60 to-transparent" />
        {/* Fade top edge */}
        <div className="absolute inset-0 bg-gradient-to-b from-canvas via-transparent to-transparent" />
      </div>

      {/* Text content on top */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className={`mb-16 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-ink-muted">
            <span className="h-px w-8 bg-ink/30" />
            Client business case
          </span>
          <h2 className="font-display text-[clamp(2.5rem,10vw,8rem)] leading-[0.9] tracking-tight text-ink">
            Build the case.
            <br />
            <span className="text-ink-muted">Then take it to the client.</span>
          </h2>
        </div>

        <div className={`max-w-[50%] transition-all delay-100 duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <p className="mb-12 max-w-md text-xl leading-relaxed text-ink-muted">
            Viableo doesn&apos;t stop at analysis. It gives you an artifact you can
            actually take into the client conversation — the verdict, the math, the
            scenarios, and the confidence, in one defensible document.
          </p>
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`transition-all duration-500 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 50 + 200}ms` }}
              >
                <h3 className="mb-1 font-medium text-ink">{feature.title}</h3>
                <p className="text-sm text-ink-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

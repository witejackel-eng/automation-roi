"use client";

import { useState, useEffect, useRef } from "react";

/**
 * ComputeIntegrations — ported from the COMPUTE template
 * `components/landing/integrations-section.tsx`.
 *
 * For Viableo this becomes the WORKFLOW section: the full-width connection
 * image stays, with the integration grid repurposed as workflow touchpoints
 * (n8n, Make, Zapier, spreadsheets, CRMs, proposal workflows). Only factual
 * claims — no invented integrations.
 *
 * Image = the localized COMPUTE connection.png (full-width, centered).
 */

const integrations = [
  { name: "n8n", category: "automation platform" },
  { name: "Make", category: "automation platform" },
  { name: "Zapier", category: "automation platform" },
  { name: "Spreadsheets", category: "your existing model" },
  { name: "CRM", category: "client context" },
  { name: "Proposal docs", category: "client delivery" },
  { name: "Discovery calls", category: "scope intake" },
  { name: "Client review", category: "decision" },
];

export function ComputeIntegrations() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
    <section ref={sectionRef} className="relative overflow-hidden py-24 lg:py-32">
      {/* Header */}
      <div className="mx-auto mb-16 max-w-[1400px] px-6 text-center lg:px-12">
        <span className="mb-8 inline-flex items-center gap-3 font-mono text-sm text-ink-muted">
          <span className="h-px w-12 bg-ink/20" />
          Workflow
          <span className="h-px w-12 bg-ink/20" />
        </span>
        <h2
          className={`font-display text-[clamp(2.5rem,10vw,8rem)] leading-[0.9] tracking-tight transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          From discovery
          <br />
          <span className="text-ink-muted">to decision.</span>
        </h2>
        <p
          className={`mx-auto mt-8 max-w-lg text-xl leading-relaxed text-ink-muted transition-all delay-100 duration-1000 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Viableo sits naturally between discovery, economics, proposal, and the
          client decision. Fits the way automation agencies already work.
        </p>
      </div>

      {/* Full-width connection image — localized COMPUTE connection.png */}
      <div
        className={`relative -mt-16 w-screen -translate-x-1/2 left-1/2 transition-all delay-200 duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/compute/integrations/connection.png"
          alt=""
          aria-hidden="true"
          className="h-auto w-full object-cover"
        />
      </div>

      {/* Workflow touchpoint grid — overlaps the image */}
      <div className="relative z-10 mx-auto mt-0 max-w-[1400px] px-6 lg:-mt-24 lg:px-12">
        <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {integrations.map((integration, index) => (
            <div
              key={integration.name}
              className={`group relative cursor-default overflow-hidden border p-6 transition-all duration-500 lg:p-8 ${
                hoveredIndex === index
                  ? "scale-[1.02] border-ink bg-ink/[0.04]"
                  : "border-ink/10 hover:border-ink/30"
              } ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
              style={{ transitionDelay: `${index * 30 + 300}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="mb-3 h-8 w-8 rounded border border-ink/20" aria-hidden="true" />
              <div className="font-medium text-ink">{integration.name}</div>
              <div className="mt-1 font-mono text-xs text-ink-muted">{integration.category}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

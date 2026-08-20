"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { CONSEQUENCE_ITEMS } from "@/lib/brand";

/**
 * Skydda-transplanted review/proof section.
 *
 * Structure ported from Skydda `testimonials-section.tsx`: section marker,
 * blur-reveal headline + left/right nav arrows, 3-col quote card grid with
 * amber quote mark, large quote text, small attribution. Mobile carousel
 * behavior preserved.
 *
 * Content = REAL source-backed practitioner statements from the repository
 * (r/agency, r/n8n) — NOT fabricated testimonials. Attribution clearly
 * states the source. No fake "Viableo customer" framing.
 *
 * Per the master directive: "Use these as a factual alternative. Do NOT
 * fabricate fake Viableo customers."
 */

// Build the review cards from the real CONSEQUENCE_ITEMS, plus the EY
// closing statement, to populate the 3-column carousel.
const reviews = [
  {
    id: 1,
    quote: CONSEQUENCE_ITEMS[0].body,
    source: CONSEQUENCE_ITEMS[0].source.label,
    href: CONSEQUENCE_ITEMS[0].source.href,
    context: "On proposal accuracy",
  },
  {
    id: 2,
    quote: CONSEQUENCE_ITEMS[1].body,
    source: CONSEQUENCE_ITEMS[1].source.label,
    href: CONSEQUENCE_ITEMS[1].source.href,
    context: "On maintenance costs",
  },
  {
    id: 3,
    quote: CONSEQUENCE_ITEMS[2].body,
    source: CONSEQUENCE_ITEMS[2].source.label,
    href: CONSEQUENCE_ITEMS[2].source.href,
    context: "On automation adoption",
  },
];

export function SkyddaProofSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  // Build a 3-item window that wraps around.
  const visible = [
    reviews[currentIndex],
    reviews[(currentIndex + 1) % reviews.length],
    reviews[(currentIndex + 2) % reviews.length],
  ];

  return (
    <section className="w-full border-b border-zinc-200 bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-6">
          <div className="flex w-fit items-center gap-3 border border-zinc-300 px-4 py-2">
            <div className="h-2.5 w-2.5 bg-amber-500" />
            <span className="text-sm font-medium tracking-wide text-zinc-500">
              What Practitioners Report
            </span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <h2 className="text-balance text-4xl font-normal text-zinc-900 md:text-5xl">
              {"What Automation Practitioners Report.".split(" ").map((word, i) => (
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
            <div className="flex flex-shrink-0 gap-2">
              <button
                onClick={prevReview}
                className="border border-zinc-300 bg-transparent p-3 text-zinc-600 transition-colors hover:bg-zinc-100"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextReview}
                className="border border-zinc-300 bg-transparent p-3 text-zinc-600 transition-colors hover:bg-zinc-100"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Review grid — 3 columns, Skydda structure */}
        <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
          {visible.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className={`p-8 ${
                index !== 2 ? "border-b border-zinc-200 md:border-b-0 md:border-r" : ""
              }`}
            >
              {/* Quote Icon — amber accent */}
              <div className="mb-6 text-4xl font-bold text-amber-500">&ldquo;</div>

              {/* Quote Text */}
              <p className="mb-8 min-h-[160px] text-base leading-relaxed text-zinc-700">
                {review.quote}
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-100 text-sm font-bold text-zinc-500">
                  {review.source.split("/")[1]?.charAt(0).toUpperCase() ?? "R"}
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900">
                    {review.context}
                  </div>
                  <a
                    href={review.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-wider text-zinc-400 transition-colors hover:text-amber-600"
                  >
                    Source: {review.source}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

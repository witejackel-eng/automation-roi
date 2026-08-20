"use client";

import { motion } from "motion/react";
import { BookOpen, ShieldCheck, Scale, Eye } from "lucide-react";

/**
 * Skydda-transplanted Testimonials section → Automation ROI Proof section.
 *
 * The master spec forbids fabricating testimonials. Instead this keeps the
 * Skydda structural skeleton (section marker, blur-reveal headline, 3-col
 * grid of quote-style cards) but fills it with real Automation ROI
 * methodology / credibility statements — not fake people or companies.
 */
const PROOF_STATEMENTS = [
  {
    id: 1,
    icon: <BookOpen className="h-5 w-5" />,
    title: "Published methodology",
    body: "Every formula, threshold, and confidence weight is public. You and your client can read exactly how the number was built — no proprietary black box.",
  },
  {
    id: 2,
    icon: <Scale className="h-5 w-5" />,
    title: "Deterministic calculation",
    body: "Same inputs, same answer — every time. The engine doesn't approximate or infer; it computes. Reproducible analysis you can stand behind.",
  },
  {
    id: 3,
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Stress-tested by default",
    body: "64 permutations sweep every assumption ±20% before you present. You walk in knowing exactly where the case is fragile.",
  },
  {
    id: 4,
    icon: <Eye className="h-5 w-5" />,
    title: "Transparent assumptions",
    body: "Every input is tagged measured, estimated, or assumed. The confidence score tells your client how much weight the answer can carry.",
  },
  {
    id: 5,
    icon: <BookOpen className="h-5 w-5" />,
    title: "Client-ready business case",
    body: "A generated document — inputs, math, scenarios, sensitivity — your client can check line by line. Not a slide deck; a defensible artifact.",
  },
  {
    id: 6,
    icon: <Scale className="h-5 w-5" />,
    title: "Defensible verdicts",
    body: "BUILD, CONSIDER, or DON'T BUILD — against fixed thresholds, not a vibes score. The recommendation engine shows its work.",
  },
];

export function SkyddaProofSection() {
  return (
    <section className="w-full border-b border-zinc-700/30 bg-zinc-900 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-6">
          <div className="flex w-fit items-center gap-3 border border-zinc-700 px-4 py-2">
            <div className="h-2.5 w-2.5 bg-amber-500" />
            <span className="text-sm font-medium tracking-wide text-zinc-400">
              Proof
            </span>
          </div>
          <h2 className="text-balance text-4xl font-normal text-white md:text-5xl">
            {"No black box. Open the math.".split(" ").map((word, i) => (
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
        </div>

        {/* Proof grid — same 3-col structure as Skydda testimonials */}
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-zinc-700/30 bg-zinc-700/30 md:grid-cols-3">
          {PROOF_STATEMENTS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-6 bg-zinc-900 p-8"
            >
              {/* Icon / marker */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-medium text-white">{item.title}</h3>

              {/* Body */}
              <p className="flex-1 text-base leading-relaxed text-zinc-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

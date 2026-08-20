"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// ── Real Automation ROI FAQ content, grounded in the repository ──
// Every answer traces to an actual product capability: the calculation
// engine, the recommendation logic, the pricing tiers, the methodology.
const faqs: FAQItem[] = [
  {
    id: "1",
    question: "How does Viableo decide BUILD, CONSIDER, or DON'T BUILD?",
    answer:
      "The recommendation engine weighs payback period, net annual benefit, and confidence against fixed thresholds. BUILD requires payback under 12 months and positive net benefit. CONSIDER sits between 12 and 24 months. Above 24 months the verdict flips to DON'T BUILD. Every threshold is published in the methodology — no black box, no vibes score.",
  },
  {
    id: "2",
    question: "Where do the numbers come from?",
    answer:
      "Every number traces to an input you provide: hourly labor cost, workload volume, implementation fee, automation coverage, conversion improvement, error cost. The calculation engine computes ROI, payback, annual benefit, and net first-year value deterministically. Same inputs, same answer — every time. No LLM approximation in the math.",
  },
  {
    id: "3",
    question: "What is the break-even implementation threshold?",
    answer:
      "It's the exact implementation fee where the verdict flips. Quote below it and the case holds; above it and the answer breaks. The stress-test engine sweeps the fee across 64 permutations so you can see exactly where the decision changes — not a single fragile number.",
  },
  {
    id: "4",
    question: "What does the client actually receive?",
    answer:
      "A generated business case document — inputs, the full math, the three scenarios (Conservative, Expected, Upside), the sensitivity analysis, and the confidence breakdown. Your client can check it line by line. On Pro and above it's an unwatermarked PDF; on Agency plans it carries your branding.",
  },
  {
    id: "5",
    question: "How does confidence scoring work?",
    answer:
      "Every input is tagged measured, estimated, or assumed. Each tag carries a weight; the weighted sum becomes a 0–100 confidence score. A case built on provided labor data and an estimated conversion rate scores higher than one resting on three assumptions. The score tells you — and your client — how much weight the answer can carry.",
  },
  {
    id: "6",
    question: "What's the difference between the plans?",
    answer:
      "Free gives you one case per month with a watermarked document — full analytical rigor, no cost. Pro ($29/mo) raises that to five cases with unwatermarked PDFs, saved projects, and share links. Agency ($79/mo) is unlimited cases with your branding and client history. Agency Pro ($790/yr) adds team seats and API access.",
  },
];

export function SkyddaFaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleQuestion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      id="faq"
      className="w-full border-b border-zinc-200 bg-white py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Header */}
          <div className="flex flex-col gap-6">
            <div className="flex w-fit items-center gap-3 border border-zinc-200 px-4 py-2">
              <div className="h-2.5 w-2.5 bg-amber-500" />
              <span className="text-sm font-medium tracking-wide text-zinc-400">
                FAQ
              </span>
            </div>

            <h2 className="text-balance text-4xl font-normal leading-[1.1] tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
              {"Common Questions".split(" ").map((word, i) => (
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

            <p className="max-w-md text-balance text-base leading-relaxed text-zinc-400 md:text-lg">
              Quick answers about how Viableo computes the verdict, what your
              client receives, and how the plans differ. Can&apos;t find what
              you&apos;re looking for? Read the full methodology.
            </p>
          </div>

          {/* Right Column - FAQ Items */}
          <div className="flex flex-col">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={cn(
                  "border-t border-zinc-200",
                  index === faqs.length - 1 && "border-b",
                )}
              >
                <button
                  onClick={() => toggleQuestion(faq.id)}
                  className="group flex w-full items-center justify-between gap-4 py-6 text-left"
                >
                  <span className="text-lg font-normal text-zinc-900 transition-colors group-hover:text-zinc-600 md:text-xl">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-zinc-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pr-12">
                        <p className="text-base leading-relaxed text-zinc-400">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

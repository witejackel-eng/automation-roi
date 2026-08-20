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

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "How does Viableo decide BUILD, CONSIDER, or DON'T BUILD?",
    answer:
      "The recommendation engine weighs payback period, net annual benefit, and confidence against fixed thresholds. BUILD requires payback under 12 months and positive net benefit. CONSIDER sits between 12 and 24 months. Above 24 months the verdict flips to DON'T BUILD. Every threshold is published in the methodology — no black box.",
  },
  {
    id: "2",
    question: "Where do the numbers come from?",
    answer:
      "Every number traces to an input you provide: hourly labor cost, workload volume, implementation fee, automation coverage, conversion improvement, error cost. The calculation engine computes ROI, payback, annual benefit, and net first-year value deterministically. Same inputs, same answer — every time.",
  },
  {
    id: "3",
    question: "What is the break-even implementation threshold?",
    answer:
      "It's the exact implementation fee where the verdict flips. Quote below it and the case holds; above it and the answer breaks. The stress-test engine sweeps the fee across 64 permutations so you can see exactly where the decision changes.",
  },
  {
    id: "4",
    question: "What does the client actually receive?",
    answer:
      "A generated business case document — inputs, the full math, the three scenarios (Conservative, Expected, Upside), the sensitivity analysis, and the confidence breakdown. On Pro and above it's an unwatermarked PDF; on Agency plans it carries your branding.",
  },
  {
    id: "5",
    question: "How does confidence scoring work?",
    answer:
      "Every input is tagged measured, estimated, or assumed. Each tag carries a weight; the weighted sum becomes a 0–100 confidence score. The score tells you — and your client — how much weight the answer can carry.",
  },
  {
    id: "6",
    question: "What's the difference between the plans?",
    answer:
      "Free gives you one case per month with a watermarked document — full analytical rigor, no cost. Pro ($29/mo) raises that to five cases with unwatermarked PDFs, saved projects, and share links. Agency ($79/mo) is unlimited cases with your branding and client history. Agency Pro ($790/yr) adds team seats and API access.",
  },
];

export function ComputeFAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — header */}
          <div className="flex flex-col gap-6">
            <span className="inline-flex items-center gap-3 font-mono text-sm text-ink-muted">
              <span className="h-px w-8 bg-ink/30" />
              FAQ
            </span>
            <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-tight text-ink">
              Common
              <br />
              <span className="text-ink-muted">questions.</span>
            </h2>
            <p className="max-w-md text-base leading-relaxed text-ink-muted">
              Quick answers about how Viableo computes the verdict, what your
              client receives, and how the plans differ.
            </p>
          </div>

          {/* Right — accordion */}
          <div className="flex flex-col">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={cn(
                  "border-t border-ink/10",
                  index === faqs.length - 1 && "border-b",
                )}
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="group flex w-full items-center justify-between gap-4 py-6 text-left"
                >
                  <span className="text-lg font-normal text-ink transition-colors group-hover:text-ink-muted">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-ink-muted" />
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
                        <p className="text-base leading-relaxed text-ink-muted">
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

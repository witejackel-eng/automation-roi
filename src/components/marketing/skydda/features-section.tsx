"use client";

import React from "react";
import { motion, type Variants } from "motion/react";
import {
  Calculator,
  Gavel,
  GitBranch,
  Gauge,
  Crosshair,
  FlaskConical,
  FileText,
  FolderOpen,
  Share2,
  Building2,
  Lock,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FeatureItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

// ── Real Automation ROI capabilities (only functionality that exists in the repo) ──
const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: "1",
    icon: <Calculator className="h-5 w-5 text-white" />,
    title: "Deterministic ROI model",
    description:
      "One scope in — ROI, payback, annual benefit, and net first-year value out. No black box, no vibes. Every number traces to an input.",
  },
  {
    id: "2",
    icon: <Gavel className="h-5 w-5 text-white" />,
    title: "BUILD / CONSIDER / DON'T BUILD",
    description:
      "A verdict, not a score. The recommendation engine weighs payback, net benefit, and confidence against fixed thresholds you can defend.",
  },
  {
    id: "3",
    icon: <GitBranch className="h-5 w-5 text-white" />,
    title: "Conservative · Expected · Upside",
    description:
      "Three scenarios run from the same inputs, so you see the range — not a single number that falls apart under the first question.",
  },
  {
    id: "4",
    icon: <Gauge className="h-5 w-5 text-white" />,
    title: "Confidence scoring",
    description:
      "Every input is tagged measured, estimated, or assumed. The confidence score tells you — and your client — how much weight the answer can carry.",
  },
  {
    id: "5",
    icon: <Crosshair className="h-5 w-5 text-white" />,
    title: "Break-even implementation threshold",
    description:
      "The exact fee where the verdict flips. Quote below it and the case holds; above it and it breaks. One number, defensible.",
  },
  {
    id: "6",
    icon: <FlaskConical className="h-5 w-5 text-white" />,
    title: "Stress testing",
    description:
      "Sweep every assumption ±20% and watch what moves the answer. 64 permutations, so you walk in knowing where the case is fragile.",
  },
  {
    id: "7",
    icon: <FileText className="h-5 w-5 text-white" />,
    title: "Client business case",
    description:
      "A generated document your client can check line by line — inputs, math, scenarios, sensitivity. Not a slide deck; a defensible artifact.",
  },
  {
    id: "8",
    icon: <FolderOpen className="h-5 w-5 text-white" />,
    title: "Saved projects",
    description:
      "Every case is saved to your workspace. Load it, revise it, rerun it when the scope changes. No spreadsheet to lose.",
  },
  {
    id: "9",
    icon: <Share2 className="h-5 w-5 text-white" />,
    title: "Shareable analysis",
    description:
      "Send a link. The recipient sees the same verdict, the same numbers, the same document — without an account or a sales call.",
  },
  {
    id: "10",
    icon: <Building2 className="h-5 w-5 text-white" />,
    title: "Agency branding",
    description:
      "Your logo, your colors, your name on every business case. The document leaves looking like it came from your shop, not ours.",
  },
  {
    id: "11",
    icon: <Lock className="h-5 w-5 text-white" />,
    title: "Entitlements & billing",
    description:
      "Plan-gated case limits, Whop checkout, subscription state. The pricing surface is real and wired to the actual purchase flow.",
  },
  {
    id: "12",
    icon: <BookOpen className="h-5 w-5 text-white" />,
    title: "Published methodology",
    description:
      "The formulas, the thresholds, the confidence weights — all public. You and your client can read exactly how the number was built.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

interface FeaturesSectionProps {
  preHeading?: string;
  headline?: string;
  features?: FeatureItem[];
  className?: string;
}

/**
 * Skydda-transplanted Features section.
 * Structure ported from Skydda `features-section.tsx`: section marker,
 * blur-reveal headline, 3-col feature grid with amber-gradient icon tiles,
 * CTA row. Content = real Automation ROI capabilities (12 features).
 */
export function SkyddaFeaturesSection({
  preHeading = "Key Capabilities",
  headline = "Everything you need to defend the number",
  features = DEFAULT_FEATURES,
  className,
}: FeaturesSectionProps) {
  return (
    <section
      className={cn(
        "w-full border-b border-zinc-700/30 bg-zinc-900 py-24",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col gap-6"
        >
          <div className="flex w-fit items-center gap-3 border border-zinc-700 px-4 py-2">
            <div className="h-2.5 w-2.5 bg-amber-500" />
            <span className="text-sm font-medium tracking-wide text-zinc-400">
              {preHeading}
            </span>
          </div>
          <h2 className="max-w-[700px] text-balance text-4xl font-normal leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
            {headline.split(" ").map((word, i) => (
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
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className="group flex flex-col"
            >
              {/* Icon */}
              <div className="mb-8">
                <div className="flex h-10 w-10 transform items-center justify-center rounded-lg bg-gradient-to-b from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20 transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xl font-medium tracking-tight text-white">
                  {feature.title}
                </h4>
                <p className="text-balance text-base leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/start?start=1"
            className="bg-white px-8 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-200 active:scale-95"
          >
            Run your first case
          </Link>
          <Link
            href="/methodology"
            className="border border-zinc-600 bg-transparent px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95"
          >
            Read the methodology
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

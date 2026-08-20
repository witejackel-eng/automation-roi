'use client';

/**
 * Viableo Orbit welcome view — shown when user lands on /start without ?start=1.
 * Minimal, Orbit-styled welcome that directs users to the calculator.
 */
import * as React from 'react';
import Link from 'next/link';
import { Calculator, FileText, Shield, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: Calculator,
    title: 'Scope & model',
    desc: 'Describe the automation. Viableo computes three scenarios from the same inputs.',
  },
  {
    icon: Shield,
    title: 'Stress test',
    desc: '64 permutations. Every material assumption varied together. Find where the answer changes.',
  },
  {
    icon: FileText,
    title: 'Client-ready document',
    desc: 'Six-section business case PDF. Every number traced to a labelled input.',
  },
  {
    icon: Zap,
    title: 'Clear verdict',
    desc: 'BUILD, CONSIDER, or DON\u2019T BUILD. A confidence score. Published decision rules.',
  },
];

export function LandingView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-16">
      {/* Brand mark */}
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#111] text-white">
        <span className="font-mono text-xs tracking-[0.2em]">V</span>
      </div>

      {/* Welcome heading */}
      <h1 className="text-2xl md:text-3xl font-light text-foreground tracking-tight text-center max-w-md mb-3">
        Welcome to Viableo
      </h1>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-10 leading-relaxed">
        Know what&apos;s worth building before you quote it.
        Run a case, stress-test the assumptions, and generate a document your client can defend.
      </p>

      {/* Primary CTA */}
      <Link
        href="/start?start=1"
        className="inline-flex items-center justify-center px-8 py-3.5 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-wide font-medium mb-4"
      >
        START YOUR FIRST CASE
      </Link>

      {/* Secondary CTA */}
      <Link
        href="/start?start=1&example=apex"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        or see a completed case &rarr;
      </Link>

      {/* Feature grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="mt-12 text-xs text-muted-foreground/60 text-center max-w-sm">
        Figures are estimates, not financial advice. Full analytical rigor on the free tier.
      </p>
    </div>
  );
}

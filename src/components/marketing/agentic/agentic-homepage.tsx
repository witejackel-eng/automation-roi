/**
 * AgenticHomepage — full marketing homepage using the agentic template
 * structure with Viableo copy + live Apex engine numbers.
 *
 * Per the ZAI_MASTER_FRONTEND_REBUILD_PROMPT Phase 4 + SITE_COPY.md:
 *   1. Hero — "Know what's worth building." + live Apex stats
 *   2. Problem — "Agencies quote by feel..."
 *   3. How it works — 5 steps
 *   4. Capabilities — 8 items
 *   5. Product contract — "Don't just tell me what the ROI is..."
 *   6. Opposites strip — what Viableo must never become
 *   7. Pricing teaser
 *   8. Final CTA
 *
 * All numbers from the live engine via getApexReferenceNumbers().
 */
import * as React from 'react';
import Link from 'next/link';
import { RevealText } from './reveal-text';
import { getApexReferenceNumbers } from '@/lib/calculations/apex-reference';
import {
  HERO_EYEBROW,
  HERO_HEADLINE,
  HERO_SUBHEAD,
  HERO_CTA_PRIMARY,
  HERO_CTA_SECONDARY,
  PRICING_TIERS,
  FINAL_CTA_HEADLINE,
} from '@/lib/brand';

const apex = getApexReferenceNumbers();

// ── Helper components ────────────────────────────────────────────────────

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-[11px] tracking-widest text-ink-muted">
      {children}
    </span>
  );
}

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`px-6 py-24 md:px-12 lg:px-20 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

// ── Homepage ──────────────────────────────────────────────────────────────

export function AgenticHomepage() {
  return (
    <main>
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-end overflow-hidden">
        {/* Atmospheric background — dark gradient + amber glow */}
        <div className="absolute inset-0 bg-canvas" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 30% 30%, rgba(245, 181, 68, 0.06) 0%, transparent 60%)',
          }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(244, 244, 245, 1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-canvas" />

        {/* Hero content */}
        <div className="relative z-10 w-full px-6 pb-16 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="mb-6">
              <span className="font-mono text-sm text-ink-muted">
                <span className="mr-3 inline-block h-px w-8 align-middle bg-amber-500/50" />
                {HERO_EYEBROW}
              </span>
            </div>

            {/* Headline */}
            <RevealText
              as="h1"
              className="mb-6 text-5xl font-light leading-[1.0] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl"
              stagger={60}
              duration={800}
            >
              {HERO_HEADLINE}
            </RevealText>

            {/* Subhead */}
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-ink-muted">
              {HERO_SUBHEAD}
            </p>

            {/* CTAs */}
            <div className="mb-12 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/start?start=1"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-canvas transition-all hover:bg-ink/90 active:scale-95"
              >
                {HERO_CTA_PRIMARY}
              </Link>
              <Link
                href="/start?start=1&example=apex"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition-all hover:bg-ink/5 active:scale-95"
              >
                {HERO_CTA_SECONDARY}
              </Link>
            </div>

            {/* Trust metrics — live from engine */}
            <div className="flex gap-8 sm:gap-12">
              {[
                { value: apex.formatted.netAnnualBenefit, label: 'Expected first-year net' },
                { value: apex.formatted.payback, label: 'Payback period' },
                { value: apex.formatted.breakEvenFee, label: 'Answer holds until' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="font-display text-3xl text-ink sm:text-4xl">{stat.value}</div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-widest text-ink-muted">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────────────────────────── */}
      <Section className="border-t border-ink/5" id="problem">
        <div className="mb-16">
          <Tag>THE REAL COST OF GUESSING</Tag>
        </div>
        <RevealText
          as="h2"
          className="mb-8 max-w-4xl text-3xl font-light leading-tight tracking-tight text-ink md:text-4xl lg:text-5xl"
        >
          {'Agencies quote by feel.\nClients push back on price.\nProjects ship without a defensible case.'}
        </RevealText>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">
          Most automation proposals start with a number that cannot survive a hard
          question. When the client asks &ldquo;what if coverage is lower?&rdquo; or &ldquo;what if
          implementation runs over?&rdquo;, the answer is usually another optimistic slide.
          Viableo exists so that conversation ends with math, not persuasion.
        </p>
      </Section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <Section className="border-t border-ink/5" id="how">
        <div className="mb-16">
          <Tag>HOW VIABLEO WORKS</Tag>
          <RevealText
            as="h2"
            className="mt-5 text-3xl font-light leading-tight tracking-tight text-ink md:text-4xl lg:text-5xl"
          >
            {'From scope to verdict\nin five steps.'}
          </RevealText>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {[
            { n: '01', title: 'Describe the automation', desc: 'Labor, revenue, cost inputs.' },
            { n: '02', title: 'Model three scenarios', desc: 'Conservative, Expected, Upside.' },
            { n: '03', title: 'Stress-test the case', desc: '64 permutations, break-even thresholds.' },
            { n: '04', title: 'Get a verdict', desc: 'BUILD / CONSIDER / DON\u2019T BUILD with confidence.' },
            { n: '05', title: 'Hand the client a document', desc: 'Share link or PDF they can check line by line.' },
          ].map((step) => (
            <div
              key={step.n}
              className="rounded-xl border border-ink/10 bg-surface/50 p-6 transition-all hover:border-ink/20 hover:bg-surface"
            >
              <span className="font-mono text-sm text-amber-500">{step.n}</span>
              <h3 className="mt-3 text-lg font-medium text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CAPABILITIES ────────────────────────────────────────────────── */}
      <Section className="border-t border-ink/5" id="capabilities">
        <div className="mb-16">
          <Tag>CAPABILITIES</Tag>
          <RevealText
            as="h2"
            className="mt-5 text-3xl font-light leading-tight tracking-tight text-ink md:text-4xl lg:text-5xl"
          >
            {'What Viableo answers.'}
          </RevealText>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Three scenarios', desc: 'Conservative, Expected, Upside from the same inputs.' },
            { title: 'Confidence score', desc: 'Measured, Estimated, Assumed inputs weighted differently.' },
            { title: 'Break it on purpose', desc: 'Find the fee and coverage where the case fails.' },
            { title: '64 stress permutations', desc: 'Multi-lever combinations, not single-slider theater.' },
            { title: 'BUILD / CONSIDER / DON\u2019T BUILD', desc: 'A decision, not a decoration.' },
            { title: 'Client-ready report', desc: 'Stamped verdict, ranked assumptions, shareable link.' },
            { title: 'Assumption quality', desc: 'Every major input must declare its evidence level.' },
            { title: 'Agency workflow', desc: 'Save, reuse clients, challenge versions, propose.' },
          ].map((cap, i) => (
            <div
              key={i}
              className="rounded-xl border border-ink/10 bg-surface/50 p-6 transition-all hover:border-ink/20 hover:bg-surface"
            >
              <h3 className="text-base font-medium text-ink">{cap.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{cap.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── PRODUCT CONTRACT ───────────────────────────────────────────── */}
      <Section className="border-t border-ink/5" id="contract">
        <div className="mb-8">
          <Tag>THE PRODUCT CONTRACT</Tag>
        </div>
        <RevealText
          as="h2"
          className="mb-8 max-w-3xl text-3xl font-light leading-tight tracking-tight text-ink md:text-4xl lg:text-5xl"
        >
          {'Don\u2019t just tell me what the ROI is.\nHelp me know whether I should actually do this.'}
        </RevealText>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { q: 'Calculator answers:', a: 'How much?' },
            { q: 'Report answers:', a: 'How do I present it?' },
            { q: 'Viableo answers:', a: 'Should we do it, how confident should we be, what could break the case, and what should we show the client?' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-ink/10 bg-surface/50 p-6">
              <p className="text-sm font-medium text-ink-muted">{item.q}</p>
              <p className="mt-2 text-base text-ink">{item.a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── OPPOSITES STRIP ─────────────────────────────────────────────── */}
      <Section className="border-t border-ink/5" id="opposites">
        <div className="mb-16">
          <Tag>WHAT VIABLEO MUST NEVER BECOME</Tag>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { want: 'Decision', not: 'Calculator' },
            { want: 'Defensibility', not: 'Black box' },
            { want: 'Evidence', not: 'AI opinion' },
            { want: 'Stress test', not: 'Optimism generator' },
            { want: 'Output', not: 'PDF generator only' },
            { want: 'Repeatability', not: 'One-off analysis' },
            { want: 'Confidence', not: 'Fake precision' },
            { want: 'Honesty', not: 'Sales tool' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-ink/10 bg-surface/50 p-4 text-center">
              <div className="text-base font-medium text-ink">{item.want}</div>
              <div className="mt-1 text-xs text-ink-faint line-through">{item.not}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── PRICING TEASER ─────────────────────────────────────────────── */}
      <Section className="border-t border-ink/5" id="pricing">
        <div className="mb-16">
          <Tag>PRICING</Tag>
          <RevealText
            as="h2"
            className="mt-5 text-3xl font-light leading-tight tracking-tight text-ink md:text-4xl lg:text-5xl"
          >
            {'Simple plans.\nFull rigor on every tier.'}
          </RevealText>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.key}
              className={`rounded-xl border p-6 ${tier.popular ? 'border-amber-500/30 bg-amber-500/5' : 'border-ink/10 bg-surface/50'}`}
            >
              <h3 className="text-lg font-medium text-ink">{tier.name}</h3>
              <p className="mt-2 text-2xl font-display text-ink">{tier.price}</p>
              <p className="mt-1 text-xs text-ink-muted">{tier.cadence}</p>
              <p className="mt-3 text-sm text-ink-muted">{tier.identity}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition-all hover:bg-ink/5"
          >
            See full pricing →
          </Link>
        </div>
      </Section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-ink/5 px-6 py-32 md:px-12 lg:px-20">
        {/* Amber glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245, 181, 68, 0.06) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <RevealText
            as="h2"
            className="mb-6 text-4xl font-light leading-tight tracking-tight text-ink md:text-5xl lg:text-6xl"
          >
            {FINAL_CTA_HEADLINE}
          </RevealText>
          <p className="mb-10 text-lg leading-relaxed text-ink-muted">
            Run one case. If the answer is don&rsquo;t build, you have saved yourself a project.
          </p>
          <Link
            href="/start?start=1"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 text-base font-medium text-canvas transition-all hover:bg-ink/90 active:scale-95"
          >
            {HERO_CTA_PRIMARY}
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-ink/10 px-6 py-10 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm tracking-tight text-ink">Viableo</span>
            <span className="font-mono text-[10px] text-ink-muted">TM</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { label: 'Methodology', href: '/methodology' },
              { label: 'Solutions', href: '/solutions/automation-agencies' },
              { label: 'Resources', href: '/resources/automation-roi' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-xs text-ink-muted transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-6 max-w-6xl text-xs text-ink-faint">
          Figures are estimates, not financial advice. © {new Date().getFullYear()} Viableo.
        </div>
      </footer>
    </main>
  );
}

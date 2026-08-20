import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CTA_PRIMARY, CTA_SECONDARY } from '@/lib/brand';
import { siteUrl } from '@/lib/site-url';

/**
 * Shared marketing primitives for the public marketing routes
 * (/methodology, /pricing, /solutions/*, /resources/*, /privacy, /terms).
 *
 * COMPUTE design system: near-black canvas, oversized serif display,
 * monospace metadata, thin borders, squared editorial blocks.
 * Voice + content rules stay (Brand Spec §4/§5).
 */

// ── CTAs ────────────────────────────────────────────────────────────

/** Primary CTA — white pill (COMPUTE: bg-ink text-canvas). */
export function PrimaryCTA({ className }: { className?: string }) {
  return (
    <a href="/start?start=1" className={cn('inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-canvas transition-all hover:bg-ink/90', className)}>
      {CTA_PRIMARY}
    </a>
  );
}

/** Secondary CTA — outline pill. */
export function SecondaryCTA({ className }: { className?: string }) {
  return (
    <a href="/start?start=1&example=apex" className={cn('inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition-all hover:bg-ink/5', className)}>
      {CTA_SECONDARY}
    </a>
  );
}

/** A CTA pair. */
export function CTAPair({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      <PrimaryCTA />
      <SecondaryCTA />
    </div>
  );
}

// ── Layout shells ───────────────────────────────────────────────────

/** Page hero — monospace eyebrow, oversized serif H1. */
export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-ink/10 bg-canvas pt-32">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12 py-24 md:py-32">
        <span className="mb-8 inline-flex items-center gap-3 font-mono text-sm text-ink-muted">
          <span className="h-px w-8 bg-ink/30" />
          {eyebrow}
        </span>
        <h1 className="font-display text-[clamp(2.5rem,6vw,6rem)] leading-[0.92] tracking-tight text-ink">
          {title}
        </h1>
        {children ? (
          <div className="mt-10 max-w-[600px] text-lg leading-relaxed text-ink-muted">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** A prose section. */
export function Section({
  children,
  wide = false,
  className,
  id,
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn('py-24 md:py-32', className)}>
      <div className={cn('mx-auto w-full px-6 md:px-12', wide ? 'max-w-[1400px]' : 'max-w-[1000px]')}>
        {children}
      </div>
    </section>
  );
}

/** Section eyebrow + heading block. */
export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-[760px]">
      {eyebrow ? (
        <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-ink-muted">
          <span className="h-px w-8 bg-ink/30" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-tight text-ink">
        {title}
      </h2>
      {children ? (
        <div className="mt-6 max-w-[600px] text-lg leading-relaxed text-ink-muted">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** The closing CTA band. */
export function ClosingCTA({
  headline = 'Build what pays back.',
  body = 'Run one case. If the answer is don\u2019t build, you have saved yourself a project.',
}: {
  headline?: string;
  body?: string;
}) {
  return (
    <section className="bg-canvas border-t border-ink/10">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
        <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-ink-muted">
          <span className="h-px w-8 bg-ink/30" />
          Start the analysis
        </span>
        <h2 className="max-w-[760px] font-display text-[clamp(2rem,5vw,4rem)] leading-[0.95] tracking-tight text-ink">
          {headline}
        </h2>
        <p className="mt-8 max-w-[520px] text-lg leading-relaxed text-ink-muted">
          {body}
        </p>
        <div className="mt-10">
          <CTAPair />
        </div>
      </div>
    </section>
  );
}

// ── Inline link ─────────────────────────────────────────────────────

export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-amber-400 underline underline-offset-4 hover:text-amber-300">
      {children}
    </Link>
  );
}

// ── Sibling-links strip ─────────────────────────────────────────────

export function SiblingLinks({
  label = 'Keep reading',
  links,
}: {
  label?: string;
  links: { href: string; label: string }[];
}) {
  return (
    <Section className="border-t border-ink/10 bg-canvas py-12 md:py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-[44px] items-center gap-2 text-base font-medium text-ink"
            >
              <span className="h-px w-6 bg-amber-400" />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ── JSON-LD BreadcrumbList ──────────────────────────────────────────

export function BreadcrumbJsonLd({
  crumbs,
}: {
  crumbs: { name: string; path: string }[];
}) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${siteUrl()}${c.path === '/' ? '/' : c.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

// ── Number display (SSR-safe, no animation) ─────────────────────────

export function FigureBlock({
  label,
  value,
  caption,
  accent = false,
}: {
  label: string;
  value: string;
  caption?: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-ink/10 bg-ink/[0.02] p-6">
      <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <p
        className={cn(
          'mt-3 font-display text-4xl tracking-tight md:text-5xl',
          accent ? 'text-amber-400' : 'text-ink',
        )}
      >
        {value}
      </p>
      {caption ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{caption}</p>
      ) : null}
    </div>
  );
}

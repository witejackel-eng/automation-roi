import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DotSeparator } from '@/components/viableo';
import { CTA_PRIMARY, CTA_SECONDARY } from '@/lib/brand';

/**
 * Shared server-rendered primitives for the public marketing routes
 * (Task 8-seo). These keep voice + visual rules consistent across the
 * /automation-roi, /methodology, /solutions/*, and /resources/* pages
 * without duplicating markup in ten places.
 *
 * Voice (Brand Spec §4): short, plain sentences. Rule of three.
 * Visual (Brand Spec §5.1): 70/20/10 — mostly canvas/charcoal, restrained coral.
 * Headlines: HUGE + BOLD + TIGHT (tracking-[-0.02em] leading-[0.95–1.05]).
 */

import { siteUrl } from '@/lib/site-url';

// ── CTAs ────────────────────────────────────────────────────────────

/** Primary CTA — charcoal pill, links to the calculator (auto-start). */
export function PrimaryCTA({ className }: { className?: string }) {
  return (
    <a
      href="/start?start=1"
      className={cn('mkt-cta-dark', className)}
    >
      {CTA_PRIMARY}
    </a>
  );
}

/** Secondary CTA — underline-wipe link to the Apex example. */
export function SecondaryCTA({ className }: { className?: string }) {
  return (
    <a
      href="/start?start=1&example=apex"
      className={cn(
        'link-underline inline-flex min-h-[44px] items-center gap-1.5 px-2',
        'text-[15px] font-medium text-ink',
        className
      )}
    >
      {CTA_SECONDARY}
    </a>
  );
}

/** A CTA pair laid out for the end of every marketing page. */
export function CTAPair({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      <PrimaryCTA />
      <SecondaryCTA />
    </div>
  );
}

// ── Layout shells ───────────────────────────────────────────────────

/**
 * Page hero. Quiet eyebrow (single charcoal dot), then the H1, then a
 * single supporting paragraph. No coral top-rule — the marketing surface
 * is near-monochrome per the piplanning.io-inspired redesign.
 */
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
    <section className="border-b border-border bg-canvas">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-24 md:px-6 md:py-40">
        <p className="mkt-eyebrow">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-ink-muted" />
          {eyebrow}
        </p>
        <h1 className="mkt-display mt-8">
          {title}
        </h1>
        {children ? (
          <div className="mt-10 max-w-[600px] text-[17px] leading-[1.6] text-ink-muted md:text-[19px]">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * A prose section. `wide` switches to the 1200px grid container; the
 * default 1000px container is the comfortable reading width.
 */
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
    <section
      id={id}
      className={cn('py-24 md:py-40', className)}
    >
      <div className={cn('mx-auto w-full px-4 md:px-6', wide ? 'max-w-[1200px]' : 'max-w-[1000px]')}>
        {children}
      </div>
    </section>
  );
}

/** Section eyebrow + heading block — keeps H2 rhythm consistent. */
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
        <p className="mkt-eyebrow">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-ink-muted" />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mkt-display-md mt-6">
        {title}
      </h2>
      {children ? (
        <div className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-ink-muted md:text-[18px]">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** The closing CTA band — dark surface, headline, body, CTA pair. */
export function ClosingCTA({
  headline = 'Build what pays back.',
  body = 'Run the numbers before you commit the build.',
}: {
  headline?: string;
  body?: string;
}) {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-24 md:px-6 md:py-40">
        <h2 className="max-w-[760px] font-display text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.03em]">
          {headline}
        </h2>
        <p className="mt-8 max-w-[520px] text-[17px] leading-[1.6] text-white/65 md:text-[18px]">
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

/** Internal link with the underline-wipe hover. */
export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="link-underline text-ink underline-offset-4 hover:text-brand"
    >
      {children}
    </Link>
  );
}

// ── Sibling-links strip ─────────────────────────────────────────────

/**
 * A small "related" strip pointing at sibling marketing routes. Used at
 * the bottom of every page so internal link density stays high without
 * feeling like a sitemap dump.
 */
export function SiblingLinks({
  label = 'Keep reading',
  links,
}: {
  label?: string;
  links: { href: string; label: string }[];
}) {
  return (
    <Section className="border-t border-border bg-canvas py-12 md:py-16">
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </p>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="link-underline inline-flex min-h-[44px] items-center gap-2 text-[15px] font-medium text-ink"
            >
              <DotSeparator className="mx-0" />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ── JSON-LD BreadcrumbList ──────────────────────────────────────────

/**
 * BreadcrumbList structured data. `crumbs` should always start with
 * Home (path "/") and end with the current page.
 */
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

/**
 * Tabular-numeral figure block for showing a real computed number.
 * Server-rendered (no count-up). Pairs label + value + caption.
 */
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
    <div className="mkt-card-quiet p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <p
        className={cn(
          'mt-3 font-mono tnum text-4xl font-semibold tracking-[-0.02em] md:text-5xl',
          accent ? 'text-brand' : 'text-ink'
        )}
      >
        {value}
      </p>
      {caption ? (
        <p className="mt-3 text-[14px] leading-[1.5] text-ink-muted">{caption}</p>
      ) : null}
    </div>
  );
}

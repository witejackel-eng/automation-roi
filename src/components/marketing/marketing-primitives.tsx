import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CTA_PRIMARY, CTA_SECONDARY } from '@/lib/brand';
import { siteUrl } from '@/lib/site-url';

/**
 * Shared marketing primitives for the public marketing routes.
 * All components use the warm ivory (light) surface system.
 * For dark surface sections, use the `dark` variant classes.
 */

// ── CTAs ────────────────────────────────────────────────────────────

/** Primary CTA — dark pill on cream. */
export function PrimaryCTA({ className, href }: { className?: string; href?: string }) {
  return (
    <a href={href || '/start?start=1'} className={cn('inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#111] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#333]', className)}>
      {CTA_PRIMARY}
    </a>
  );
}

/** Secondary CTA — outline pill. */
export function SecondaryCTA({ className, href }: { className?: string; href?: string }) {
  return (
    <a href={href || '/start?start=1&example=apex'} className={cn('inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#111]/10 px-6 py-3 text-sm font-medium text-[#111]/55 transition-all hover:border-[#111]/25 hover:text-[#111] hover:bg-[#111]/[0.04]', className)}>
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
    <section className="border-b border-[#111]/[0.06] pt-28 md:pt-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12 py-20 md:py-28">
        <span className="mb-8 text-[11px] tracking-widest text-[#111]/40 bg-[#111]/[0.04] rounded-full px-3 py-1 inline-flex items-center gap-1.5">
          {eyebrow}
        </span>
        <h1 className="font-light text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] tracking-tight text-[#111]">
          {title}
        </h1>
        {children ? (
          <div className="mt-8 max-w-lg text-[15px] text-[#111]/50 leading-relaxed">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** A prose section — light surface by default. */
export function Section({
  children,
  wide = false,
  className,
  id,
  dark = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
  id?: string;
  /** Use dark surface instead of light. */
  dark?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 md:py-24',
        dark && 'bg-[#111]',
        className
      )}
    >
      <div className={cn('mx-auto w-full px-6 md:px-12', wide ? 'max-w-[1200px]' : 'max-w-[1000px]')}>
        {children}
      </div>
    </section>
  );
}

/** Section eyebrow + heading block. Auto-adapts to parent surface. */
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
        <span className="mb-6 text-[11px] tracking-widest text-[#111]/40 bg-[#111]/[0.04] rounded-full px-3 py-1 inline-flex items-center gap-1.5">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-light text-3xl md:text-4xl tracking-tight leading-[1.1] text-[#111]">
        {title}
      </h2>
      {children ? (
        <div className="mt-6 max-w-lg text-sm text-[#111]/45 leading-relaxed">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** Dark surface heading — for dark sections. */
export function DarkSectionHeading({
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
        <span className="mb-6 text-[11px] tracking-widest text-white/40 bg-white/10 rounded-full px-3 py-1 inline-flex items-center gap-1.5">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-light text-3xl md:text-4xl tracking-tight leading-[1.1] text-white">
        {title}
      </h2>
      {children ? (
        <div className="mt-6 max-w-lg text-sm text-white/50 leading-relaxed">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** The closing CTA band — dark surface. */
export function ClosingCTA({
  headline = 'Build what pays back.',
  body = 'Run one case. If the answer is don\u2019t build, you have saved yourself a project.',
}: {
  headline?: string;
  body?: string;
}) {
  return (
    <section className="bg-[#111]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24 md:px-12 md:py-32">
        <span className="mb-6 text-[11px] tracking-widest text-white/40 bg-white/10 rounded-full px-3 py-1 inline-flex items-center gap-1.5">
          Start the analysis
        </span>
        <h2 className="max-w-[760px] font-light text-3xl md:text-4xl tracking-tight leading-[1.1] text-white">
          {headline}
        </h2>
        <p className="mt-8 max-w-lg text-sm text-white/50 leading-relaxed">
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
    <Link href={href} className="text-[#111] underline underline-offset-2 decoration-[#111]/20 hover:decoration-[#111]/60 hover:text-[#111]/70">
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
    <Section className="border-t border-[#111]/[0.06] py-12 md:py-16">
      <p className="text-[11px] tracking-widest text-[#111]/40 uppercase">
        {label}
      </p>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-[44px] items-center gap-2 text-sm text-[#111]/50 hover:text-[#111]"
            >
              <span className="h-px w-6 bg-[#111]/20" />
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
    <div className="border border-[#111]/[0.06] bg-white rounded-lg p-6">
      <p className="text-[11px] tracking-widest text-[#111]/40 uppercase">
        {label}
      </p>
      <p className="mt-3 font-light text-3xl md:text-4xl tracking-tight text-[#111]">
        {value}
      </p>
      {caption ? (
        <p className="mt-3 text-sm text-[#111]/40 leading-relaxed">{caption}</p>
      ) : null}
    </div>
  );
}

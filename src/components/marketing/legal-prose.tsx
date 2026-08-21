import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Legal-prose primitives shared by /privacy, /terms, and /docs.
 *
 * Designed to render INSIDE MarketingShell's cream background. Uses only
 * light-compatible tokens (text-[#111], text-black/70, border-black/10,
 * bg-white, bg-black/[0.02]). No dark tokens, no shadcn semantic colors.
 *
 * The legal pages were re-ported from /upload/refs/viableo-legal-docs in
 * Task 6. Content fidelity to the source markdown is the contract.
 */

/** Outer wrapper that constrains the prose to a comfortable reading width. */
export function LegalProse({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-[760px] text-[15px] leading-[1.7] text-black/70',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Section heading inside the prose column. */
export function LegalH2({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="mt-12 mb-3 text-[20px] font-medium tracking-tight text-[#111]"
    >
      {children}
    </h2>
  );
}

/** Sub-heading inside the prose column. */
export function LegalH3({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      id={id}
      className="mt-7 mb-2 text-[16px] font-medium text-[#111]"
    >
      {children}
    </h3>
  );
}

/** Paragraph. */
export function LegalP({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('my-4 text-[15px] leading-[1.7] text-black/70', className)}>
      {children}
    </p>
  );
}

/** Unordered list with subtle dot markers. */
export function LegalUl({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ul className={cn('my-4 space-y-2', className)}>
      {children}
    </ul>
  );
}

/** Ordered list — uses native counters so the prose remains accessible. */
export function LegalOl({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ol className={cn('my-4 list-decimal space-y-2 pl-5', className)}>
      {children}
    </ol>
  );
}

/** List item — bullet style for unordered lists. */
export function LegalLi({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        'relative pl-5 text-[15px] leading-[1.65] text-black/70',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-[0.55em] h-[5px] w-[5px] rounded-full bg-black/35"
      />
      {children}
    </li>
  );
}

/** Ordered-list item — relies on native counter, no bullet marker. */
export function LegalLiNumber({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={cn('text-[15px] leading-[1.65] text-black/70 pl-1', className)}>
      {children}
    </li>
  );
}

/** Blockquote — used for the "Important" notice in the legal docs. */
export function LegalBlockquote({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <blockquote className="my-6 border-l-2 border-black/15 pl-4 text-[15px] italic leading-[1.65] text-black/60">
      {children}
    </blockquote>
  );
}

/** Inline emphasis — bolds without changing the font family. */
export function LegalStrong({
  children,
}: {
  children: React.ReactNode;
}) {
  return <strong className="font-semibold text-[#111]">{children}</strong>;
}

/** Code/pre block — used in /docs for the workflow diagram and similar. */
export function LegalPre({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <pre
      className={cn(
        'my-5 overflow-x-auto rounded-lg border border-black/10 bg-black/[0.03] p-4 font-mono text-[13px] leading-[1.6] text-[#111]',
        className,
      )}
    >
      {children}
    </pre>
  );
}

/** Horizontal rule used to separate appendix sections (checklists). */
export function LegalHr() {
  return <hr className="my-10 border-t border-black/10" />;
}

/** Inline anchor styled to match InlineLink in marketing-primitives. */
export function LegalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-[#111] underline underline-offset-2 hover:text-black/60"
    >
      {children}
    </a>
  );
}

/** A muted meta line — effective date / last updated / version stamp. */
export function LegalMeta({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'text-[12px] uppercase tracking-[0.12em] text-black/40',
        className,
      )}
    >
      {children}
    </p>
  );
}

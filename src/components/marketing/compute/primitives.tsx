import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * COMPUTE marketing design system — shared primitives.
 *
 * One coherent set of presentation components that every marketing section
 * consumes. Matches the COMPUTE visual language: monospace metadata labels,
 * oversized serif display headings, thin borders, 12-col grids, numbered
 * sections, restrained accent.
 */

// ── Container ──────────────────────────────────────────────────────

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[1400px] px-6 lg:px-12', className)}>
      {children}
    </div>
  );
}

// ── Section label (monospace eyebrow with rule) ─────────────────────

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-3 font-mono text-sm text-ink-muted',
        className,
      )}
    >
      <span className="h-px w-8 bg-ink/30" aria-hidden="true" />
      {children}
    </span>
  );
}

// ── Display heading (oversized serif) ───────────────────────────────

export function DisplayHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        'font-display text-[clamp(2.5rem,6vw,7rem)] leading-[0.92] tracking-tight text-ink',
        className,
      )}
    >
      {children}
    </h2>
  );
}

// ── Numbered section wrapper ────────────────────────────────────────

export function NumberedSection({
  number,
  title,
  children,
  className,
  id,
}: {
  number: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn('relative py-24 lg:py-32', className)}>
      <Container>
        {/* Section header: number + title */}
        <div className="mb-16 flex flex-col gap-4 lg:mb-20">
          <SectionLabel>
            <span className="text-ink-faint">{number}</span>
            <span className="text-ink-muted">{title}</span>
          </SectionLabel>
        </div>
        {children}
      </Container>
    </section>
  );
}

// ── Metric (oversized figure with mono label) ────────────────────────

export function Metric({
  value,
  label,
  sublabel,
  className,
}: {
  value: string;
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="font-display text-3xl tracking-tight text-ink lg:text-4xl">
        {value}
      </span>
      {label ? (
        <span className="text-sm text-ink">{label}</span>
      ) : null}
      {sublabel ? (
        <span className="font-mono text-xs leading-tight text-ink-muted">
          {sublabel}
        </span>
      ) : null}
    </div>
  );
}

// ── Card (raised charcoal surface) ──────────────────────────────────

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border border-ink/10 bg-ink/[0.02] p-8',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── Rule (horizontal hairline) ──────────────────────────────────────

export function Rule({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-ink/10', className)} />;
}

// ── Primary button (white-on-dark, COMPUTE style) ────────────────────

export function PrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-canvas transition-all hover:bg-ink/90 active:scale-95',
        className,
      )}
    >
      {children}
    </a>
  );
}

// ── Secondary button (outline) ──────────────────────────────────────

export function SecondaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition-all hover:bg-ink/5 active:scale-95',
        className,
      )}
    >
      {children}
    </a>
  );
}

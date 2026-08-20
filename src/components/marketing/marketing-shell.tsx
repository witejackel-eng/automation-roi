import * as React from 'react';
import { SkyddaHeader, SkyddaFooter } from '@/components/marketing/skydda';

/**
 * MarketingShell — shared chrome for public, indexable marketing routes.
 *
 * Per the master directive: "Create one shared header component/system.
 * Every marketing page consumes that same header." This shell now
 * delegates to the Skydda-transplanted header + footer + vertical
 * margin-line overlay, so every marketing page (/methodology, /pricing,
 * /solutions/*, /resources/*, /privacy, /terms) gets the EXACT same
 * header geometry/behavior as the homepage hero nav.
 *
 * The homepage (`/`) renders its own SkyddaHero with a transparent
 * header, so it composes the Skydda sections directly instead of this
 * shell. All other marketing routes consume this shell.
 *
 * Content primitives (PageHero, Section, SectionHeading, etc.) use
 * dark-tuned semantic tokens (bg-canvas, text-ink, border-border) so
 * they render coherently on the dark Skydda surface.
 */
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Vertical margin lines — exact Skydda overlay structure */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="mx-auto h-full max-w-7xl">
          <div className="relative h-full">
            <div className="absolute left-0 top-0 h-full w-px bg-zinc-700/30" />
            <div className="absolute right-0 top-0 h-full w-px bg-zinc-700/30" />
          </div>
        </div>
      </div>

      <div className="flex min-h-screen flex-col bg-zinc-950">
        <SkyddaHeader />
        <div className="flex flex-1 flex-col w-full">{children}</div>
        <SkyddaFooter />
      </div>
    </>
  );
}

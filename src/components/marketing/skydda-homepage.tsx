/**
 * SkyddaHomepage — the transplanted homepage composition.
 *
 * Mirrors the supplied Skydda `app/page.tsx` structure exactly:
 *  - vertical margin lines (fixed overlay, max-w-7xl)
 *  - main: Hero → LogoSection → Problem → Solution → Features → Proof →
 *    Pricing → FAQ → CTA
 *  - Footer
 *
 * Every section is the Skydda-transplanted component with Automation ROI
 * content. Server-rendered (the section components that need motion are
 * 'use client' individually). CTAs wired to real routes.
 *
 * NOTE: This bypasses MarketingShell because the Skydda hero contains its
 * own navigation and the footer is composed directly — matching the
 * template's page structure.
 */
import {
  SkyddaHero,
  SkyddaLogoSection,
  SkyddaProblemSection,
  SkyddaSolutionSection,
  SkyddaFeaturesSection,
  SkyddaProofSection,
  SkyddaPricingSection,
  SkyddaFaqSection,
  SkyddaCtaSection,
  SkyddaFooter,
} from './skydda';

export function SkyddaHomepage() {
  return (
    <>
      {/* Vertical margin lines — exact Skydda overlay structure */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="mx-auto h-full max-w-7xl">
          <div className="relative h-full">
            <div className="absolute left-0 top-0 h-full w-px bg-zinc-200" />
            <div className="absolute right-0 top-0 h-full w-px bg-zinc-200" />
          </div>
        </div>
      </div>

      <main>
        <SkyddaHero />
        <SkyddaLogoSection />
        <SkyddaProblemSection />
        <SkyddaSolutionSection />
        <SkyddaFeaturesSection />
        <SkyddaProofSection />
        <SkyddaPricingSection />
        <SkyddaFaqSection />
        <SkyddaCtaSection />
      </main>

      <SkyddaFooter />
    </>
  );
}

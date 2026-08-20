import * as React from "react";
import { SkyddaHeader } from "./header";
import { SkyddaFooter } from "./footer";

/**
 * SkyddaMarketingShell — the shared chrome for every marketing page.
 *
 * Per the master directive: "Create one shared header component/system.
 * Every marketing page consumes that same header." This shell renders the
 * SkyddaHeader (consistent nav), the page body, the SkyddaFooter, and the
 * fixed vertical margin-line overlay (the Skydda `app/page.tsx` frame).
 *
 * Use on: /methodology, /pricing, /solutions/*, /resources/*, /privacy,
 * /terms — any marketing route that needs the consistent Skydda chrome.
 * The homepage (`/`) renders its own hero with a transparent header, so it
 * composes SkyddaHero directly instead of using this shell.
 */
export function SkyddaMarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
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

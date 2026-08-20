import * as React from 'react';
import { ComputeNavigation } from './navigation';
import { ComputeFooter } from './footer';

/**
 * ComputeMarketingShell — the ONE shared chrome for every marketing page.
 *
 * Renders the fixed ComputeNavigation (transparent over hero, bordered pill
 * on scroll) + the page body + the ComputeFooter. Every marketing page
 * consumes this shell so the header/footer are byte-identical everywhere.
 */
export function ComputeMarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <ComputeNavigation />
      <div className="flex flex-1 flex-col w-full">{children}</div>
      <ComputeFooter />
    </div>
  );
}

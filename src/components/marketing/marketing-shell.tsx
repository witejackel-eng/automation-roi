import * as React from 'react';
import { ComputeNavigation } from '@/components/marketing/compute/navigation';
import { ComputeFooter } from '@/components/marketing/compute/footer';

/**
 * MarketingShell — shared chrome for public marketing routes.
 *
 * Delegates to the ComputeNavigation + ComputeFooter so every marketing
 * page (/methodology, /pricing, /solutions/*, /resources/*, /privacy, /terms)
 * gets the identical COMPUTE header/footer. Same export signature so no
 * page files need to change.
 */
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <ComputeNavigation />
      <div className="flex flex-1 flex-col w-full">{children}</div>
      <ComputeFooter />
    </div>
  );
}

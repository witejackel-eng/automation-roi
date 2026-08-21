'use client';

/**
 * SettingsContent — the "Settings" section.
 *
 * The existing SettingsView renders its own full-page header (mx-auto, max-w,
 * py-12). Embedding it directly inside the dashboard main area would create
 * nested layouts and a second header. Cleanest integration: render an honest
 * pointer to the settings view with a single CTA.
 */
import { Settings2, ArrowRight, ChevronRight, Palette, Users, CreditCard } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useTier } from '@/lib/store';

export function SettingsContent() {
  const go = useApp((s) => s.go);
  const tier = useTier();
  const isPro = tier === 'pro' || tier === 'agency' || tier === 'agency_pro';

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface-raised p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle">
            <Settings2 className="h-4 w-4 text-brand" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[14px] font-medium text-ink">Settings</h2>
            <p className="text-[11px] text-ink-faint">Agency branding, client directory, team, billing</p>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          Open the full Settings view to manage your agency branding (logo + brand color for PDFs), client directory, team seats, and billing. Branding is applied to generated PDFs only — the live app always uses the fixed design system.
        </p>
        <button
          type="button"
          onClick={() => go('settings')}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-cta px-4 py-2 text-[12px] font-medium text-brand-foreground transition-colors hover:bg-brand-cta-hover"
        >
          <Settings2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          Open Settings
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Section pointers */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SettingsPointer
          icon={Palette}
          title="Agency branding"
          body={isPro ? 'Logo, brand color, contact details — applied to PDFs only.' : 'Pro unlocks logo, brand color, and contact details on PDFs.'}
          locked={!isPro}
          onClick={() => go('settings')}
        />
        <SettingsPointer
          icon={Users}
          title="Client directory"
          body="Add clients to attach to cases and reuse default assumptions."
          locked={false}
          onClick={() => go('settings')}
        />
        <SettingsPointer
          icon={CreditCard}
          title="Billing"
          body={isPro ? 'Manage your Pro subscription via Whop.' : 'Upgrade to Pro — $49/month, cancel any time.'}
          locked={false}
          onClick={() => go('pricing')}
        />
      </div>

      <button
        type="button"
        onClick={() => go('settings')}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-raised p-4 text-left transition-colors hover:border-border-strong"
      >
        <div>
          <p className="text-[13px] font-medium text-ink">Open Settings</p>
          <p className="text-[11px] text-ink-faint">All agency configuration</p>
        </div>
        <ChevronRight className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function SettingsPointer({
  icon: Icon,
  title,
  body,
  locked,
  onClick,
}: {
  icon: typeof Palette;
  title: string;
  body: string;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border bg-surface-raised p-4 text-left transition-colors hover:border-border-strong"
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
          <h3 className="text-[12.5px] font-medium text-ink">{title}</h3>
        </div>
        {locked && (
          <span className="rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-ink-faint">
            Pro
          </span>
        )}
      </div>
      <p className="text-[11.5px] leading-relaxed text-ink-muted">{body}</p>
    </button>
  );
}

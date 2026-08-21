'use client';

/**
 * ClientsContent — the "Clients" section.
 *
 * The store doesn't have a clients list separate from the projects list, and
 * the canonical client directory lives in Settings → Client Management. So
 * this section points there with honest copy and a single CTA.
 */
import { Users, ArrowRight, Settings2, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/store';

export function ClientsContent() {
  const go = useApp((s) => s.go);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface-raised p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle">
            <Users className="h-4 w-4 text-brand" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[14px] font-medium text-ink">Client directory</h2>
            <p className="text-[11px] text-ink-faint">Lives in Settings · Client Management</p>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          Your client directory lives in Settings. Add clients there to attach them to cases and reuse their default assumptions — hours, rates, and volumes — so the next analysis starts closer to your real numbers.
        </p>
        <button
          type="button"
          onClick={() => go('settings')}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-cta px-4 py-2 text-[12px] font-medium text-brand-foreground transition-colors hover:bg-brand-cta-hover"
        >
          <Settings2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          Open Client Management
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Helper cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <HelperCard
          title="Add a client"
          body="Save name, default hourly rate, and contact email. Reused on the calculator's summary step."
        />
        <HelperCard
          title="Attach to a case"
          body="Pick a client when you save an analysis. The case shows up under their record."
        />
        <HelperCard
          title="Reuse assumptions"
          body="Pro tier unlocks client history — start a new case from a prior client's inputs."
        />
      </div>

      <button
        type="button"
        onClick={() => go('settings')}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-raised p-4 text-left transition-colors hover:border-border-strong"
      >
        <div>
          <p className="text-[13px] font-medium text-ink">Open Settings</p>
          <p className="text-[11px] text-ink-faint">Branding, clients, team, billing</p>
        </div>
        <ChevronRight className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function HelperCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <h3 className="mb-1 text-[12.5px] font-medium text-ink">{title}</h3>
      <p className="text-[11.5px] leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

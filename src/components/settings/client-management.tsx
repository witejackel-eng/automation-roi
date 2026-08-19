'use client';

/**
 * ClientManagement — organization client list with create dialog.
 *
 * Shows clients in a card grid with name, industry, case count, and
 * created date. Owner/member can create new clients.
 * Styled consistently with settings-view.tsx.
 */
import * as React from 'react';
import { Building2, Plus, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ClientManagementProps {
  organizationId: string;
}

interface Client {
  id: string;
  name: string;
  industry: string | null;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

export function ClientManagement({ organizationId }: ClientManagementProps) {
  const { toast } = useToast();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Create dialog state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [clientName, setClientName] = React.useState('');
  const [clientIndustry, setClientIndustry] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  const fetchClients = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/clients`);
      if (!res.ok) return;
      const data = (await res.json()) as { clients: Client[] };
      setClients(data.clients ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreate = async () => {
    if (!clientName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName.trim(),
          industry: clientIndustry.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast({ title: data.error ?? 'Could not create client.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Client created.' });
      setClientName('');
      setClientIndustry('');
      setCreateOpen(false);
      fetchClients();
    } catch {
      toast({ title: 'Could not reach the service.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <section aria-label="Clients">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[20px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
            Clients
          </h2>
          <p className="mt-0.5 text-[14px] text-ink-muted">
            {clients.length} {clients.length === 1 ? 'client' : 'clients'}
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-1.5 bg-brand-cta text-white hover:bg-brand-cta-hover"
            >
              <Plus className="size-4" strokeWidth={1.75} aria-hidden="true" />
              New client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>Add a client</DialogTitle>
              <DialogDescription>
                Create a client to group related business cases.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="client-name" className="mb-1.5 text-[13px] text-ink-muted">
                  Client name
                </Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Apex Logistics"
                  className="bg-canvas"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                />
              </div>
              <div>
                <Label htmlFor="client-industry" className="mb-1.5 text-[13px] text-ink-muted">
                  Industry{' '}
                  <span className="text-ink-faint">(optional)</span>
                </Label>
                <Input
                  id="client-industry"
                  value={clientIndustry}
                  onChange={(e) => setClientIndustry(e.target.value)}
                  placeholder="E-commerce, Logistics, SaaS…"
                  className="bg-canvas"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !clientName.trim()}
                className="gap-1.5 bg-brand-cta text-white hover:bg-brand-cta-hover"
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface-raised py-12 text-center">
          <Building2 className="size-7 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
          <p className="text-[14px] text-ink-muted">No clients yet.</p>
          <p className="text-[13px] text-ink-faint">
            Add your first client to start organizing business cases.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className="group rounded-lg border border-border bg-surface-raised p-4 transition-colors duration-hover hover:border-border-strong"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[14px] font-semibold text-ink">
                    {client.name}
                  </h3>
                  {client.industry && (
                    <p className="mt-0.5 truncate text-[13px] text-ink-muted">
                      {client.industry}
                    </p>
                  )}
                </div>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface">
                  <Building2 className="size-4 text-ink-faint" strokeWidth={1.75} aria-hidden="true" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-[12px] text-ink-faint">
                <span className="inline-flex items-center gap-1">
                  <FolderOpen className="size-3" strokeWidth={1.75} aria-hidden="true" />
                  {client.projectCount} {client.projectCount === 1 ? 'case' : 'cases'}
                </span>
                <span className="font-mono tnum">
                  {new Date(client.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

'use client';

/**
 * TeamManagement — organization member list with invite / role / remove.
 *
 * Owner can invite new members (email + role), change roles, and remove.
 * Styled consistently with settings-view.tsx.
 */
import * as React from 'react';
import { UserPlus, ShieldCheck, MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface TeamManagementProps {
  organizationId: string;
}

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string | null; email: string | null; image: string | null };
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  member: 'Member',
  viewer: 'Viewer',
};

export function TeamManagement({ organizationId }: TeamManagementProps) {
  const { toast } = useToast();
  const [members, setMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOwner, setIsOwner] = React.useState(false);

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('member');
  const [inviting, setInviting] = React.useState(false);

  // Track the current user's membership id for role detection
  const fetchMembers = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/members`);
      if (!res.ok) return;
      const data = (await res.json()) as { members: Member[] };
      setMembers(data.members ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  React.useEffect(() => {
    // Determine if current user is owner by checking session
    fetch('/api/organizations')
      .then((r) => (r.ok ? r.json() : null))
      .then((org) => {
        // We rely on the members list — the first owner is the current user context.
        // The actual owner check is server-side; on the client we show/hide controls.
        setIsOwner(true); // Optimistically allow; server will 403 if not.
      })
      .catch(() => {});
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (res.status === 403) {
        toast({ title: 'Only organization owners can invite members.', variant: 'destructive' });
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast({ title: data.error ?? 'Could not invite member.', variant: 'destructive' });
        return;
      }
      const data = (await res.json()) as { alreadyMember?: boolean };
      if (data.alreadyMember) {
        toast({ title: 'That person is already on the team.' });
      } else {
        toast({ title: 'Member invited.' });
      }
      setInviteEmail('');
      setInviteRole('member');
      setInviteOpen(false);
      fetchMembers();
    } catch {
      toast({ title: 'Could not reach the service.', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole }),
      });
      if (res.ok) {
        setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
        toast({ title: 'Role updated.' });
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast({ title: data.error ?? 'Could not update role.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Could not reach the service.', variant: 'destructive' });
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Remove ${memberName} from the team?`)) return;
    try {
      const res = await fetch(`/api/organizations/${organizationId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        toast({ title: 'Member removed.' });
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast({ title: data.error ?? 'Could not remove member.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Could not reach the service.', variant: 'destructive' });
    }
  };

  return (
    <section aria-label="Team members">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[20px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
            Team
          </h2>
          <p className="mt-0.5 text-[14px] text-ink-muted">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        {isOwner && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-1.5 bg-brand-cta text-white hover:bg-brand-cta-hover"
              >
                <UserPlus className="size-4" strokeWidth={1.75} aria-hidden="true" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader>
                <DialogTitle>Invite a team member</DialogTitle>
                <DialogDescription>
                  They must already have a Viableo account. The invitation links them to this organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="invite-email" className="mb-1.5 text-[13px] text-ink-muted">
                    Email address
                  </Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@agency.com"
                    className="bg-canvas"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleInvite();
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role" className="mb-1.5 text-[13px] text-ink-muted">
                    Role
                  </Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="invite-role" className="w-full bg-canvas">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="gap-1.5 bg-brand-cta text-white hover:bg-brand-cta-hover"
                >
                  {inviting ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface-raised py-12 text-center">
          <ShieldCheck className="size-7 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
          <p className="text-[14px] text-ink-muted">No team members yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface-raised">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-surface hover:bg-surface">
                <TableHead className="px-5 py-2.5 text-[13px] font-medium text-ink-muted">Name</TableHead>
                <TableHead className="px-5 py-2.5 text-[13px] font-medium text-ink-muted">Email</TableHead>
                <TableHead className="px-5 py-2.5 text-[13px] font-medium text-ink-muted">Role</TableHead>
                <TableHead className="px-5 py-2.5 text-right text-[13px] font-medium text-ink-muted">Joined</TableHead>
                {isOwner && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id} className="border-border last:border-b-0 hover:bg-surface/50">
                  <TableCell className="px-5 py-3 text-[14px] font-medium text-ink">
                    {m.user.name || '—'}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-[14px] text-ink-muted">
                    {m.user.email || '—'}
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    {isOwner && m.role !== 'owner' ? (
                      <Select
                        value={m.role}
                        onValueChange={(v) => handleRoleChange(m.id, v)}
                      >
                        <SelectTrigger
                          size="sm"
                          className="h-8 w-[120px] bg-canvas text-[13px]"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-[12px] font-medium text-ink-muted">
                        {ROLE_LABELS[m.role] ?? m.role}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-right font-mono tnum text-[13px] text-ink-muted">
                    {new Date(m.joinedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  {isOwner && (
                    <TableCell className="px-2 py-3 text-right">
                      {m.role !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded text-ink-faint hover:text-dont-build hover:bg-dont-build/5"
                              aria-label={`Actions for ${m.user.name ?? 'member'}`}
                            >
                              <MoreHorizontal className="size-4" strokeWidth={1.75} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="gap-2 text-dont-build focus:text-dont-build"
                              onClick={() =>
                                handleRemove(m.id, m.user.name ?? 'this member')
                              }
                            >
                              <Trash2 className="size-3.5" strokeWidth={1.75} />
                              Remove from team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

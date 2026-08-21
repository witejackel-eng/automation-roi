'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/format'
import {
  KeyRound, UserCog, Eye, EyeOff, FlaskConical, RefreshCw,
  Settings, Search, ShieldCheck, FileText, type LucideIcon,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Audit action → icon + color mapping
// ---------------------------------------------------------------------------

type ActionMeta = { icon: LucideIcon; color: string; bg: string; label: string }

function getActionMeta(action: string): ActionMeta {
  const a = action.toUpperCase()
  if (a === 'SUPERADMIN_BOOTSTRAP' || a === 'BOOTSTRAP_SUPERADMIN')
    return { icon: ShieldCheck, color: 'var(--vcp-coral)', bg: 'var(--vcp-coral-tint)', label: 'Superadmin bootstrapped' }
  if (a === 'ENTITLEMENT_OVERRIDE')
    return { icon: KeyRound, color: 'var(--vcp-warning)', bg: 'var(--vcp-warning-bg)', label: 'Entitlement overridden' }
  if (a === 'IMPERSONATION_START')
    return { icon: Eye, color: 'var(--vcp-info)', bg: 'var(--vcp-info-bg)', label: 'Impersonation started' }
  if (a === 'IMPERSONATION_END')
    return { icon: EyeOff, color: 'var(--vcp-ink-muted)', bg: 'var(--vcp-surface-sunken)', label: 'Impersonation ended' }
  if (a === 'QA_TIER_SWITCH')
    return { icon: FlaskConical, color: 'var(--vcp-coral)', bg: 'var(--vcp-coral-tint)', label: 'QA tier switched' }
  if (a === 'QA_WEBHOOK_REPLAY')
    return { icon: RefreshCw, color: 'var(--vcp-coral)', bg: 'var(--vcp-coral-tint)', label: 'QA webhook replayed' }
  if (a === 'PLANMAPPING_UPDATE')
    return { icon: Settings, color: 'var(--vcp-info)', bg: 'var(--vcp-info-bg)', label: 'Plan mapping updated' }
  if (a === 'ADMIN_SEARCH')
    return { icon: Search, color: 'var(--vcp-ink-muted)', bg: 'var(--vcp-surface-sunken)', label: 'Admin search' }
  if (a === 'ADMIN_PAGE_VIEWED')
    return { icon: FileText, color: 'var(--vcp-ink-muted)', bg: 'var(--vcp-surface-sunken)', label: 'Page viewed' }
  if (a.includes('SUSPEND') || a.includes('BAN'))
    return { icon: UserCog, color: 'var(--vcp-error)', bg: 'var(--vcp-error-bg)', label: 'Account action' }
  // Default
  return { icon: ShieldCheck, color: 'var(--vcp-ink-muted)', bg: 'var(--vcp-surface-sunken)', label: action }
}

function roleColor(role: string): string {
  if (role === 'SUPERADMIN') return 'var(--vcp-coral)'
  if (role === 'OWNER') return 'var(--vcp-info)'
  return 'var(--vcp-ink-muted)'
}

// ---------------------------------------------------------------------------
// Timeline entry type
// ---------------------------------------------------------------------------

export interface AuditTimelineEntry {
  id: string
  action: string
  actorUserId: string
  actorRole: string
  targetType?: string | null
  targetId?: string | null
  reason?: string | null
  createdAt: string | Date
}

// ---------------------------------------------------------------------------
// Action Timeline — vertical timeline for audit log entries
// ---------------------------------------------------------------------------

export function ActionTimeline({ entries, maxItems = 15 }: { entries: AuditTimelineEntry[]; maxItems?: number }) {
  const items = entries.slice(0, maxItems)
  if (items.length === 0) {
    return (
      <div className="vcp-card p-8 flex flex-col items-center justify-center text-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[var(--vcp-surface-sunken)] flex items-center justify-center text-[var(--vcp-ink-faint)]" aria-hidden>
          <ShieldCheck size={18} strokeWidth={1.5} />
        </div>
        <p className="text-[13px] text-[var(--vcp-ink-muted)]">No administrative actions recorded.</p>
      </div>
    )
  }

  return (
    <div className="vcp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-[var(--vcp-ink-strong)]">Action timeline</h3>
        <span className="text-[11px] text-[var(--vcp-ink-faint)]">Last {items.length} actions</span>
      </div>
      <ol className="vcp-timeline" role="list">
        {items.map((entry, i) => {
          const meta = getActionMeta(entry.action)
          const Icon = meta.icon
          const isLast = i === items.length - 1
          return (
            <li key={entry.id} className="vcp-timeline-item">
              <div className="vcp-timeline-rail" aria-hidden>
                <span className="vcp-timeline-icon" style={{ background: meta.bg, color: meta.color }}>
                  <Icon size={13} strokeWidth={2} />
                </span>
                {!isLast && <span className="vcp-timeline-line" />}
              </div>
              <div className="vcp-timeline-content">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-medium text-[var(--vcp-ink)]">{meta.label}</span>
                  <span
                    className="vcp-pill vcp-pill-sm"
                    style={{
                      background: 'var(--vcp-surface-sunken)',
                      color: roleColor(entry.actorRole),
                      fontSize: 10,
                      padding: '1px 6px',
                      fontWeight: 600,
                    }}
                  >
                    {entry.actorRole}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] font-mono text-[var(--vcp-ink-muted)]">{entry.action}</span>
                  <span className="text-[11px] text-[var(--vcp-ink-faint)]">·</span>
                  <span className="text-[11px] text-[var(--vcp-ink-muted)]">{timeAgo(entry.createdAt)}</span>
                  {entry.targetType ? (
                    <>
                      <span className="text-[11px] text-[var(--vcp-ink-faint)]">·</span>
                      <span className="text-[11px] text-[var(--vcp-ink-faint)]">{entry.targetType}</span>
                    </>
                  ) : null}
                </div>
                {entry.reason ? (
                  <p className="text-[11.5px] text-[var(--vcp-ink-muted)] mt-1.5 italic leading-relaxed">
                    &ldquo;{entry.reason}&rdquo;
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

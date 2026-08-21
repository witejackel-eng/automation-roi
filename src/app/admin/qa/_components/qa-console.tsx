'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { StatusPill, type StatusVariant } from '@/components/admin/ui'
import { shortId, timeAgo } from '@/lib/format'
import { TIER_LABEL, TIER_TO_CANONICAL, type Tier } from '@/lib/brand'

// ---------------------------------------------------------------------------
// Props — passed from the server page.
// ---------------------------------------------------------------------------

export type QaAuditRow = {
  id: string
  action: string
  targetType: string | null
  targetId: string | null
  reason: string | null
  createdAt: string
}

export type QaConsoleProps = {
  qaOrgId: string | null
  qaOrgName: string | null
  currentTier: Tier | null
  qaEnabled: boolean
  recentAudit: QaAuditRow[]
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const CANONICAL_PLAN_VARIANT: Record<string, StatusVariant> = {
  FREE: 'neutral',
  PRO: 'coral',
  CUSTOM: 'info',
}

type ToastTone = 'success' | 'error' | 'info'

type Toast = {
  id: number
  tone: ToastTone
  message: string
}

const TIER_BUTTONS: { label: string; tier: Tier; variant: StatusVariant }[] = [
  { label: 'Test Free', tier: 'free', variant: 'neutral' },
  { label: 'Test Pro', tier: 'pro', variant: 'coral' },
  { label: 'Test Custom', tier: 'agency_pro', variant: 'info' },
]

const QA_ACTIONS: { slug: string; label: string }[] = [
  { slug: 'run_golden_case', label: 'Run Golden Case' },
  { slug: 'generate_report', label: 'Generate Report' },
  { slug: 'generate_proposal', label: 'Generate Proposal' },
  { slug: 'create_share', label: 'Create Share' },
  { slug: 'simulate_approve', label: 'Simulate Approve' },
  { slug: 'simulate_request_changes', label: 'Simulate Request Changes' },
  { slug: 'reset_test_org', label: 'Reset Test Organization' },
]

const WEBHOOK_EVENTS = [
  { value: 'payment.succeeded', label: 'payment.succeeded' },
  { value: 'subscription.activated', label: 'subscription.activated' },
  { value: 'subscription.cancelled', label: 'subscription.cancelled' },
] as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QaConsole({
  qaOrgId,
  qaOrgName,
  currentTier,
  qaEnabled,
  recentAudit,
}: QaConsoleProps) {
  const [tierLoading, setTierLoading] = React.useState<Tier | null>(null)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)
  const [webhookLoading, setWebhookLoading] = React.useState(false)
  const [webhookEvent, setWebhookEvent] = React.useState<typeof WEBHOOK_EVENTS[number]['value']>('payment.succeeded')
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const [displayedTier, setDisplayedTier] = React.useState<Tier | null>(currentTier)
  const [audit, setAudit] = React.useState<QaAuditRow[]>(recentAudit)

  const pushToast = React.useCallback((tone: ToastTone, message: string) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, tone, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const disabled = !qaEnabled || !qaOrgId

  async function switchTier(tier: Tier) {
    if (!qaOrgId) return
    setTierLoading(tier)
    try {
      const res = await fetch('/api/admin/qa/tier', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ organizationId: qaOrgId, tier, reason: 'Founder QA: simulate tier switch' }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) {
        pushToast('error', json?.error ?? 'Tier switch failed.')
        return
      }
      setDisplayedTier(tier)
      pushToast('success', `TEST tier applied: ${TIER_LABEL[tier]}. Audit log updated.`)
      refreshAudit('QA_TIER_SWITCH')
    } catch {
      pushToast('error', 'Network error — tier switch failed.')
    } finally {
      setTierLoading(null)
    }
  }

  async function runAction(slug: string) {
    if (!qaOrgId) return
    setActionLoading(slug)
    try {
      const res = await fetch('/api/admin/qa/action', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ organizationId: qaOrgId, action: slug, reason: 'Founder QA action' }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) {
        pushToast('error', json?.error ?? 'Action failed.')
        return
      }
      pushToast('success', `TEST action recorded: ${json.action ?? slug}`)
      refreshAudit(json.action ?? 'QA_ACTION')
    } catch {
      pushToast('error', 'Network error — action failed.')
    } finally {
      setActionLoading(null)
    }
  }

  async function replayWebhook() {
    if (!qaOrgId) return
    setWebhookLoading(true)
    try {
      const res = await fetch('/api/admin/qa/replay-webhook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ organizationId: qaOrgId, event: webhookEvent }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) {
        pushToast('error', json?.error ?? 'Webhook replay failed.')
        return
      }
      pushToast('success', `TEST webhook recorded: ${webhookEvent}`)
      refreshAudit('QA_WEBHOOK_REPLAY')
    } catch {
      pushToast('error', 'Network error — webhook replay failed.')
    } finally {
      setWebhookLoading(false)
    }
  }

  async function refreshAudit(actionLabel: string) {
    // Optimistic local prepend: the canonical QA audit list is server-rendered
    // (SSR) on the next page navigation. To keep the operator honest without
    // leaking an audit-list API outside this task's scope, we add a local row
    // noting the action was recorded. Reloading the page shows the persisted
    // AuditLog row written by the QA tier / action / webhook-replay routes.
    setAudit((prev) => [
      {
        id: `local_${Date.now()}`,
        action: actionLabel,
        targetType: 'Organization',
        targetId: qaOrgId,
        reason: 'Founder QA: action recorded (reload page to see persisted audit row)',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 8))
  }

  const canonical = displayedTier ? TIER_TO_CANONICAL[displayedTier] : null

  return (
    <div className="flex flex-col gap-5">
      {/* Toasts */}
      {toasts.length > 0 ? (
        <div className="flex flex-col gap-2" aria-live="polite" aria-atomic="true">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                'vcp-card-flat px-4 py-3 flex items-start gap-3',
                t.tone === 'success' && 'border-[var(--vcp-success)]/40',
                t.tone === 'error' && 'border-[var(--vcp-error)]/40',
                t.tone === 'info' && 'border-[var(--vcp-info)]/40',
              )}
              role="status"
            >
              <span
                className={cn(
                  'vcp-dot mt-1.5',
                  t.tone === 'success' && 'vcp-dot-success',
                  t.tone === 'error' && 'vcp-dot-error',
                  t.tone === 'info' && 'vcp-dot-info',
                )}
                aria-hidden
              />
              <span className="text-[13px] text-[var(--vcp-ink)] flex-1">{t.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-[var(--vcp-ink-faint)] hover:text-[var(--vcp-ink)] vcp-focus rounded text-[12px]"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Test organization card */}
        <section className="vcp-card p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">
              Test organization
            </h3>
            <span className="vcp-pill vcp-pill-coral">
              <span className="vcp-dot vcp-dot-error" style={{ background: 'var(--vcp-coral)', boxShadow: 'none' }} aria-hidden />
              FOUNDER TESTING
            </span>
          </div>

          {!qaOrgId ? (
            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-[var(--vcp-ink)]">
                Not configured — set <code className="vcp-mono text-[12px] text-[var(--vcp-ink-strong)]">QA_ORG_ID</code> + <code className="vcp-mono text-[12px] text-[var(--vcp-ink-strong)]">ENABLE_QA_ENDPOINTS=true</code>.
              </p>
              <p className="text-[12px] text-[var(--vcp-ink-muted)]">
                In the preview harness the QA gate is open in non-production, so plan-simulation
                and action endpoints still respond. Configure <code className="vcp-mono text-[12px]">QA_ORG_ID</code> to bind
                them to a dedicated test organization.
              </p>
            </div>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-5">
              <Field label="Organization ID" value={<span className="vcp-mono text-[12px]">{shortId(qaOrgId, 24)}</span>} />
              <Field label="Name" value={qaOrgName ?? '—'} />
              <Field
                label="Current tier"
                value={displayedTier ? (
                  <div className="flex items-center gap-2">
                    <StatusPill variant={CANONICAL_PLAN_VARIANT[canonical ?? 'FREE'] ?? 'neutral'}>
                      {canonical ?? 'FREE'}
                    </StatusPill>
                    <span className="text-[12px] text-[var(--vcp-ink-muted)]">{TIER_LABEL[displayedTier]}</span>
                  </div>
                ) : '—'}
              />
              <Field
                label="QA endpoints"
                value={
                  <StatusPill variant={qaEnabled ? 'success' : 'error'}>
                    {qaEnabled ? 'Enabled' : 'Disabled'}
                  </StatusPill>
                }
              />
            </dl>
          )}

          {/* Plan simulation */}
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-2">
            Plan simulation
          </div>
          <div className="flex flex-wrap gap-2">
            {TIER_BUTTONS.map((btn) => (
              <button
                key={btn.tier}
                type="button"
                disabled={disabled || tierLoading !== null}
                onClick={() => switchTier(btn.tier)}
                className={cn(
                  'vcp-card-flat px-3 py-2 flex items-center gap-2 vcp-focus cursor-pointer transition-colors',
                  'hover:border-[var(--vcp-coral)] hover:bg-[var(--vcp-coral-tint)]',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--vcp-border)] disabled:hover:bg-transparent',
                )}
              >
                <span className="text-[12.5px] font-medium text-[var(--vcp-ink-strong)]">{btn.label}</span>
                <span className="vcp-pill vcp-pill-outline text-[10px]">TEST</span>
                {tierLoading === btn.tier ? (
                  <span className="vcp-mono text-[11px] text-[var(--vcp-ink-muted)]">Working…</span>
                ) : null}
              </button>
            ))}
          </div>
        </section>

        {/* Webhook replay card */}
        <section className="vcp-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">
            Webhook replay
          </h3>
          <p className="text-[12.5px] text-[var(--vcp-ink-muted)] mb-4">
            Synthetically inject a Whop webhook event into the system for the test
            organization. The synthetic event is recorded as a SystemEvent with{' '}
            <code className="vcp-mono text-[11px]">replayed: true</code> and audit-logged.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <label className="flex-1 flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--vcp-ink-faint)]">
                Webhook event
              </span>
              <select
                value={webhookEvent}
                onChange={(e) => setWebhookEvent(e.target.value as typeof WEBHOOK_EVENTS[number]['value'])}
                disabled={disabled || webhookLoading}
                className="h-9 px-3 text-[13px] bg-[var(--vcp-surface)] border border-[var(--vcp-border)] rounded-[var(--vcp-radius-sm)] text-[var(--vcp-ink)] vcp-focus disabled:opacity-50"
              >
                {WEBHOOK_EVENTS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={disabled || webhookLoading}
              onClick={replayWebhook}
              className={cn(
                'vcp-card-flat px-3 h-9 flex items-center gap-2 vcp-focus cursor-pointer transition-colors',
                'hover:border-[var(--vcp-coral)] hover:bg-[var(--vcp-coral-tint)]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--vcp-border)] disabled:hover:bg-transparent',
              )}
            >
              <span className="text-[12.5px] font-medium text-[var(--vcp-ink-strong)]">Replay webhook</span>
              <span className="vcp-pill vcp-pill-outline text-[10px]">TEST</span>
              {webhookLoading ? (
                <span className="vcp-mono text-[11px] text-[var(--vcp-ink-muted)]">Working…</span>
              ) : null}
            </button>
          </div>
        </section>
      </div>

      {/* QA action buttons */}
      <section className="vcp-card p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">
          Workflow actions
        </h3>
        <p className="text-[12.5px] text-[var(--vcp-ink-muted)] mb-4">
          Exercise the customer workflow surface safely. Each action records a{' '}
          <code className="vcp-mono text-[11px]">QA_*</code> audit log entry without
          invoking the production engines.
        </p>
        <div className="flex flex-wrap gap-2">
          {QA_ACTIONS.map((a) => (
            <button
              key={a.slug}
              type="button"
              disabled={disabled || actionLoading !== null}
              onClick={() => runAction(a.slug)}
              className={cn(
                'vcp-card-flat px-3 py-2 flex items-center gap-2 vcp-focus cursor-pointer transition-colors',
                'hover:border-[var(--vcp-coral)] hover:bg-[var(--vcp-coral-tint)]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--vcp-border)] disabled:hover:bg-transparent',
              )}
            >
              <span className="text-[12.5px] font-medium text-[var(--vcp-ink-strong)]">{a.label}</span>
              <span className="vcp-pill vcp-pill-outline text-[10px]">TEST</span>
              {actionLoading === a.slug ? (
                <span className="vcp-mono text-[11px] text-[var(--vcp-ink-muted)]">Working…</span>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      {/* Activity log */}
      <section className="vcp-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--vcp-border)]">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">
            Recent QA activity
          </h3>
        </div>
        {audit.length === 0 ? (
          <div className="px-5 py-10 flex flex-col items-center justify-center text-center gap-1">
            <p className="text-[13px] text-[var(--vcp-ink-muted)]">
              No QA actions recorded yet.
            </p>
            <p className="text-[12px] text-[var(--vcp-ink-faint)]">
              Run a plan simulation, action, or webhook replay to populate this log.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto vcp-scroll">
            <table className="vcp-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Reason</th>
                  <th>Target</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((row) => (
                  <tr key={row.id}>
                    <td className="vcp-mono text-[12.5px] font-medium text-[var(--vcp-ink)]">{row.action}</td>
                    <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{row.reason ?? '—'}</td>
                    <td className="vcp-mono text-[12px] text-[var(--vcp-ink-faint)]">
                      {row.targetId ? shortId(row.targetId, 16) : '—'}
                    </td>
                    <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{timeAgo(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Rules footer */}
      <ul className="vcp-card-flat p-4 flex flex-col gap-1.5 list-disc pl-8">
        <li className="text-[12px] text-[var(--vcp-ink-muted)]">Test data is isolated from real customer data.</li>
        <li className="text-[12px] text-[var(--vcp-ink-muted)]">No production payment bypass.</li>
        <li className="text-[12px] text-[var(--vcp-ink-muted)]">Every privileged simulation is labelled TEST.</li>
        <li className="text-[12px] text-[var(--vcp-ink-muted)]">All actions are audit-logged.</li>
      </ul>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-[var(--vcp-ink-faint)]">{label}</dt>
      <dd className="text-[13px] text-[var(--vcp-ink)] truncate">{value}</dd>
    </div>
  )
}

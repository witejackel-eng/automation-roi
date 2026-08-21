import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import { checkEnvConfig, checkDbConnectivity } from '@/lib/admin/operational-queries'
import {
  SectionHeader, PageContainer, StatusPill, StatusDot, type StatusVariant,
} from '@/components/admin/ui'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

// Static catalogue of integrations surfaced on the Settings page. Status is
// derived from the env-presence map returned by checkEnvConfig so secrets are
// never rendered — only booleans. Mirrors the integration catalogue documented
// in the repo's docs/ folder.
const INTEGRATIONS: Array<{
  name: string
  purpose: string
  envKey: string
}> = [
  { name: 'Whop', purpose: 'Billing — subscriptions, payments, webhooks', envKey: 'WHOP_API_KEY' },
  { name: 'NextAuth', purpose: 'Authentication — OAuth (GitHub, Google) + JWT sessions', envKey: 'NEXTAUTH_SECRET' },
  { name: 'Vercel Blob', purpose: 'Object storage — generated report PDFs and exports', envKey: 'BLOB_READ_WRITE_TOKEN' },
  { name: 'ZAI', purpose: 'AI runtime — report generation and case synthesis', envKey: 'ZAI_API_KEY' },
]

// Feature-flag detection. Conservative match: keys whose name carries a
// flag-like signal (FEATURE/FLAG/ENABLE). Never invents keys — only surfaces
// what the runtime actually exposes via process.env.
function detectFeatureFlags(): string[] {
  const keys = Object.keys(process.env)
  return keys.filter((k) => {
    const upper = k.toUpperCase()
    return (
      upper.includes('FEATURE') ||
      upper.includes('FLAG') ||
      upper.startsWith('ENABLE_')
    )
  }).sort()
}

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'settings' } })

  // searchParams awaited for force-dynamic parity with sibling admin pages.
  await searchParams

  const envConfig = checkEnvConfig()
  const envMap = new Map(envConfig.map((e) => [e.key, e.present]))
  const db = await checkDbConnectivity()
  const featureFlags = detectFeatureFlags()

  return (
    <PageContainer>
      <SectionHeader
        title="Settings"
        subtitle="System configuration and operational thresholds"
      />

      {/* Privacy banner: status only, never values */}
      <div className="vcp-card-flat p-4">
        <p className="text-[12.5px] text-[var(--vcp-ink-muted)]">
          This page shows configuration <strong className="text-[var(--vcp-ink-strong)]">status</strong> only.
          Secret values are never rendered. Only presence is exposed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Environment configuration */}
        <div className="vcp-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">
            Environment configuration
          </h3>
          <ul className="flex flex-col divide-y divide-[var(--vcp-border)]">
            {envConfig.map((e) => (
              <li
                key={e.key}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="vcp-mono text-[12.5px] text-[var(--vcp-ink)]">{e.key}</span>
                <StatusPill variant={e.present ? 'success' : 'error'}>
                  {e.present ? 'Configured' : 'Missing'}
                </StatusPill>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Database */}
        <div className="vcp-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">
            Database
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-[var(--vcp-ink)]">Connectivity</span>
              {db.ok ? (
                <StatusDot variant="success" label="Connected" />
              ) : (
                <StatusDot variant="error" label="Disconnected" />
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-[var(--vcp-ink)]">Latency</span>
              {db.latencyMs != null ? (
                <span className="vcp-mono vcp-tnum text-[12.5px] text-[var(--vcp-ink-muted)]">
                  {db.latencyMs} ms
                </span>
              ) : (
                <span className="text-[12.5px] text-[var(--vcp-ink-faint)]">
                  Not yet measured
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--vcp-ink-faint)] mt-1">
              Live probe via <code className="vcp-mono">SELECT 1</code> at page render.
            </p>
          </div>
        </div>

        {/* 3. Integrations */}
        <div className="vcp-card p-5 lg:col-span-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">
            Integrations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTEGRATIONS.map((it) => {
              const configured = envMap.get(it.envKey) ?? false
              const variant: StatusVariant = configured ? 'success' : 'error'
              return (
                <div
                  key={it.name}
                  className="rounded-[var(--vcp-radius-sm)] border border-[var(--vcp-border)] p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-[var(--vcp-ink-strong)]">
                      {it.name}
                    </span>
                    <StatusPill variant={variant}>
                      {configured ? 'Configured' : 'Missing'}
                    </StatusPill>
                  </div>
                  <p className="text-[12px] text-[var(--vcp-ink-muted)]">{it.purpose}</p>
                  <p className="vcp-mono text-[11px] text-[var(--vcp-ink-faint)] mt-1">
                    {it.envKey}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Feature flags */}
        <div className="vcp-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">
            Feature flags
          </h3>
          {featureFlags.length === 0 ? (
            <p className="text-[13px] text-[var(--vcp-ink-muted)]">
              No feature flags configured.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--vcp-border)]">
              {featureFlags.map((k) => (
                <li
                  key={k}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="vcp-mono text-[12.5px] text-[var(--vcp-ink)]">{k}</span>
                  <StatusPill variant="info">Active</StatusPill>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-[var(--vcp-ink-faint)] mt-3">
            Flags are detected from <code className="vcp-mono">process.env</code> at render time.
            Values are never shown.
          </p>
        </div>

        {/* 5. Admin access */}
        <div className="vcp-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">
            Admin access
          </h3>
          <p className="text-[13px] text-[var(--vcp-ink-muted)] leading-relaxed">
            Superadmin authorization is server-derived from{' '}
            <code className="vcp-mono text-[12.5px] text-[var(--vcp-ink)]">User.systemRole</code>.
            Bootstrap via{' '}
            <code className="vcp-mono text-[12.5px] text-[var(--vcp-ink)]">
              scripts/bootstrap-superadmin.ts
            </code>
            .
          </p>
          <p className="text-[12px] text-[var(--vcp-ink-faint)] mt-3">
            See the repository <code className="vcp-mono">SECURITY.md</code> for the access model
            and revocation procedure.
          </p>
        </div>

        {/* 6. Documentation links */}
        <div className="vcp-card p-5 lg:col-span-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">
            Documentation links
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/system"
              className="vcp-pill vcp-pill-outline vcp-focus hover:bg-[var(--vcp-surface-sunken)]"
            >
              System health
            </Link>
            <Link
              href="/admin/audit"
              className="vcp-pill vcp-pill-outline vcp-focus hover:bg-[var(--vcp-surface-sunken)]"
            >
              Audit log
            </Link>
            <Link
              href="/admin/events"
              className="vcp-pill vcp-pill-outline vcp-focus hover:bg-[var(--vcp-surface-sunken)]"
            >
              System events
            </Link>
          </div>
          <p className="text-[12px] text-[var(--vcp-ink-faint)] mt-3">
            See the repository <code className="vcp-mono">docs/</code> folder for operational runbooks.
          </p>
        </div>
      </div>
    </PageContainer>
  )
}

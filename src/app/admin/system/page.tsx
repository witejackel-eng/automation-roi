import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import {
  checkDbConnectivity,
  checkEnvConfig,
  getRecentCriticalEvents,
  getOverviewMetrics,
  getDbLatencyHistory,
} from '@/lib/admin/operational-queries'
import {
  SectionHeader, PageContainer, StatusPill, type StatusVariant,
} from '@/components/admin/ui'
import { Sparkline } from '@/components/admin/sparkline'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/format'
import {
  Globe, Server, Database, ShieldCheck, CreditCard,
  FileText, Sparkles, HardDrive,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

type ServiceStatus = 'operational' | 'degraded' | 'down' | 'configured' | 'not-configured'

function statusVariant(status: ServiceStatus): StatusVariant {
  switch (status) {
    case 'operational':
    case 'configured':
      return 'success'
    case 'degraded':
      return 'warning'
    case 'down':
    case 'not-configured':
      return 'error'
    default:
      return 'neutral'
  }
}

function statusLabel(status: ServiceStatus): string {
  switch (status) {
    case 'operational':
      return 'Operational'
    case 'degraded':
      return 'Degraded'
    case 'down':
      return 'Down'
    case 'configured':
      return 'Configured'
    case 'not-configured':
      return 'Not configured'
    default:
      return 'Unknown'
  }
}

const DOT_VARIANT: Record<StatusVariant, string> = {
  success: 'vcp-dot-success',
  warning: 'vcp-dot-warning',
  error: 'vcp-dot-error',
  info: 'vcp-dot-info',
  neutral: 'vcp-dot-neutral',
  coral: 'vcp-dot-error',
}

type ServiceCard = {
  name: string
  icon: LucideIcon
  status: ServiceStatus
  detail: string
}

const SEVERITY_VARIANT: Record<string, StatusVariant> = {
  info: 'info',
  warn: 'warning',
  error: 'error',
}

export default async function SystemHealthPage() {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'system' } })

  // Real server-side checks only. No synthetic uptime / latency numbers.
  const [dbCheck, envConfig, metrics, recentCritical, dbLatencyHistory] = await Promise.all([
    checkDbConnectivity(),
    checkEnvConfig(),
    getOverviewMetrics(),
    getRecentCriticalEvents(8),
    getDbLatencyHistory(8),
  ])

  const envMap = new Map(envConfig.map((e) => [e.key, e.present]))
  const authConfigured = Boolean(envMap.get('GITHUB_ID') || envMap.get('GOOGLE_CLIENT_ID'))
  const billingConfigured = Boolean(envMap.get('WHOP_API_KEY'))
  const aiConfigured = Boolean(envMap.get('ZAI_API_KEY'))
  const storageConfigured = Boolean(envMap.get('BLOB_READ_WRITE_TOKEN'))

  const reportsGenerated24h = metrics.reportsGenerated24h
  const reportFailures24h = metrics.operationalSignals.reportFailures24h
  const systemErrors24h = metrics.operationalSignals.systemErrors24h

  const overallOk = dbCheck.ok && systemErrors24h === 0
  const overallVariant: StatusVariant = overallOk ? 'success' : 'warning'

  const services: ServiceCard[] = [
    {
      name: 'Web App',
      icon: Globe,
      status: 'operational',
      detail: 'Page loaded successfully',
    },
    {
      name: 'API',
      icon: Server,
      status: 'operational',
      detail: 'Responding',
    },
    {
      name: 'Database',
      icon: Database,
      status: dbCheck.ok ? 'operational' : 'down',
      detail: dbCheck.ok
        ? dbCheck.latencyMs != null
          ? `Connected · ${dbCheck.latencyMs}ms`
          : 'Connected'
        : 'Disconnected',
    },
    {
      name: 'Authentication',
      icon: ShieldCheck,
      status: authConfigured ? 'configured' : 'not-configured',
      detail: authConfigured ? 'Configured' : 'Not configured',
    },
    {
      name: 'Billing & Whop',
      icon: CreditCard,
      status: billingConfigured ? 'configured' : 'not-configured',
      detail: billingConfigured ? 'Configured' : 'Not configured',
    },
    {
      name: 'Reports',
      icon: FileText,
      status: reportFailures24h > 0 ? 'degraded' : 'operational',
      detail: `${reportsGenerated24h} generated, ${reportFailures24h} failures (24h)`,
    },
    {
      name: 'AI Runtime',
      icon: Sparkles,
      status: aiConfigured ? 'configured' : 'not-configured',
      detail: aiConfigured ? 'Configured' : 'Not configured',
    },
    {
      name: 'Storage',
      icon: HardDrive,
      status: storageConfigured ? 'configured' : 'not-configured',
      detail: storageConfigured ? 'Configured' : 'Local fallback',
    },
  ]

  return (
    <PageContainer>
      <SectionHeader
        title="System Health"
        subtitle="Service reliability and integration status"
      />

      {/* Overall status banner */}
      <div
        className="vcp-card p-5 flex items-start gap-4"
        style={overallOk ? undefined : { borderColor: 'var(--vcp-warning)' }}
      >
        <span className={cn('vcp-dot mt-1.5', DOT_VARIANT[overallVariant])} style={{ width: 10, height: 10 }} aria-hidden />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[16px] font-semibold text-[var(--vcp-ink-strong)]">
              {overallOk ? 'Operational' : 'Degraded'}
            </h2>
            <StatusPill variant={overallVariant}>
              {overallOk ? 'All systems nominal' : 'Action required'}
            </StatusPill>
          </div>
          <p className="text-[13px] text-[var(--vcp-ink-muted)] mt-1">
            {overallOk
              ? 'Database is reachable and no critical errors recorded in the last 24 hours.'
              : 'A service is degraded or critical errors have been recorded in the last 24 hours. Review the cards below.'}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--vcp-ink-faint)]">
              Database latency
            </span>
            <span className="vcp-mono text-[12.5px] text-[var(--vcp-ink)]">
              {dbCheck.ok
                ? dbCheck.latencyMs != null
                  ? `${dbCheck.latencyMs}ms`
                  : 'Not yet measured'
                : 'Unreachable'}
            </span>
            <span className="text-[var(--vcp-ink-faint)]">·</span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--vcp-ink-faint)]">
              Critical events (24h)
            </span>
            <span className="vcp-mono vcp-tnum text-[12.5px] text-[var(--vcp-ink)]">
              {systemErrors24h}
            </span>
          </div>
        </div>
      </div>

      {/* Service grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {services.map((s) => {
          const Icon = s.icon
          const variant = statusVariant(s.status)
          const isDbCard = s.name === 'Database'
          return (
            <div key={s.name} className="vcp-card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-[6px] bg-[var(--vcp-surface-sunken)] flex items-center justify-center text-[var(--vcp-ink-muted)]">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <span className="text-[13.5px] font-semibold text-[var(--vcp-ink-strong)]">{s.name}</span>
                </div>
                <span className={cn('vcp-dot', DOT_VARIANT[variant])} aria-hidden />
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[12.5px] text-[var(--vcp-ink-muted)]">{s.detail}</span>
                <StatusPill variant={variant}>{statusLabel(s.status)}</StatusPill>
              </div>
              {isDbCard && dbCheck.ok ? (
                <div className="mt-3 pt-3 border-t border-[var(--vcp-border)] flex items-center gap-3">
                  <Sparkline data={dbLatencyHistory} color="var(--vcp-success)" height={24} />
                  <span className="text-[11px] text-[var(--vcp-ink-faint)]">
                    Latency · 8 probes · avg {Math.round(dbLatencyHistory.reduce((a, b) => a + b, 0) / dbLatencyHistory.length)}ms
                  </span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Recent operational events */}
      <div className="vcp-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--vcp-border)]">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)]">
            Recent operational events
          </h3>
        </div>
        {recentCritical.length === 0 ? (
          <div className="px-5 py-10 flex flex-col items-center justify-center text-center gap-2">
            <span className="vcp-dot vcp-dot-success" aria-hidden />
            <p className="text-[13px] text-[var(--vcp-ink-muted)]">
              No critical or warning events recorded.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto vcp-scroll">
            <table className="vcp-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Severity</th>
                  <th>Organization</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {recentCritical.map((e) => (
                  <tr key={e.id}>
                    <td className="vcp-mono text-[12.5px] font-medium text-[var(--vcp-ink)]">{e.eventType}</td>
                    <td>
                      <StatusPill variant={SEVERITY_VARIANT[e.severity] ?? 'neutral'}>
                        {e.severity === 'warn' ? 'Warning' : e.severity.charAt(0).toUpperCase() + e.severity.slice(1)}
                      </StatusPill>
                    </td>
                    <td className="vcp-mono text-[12px] text-[var(--vcp-ink-muted)]">
                      {e.organizationId ?? '—'}
                    </td>
                    <td className="text-[12.5px] text-[var(--vcp-ink-muted)]">{timeAgo(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[12px] text-[var(--vcp-ink-muted)] px-1">
        Metrics shown reflect real server-side checks. Historical uptime and p95 latency
        require external telemetry (not yet configured).
      </p>
    </PageContainer>
  )
}

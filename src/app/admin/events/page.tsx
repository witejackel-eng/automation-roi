import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth'
import { logSystemEvent } from '@/lib/observability/system-event'
import {
  listSystemEventsForAdmin,
  getEventTypeSummary,
} from '@/lib/admin/operational-queries'
import {
  KpiCard, SectionHeader, PageContainer,
  EmptyState, Pagination, StatusPill, type StatusVariant,
} from '@/components/admin/ui'
import { EventFilters } from './_components/event-filters'
import { timeAgo, shortId } from '@/lib/format'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

function severityVariant(severity: string | null): StatusVariant {
  if (severity === 'error') return 'error'
  if (severity === 'warn') return 'warning'
  return 'neutral'
}

function severityLabel(severity: string | null): string {
  if (severity === 'error') return 'Error'
  if (severity === 'warn') return 'Warning'
  return 'Info'
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireSuperAdmin()
  await logSystemEvent({ eventType: 'ADMIN_PAGE_VIEWED', userId: admin.userId, metadata: { page: 'events' } })

  const sp = await searchParams
  const search = typeof sp.search === 'string' ? sp.search : ''
  const eventTypeRaw = typeof sp.eventType === 'string' ? sp.eventType : 'all'
  const severityRaw = typeof sp.severity === 'string' ? sp.severity : 'all'
  const page = Math.max(1, Number(sp.page ?? 1) || 1)

  // Resolve event type options from the global summary so the FilterSelect
  // reflects the actual event vocabulary the system is emitting.
  const eventTypeSummary = await getEventTypeSummary()
  const eventTypeOptions = eventTypeSummary.map((s) => s.eventType)

  // Paginated, filtered list for the table — plus the four KPI counters via
  // parallel total-only fetches (no filter = total; severity-scoped = error/
  // warning/info).
  const [list, totals, errors, warnings, infos] = await Promise.all([
    listSystemEventsForAdmin({
      page,
      pageSize: PAGE_SIZE,
      search,
      eventType: eventTypeRaw,
      severity: severityRaw,
    }),
    listSystemEventsForAdmin({ pageSize: 1 }),
    listSystemEventsForAdmin({ severity: 'error', pageSize: 1 }),
    listSystemEventsForAdmin({ severity: 'warn', pageSize: 1 }),
    listSystemEventsForAdmin({ severity: 'info', pageSize: 1 }),
  ])

  // Right-rail: top 10 event types by count, with a coral bar proportional to
  // the max count in that slice (so the loudest event always renders full-width).
  const summaryTop = eventTypeSummary.slice(0, 10)
  const summaryMax = summaryTop.reduce((m, s) => Math.max(m, s._count), 0)

  return (
    <PageContainer>
      <SectionHeader
        title="System Events"
        subtitle="What the Viableo system is doing"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total events" value={totals.total} sub="All captured events" />
        <KpiCard
          label="Errors"
          value={errors.total}
          variant={errors.total > 0 ? 'error' : 'neutral'}
          sub="By severity"
        />
        <KpiCard
          label="Warnings"
          value={warnings.total}
          variant={warnings.total > 0 ? 'warning' : 'neutral'}
          sub="By severity"
        />
        <KpiCard
          label="Info"
          value={infos.total}
          variant="neutral"
          sub="Ambient activity"
        />
      </div>

      <EventFilters
        eventType={eventTypeRaw}
        severity={severityRaw}
        eventTypeOptions={eventTypeOptions}
      />

      {/* Two-column layout: events table (left, 2/3) + summary card (right, 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {list.rows.length === 0 ? (
            <EmptyState
              title="No system events in this period."
              message="Operational events are emitted by the Viableo system as users sign in, calculate, generate reports, and as billing webhooks arrive."
            />
          ) : (
            <div className="vcp-card overflow-hidden">
              <div className="overflow-x-auto vcp-scroll">
                <table className="vcp-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Severity</th>
                      <th>Organization</th>
                      <th>User</th>
                      <th>When</th>
                      <th>Request ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.rows.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <span className="vcp-mono text-[13px] font-semibold text-[var(--vcp-ink-strong)]">
                            {e.eventType}
                          </span>
                        </td>
                        <td>
                          <StatusPill variant={severityVariant(e.severity)}>
                            {severityLabel(e.severity)}
                          </StatusPill>
                        </td>
                        <td>
                          {e.organizationId ? (
                            <Link
                              href={`/admin/organizations/${e.organizationId}`}
                              className="text-[13px] text-[var(--vcp-ink)] hover:text-[var(--vcp-coral)] vcp-focus rounded"
                            >
                              {shortId(e.organizationId, 14)}
                            </Link>
                          ) : (
                            <span className="text-[13px] text-[var(--vcp-ink-faint)]">—</span>
                          )}
                        </td>
                        <td>
                          {e.userId ? (
                            <span className="vcp-mono text-[12px] text-[var(--vcp-ink-muted)]">
                              {shortId(e.userId)}
                            </span>
                          ) : (
                            <span className="text-[13px] text-[var(--vcp-ink-faint)]">—</span>
                          )}
                        </td>
                        <td>
                          <span className="text-[12.5px] text-[var(--vcp-ink-muted)]">
                            {timeAgo(e.createdAt)}
                          </span>
                        </td>
                        <td>
                          {e.requestId ? (
                            <span className="vcp-mono text-[12px] text-[var(--vcp-ink-faint)]">
                              {shortId(e.requestId)}
                            </span>
                          ) : (
                            <span className="text-[13px] text-[var(--vcp-ink-faint)]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Pagination
            page={list.page}
            totalPages={list.totalPages}
            searchParams={{
              search,
              eventType: eventTypeRaw === 'all' ? undefined : eventTypeRaw,
              severity: severityRaw === 'all' ? undefined : severityRaw,
            }}
          />
        </div>

        {/* Event type summary card */}
        <div className="lg:col-span-1">
          <div className="vcp-card p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vcp-ink-muted)] mb-3">
              Event type summary
            </h3>
            {summaryTop.length === 0 ? (
              <p className="text-[13px] text-[var(--vcp-ink-muted)]">
                No events recorded yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {summaryTop.map((s) => {
                  const pct = summaryMax > 0 ? Math.max(2, (s._count / summaryMax) * 100) : 0
                  return (
                    <div key={s.eventType} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="vcp-mono text-[12px] text-[var(--vcp-ink)]">
                          {s.eventType}
                        </span>
                        <span className="vcp-mono vcp-tnum text-[12px] text-[var(--vcp-ink-muted)]">
                          {s._count}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--vcp-surface-sunken)] overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-[var(--vcp-coral)]"
                          style={{ width: `${pct}%` }}
                          aria-hidden
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <p className="text-[11px] text-[var(--vcp-ink-faint)] mt-4">
              Top 10 by volume. Counts are all-time.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

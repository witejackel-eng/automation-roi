'use client'

import * as React from 'react'

/**
 * Events Heatmap — a 7-day × 24-hour density grid showing when system
 * events cluster. Darker cells = more events at that day+hour.
 *
 * Helps the founder spot patterns: "errors always spike at 3am" or
 * "activity is dead on weekends".
 */

function heatColor(count: number, max: number): string {
  if (count === 0 || max === 0) return 'var(--vcp-surface-sunken)'
  const intensity = count / max
  // Coral gradient from light to dark
  if (intensity > 0.75) return 'var(--vcp-coral)'
  if (intensity > 0.5) return 'rgba(255, 22, 75, 0.7)'
  if (intensity > 0.25) return 'rgba(255, 22, 75, 0.45)'
  if (intensity > 0.1) return 'rgba(255, 22, 75, 0.25)'
  return 'rgba(255, 22, 75, 0.12)'
}

export function EventsHeatmap({
  grid,
  dayLabels,
  maxCount,
  total,
}: {
  grid: number[][]
  dayLabels: string[]
  maxCount: number
  total: number
}) {
  // Show every 3rd hour label (0, 3, 6, 9, 12, 15, 18, 21) to avoid crowding
  const hourLabels = Array.from({ length: 24 }, (_, h) => (h % 3 === 0 ? `${h}h` : ''))

  return (
    <div className="vcp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--vcp-ink-strong)]">Event density</h3>
          <p className="text-[11px] text-[var(--vcp-ink-muted)] mt-0.5">
            Last 7 days · {total} events · darker = more activity
          </p>
        </div>
        <div className="vcp-heatmap-legend">
          <span>Less</span>
          <span className="vcp-heatmap-legend-swatch" style={{ background: 'var(--vcp-surface-sunken)' }} />
          <span className="vcp-heatmap-legend-swatch" style={{ background: 'rgba(255, 22, 75, 0.25)' }} />
          <span className="vcp-heatmap-legend-swatch" style={{ background: 'rgba(255, 22, 75, 0.45)' }} />
          <span className="vcp-heatmap-legend-swatch" style={{ background: 'rgba(255, 22, 75, 0.7)' }} />
          <span className="vcp-heatmap-legend-swatch" style={{ background: 'var(--vcp-coral)' }} />
          <span>More</span>
        </div>
      </div>
      <div className="overflow-x-auto vcp-scroll">
        <div className="vcp-heatmap min-w-[600px]">
          {/* Header row: empty corner + hour labels */}
          <div />
          {hourLabels.map((label, h) => (
            <div key={h} className="vcp-heatmap-hour-label">{label}</div>
          ))}
          {/* Data rows: day label + 24 cells */}
          {dayLabels.map((day, d) => (
            <React.Fragment key={d}>
              <div className="vcp-heatmap-day-label">{day}</div>
              {grid[d].map((count, h) => (
                <div
                  key={h}
                  className="vcp-heatmap-cell"
                  data-count={count}
                  style={{ background: heatColor(count, maxCount) }}
                  title={`${day} ${h}:00 — ${count} event${count === 1 ? '' : 's'}`}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import * as React from 'react'

/**
 * MiniDonut — a tiny inline donut chart for right-rail cards.
 *
 * Renders an SVG donut with colored segments + a center label showing
 * the total. Designed to sit in a 120×120px area in the right rail.
 */
export function MiniDonut({
  segments,
  size = 120,
  thickness = 14,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[]
  size?: number
  thickness?: number
  centerLabel?: string
  centerValue?: string | number
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full border-[6px] border-[var(--vcp-surface-sunken)]"
        style={{ width: size, height: size }}
        aria-label="No data"
      >
        <span className="text-[10px] text-[var(--vcp-ink-faint)]">No data</span>
      </div>
    )
  }

  let offset = 0
  const arcs = segments.map((seg) => {
    const fraction = seg.value / total
    const dash = fraction * circumference
    const arc = {
      color: seg.color,
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: -offset,
      label: seg.label,
      value: seg.value,
    }
    offset += dash
    return arc
  })

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--vcp-surface-sunken)"
          strokeWidth={thickness}
        />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={thickness}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      {centerValue !== undefined ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[18px] font-semibold text-[var(--vcp-ink-strong)] vcp-tnum leading-none">
            {centerValue}
          </span>
          {centerLabel ? (
            <span className="text-[9px] uppercase tracking-wide text-[var(--vcp-ink-faint)] mt-1">
              {centerLabel}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

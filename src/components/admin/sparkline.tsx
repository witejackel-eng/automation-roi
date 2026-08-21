'use client'

import * as React from 'react'

/**
 * Sparkline — a tiny inline trend chart for KPI cards.
 *
 * Renders an SVG polyline + subtle gradient fill. No axes, no labels —
 * just the shape of the trend. Designed to sit inside a KpiCard.
 *
 * Props:
 *   data: number[] — the trend values (e.g. last 7 days of customer growth)
 *   color: stroke color (defaults to brand coral)
 *   height: svg height in px (default 32)
 */
export function Sparkline({
  data,
  color = 'var(--vcp-coral)',
  height = 32,
  strokeWidth = 1.5,
}: {
  data: number[]
  color?: string
  height?: number
  strokeWidth?: number
}) {
  const id = React.useId()
  if (!data || data.length < 2) {
    // Not enough data points to draw a line — render a flat placeholder
    return (
      <div
        className="vcp-sparkline-empty"
        style={{ height }}
        aria-label="Insufficient data for trend"
      />
    )
  }

  const width = 100 // viewBox width — scales via CSS
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const step = width / (data.length - 1)

  const points = data.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * (height - 4) - 2
    return [x, y] as const
  })

  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const areaPath = `${path} L${width},${height} L0,${height} Z`
  const lastPoint = points[points.length - 1]

  return (
    <svg
      className="vcp-sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${id})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r={1.8}
        fill={color}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

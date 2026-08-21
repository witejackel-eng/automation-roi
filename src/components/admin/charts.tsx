'use client'

import * as React from 'react'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts'

const AXIS = { fontSize: 11, fill: '#A39C92' }
const GRID = '#E8E2D8'
const CORAL = '#FF164B'
const INK = '#1A1714'
const MUTED = '#6B645B'

export function TrendArea({ data, dataKey = 'value', height = 180, color = CORAL }: { data: { label: string; value: number }[]; dataKey?: string; height?: number; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} minTickGap={20} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={36} />
        <Tooltip
          contentStyle={{ background: '#FFFFFF', border: '1px solid #E8E2D8', borderRadius: 6, fontSize: 12, boxShadow: '0 8px 28px rgba(26,23,20,0.12)' }}
          labelStyle={{ color: MUTED, fontWeight: 600 }}
        />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function TrendLine({ data, dataKey = 'value', height = 180, color = CORAL }: { data: { label: string; value: number }[]; dataKey?: string; height?: number; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} minTickGap={20} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={36} />
        <Tooltip
          contentStyle={{ background: '#FFFFFF', border: '1px solid #E8E2D8', borderRadius: 6, fontSize: 12, boxShadow: '0 8px 28px rgba(26,23,20,0.12)' }}
          labelStyle={{ color: MUTED, fontWeight: 600 }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function MiniBars({ data, dataKey = 'value', height = 180, color = CORAL }: { data: { label: string; value: number }[]; dataKey?: string; height?: number; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} minTickGap={10} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={36} />
        <Tooltip
          cursor={{ fill: '#F3EFE8' }}
          contentStyle={{ background: '#FFFFFF', border: '1px solid #E8E2D8', borderRadius: 6, fontSize: 12, boxShadow: '0 8px 28px rgba(26,23,20,0.12)' }}
          labelStyle={{ color: MUTED, fontWeight: 600 }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DonutMix({ data, height = 180 }: { data: { name: string; value: number; color: string }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2} stroke="none">
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#FFFFFF', border: '1px solid #E8E2D8', borderRadius: 6, fontSize: 12, boxShadow: '0 8px 28px rgba(26,23,20,0.12)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export const CHART_COLORS = {
  coral: CORAL,
  ink: INK,
  muted: MUTED,
  success: '#15803D',
  warning: '#B45309',
  info: '#1D4ED8',
  grid: GRID,
}

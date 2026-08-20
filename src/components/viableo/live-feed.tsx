"use client"

import { useEffect, useState, useRef, useSyncExternalStore } from "react"

const AGENT_NAMES = [
  "calc-7f2a", "proposal-3b1c", "report-9d4e", "discovery-2c8f",
  "portal-5a3d", "quote-1e9b", "share-4f2c", "save-8d1a",
  "export-6b3e", "audit-0c7f",
]

const TASKS = [
  "Calculating ROI for Apex Manufacturing",
  "Generating proposal for TechFlow Inc",
  "Mapping processes at Global Logistics",
  "Running sensitivity analysis",
  "Exporting PDF report for client review",
  "Creating share link for stakeholder",
  "Saving draft — Meridian Health case",
  "Analyzing automation opportunities",
  "Building executive summary",
  "Processing client parameters",
]

const REGIONS = ["Apex Mfg", "TechFlow", "Meridian", "GlobalLog", "NovaTech"]
const STATUSES = [
  { label: "running",  color: "#4ade80" },
  { label: "running",  color: "#4ade80" },
  { label: "running",  color: "#4ade80" },
  { label: "queued",   color: "#facc15" },
  { label: "complete", color: "#60a5fa" },
]

type CalcRow = {
  id: string
  name: string
  task: string
  region: string
  status: typeof STATUSES[number]
  progress: number
  elapsed: string
  key: number
}

function randomRow(key: number): CalcRow {
  return {
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    name: AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)],
    task: TASKS[Math.floor(Math.random() * TASKS.length)],
    region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    progress: Math.floor(Math.random() * 85 + 10),
    elapsed: `${Math.floor(Math.random() * 14 + 1)}m ${Math.floor(Math.random() * 59)}s`,
    key,
  }
}

// Animated progress bar that slowly ticks forward
function ProgressBar({ initial }: { initial: number }) {
  const [pct, setPct] = useState(initial)
  const rafRef = useRef<number>(0)
  const pctRef = useRef(initial)

  useEffect(() => {
    const tick = () => {
      pctRef.current = Math.min(99, pctRef.current + 0.015)
      setPct(Math.round(pctRef.current))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div style={{ width: "100%", height: 2, background: "rgba(0,0,0,0.08)", borderRadius: 9 }}>
      <div style={{
        height: "100%", borderRadius: 9,
        width: `${pct}%`,
        background: "rgba(0,0,0,0.35)",
        transition: "width 0.5s linear",
      }} />
    </div>
  )
}

// Stable seed rows — same on server and client, no random values
const SEED_ROWS: CalcRow[] = [
  { id: "A1B2C3", name: "calc-7f2a",      task: "Calculating ROI for Apex Manufacturing",   region: "Apex Mfg",  status: STATUSES[0], progress: 42, elapsed: "3m 12s", key: 0 },
  { id: "D4E5F6", name: "proposal-3b1c",   task: "Generating proposal for TechFlow Inc",     region: "TechFlow",  status: STATUSES[0], progress: 67, elapsed: "7m 48s", key: 1 },
  { id: "G7H8I9", name: "discovery-2c8f",  task: "Mapping processes at Global Logistics",    region: "GlobalLog", status: STATUSES[3], progress: 18, elapsed: "1m 05s", key: 2 },
  { id: "J0K1L2", name: "portal-5a3d",     task: "Creating share link for stakeholder",      region: "Meridian",  status: STATUSES[0], progress: 55, elapsed: "5m 30s", key: 3 },
  { id: "M3N4O5", name: "export-6b3e",     task: "Exporting PDF report for client review",   region: "NovaTech",  status: STATUSES[0], progress: 80, elapsed: "11m 22s", key: 4 },
  { id: "P6Q7R8", name: "report-9d4e",     task: "Running sensitivity analysis",             region: "Apex Mfg",  status: STATUSES[4], progress: 99, elapsed: "14m 01s", key: 5 },
]

// Shared "is client" signal — avoids setState in effects
let clientListeners: Array<() => void> = []
let isClient = false
function subscribeToClient(cb: () => void) { clientListeners.push(cb); return () => { clientListeners = clientListeners.filter(l => l !== cb) } }
function getClientSnapshot() { return isClient }
function getServerSnapshot() { return false }

function useIsClient() {
  return useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot)
}

export function LiveCalcFeed() {
  const [rows, setRows] = useState<CalcRow[]>(SEED_ROWS)
  const mounted = useIsClient()
  const keyRef = useRef(100)
  const initializedRef = useRef(false)

  useEffect(() => {
    isClient = true
    clientListeners.forEach(l => l())

    // Hydrate with random data only after client mount
    if (!initializedRef.current) {
      initializedRef.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR hydration: seed rows → random rows
      setRows(Array.from({ length: 6 }, (_, i) => randomRow(i)))
    }

    const t = setInterval(() => {
      keyRef.current++
      setRows(prev => [...prev.slice(1), randomRow(keyRef.current)])
    }, 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: 16,
      overflow: "hidden",
      background: "rgba(255,255,255,0.7)",
    }}>
      {/* Table header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr 90px 70px",
        padding: "8px 16px",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        background: "rgba(0,0,0,0.03)",
      }}>
        {["CASE", "TASK", "CLIENT", "STATUS"].map(h => (
          <span key={h} style={{ fontSize: 8, letterSpacing: "0.16em", color: "rgba(0,0,0,0.30)", fontFamily: "monospace" }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ overflow: "hidden" }}>
        {rows.map((row, i) => (
          <div
            key={row.key}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr 90px 70px",
              padding: "10px 16px",
              borderBottom: "1px solid rgba(0,0,0,0.04)",
              gap: 8,
              alignItems: "center",
              animation: mounted && i === rows.length - 1 ? "rowSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both" : "none",
            }}
          >
            {/* Case */}
            <div>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(0,0,0,0.65)", marginBottom: 1 }}>{row.name}</div>
              <div style={{ fontSize: 7.5, fontFamily: "monospace", color: "rgba(0,0,0,0.25)" }}>#{row.id}</div>
            </div>

            {/* Task + progress */}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 9, color: "rgba(0,0,0,0.50)", lineHeight: 1.35, marginBottom: 5,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{row.task}</div>
              <ProgressBar initial={row.progress} />
            </div>

            {/* Client */}
            <div style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(0,0,0,0.30)" }}>{row.region}</div>

            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: row.status.color,
                boxShadow: row.status.label === "running" ? `0 0 6px ${row.status.color}` : "none",
                animation: row.status.label === "running" ? "statusPulse 2s ease-in-out infinite" : "none",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(0,0,0,0.35)" }}>{row.status.label}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes rowSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

export function LiveCalcCounter() {
  const [count, setCount] = useState(3847)
  const mounted = useIsClient()

  useEffect(() => {
    isClient = true
    clientListeners.forEach(l => l())

    const t = setInterval(() => {
      setCount(v => v + Math.floor(Math.random() * 3 - 1))
    }, 1200)
    return () => clearInterval(t)
  }, [])

  return (
    <span style={{
      fontFamily: "monospace",
      fontSize: "clamp(3rem, 6vw, 5rem)",
      fontWeight: 300,
      color: "rgba(0,0,0,0.85)",
      lineHeight: 1,
      letterSpacing: "-0.02em",
      transition: "color 0.3s ease",
    }}>
      {mounted ? count.toLocaleString("en-US") : "3,847"}
    </span>
  )
}

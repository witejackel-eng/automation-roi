"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

const FEATURES = [
  {
    label: "MODEL THE ECONOMICS",
    title: "Three scenarios from the same inputs",
    desc: "Conservative, Expected, and Upside. Every figure traced to a labeled input — measured, estimated, or assumed.",
    stats: [{ v: "3", l: "scenarios" }, { v: "100%", l: "traced" }],
  },
  {
    label: "SEE THE DOWNSIDE",
    title: "64-permutation stress test",
    desc: "Every material assumption varied together. Find the fee, the coverage, and the cost where the case breaks.",
    stats: [{ v: "64", l: "permutations" }, { v: "4", l: "break points" }],
  },
  {
    label: "KNOW HOW MUCH TO TRUST IT",
    title: "Confidence scoring",
    desc: "Measured inputs count in full. Estimated inputs count at 0.6. Assumptions count at 0.3. Guess more, confidence falls.",
    stats: [{ v: "0–100", l: "score range" }, { v: "3", l: "evidence tiers" }],
  },
  {
    label: "BREAK IT ON PURPOSE",
    title: "BUILD / CONSIDER / DON\u2019T BUILD",
    desc: "Published rules. Applied the same way every time. A model that cannot say no is not giving you a decision.",
    stats: [{ v: "3", l: "verdicts" }, { v: "60+", l: "min confidence" }],
  },
]

const STICKY_TOP   = 80
const STICKY_STEP  = 16
const SCALE_STEP   = 0.04
const OFFSET_STEP  = 8

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

export function StackingFeatureCards() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [depth, setDepth] = useState<number[]>(FEATURES.map(() => 0))

  useEffect(() => {
    function onScroll() {
      const nextDepth = FEATURES.map((_, i) => {
        let count = 0
        for (let j = i + 1; j < FEATURES.length; j++) {
          const el = cardRefs.current[j]
          if (!el) continue
          const rect = el.getBoundingClientRect()
          const stickyTopJ = STICKY_TOP + j * STICKY_STEP
          if (rect.top <= stickyTopJ + 2) count++
        }
        return count
      })
      setDepth(nextDepth)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="flex flex-col" style={{ perspective: "1400px", perspectiveOrigin: "50% 0%" }}>
      {FEATURES.map((feat, i) => {
        const d = depth[i]
        const scale = 1 - d * SCALE_STEP
        const translateY = d * OFFSET_STEP
        return (
          <div key={feat.label} ref={el => { cardRefs.current[i] = el }} className="sticky mb-4" style={{ top: `${STICKY_TOP + i * STICKY_STEP}px`, zIndex: 10 + i }}>
            <div style={{ transform: `scale(${scale}) translateY(${translateY}px)`, transformOrigin: "top center", transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)", willChange: "transform" }}>
              <div className="group relative bg-[#faf9f7] rounded-2xl border border-black/[0.07] overflow-hidden cursor-pointer">
                <div className="relative z-10 p-8">
                  <div className="mb-6"><Tag>{feat.label}</Tag></div>
                  <h3 className="text-xl font-light mb-3" style={{ color: "rgba(0,0,0,0.85)" }}>{feat.title}</h3>
                  <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(0,0,0,0.45)" }}>{feat.desc}</p>
                  <div className="flex gap-8 pt-6 border-t border-black/[0.06]">
                    {feat.stats.map(s => (
                      <div key={s.l}>
                        <div className="text-2xl font-light" style={{ color: "rgba(0,0,0,0.85)" }}>{s.v}</div>
                        <div className="text-[11px] mt-0.5" style={{ color: "rgba(0,0,0,0.35)", letterSpacing: "0.1em" }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

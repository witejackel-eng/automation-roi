"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

const TIERS = [
  {
    label: "STARTER",
    title: "Try the real thing",
    desc: "10 cases per month. Full analytical rigor — three scenarios, confidence scoring, stress test, verdict. Watermarked client PDFs.",
    stats: [{ v: "10", l: "cases/mo" }, { v: "$0", l: "forever" }],
  },
  {
    label: "PRO",
    title: "Full agency workflow",
    desc: "Unlimited cases. Clean, unwatermarked PDFs. Your branding. Share links with approval tracking. Client directory and case library.",
    stats: [{ v: "∞", l: "cases" }, { v: "$49", l: "/month" }],
  },
]

const STICKY_TOP = 80
const STICKY_STEP = 16
const SCALE_STEP = 0.04
const OFFSET_STEP = 8

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

export function StackingPricingCards() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [depth, setDepth] = useState<number[]>(TIERS.map(() => 0))

  useEffect(() => {
    function onScroll() {
      const nextDepth = TIERS.map((_, i) => {
        let count = 0
        for (let j = i + 1; j < TIERS.length; j++) {
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
      {TIERS.map((tier, i) => {
        const d = depth[i]
        const scale = 1 - d * SCALE_STEP
        const translateY = d * OFFSET_STEP
        return (
          <div key={tier.label} ref={el => { cardRefs.current[i] = el }} className="sticky mb-4" style={{ top: `${STICKY_TOP + i * STICKY_STEP}px`, zIndex: 10 + i }}>
            <div style={{ transform: `scale(${scale}) translateY(${translateY}px)`, transformOrigin: "top center", transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)", willChange: "transform" }}>
              <div className="group relative bg-[#faf9f7] rounded-2xl border border-black/[0.07] overflow-hidden cursor-pointer">
                <div className="relative z-10 p-8">
                  <div className="flex items-start justify-between mb-6">
                    <Tag>{tier.label}</Tag>
                  </div>
                  <h3 className="text-xl font-light mb-3" style={{ color: "rgba(0,0,0,0.85)" }}>{tier.title}</h3>
                  <p className="text-sm text-black/45 leading-relaxed mb-8">{tier.desc}</p>
                  <div className="flex gap-8 pt-6 border-t border-black/[0.06]">
                    {tier.stats.map(s => (
                      <div key={s.l}>
                        <div className="text-2xl font-light" style={{ color: "rgba(0,0,0,0.85)" }}>{s.v}</div>
                        <div className="text-[11px] text-black/35 tracking-widest mt-0.5">{s.l}</div>
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

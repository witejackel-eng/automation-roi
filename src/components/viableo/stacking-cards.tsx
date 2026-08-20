"use client"

import { useEffect, useRef, useState } from "react"

const AGENTS = [
  {
    label: "PROCESS DISCOVERY",
    title: "Map every manual workflow in a client's operations",
    desc: "AI-powered process mining that identifies automation opportunities across CRM, email, spreadsheets, and internal tools. Quantify time savings automatically.",
    stats: [{ v: "47", l: "processes mapped" }, { v: "12.4hrs", l: "avg saved/wk" }],
    img: "",
  },
  {
    label: "ROI CALCULATION",
    title: "Build data-driven business cases in minutes",
    desc: "Input client parameters once. Get detailed ROI projections with NPV, payback period, and confidence intervals \u2014 ready for executive presentations.",
    stats: [{ v: "$131K", l: "avg case value" }, { v: "94%", l: "win rate" }],
    img: "",
  },
  {
    label: "PROPOSAL GENERATION",
    title: "Generate polished client proposals automatically",
    desc: "Transform calculation results into professional PDF proposals with executive summaries, implementation timelines, and pricing breakdowns.",
    stats: [{ v: "8 min", l: "avg generation" }, { v: "340+", l: "proposals sent" }],
    img: "",
  },
  {
    label: "CLIENT PORTAL",
    title: "Share interactive results via secure links",
    desc: "Clients view their personalized ROI dashboard, explore scenarios, and approve next steps \u2014 all from a branded share link. No login required.",
    stats: [{ v: "78%", l: "approval rate" }, { v: "2.1 days", l: "avg close time" }],
    img: "",
  },
]

const STICKY_TOP   = 80   // matches top: 80px on first card
const STICKY_STEP  = 16   // each card stacks 16px lower
const SCALE_STEP   = 0.04 // scale reduction per card stacked on top
const OFFSET_STEP  = 8    // px pushed down per card stacked on top

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

export function StackingCards() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  // depth[i] = 0..N how many cards are currently stacked on top of card i
  const [depth, setDepth] = useState<number[]>(AGENTS.map(() => 0))

  useEffect(() => {
    function onScroll() {
      const nextDepth = AGENTS.map((_, i) => {
        // Count how many cards j > i are currently in sticky position (i.e. have scrolled past card i)
        let count = 0
        for (let j = i + 1; j < AGENTS.length; j++) {
          const el = cardRefs.current[j]
          if (!el) continue
          const rect = el.getBoundingClientRect()
          const stickyTopJ = STICKY_TOP + j * STICKY_STEP
          // Card j is "on top of" card i when it has reached its sticky position
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
      {AGENTS.map((agent, i) => {
        const d         = depth[i]
        const scale     = 1 - d * SCALE_STEP
        const translateY = d * OFFSET_STEP

        return (
          <div
            key={agent.label}
            ref={el => { cardRefs.current[i] = el }}
            className="sticky mb-4"
            style={{ top: `${STICKY_TOP + i * STICKY_STEP}px`, zIndex: 10 + i }}
          >
            <div
              style={{
                transform:      `scale(${scale}) translateY(${translateY}px)`,
                transformOrigin: "top center",
                transition:     "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
                willChange:     "transform",
              }}
            >
              <div className="group relative bg-[#faf9f7] rounded-2xl border border-black/[0.07] overflow-hidden cursor-pointer">

                {/* Text content */}
                <div className="relative z-10 p-8">
                  <div className="md:max-w-[100%]">
                    <div className="flex items-start justify-between mb-6">
                      <Tag>{agent.label}</Tag>
                    </div>
                    <h3 className="text-xl font-light mb-3">{agent.title}</h3>
                    <p className="text-sm text-black/45 leading-relaxed mb-8">{agent.desc}</p>
                  </div>
                  <div className="flex gap-8 pt-6 border-t border-black/[0.06]">
                    {agent.stats.map(s => (
                      <div key={s.l}>
                        <div className="text-2xl font-light">{s.v}</div>
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

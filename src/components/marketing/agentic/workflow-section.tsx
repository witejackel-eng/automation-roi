"use client"

import { useState, useEffect } from "react"

const STEPS = [
  {
    num: "01",
    title: "Describe the automation",
    desc: "Labor hours, rates, revenue, costs",
    code: [
      { type: "comment", text: "# What process are you automating?" },
      { type: "plain", text: "Client onboarding → 40 hrs/month manual" },
      { type: "gap" },
      { type: "comment", text: "# What does it cost today?" },
      { type: "plain", text: "Team: 2 FTE × $45/hr × 40 hrs = $3,600/mo" },
      { type: "gap" },
      { type: "comment", text: "# What revenue does it support?" },
      { type: "plain", text: "500 onboards/mo × $200 ARPU = $100K/mo" },
    ],
  },
  {
    num: "02",
    title: "Viableo models three scenarios",
    desc: "Conservative, Expected, Upside",
    code: [
      { type: "comment", text: "// Three scenarios from the same inputs" },
      { type: "plain", text: "Conservative: ROI 89%  |  Payback 8.2 mo" },
      { type: "plain", text: "Expected:    ROI 142% |  Payback 5.1 mo" },
      { type: "plain", text: "Upside:      ROI 218% |  Payback 3.3 mo" },
      { type: "gap" },
      { type: "comment", text: "// Same scope, different assumption tightness" },
      { type: "plain", text: "Coverage: 85% → 90% → 95%" },
    ],
  },
  {
    num: "03",
    title: "Stress-test the case",
    desc: "64 permutations, break-even thresholds",
    code: [
      { type: "comment", text: "// 64 permutations: every assumption varied" },
      { type: "plain", text: "52/64 permutations: BUILD" },
      { type: "plain", text: " 8/64 permutations: CONSIDER" },
      { type: "plain", text: " 4/64 permutations: DON’T BUILD" },
      { type: "gap" },
      { type: "comment", text: "// Case breaks at fee > $18,200" },
      { type: "success", text: "Verdict holds until $18,200" },
    ],
  },
  {
    num: "04",
    title: "Hand the client a document",
    desc: "Share link or PDF they can check line by line",
    code: [
      { type: "comment", text: "# Generate client-ready business case" },
      { type: "success", text: "✓ PDF generated with branded header" },
      { type: "success", text: "✓ Share link: /r/a1b2c3" },
      { type: "gap" },
      { type: "url", text: "  → Client views analysis in browser" },
      { type: "url", text: "  → Every number traced to an input" },
      { type: "gap" },
      { type: "success", text: "✓ BUILD — Confidence: 78" },
    ],
  },
]

function CodeLine({ line }: { line: (typeof STEPS)[0]["code"][0] }) {
  if (line.type === "gap") return <div className="h-3" />
  if (line.type === "comment") return <div style={{ color: "rgba(0,0,0,0.3)" }}>{line.text}</div>
  if (line.type === "output") return <div style={{ color: "rgba(0,0,0,0.35)" }}>{line.text}</div>
  if (line.type === "success") return <div style={{ color: "#16a34a" }}>{line.text}</div>
  if (line.type === "url") return <div style={{ color: "#2563eb", textDecoration: "underline" }}>{line.text}</div>
  return <div style={{ color: "rgba(0,0,0,0.7)" }}>{line.text}</div>
}

export function WorkflowSection() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)

  function selectStep(i: number) {
    if (i === active) return
    setVisible(false)
    setTimeout(() => { setActive(i); setVisible(true) }, 180)
  }

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setActive(prev => (prev + 1) % STEPS.length); setVisible(true) }, 180)
    }, 3200)
    return () => clearInterval(t)
  }, [])

  const step = STEPS[active]

  return (
    <section id="workflow" className="py-32 px-6 md:px-12 lg:px-20" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.4)" }}>
            How It Works
          </div>
          <h2 className="mt-5 text-4xl md:text-5xl font-light tracking-tight" style={{ lineHeight: 1.05, color: "rgba(0,0,0,0.85)" }}>
            From scope to verdict<br />in four steps.
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
          <div className="flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <button key={s.num} onClick={() => selectStep(i)} className="flex-1 text-left rounded-2xl border p-6 group transition-all duration-200" style={{ background: active === i ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.7)", borderColor: active === i ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.06)", boxShadow: active === i ? "0 1px 3px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.03)" }}>
                <div className="flex gap-4 items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-light shrink-0 transition-colors duration-200" style={{ background: active === i ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)", color: active === i ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.35)" }}>{s.num}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-light transition-colors duration-200" style={{ color: active === i ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)" }}>{s.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(0,0,0,0.28)" }}>{s.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="lg:col-span-2 rounded-2xl border p-8 flex flex-col" style={{ background: "rgba(255,255,255,0.7)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", borderColor: "rgba(0,0,0,0.06)", minHeight: "360px" }}>
            <div className="flex items-center justify-between mb-5 shrink-0">
              <div className="text-[10px] tracking-widest uppercase transition-all duration-200" style={{ opacity: visible ? 1 : 0, filter: visible ? "blur(0px)" : "blur(4px)", transition: "opacity 200ms ease, filter 200ms ease", color: "rgba(0,0,0,0.3)" }}>Step {step.num}</div>
              <div className="flex gap-1.5">{[0, 1, 2, 3].map(d => (<div key={d} className="w-2 h-2 rounded-full transition-all duration-300" style={{ background: d === active % 4 ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.08)" }} />))}</div>
            </div>
            <div className="flex-1 rounded-xl p-6 overflow-hidden" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="font-mono text-[12px] leading-6" style={{ opacity: visible ? 1 : 0, filter: visible ? "blur(0px)" : "blur(6px)", transform: visible ? "translateY(0)" : "translateY(6px)", transition: "opacity 220ms cubic-bezier(0.16,1,0.3,1), filter 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)" }}>
                {step.code.map((line, i) => (<CodeLine key={i} line={line} />))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

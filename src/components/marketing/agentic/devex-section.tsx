"use client"

import { useState, useEffect } from "react"

const STEPS = [
  {
    num: "01",
    title: "Scope the build",
    desc: "Define the automation in a discovery call",
    file: "discovery",
    lang: "plain",
    code: [
      { type: "comment", text: "# After the discovery call, you have:" },
      { type: "output", text: "✓ Monthly hours saved: 40" },
      { type: "output", text: "✓ Hourly cost: $35" },
      { type: "output", text: "✓ Implementation fee: $12,000" },
      { type: "output", text: "✓ Leads per month: 200" },
      { type: "output", text: "✓ Conversion improvement: 15%" },
      { type: "gap" },
      { type: "comment", text: "# Input quality matters. Measured > estimated > assumed." },
    ],
  },
  {
    num: "02",
    title: "Run the analysis",
    desc: "Viableo computes in seconds, not hours",
    file: "analysis-engine",
    lang: "typescript",
    code: [
      { type: "comment", text: "// One scope in. Four answers out." },
      { type: "keyword", text: "const", after: " analysis ", keyword2: "= ", fn: "runAnalysis", args: "(inputs)" },
      { type: "gap" },
      { type: "comment", text: "// Returns verdict, scenarios, confidence, break-even" },
      { type: "plain", text: "analysis.verdict     // → BUILD" },
      { type: "plain", text: "analysis.roi         // → 186%" },
      { type: "plain", text: "analysis.payback     // → 4.2 months" },
      { type: "plain", text: "analysis.confidence  // → 78" },
      { type: "plain", text: "analysis.breakEvenFee // → $18,400" },
    ],
  },
  {
    num: "03",
    title: "Stress-test it",
    desc: "64 permutations. Know where it breaks.",
    file: "stress-test",
    lang: "typescript",
    code: [
      { type: "comment", text: "// Vary every material assumption ±20%" },
      { type: "keyword", text: "const", after: " stress ", keyword2: "= ", fn: "runStressTest", args: "(inputs)" },
      { type: "gap" },
      { type: "plain", text: "stress.permutations // → 64" },
      { type: "plain", text: "stress.stillViable  // → true" },
      { type: "plain", text: "stress.breakingFee  // → $18,400" },
      { type: "gap" },
      { type: "comment", text: "// The answer holds until the fee passes this point" },
    ],
  },
  {
    num: "04",
    title: "Walk in with the answer",
    desc: "Client-ready document, every number traced",
    file: "output",
    lang: "plain",
    code: [
      { type: "comment", text: "# Generate the Viableo Business Case" },
      { type: "command", text: "viableo generate-report --input analysis.json" },
      { type: "gap" },
      { type: "output", text: "  Computing scenarios..." },
      { type: "output", text: "  Running stress test (64 permutations)..." },
      { type: "output", text: "  Generating document..." },
      { type: "gap" },
      { type: "success", text: "✓ Viableo Business Case ready" },
      { type: "url", text: "  → Share link copied to clipboard" },
    ],
  },
]

function CodeLine({ line }: { line: (typeof STEPS)[0]["code"][0] }) {
  if (line.type === "gap") return <div className="h-3" />
  if (line.type === "comment") return <div className="text-[#9ca3af]">{line.text}</div>
  if (line.type === "output") return <div className="text-[#6b7280]">{line.text}</div>
  if (line.type === "success") return <div className="text-[#16a34a]">{line.text}</div>
  if (line.type === "url") return <div className="text-[#2563eb] underline">{line.text}</div>
  if (line.type === "command") return (
    <div>
      <span className="text-[#16a34a]">$ </span>
      <span className="text-[#111]">{line.text}</span>
    </div>
  )
  if (line.type === "plain") return <div className="text-[#111]">{line.text}</div>
  if (line.type === "keyword") return (
    <div>
      <span className="text-[#7c3aed]">{line.text}</span>
      <span className="text-[#111]">{line.after}</span>
      <span className="text-[#7c3aed]">{line.keyword2}</span>
      {line.fn && <span className="text-[#b45309]">{line.fn}</span>}
      {line.args && <span className="text-[#111]">{line.args}</span>}
    </div>
  )
  return null
}

export function DevExSection() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)

  function selectStep(i: number) {
    if (i === active) return
    setVisible(false)
    setTimeout(() => {
      setActive(i)
      setVisible(true)
    }, 180)
  }

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActive(prev => (prev + 1) % STEPS.length)
        setVisible(true)
      }, 180)
    }, 3200)
    return () => clearInterval(t)
  }, [])

  const step = STEPS[active]

  return (
    <section id="devex" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.05] border border-black/[0.06] text-[10px] tracking-widest text-black/40 uppercase">
            Agency Workflow
          </div>
          <h2 className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            From discovery call to
            client-ready document.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
          <div className="flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <button
                key={s.num}
                onClick={() => selectStep(i)}
                className="flex-1 text-left rounded-2xl border transition-all duration-200 p-6 group"
                style={{
                  background: active === i ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.7)",
                  borderColor: active === i ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.06)",
                  boxShadow: active === i
                    ? "0 1px 3px rgba(0,0,0,0.06)"
                    : "0 1px 2px rgba(0,0,0,0.03)",
                }}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-light shrink-0 transition-colors duration-200"
                    style={{
                      background: active === i ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)",
                      color: active === i ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.35)",
                    }}
                  >
                    {s.num}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-light transition-colors duration-200"
                      style={{ color: active === i ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)" }}
                    >
                      {s.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(0,0,0,0.28)" }}>{s.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div
            className="lg:col-span-2 rounded-2xl border border-black/[0.06] p-8 flex flex-col"
            style={{
              background: "rgba(255,255,255,0.7)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              minHeight: "360px",
            }}
          >
            <div className="flex items-center justify-between mb-5 shrink-0">
              <div
                className="text-[10px] tracking-widest uppercase transition-all duration-200"
                style={{
                  opacity: visible ? 1 : 0,
                  filter: visible ? "blur(0px)" : "blur(4px)",
                  transition: "opacity 200ms ease, filter 200ms ease",
                  color: "rgba(0,0,0,0.3)",
                }}
              >
                {step.file}
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(d => (
                  <div
                    key={d}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: d === active ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.08)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 rounded-xl p-6 overflow-hidden" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div
                className="font-mono text-[12px] leading-6"
                style={{
                  opacity: visible ? 1 : 0,
                  filter: visible ? "blur(0px)" : "blur(6px)",
                  transform: visible ? "translateY(0)" : "translateY(6px)",
                  transition: "opacity 220ms cubic-bezier(0.16,1,0.3,1), filter 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                {step.code.map((line, i) => (
                  <CodeLine key={i} line={line} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
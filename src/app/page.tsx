"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { IntroAnimation, INTRO_DURATION_MS, HERO_REVEAL_MS } from "@/components/viableo/intro-animation"
import { ViableoNav } from "@/components/viableo/nav"
import { RevealText } from "@/components/viableo/reveal-text"
import { PixelIcon } from "@/components/viableo/pixel-icon"
import { StackingCards } from "@/components/viableo/stacking-cards"
import { LiveCalcFeed, LiveCalcCounter } from "@/components/viableo/live-feed"
import { DevExSection } from "@/components/viableo/devex-section"

// ─── Intersection Observer hook ──────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ─── Bento card ──────────────────────────────────────────────────────────────
function BentoCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-black/[0.07] bg-white overflow-hidden transition-all duration-700 hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.03), transparent 60%)" }}
      />
      {children}
    </div>
  )
}

// ─── Pill tag ─────────────────────────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [heroReady, setHeroReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const handleIntroDone = useCallback(() => {
    setHeroReady(true)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), HERO_REVEAL_MS)
    return () => clearTimeout(t)
  }, [])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }

  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">

      {/* ── INTRO ANIMATION ───────────────────────────────────────────────── */}
      <IntroAnimation onDone={handleIntroDone} />

      {/* ── STICKY NAV ────────────────────────────────────────────────────── */}
      <ViableoNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden">

        {/* Video background — zooms in once intro is done */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/hero.mp4"
          style={{
            transform: videoReady ? "scale(1.05)" : "scale(0.85)",
            transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Progressive blur + light gradient rising from bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "70%", background: "linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "22%", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "40%", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "58%", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />

        {/* ── HERO CONTENT ── */}
        <div className="relative z-30 max-w-4xl mx-auto px-6 md:px-12 pt-32 md:pt-36 lg:pt-40 pb-24 md:pb-32">
          {/* Eyebrow */}
          <div
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(12px)",
              transform: heroReady ? "translateY(0px)" : "translateY(16px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 0ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0ms",
            }}
          >
            <Tag>AUTOMATION ROI BY VIABLEO</Tag>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#111] leading-[1.02] tracking-tight mb-8 mt-6"
            style={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(24px)",
              transform: heroReady ? "translateY(0px)" : "translateY(32px)",
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 60ms, filter 1s cubic-bezier(0.16,1,0.3,1) 60ms, transform 1s cubic-bezier(0.16,1,0.3,1) 60ms",
            }}
          >
            {"Know what's worth building."}
          </h1>

          {/* Subtext — per master prompt spec */}
          <p
            className="text-base md:text-lg text-black/50 leading-relaxed max-w-xl mb-10"
            style={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(16px)",
              transform: heroReady ? "translateY(0px)" : "translateY(20px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 120ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 120ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 120ms",
            }}
          >
            Viableo takes an automation scope and returns a verdict — build it or don't — the fee where that verdict flips, and a document your client can check line by line.
          </p>

          {/* CTA buttons — WIRED per master prompt spec */}
          <div
            className="flex flex-wrap gap-4 mb-16"
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(12px)",
              transform: heroReady ? "translateY(0px)" : "translateY(16px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 200ms",
            }}
          >
            <Link
              href="/start?start=1"
              className="inline-flex items-center px-7 py-3.5 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors duration-200 tracking-wide"
            >
              Run your first case — free
            </Link>
            <Link
              href="/start?example=apex"
              className="inline-flex items-center px-7 py-3.5 border border-black/12 text-black/60 text-sm rounded-xl hover:border-black/25 hover:text-black hover:bg-black/[0.03] transition-all duration-200 tracking-wide"
            >
              See a completed case
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROBLEM SECTION ────────────────────────────────────────────────── */}
      <section className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4"><Tag>THE PROBLEM</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
              {"You can't sell\nautomation without\nproving it pays back."}
            </RevealText>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Spreadsheets break down",
                body: "When assumptions change mid-meeting, your ROI model collapses. Clients notice the uncertainty and lose confidence in your proposal.",
              },
              {
                title: "CFOs reject gut feels",
                body: "Finance leaders want documented assumptions, sensitivity analysis, and confidence intervals — not an optimistic scenario dressed up as a forecast.",
              },
              {
                title: "Agencies underprice themselves",
                body: "Without rigorous analysis, you discount projects that would actually deliver 5x ROI — or overpromise on ones that won't break even for 18 months.",
              },
            ].map((item, i) => (
              <BentoCard key={i} className="p-8" delay={i * 100}>
                <h3 className="text-lg font-light mb-3">{item.title}</h3>
                <p className="text-sm text-black/45 leading-relaxed">{item.body}</p>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM OVERVIEW (bento) ──────────────────────────────────────── */}
      <section id="methodology" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4"><Tag>HOW IT WORKS</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
              {"Everything you need\nto build ironclad ROI cases."}
            </RevealText>
          </div>

          <div className="grid grid-cols-12 grid-rows-auto gap-3" onMouseMove={handleMouse}>
            {/* Big left card — arc background */}
            <BentoCard className="col-span-12 p-8 min-h-[200px] flex flex-col justify-between relative overflow-hidden" delay={0}>
              <img
                src="/images/arc.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center 70%" }}
              />
              <div className="absolute inset-0" style={{
                maskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }} />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to bottom, transparent 35%, rgba(245,244,240,0.3) 50%, rgba(245,244,240,0.75) 65%, rgba(245,244,240,0.95) 80%, rgb(245,244,240) 100%)",
              }} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl border border-black/10 bg-white/60 flex items-center justify-center mb-6" style={{ backdropFilter: "blur(8px)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
                </div>
                <h3 className="text-xl font-light mb-3">ROI Calculation Engine</h3>
                <p className="text-sm text-black/45 leading-relaxed max-w-sm">
                  Input client parameters once. Get detailed projections with NPV, payback period, confidence intervals, and sensitivity analysis.
                </p>
              </div>
            </BentoCard>

            {/* Bottom row */}
            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={120}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Real-time Scenarios</h3>
              <p className="text-sm text-black/45 leading-relaxed">Adjust parameters live. Clients see instant updated projections as you explore scenarios together.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={160}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10h8M8 14h5"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Documented Assumptions</h3>
              <p className="text-sm text-black/45 leading-relaxed">Every input is tracked. Challenge any assumption and watch the verdict update instantly.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={200}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Client-Ready Documents</h3>
              <p className="text-sm text-black/45 leading-relaxed">Generate PDF reports and proposals your clients can actually verify. Every number, every source, every assumption laid out.</p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── USE CASES (stacking cards) ─────────────────────────────────────── */}
      <section id="solutions" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="agents" size={40} />
              <div className="mt-4"><Tag>SOLUTIONS</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
                {"From discovery\nto closed deal."}
              </RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">
              One platform covers the entire pre-sales workflow for automation agencies. No more cobbling together spreadsheets and slide decks.
            </p>
          </div>
          <StackingCards />
        </div>
      </section>

      {/* ── HOW IT WORKS (devex) ────────────────────────────────────────────── */}
      <DevExSection />

      {/* ── PRODUCT CONTRACT / DIFFERENTIATION ─────────────────────────────── */}
      <section className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <div>
              <PixelIcon type="integrations" size={40} />
              <div className="mt-4"><Tag>THE PRODUCT CONTRACT</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
                {"What Viableo\ndelivers, exactly."}
              </RevealText>
              <p className="mt-8 text-base text-black/45 leading-relaxed max-w-md">
                Viableo is not a dashboard. It is a decision engine. You describe the automation, you estimate the economics, and Viableo tells you — with documented evidence — whether the project is worth building.
              </p>
            </div>
            <div className="space-y-6">
              {[
                { label: "A verdict", desc: "BUILD, CONSIDER, or DON'T BUILD — based on your actual numbers, not optimism bias." },
                { label: "The flip point", desc: "The exact fee where a DON'T BUILD becomes a BUILD. Know your ceiling before you quote." },
                { label: "A shareable document", desc: "PDF report or proposal with every assumption, calculation, and data source visible." },
                { label: "Challenge mode", desc: "Stress-test any assumption. If the case still holds under pressure, you've got something to sell." },
              ].map((item, i) => (
                <BentoCard key={i} className="p-6" delay={i * 80}>
                  <div className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-black/25 mt-2 shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium mb-1">{item.label}</h4>
                      <p className="text-sm text-black/45 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </BentoCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OPPOSITES / DIFFERENTIATION ─────────────────────────────────────── */}
      <section className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <PixelIcon type="pricing" size={40} />
            <div className="mt-4 inline-block"><Tag>WHY NOT JUST USE A SPREADSHEET</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Spreadsheets give you\na number. Viableo gives you\na defensible answer."}
            </RevealText>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
            <BentoCard className="p-8" delay={0}>
              <div className="text-[11px] tracking-widest text-black/30 uppercase mb-4">Spreadsheets</div>
              {[
                "Single scenario, hope it's right",
                "No confidence scoring",
                "Assumptions buried in cells",
                "Breaks when client changes a number",
                "Looks like you made it up",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 py-2 text-sm text-black/40">
                  <div className="w-1 h-1 rounded-full bg-black/15 shrink-0" />
                  {text}
                </div>
              ))}
            </BentoCard>
            <BentoCard className="p-8 border-black/[0.15]" delay={100}>
              <div className="text-[11px] tracking-widest text-black/50 uppercase mb-4">Viableo</div>
              {[
                "Multi-scenario with sensitivity analysis",
                "Confidence intervals on every projection",
                "Every assumption documented and challengeable",
                "Live updates — change any input instantly",
                "PDF your client's CFO will actually read",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 py-2 text-sm text-black/70">
                  <div className="w-1 h-1 rounded-full bg-[#111] shrink-0" />
                  {text}
                </div>
              ))}
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── LIVE CALCULATIONS ──────────────────────────────────────────────── */}
      <section id="resources" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <PixelIcon type="workflow" size={40} />
              <div className="mt-4"><Tag>LIVE RIGHT NOW</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
                {"Agencies closing deals\nwith Viableo, right now."}
              </RevealText>
              <p className="mt-6 text-base text-black/40 leading-relaxed max-w-sm">
                At any moment, agencies around the world are building and sharing ROI cases with their clients.
              </p>
              <div className="mt-10 flex items-end gap-2">
                <LiveCalcCounter />
                <span className="text-black/30 text-sm mb-1 tracking-wide">cases calculated today</span>
              </div>
            </div>
            <div className="relative">
              <LiveCalcFeed />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <PixelIcon type="pricing" size={40} />
            <div className="mt-4"><Tag>PRICING</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Start free. Scale as you close."}
            </RevealText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" onMouseMove={handleMouse}>
            {[
              {
                name: "Starter",
                price: "Free",
                sub: "For individual consultants",
                features: ["5 cases/month", "Basic ROI calculator", "PDF export", "Email support"],
                delay: 0,
              },
              {
                name: "Pro",
                price: "$49",
                period: "/mo",
                sub: "For growing agencies",
                features: ["Unlimited cases", "Advanced scenarios", "Custom branding", "Client portal & share links", "Priority support", "API access"],
                highlight: true,
                delay: 80,
              },
              {
                name: "Enterprise",
                price: "Custom",
                sub: "For agencies at scale",
                features: ["Everything in Pro", "White-label reports", "SSO & team management", "Dedicated account manager", "Custom integrations", "SLA guarantees"],
                delay: 140,
              },
            ].map((plan) => (
              <BentoCard
                key={plan.name}
                className={`p-8 flex flex-col ${plan.highlight ? "border-black/20 bg-[#F0EEE8]" : ""}`}
                delay={plan.delay}
              >
                <div className="mb-8">
                  <div className="text-[11px] tracking-widest text-black/40 mb-4" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-light">{plan.price}</span>
                    {plan.period && <span className="text-black/40 text-sm">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-black/35 tracking-wide">{plan.sub}</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-black/55">
                      <div className="w-1 h-1 rounded-full bg-black/25 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === "Enterprise" ? "/start?start=1" : "/start?start=1"}
                  className={`block w-full text-center py-3 rounded-xl text-sm tracking-widest transition-all duration-200 ${
                    plan.highlight
                      ? "bg-[#111] text-white hover:bg-[#333]"
                      : "border border-black/10 text-black/60 hover:border-black/25 hover:text-black hover:bg-black/[0.04]"
                  }`}
                >
                  {plan.name === "Enterprise" ? "CONTACT SALES" : "GET STARTED"}
                </Link>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
        <img
          src="/images/footer.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full object-cover object-bottom pointer-events-none select-none"
          style={{ opacity: 0.85 }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: "linear-gradient(to top, transparent 0%, black 55%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 55%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgb(245,244,240) 0%, rgba(245,244,240,0.92) 18%, rgba(245,244,240,0.55) 35%, transparent 55%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-6" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
            Start building your<br />next winning case.
          </h2>
          <p className="text-sm text-black/45 leading-relaxed mb-10">
            Join hundreds of automation agencies using Viableo to close more deals, faster, with data-driven confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/start?start=1"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors duration-200 tracking-wide"
            >
              Run your first case — free
            </Link>
            <Link
              href="/start?example=apex"
              className="inline-flex items-center justify-center px-7 py-3.5 border border-black/12 text-black/60 text-sm rounded-xl hover:border-black/25 hover:text-black hover:bg-black/[0.03] transition-all duration-200 tracking-wide"
            >
              See a completed case
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <Link href="/" className="font-mono text-xs tracking-[0.25em] text-black/50 hover:text-black/70 transition-colors">
            VIABLEO
          </Link>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { label: "Platform", href: "/methodology" },
              { label: "Solutions", href: "/solutions/automation-agencies" },
              { label: "Pricing", href: "/pricing" },
              { label: "Resources", href: "/resources/automation-roi" },
              { label: "How It Works", href: "/methodology#workflow" },
            ].map(l => (
              <Link key={l.label} href={l.href} className="text-xs text-black/35 hover:text-black/70 transition-colors tracking-widest">{l.label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map(l => (
              <Link key={l.label} href={l.href} className="text-xs text-black/25 hover:text-black/55 transition-colors tracking-widest">{l.label}</Link>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04]">
          <span className="text-xs text-black/20">© 2026 Viableo. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

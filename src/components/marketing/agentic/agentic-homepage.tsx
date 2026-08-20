"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { IntroAnimation, INTRO_DURATION_MS, HERO_REVEAL_MS } from "./intro-animation"
import { RevealText } from "./reveal-text"
import { LiveAnalysisFeed, LiveAnalysisCounter } from "./live-analysis-feed"
import { StackingPricingCards } from "./stacking-pricing-cards"
import { MobileNav } from "./mobile-nav"
import { PixelIcon } from "./pixel-icon"
import { getApexReferenceNumbers } from "@/lib/calculations/apex-reference"

const apex = getApexReferenceNumbers()

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
      {/* Hover glow spot */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
export function AgenticHomepage() {
  const [heroReady, setHeroReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  const handleIntroDone = useCallback(() => {
    setHeroReady(true)
  }, [])

  // Start video zoom slightly before hero content reveals, for seamless overlap
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
      <MobileNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen overflow-hidden">

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
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{ height: "65%", background: "linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)" }}
        />
        {/* Backdrop blur layers — progressively lighter toward top */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{ height: "20%", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{ height: "38%", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{ height: "55%", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }}
        />

        {/* Spacer so hero content doesn't sit under the fixed nav */}
        <div className="h-20" />

        {/* Title + CTAs + metrics — anchored to bottom left */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col px-6 md:px-12 pb-12 max-w-3xl">
          {/* Title */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#111] leading-[1.0] tracking-tight mb-6"
            style={{
              fontFamily: 'var(--font-plex-sans), system-ui, sans-serif',
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(24px)",
              transform: heroReady ? "translateY(0px)" : "translateY(32px)",
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 0ms, filter 1s cubic-bezier(0.16,1,0.3,1) 0ms, transform 1s cubic-bezier(0.16,1,0.3,1) 0ms",
            }}
          >
            Know what&rsquo;s worth building&mdash;<br />before you quote it.
          </h1>

          {/* Support line */}
          <p
            className="text-sm sm:text-base text-black/45 leading-relaxed max-w-lg mb-8"
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(16px)",
              transform: heroReady ? "translateY(0px)" : "translateY(20px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 120ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 120ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 120ms",
            }}
          >
            Viableo turns a rough automation scope into a stress-tested verdict — and the business case that defends it.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-3 mb-10"
            style={{
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0px)" : "translateY(20px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 200ms",
            }}
          >
            <Link
              href="/start?start=1"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-widest font-medium"
            >
              Run your first case
            </Link>
            <Link
              href="/start?start=1&example=apex"
              className="inline-flex items-center justify-center px-6 py-3 border border-black/10 text-black/60 text-sm rounded-xl hover:border-black/25 hover:text-black hover:bg-black/[0.04] transition-all tracking-widest"
            >
              See a completed case
            </Link>
          </div>

          {/* 3 metrics — staggered after title */}
          <div className="flex gap-8 sm:gap-12">
            {[
              { value: apex.formatted.netAnnualBenefit, label: "Expected first-year net" },
              { value: apex.formatted.payback, label: "Payback" },
              { value: apex.formatted.breakEvenFee, label: "Holds until" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(16px)",
                  transform: heroReady ? "translateY(0px)" : "translateY(20px)",
                  transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${300 + i * 80}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${300 + i * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${300 + i * 80}ms`,
                }}
              >
                <div className="text-3xl sm:text-4xl text-[#111] font-light tracking-tight" style={{ fontFamily: 'var(--font-plex-sans), system-ui, sans-serif' }}>{stat.value}</div>
                <div className="text-xs text-black/40 tracking-widest uppercase mt-1" style={{ fontFamily: 'var(--font-plex-sans), system-ui, sans-serif' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY VIABLEO (bento) ─────────────────────────────────────────────── */}
      <section id="platform" className="py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="decision" size={40} />
            <div className="mt-4"><Tag>WHY VIABLEO</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
              {"Break it on purpose."}
            </RevealText>
          </div>

          <div className="grid grid-cols-12 grid-rows-auto gap-3" onMouseMove={handleMouse}>
            {/* Big left card — full width */}
            <BentoCard className="col-span-12 p-8 min-h-[200px] flex flex-col justify-between relative overflow-hidden" delay={0}>
              {/* Arc image background */}
              <img src="/images/arc.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 70%" }} />
              {/* Progressive blur layer */}
              <div className="absolute inset-0" style={{
                maskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }} />
              {/* Fade-to-background gradient */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to bottom, transparent 35%, rgba(245,244,240,0.3) 50%, rgba(245,244,240,0.75) 65%, rgba(245,244,240,0.95) 80%, rgb(245,244,240) 100%)",
              }} />
              {/* Content */}
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl border border-black/10 bg-white/60 flex items-center justify-center mb-6" style={{ backdropFilter: "blur(8px)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="3" /></svg>
                </div>
                <h3 className="text-xl font-light mb-3">Model the economics</h3>
                <p className="text-sm text-black/45 leading-relaxed max-w-sm">
                  Conservative, Expected, and Upside scenarios from the same inputs. Every figure traced to a labelled input — measured, estimated, or assumed.
                </p>
              </div>
            </BentoCard>

            {/* Bottom row */}
            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={120}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M2 12h20" /><path d="m8 8 8 8M16 8l-8 8" /></svg>
              </div>
              <h3 className="text-lg font-light mb-2">See the downside</h3>
              <p className="text-sm text-black/45 leading-relaxed">64-permutation stress test. Every material assumption varied together. Find the fee, the coverage, and the cost where the case breaks.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={160}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Know how much to trust it</h3>
              <p className="text-sm text-black/45 leading-relaxed">Measured inputs count in full. Estimated inputs count at 0.6. Assumptions count at 0.3. Guess more, confidence falls.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={200}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h3 className="text-lg font-light mb-2">A model that can say no</h3>
              <p className="text-sm text-black/45 leading-relaxed">BUILD, CONSIDER, or DON&rsquo;T BUILD. Published rules, applied the same way every time. A model that cannot say no is not giving you a decision.</p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="workflow" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4"><Tag>HOW IT WORKS</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"From scope to verdict\nin four steps."}
            </RevealText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3" onMouseMove={handleMouse}>
            {[
              { n: "01", title: "Scope", desc: "Describe the automation. Labor hours, rates, revenue, costs, and a proposed implementation fee.", delay: 0 },
              { n: "02", title: "Model", desc: "Viableo computes three scenarios — Conservative, Expected, and Upside — from the same inputs.", delay: 80 },
              { n: "03", title: "Stress Test", desc: "64 permutations. Every material assumption varied together. Find where the answer changes.", delay: 140 },
              { n: "04", title: "Verdict", desc: "BUILD, CONSIDER, or DON\u2019T BUILD. A confidence score. A document with every number traced.", delay: 200 },
            ].map((step) => (
              <BentoCard key={step.n} className="relative overflow-hidden flex flex-col min-h-[320px]" delay={step.delay}>
                {/* Subtle top gradient accent */}
                <div className="absolute inset-x-0 top-0 h-56 pointer-events-none" style={{
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, transparent 80%)",
                }} />
                {/* Number top-left */}
                <div className="relative z-10 p-7">
                  <span className="font-mono text-[11px] text-black/20 tracking-widest block">{step.n}</span>
                </div>
                {/* Text pushed further down */}
                <div className="relative z-10 px-7 pb-7 mt-auto pt-16">
                  <h3 className="text-2xl font-light mb-3">{step.title}</h3>
                  <p className="text-sm text-black/45 leading-relaxed">{step.desc}</p>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── STACKING PRICING TIERS ───────────────────────────────────────── */}
      <section id="capabilities" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="platforms" size={40} />
              <div className="mt-4"><Tag>PLANS</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
                {"Full rigor on\nevery tier."}
              </RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">
              Free includes the real decision engine. Paid unlocks clean client artifacts and workflow.
            </p>
          </div>

          <StackingPricingCards />
        </div>
      </section>

      {/* ── MARQUEE CAPABILITIES ──────────────────────────────────────────── */}
      <section className="py-0 border-t border-black/[0.06] overflow-hidden select-none">
        <div className="flex border-b border-black/[0.06]" style={{ animation: "marqueeLeft 28s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["n8n Workflows", "Make Scenarios", "Zapier Automations", "AI Workflows", "Custom Builds", "ROI Modeling", "Stress Testing", "Confidence Scoring", "Business Cases", "Break-Even Analysis"].map((cap) => (
                <div key={`${rep}-${cap}`} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0" />
                  <span className="text-sm text-black/45 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex" style={{ animation: "marqueeRight 22s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["Lead Generation", "Invoice Processing", "CRM Sync", "Onboarding Flows", "Email Sequences", "Data Entry", "Order Management", "Appointment Booking", "Report Generation", "Compliance Checks"].map((cap) => (
                <div key={`${rep}-${cap}`} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/12 shrink-0" />
                  <span className="text-sm text-black/30 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE ANALYSIS FEED ──────────────────────────────────────────────── */}
      <section id="live" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <PixelIcon type="analysis" size={40} />
              <div className="mt-4"><Tag>LIVE RIGHT NOW</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
                {"Analyses running\n24 / 7, in real time."}
              </RevealText>
              <p className="mt-6 text-base text-black/40 leading-relaxed max-w-sm">
                At any moment, dozens of automation opportunity assessments are running through Viableo&rsquo;s decision engine — modeling, stress-testing, and returning verdicts.
              </p>
              <div className="mt-10 flex items-end gap-2">
                <LiveAnalysisCounter />
                <span className="text-black/30 text-sm mb-1 tracking-wide">analyses completed</span>
              </div>
            </div>
            <div className="relative">
              <LiveAnalysisFeed />
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
              {"Simple plans.\nFull rigor on every tier."}
            </RevealText>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" onMouseMove={handleMouse}>
            {[
              {
                name: "Free",
                price: "$0",
                period: "",
                sub: "Try it once",
                features: ["1 case/month", "Full analytical rigor", "Confidence scoring", "Stress test", "Watermarked document"],
                delay: 0,
              },
              {
                name: "Pro",
                price: "$29",
                period: "/mo",
                sub: "Full documents",
                features: ["5 cases/month", "Unwatermarked PDFs", "Saved projects", "Share links", "All scenario types"],
                highlight: true,
                delay: 80,
              },
              {
                name: "Agency",
                price: "$79",
                period: "/mo",
                sub: "Unlimited cases",
                features: ["Unlimited cases", "Your branding", "Client history", "Team seats", "Priority support"],
                delay: 140,
              },
              {
                name: "Agency Pro",
                price: "$790",
                period: "/yr",
                sub: "Make it yours",
                features: ["Everything in Agency", "API access", "Custom integrations", "Dedicated support", "Custom contracts"],
                delay: 200,
              },
            ].map((plan) => (
              <BentoCard
                key={plan.name}
                className={`p-8 flex flex-col ${plan.highlight ? "border-black/20 bg-[#F0EEE8]" : ""}`}
                delay={plan.delay}
              >
                <div className="mb-8">
                  <div className="font-mono text-[11px] tracking-widest text-black/40 mb-4">{plan.name}</div>
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
                  href="/start?start=1"
                  className={`w-full py-3 rounded-xl text-sm tracking-widest text-center transition-all duration-200 block ${
                    plan.highlight
                      ? "bg-[#111] text-white hover:bg-[#333]"
                      : "border border-black/10 text-black/60 hover:border-black/25 hover:text-black hover:bg-black/[0.04]"
                  }`}
                >
                  GET STARTED
                </Link>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
        {/* Progressive gradient background — blends into site bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgb(245,244,240) 0%, rgba(245,244,240,0.92) 18%, rgba(245,244,240,0.55) 35%, transparent 55%)",
          }}
        />
        {/* Footer.png background */}
        <img src="/images/footer.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-top opacity-[0.06]" />
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-6">
            Start your first case.
          </h2>
          <p className="text-sm text-black/45 leading-relaxed mb-10">
            Run one case. If the answer is don&rsquo;t build, you have saved yourself a project.
          </p>
          <Link
            href="/start?start=1"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-widest font-medium"
          >
            START YOUR FIRST CASE
          </Link>
        </div>
      </section>


      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <span className="font-mono text-xs tracking-[0.25em] text-black/50">VIABLEO</span>

          {/* Nav sections */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { label: "Platform", href: "/methodology" },
              { label: "How It Works", href: "#workflow" },
              { label: "Solutions", href: "/solutions/automation-agencies" },
              { label: "Live", href: "#live" },
              { label: "Pricing", href: "/pricing" },
            ].map(l => (
              <Link key={l.label} href={l.href} className="text-xs text-black/35 hover:text-black/70 transition-colors tracking-widest">{l.label}</Link>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-6">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Methodology", href: "/methodology" },
            ].map(l => (
              <Link key={l.label} href={l.href} className="text-xs text-black/25 hover:text-black/55 transition-colors tracking-widest">{l.label}</Link>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04]">
          <span className="text-xs text-black/20">© {new Date().getFullYear()} Viableo. Figures are estimates, not financial advice.</span>
        </div>
      </footer>

      {/* ── GLOBAL KEYFRAMES ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes marqueeLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marqueeRight {
          0%   { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

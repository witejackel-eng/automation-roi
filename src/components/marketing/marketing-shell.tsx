"use client"

import Link from "next/link"
import { useState } from "react"

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Platform",     href: "/methodology" },
  { label: "How it works", href: "/methodology#workflow" },
  { label: "Solutions",    href: "/solutions/automation-agencies" },
  { label: "Pricing",      href: "/pricing" },
  { label: "Resources",    href: "/resources/automation-roi" },
]

const FOOTER_CENTER_LINKS = [
  { label: "Platform",     href: "/methodology" },
  { label: "How it works", href: "/methodology#workflow" },
  { label: "Solutions",    href: "/solutions/automation-agencies" },
  { label: "Resources",    href: "/resources/automation-roi" },
  { label: "Pricing",      href: "/pricing" },
]

const FOOTER_LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms",   href: "/terms" },
]

// ─── Shared pill style (matches agentic homepage MobileNav) ──────────────────

const PILL_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(245,244,240,0.30)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
} as const

const LINK_FONT = { fontFamily: "system-ui, -apple-system, sans-serif" } as const

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4F0] text-[#111]">

      {/* ── Floating pill nav ──────────────────────────────────────────────── */}
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-3xl">

          {/* Main bar */}
          <nav
            className="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06]"
            style={PILL_STYLE}
          >
            {/* Brand */}
            <Link href="/" className="font-mono text-xs tracking-[0.25em] text-black/70">
              VIABLEO
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-6" style={LINK_FONT}>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[11px] text-black/60 hover:text-black transition-colors duration-200 tracking-wide"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/auth/signin"
                className="text-[11px] text-black/50 hover:text-black transition-colors duration-200 tracking-wide"
              >
                Sign in
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* CTA — desktop */}
              <Link
                href="/start?start=1"
                className="text-[11px] px-4 py-2 rounded-xl border border-black/10 text-black/60 hover:text-black hover:border-black/20 hover:bg-black/[0.03] transition-all duration-200 tracking-wide hidden lg:block"
                style={LINK_FONT}
              >
                RUN YOUR FIRST CASE
              </Link>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg hover:bg-black/[0.04] transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                <span
                  className="block h-px bg-black/60 transition-all duration-300 origin-center"
                  style={{
                    width: "18px",
                    transform: mobileOpen ? "translateY(6px) rotate(45deg)" : "none",
                  }}
                />
                <span
                  className="block h-px bg-black/60 transition-all duration-300"
                  style={{
                    width: "18px",
                    opacity: mobileOpen ? 0 : 1,
                    transform: mobileOpen ? "scaleX(0)" : "none",
                  }}
                />
                <span
                  className="block h-px bg-black/60 transition-all duration-300 origin-center"
                  style={{
                    width: "18px",
                    transform: mobileOpen ? "translateY(-6px) rotate(-45deg)" : "none",
                  }}
                />
              </button>
            </div>
          </nav>

          {/* Mobile dropdown */}
          <div
            className="lg:hidden mt-2 overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: mobileOpen ? "400px" : "0px", opacity: mobileOpen ? 1 : 0 }}
          >
            <div
              className="rounded-2xl border border-black/[0.06] px-2 py-2 flex flex-col"
              style={PILL_STYLE}
            >
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={closeMobile}
                  className="px-4 py-3 text-sm text-black/60 hover:text-black hover:bg-black/[0.03] rounded-xl transition-colors tracking-wide"
                  style={LINK_FONT}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/auth/signin"
                onClick={closeMobile}
                className="px-4 py-3 text-sm text-black/50 hover:text-black hover:bg-black/[0.03] rounded-xl transition-colors tracking-wide"
                style={LINK_FONT}
              >
                Sign in
              </Link>
              <div className="mt-1 px-2 pb-1">
                <Link
                  href="/start?start=1"
                  className="block w-full text-center text-[11px] px-4 py-2.5 rounded-xl border border-black/10 text-black/60 hover:text-black hover:border-black/20 hover:bg-black/[0.03] transition-all duration-200 tracking-wide"
                  style={LINK_FONT}
                >
                  RUN YOUR FIRST CASE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col w-full">
        {children}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Left — brand */}
          <Link href="/" className="font-mono text-xs tracking-[0.25em] text-black/50">
            VIABLEO
          </Link>

          {/* Center — nav links */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {FOOTER_CENTER_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-xs text-black/35 hover:text-black/70 transition-colors tracking-widest"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right — legal links */}
          <div className="flex items-center gap-6">
            {FOOTER_LEGAL_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-xs text-black/25 hover:text-black/55 transition-colors tracking-widest"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04]">
          <span className="text-xs text-black/20">© 2026 Viableo. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

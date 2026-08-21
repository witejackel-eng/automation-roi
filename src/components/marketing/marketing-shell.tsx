"use client"

import Link from "next/link"
import { useState } from "react"

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Methodology", href: "/methodology" },
  { label: "Solutions", href: "/solutions/automation-agencies" },
  { label: "How It Works", href: "/resources/automation-roi" },
  { label: "See It Work", href: "/start?start=1&example=apex" },
  { label: "Pricing", href: "/pricing" },
]

const FOOTER_CENTER_LINKS = [
  { label: "Methodology", href: "/methodology" },
  { label: "Solutions", href: "/solutions/automation-agencies" },
  { label: "How It Works", href: "/resources/automation-roi" },
  { label: "Pricing", href: "/pricing" },
  { label: "Documentation", href: "/docs" },
]

const FOOTER_LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
]

// ─── Shared pill style ──────────────────────────────────────────────────────────

const PILL_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(245,244,240,0.80)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
} as const

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
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Brand */}
            <Link href="/" className="font-mono text-xs tracking-[0.25em] text-[#111] font-semibold">
              VIABLEO
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-5">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[11px] text-[#111]/55 hover:text-[#111] transition-colors duration-200 tracking-wide"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/auth/signin"
                className="text-[11px] text-[#111]/40 hover:text-[#111] transition-colors duration-200 tracking-wide"
              >
                Sign in
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* CTA — desktop */}
              <Link
                href="/start?start=1"
                className="text-[11px] px-4 py-2 rounded-full bg-[#111] text-white hover:bg-[#333] transition-colors duration-200 tracking-wide hidden lg:inline-flex items-center min-h-[36px]"
              >
                Run your first case — free
              </Link>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg hover:bg-black/[0.04] transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                <span
                  className="block h-px bg-[#111]/60 transition-all duration-300 origin-center"
                  style={{
                    width: "18px",
                    transform: mobileOpen ? "translateY(6px) rotate(45deg)" : "none",
                  }}
                />
                <span
                  className="block h-px bg-[#111]/60 transition-all duration-300"
                  style={{
                    width: "18px",
                    opacity: mobileOpen ? 0 : 1,
                    transform: mobileOpen ? "scaleX(0)" : "none",
                  }}
                />
                <span
                  className="block h-px bg-[#111]/60 transition-all duration-300 origin-center"
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
            style={{ maxHeight: mobileOpen ? "500px" : "0px", opacity: mobileOpen ? 1 : 0 }}
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
                  className="px-4 py-3 text-sm text-[#111]/60 hover:text-[#111] hover:bg-black/[0.03] rounded-xl transition-colors tracking-wide"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/auth/signin"
                onClick={closeMobile}
                className="px-4 py-3 text-sm text-[#111]/40 hover:text-[#111] hover:bg-black/[0.03] rounded-xl transition-colors tracking-wide"
              >
                Sign in
              </Link>
              <div className="mt-2 px-2 pb-1">
                <Link
                  href="/start?start=1"
                  className="block w-full text-center text-[11px] px-4 py-2.5 rounded-full bg-[#111] text-white hover:bg-[#333] transition-colors duration-200 tracking-wide min-h-[44px] leading-[44px]"
                >
                  Run your first case — free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <main id="main-content" className="flex flex-1 flex-col w-full">
        {children}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-10">
          {/* Top row: brand + tagline */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div>
              <Link href="/" className="font-mono text-xs tracking-[0.25em] text-[#111]/70">
                VIABLEO
              </Link>
              <p className="mt-2 text-sm text-[#111]/40">
                Know what&apos;s worth building.
              </p>
            </div>

            {/* Center — nav links */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {FOOTER_CENTER_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-xs text-[#111]/35 hover:text-[#111]/70 transition-colors tracking-widest"
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
                  className="text-xs text-[#111]/25 hover:text-[#111]/55 transition-colors tracking-widest"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="pt-6 border-t border-black/[0.04]">
            <span className="text-xs text-[#111]/20">© 2026 Viableo. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

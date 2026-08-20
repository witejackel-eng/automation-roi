"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/viableo";
import { HERO_CTA_PRIMARY } from "@/lib/brand";

/**
 * SkyddaHeader — the ONE shared, consistent header for EVERY marketing page.
 *
 * Per the master directive: "Create one shared header component/system.
 * Every marketing page consumes that same header. There must be no separate
 * homepage header implementation."
 *
 * One component, two presentation states:
 *   - transparent (hero variant): white text over the dark hero image, no bg
 *   - default (sub-pages): dark text on white canvas, border-b
 *
 * Structure ported from the supplied Skydda `components/hero.tsx` navigation:
 * left logo · center nav links · right CTA · mobile hamburger + panel.
 */

const NAV_LINKS = [
  { href: "/", label: "Product" },
  { href: "/methodology", label: "Methodology" },
  { href: "/solutions/automation-agencies", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources/automation-roi", label: "Resources" },
];

export function SkyddaHeader({ transparent = false }: { transparent?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Color treatment depends on the presentation state.
  const textColor = transparent ? "text-white" : "text-zinc-900";
  const mutedColor = transparent ? "text-zinc-300" : "text-zinc-600";
  const hoverColor = transparent ? "hover:text-white" : "hover:text-zinc-900";
  const ctaColor = transparent ? "text-white hover:text-zinc-300" : "text-zinc-900 hover:text-zinc-600";

  return (
    <nav
      className={`relative z-50 px-6 py-6 md:px-12 ${
        transparent ? "" : "border-b border-zinc-200 bg-white"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Viableo — home">
          <Logo variant={transparent ? "reverse" : "primary"} />
        </Link>

        {/* Desktop Navigation */}
        <div className={`hidden items-center gap-8 text-sm lg:flex ${mutedColor}`}>
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`font-normal tracking-wide transition-colors ${hoverColor} ${
                  active ? textColor : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/start?start=1"
            className={`hidden text-sm font-medium transition-colors lg:block ${ctaColor}`}
          >
            {HERO_CTA_PRIMARY}
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${textColor} lg:hidden`}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-zinc-200 bg-white/95 backdrop-blur-sm lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-3 text-zinc-600 transition-colors hover:text-zinc-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/start?start=1"
                className="mt-2 border-t border-zinc-200 py-3 font-medium text-zinc-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {HERO_CTA_PRIMARY}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

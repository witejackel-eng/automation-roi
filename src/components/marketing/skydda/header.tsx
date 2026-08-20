"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/viableo";
import { HERO_CTA_PRIMARY } from "@/lib/brand";

/**
 * SkyddaHeader — the shared, consistent header for EVERY marketing page.
 *
 * Extracted from the Skydda hero's inline nav so the exact same header
 * geometry/behavior appears on /, /methodology, /pricing, /solutions/*,
 * /resources/*, /privacy, /terms — per the master directive:
 * "do NOT create a different header for different pages."
 *
 * Structure ported from the supplied Skydda `components/hero.tsx` navigation:
 * left logo · center nav links · right CTA · mobile hamburger + panel.
 * `transparent` prop (default false) renders the header over dark hero
 * sections with white text; on sub-pages it gets a zinc-950 backdrop.
 */

const NAV_LINKS = [
  { href: "/automation-roi", label: "Product" },
  { href: "/methodology", label: "Methodology" },
  { href: "/solutions/automation-agencies", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources/automation-roi", label: "Resources" },
];

export function SkyddaHeader({ transparent = false }: { transparent?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav
      className={`relative z-50 px-6 py-6 md:px-12 ${
        transparent ? "" : "border-b border-zinc-700/30 bg-zinc-950"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Viableo — home">
          <Logo variant="reverse" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 text-sm text-zinc-300 lg:flex">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`font-normal tracking-wide transition-colors hover:text-white ${
                  active ? "text-white" : ""
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
            className="hidden text-sm font-medium text-white transition-colors hover:text-zinc-300 lg:block"
          >
            {HERO_CTA_PRIMARY}
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white lg:hidden"
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
            className="overflow-hidden border-t border-zinc-700/30 bg-zinc-900/95 backdrop-blur-sm lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-3 text-zinc-300 transition-colors hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/start?start=1"
                className="mt-2 border-t border-zinc-700/30 py-3 font-medium text-white"
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

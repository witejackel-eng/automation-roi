"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthNavControls } from "@/components/auth-nav-controls";

/**
 * ComputeNavigation — the ONE shared, consistent header for EVERY page.
 *
 * Ported from the COMPUTE template `components/landing/navigation.tsx`:
 * fixed, transparent at top → bordered rounded pill on scroll, full-screen
 * mobile overlay menu. Logo left · center nav · right CTA.
 *
 * Content = real Automation ROI routes.
 */
const NAV_LINKS = [
  { href: "/methodology", label: "Methodology" },
  { href: "/solutions/automation-agencies", label: "Solutions" },
  { href: "/resources/automation-roi", label: "Resources" },
  { href: "/pricing", label: "Pricing" },
];

export function ComputeNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const raf = requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsMobileMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed z-50 transition-all duration-500",
        isScrolled ? "left-4 right-4 top-4" : "left-0 right-0 top-0",
      )}
    >
      <nav
        className={cn(
          "mx-auto transition-all duration-500",
          isScrolled || isMobileMenuOpen
            ? "max-w-[1200px] rounded-2xl border border-ink/10 bg-canvas/80 shadow-lg backdrop-blur-xl"
            : "max-w-[1400px] bg-transparent",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between px-6 transition-all duration-500 lg:px-8",
            isScrolled ? "h-14" : "h-20",
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="Viableo — home">
            <span className="font-display tracking-tight text-ink transition-all duration-500"
              style={{ fontSize: isScrolled ? "1.25rem" : "1.5rem" }}>
              Viableo
            </span>
            <span className="font-mono text-[10px] text-ink-muted">TM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-12 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className="group relative text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-ink transition-all duration-300 group-hover:w-full" />
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA — auth-aware (shows avatar/email/sign-out when signed in) */}
          <div className="hidden items-center gap-4 md:flex">
            <AuthNavControls variant="light" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-ink md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-canvas transition-all duration-500 md:hidden",
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{ top: 0 }}
      >
        <div className="flex h-full flex-col px-8 pb-8 pt-28">
          <div className="flex flex-1 flex-col justify-center gap-8">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-display text-5xl text-ink transition-all duration-500 hover:text-ink-muted",
                  isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div
            className={cn(
              "flex flex-col gap-4 border-t border-ink/10 pt-8 transition-all duration-500",
              isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
            style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            <AuthNavControls variant="light" />
          </div>
        </div>
      </div>
    </header>
  );
}

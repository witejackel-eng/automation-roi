'use client';

/**
 * MarketingShell — shared chrome for public, indexable marketing routes
 * (Master Spec §7). Replaces the AppShell for routes like /pricing,
 * /methodology, /solutions/*, /resources/*.
 *
 * Unlike AppShell (which switches views via Zustand), MarketingShell uses
 * real <Link> navigation so every route is a stable, copyable, indexable URL.
 *
 * The primary CTA ("Start free analysis") links to /?start=1 — the homepage
 * reads that param and auto-launches the calculator, so marketing → app is
 * one click with no auth wall.
 */
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Logo,
} from '@/components/viableo';
import {
  COMPANY_NAME,
  BRAND_TAGLINE,
  CTA_PRIMARY,
  NAV_LABELS,
  DATA_HANDLING_LINE,
} from '@/lib/brand';

const NAV_LINKS = [
  { href: '/automation-roi', label: NAV_LABELS.automationRoi },
  { href: '/solutions/automation-agencies', label: NAV_LABELS.solutions },
  { href: '/resources/automation-roi', label: NAV_LABELS.resources },
  { href: '/methodology', label: NAV_LABELS.methodology },
  { href: '/pricing', label: NAV_LABELS.pricing },
];

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/start?start=1', label: 'Run a case' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/start?start=1&example=apex', label: 'See an example' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { href: '/solutions/automation-agencies', label: 'Automation agencies' },
      { href: '/solutions/n8n-agencies', label: 'n8n agencies' },
      { href: '/solutions/make-agencies', label: 'Make agencies' },
      { href: '/solutions/zapier-agencies', label: 'Zapier agencies' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/resources/automation-roi', label: 'Automation ROI' },
      { href: '/resources/automation-payback', label: 'Automation payback' },
      { href: '/resources/automation-cost', label: 'Automation cost' },
      { href: '/resources/automation-business-case', label: 'Business case' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/methodology', label: 'Methodology' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <MarketingTopNav />
      <div className="flex flex-1 flex-col w-full">{children}</div>
      <MarketingFooter />
    </div>
  );
}

function MarketingTopNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on Escape.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 transition-colors duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        scrolled ? 'bg-canvas/80 backdrop-blur supports-[backdrop-filter]:bg-canvas/65' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
        {/* ── Floating pill: logo + nav links (+ hamburger on mobile) ── */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="mkt-nav-pill relative"
          aria-label="Marketing"
        >
          <Link
            href="/"
            className="flex min-h-[34px] shrink-0 items-center text-left"
            aria-label={`${COMPANY_NAME} — home`}
          >
            <Logo variant="primary" />
          </Link>

          <div className="hidden items-center md:flex">
            <span aria-hidden="true" className="mkt-nav-pill-sep" />
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active}
                  className="mkt-nav-link link-underline"
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger — inside the pill. */}
          <div className="flex items-center md:hidden">
            <span aria-hidden="true" className="mkt-nav-pill-sep" />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex min-h-[34px] min-w-[34px] items-center justify-center rounded-full text-ink transition-colors hover:bg-canvas"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="marketing-mobile-nav-menu"
            >
              {menuOpen ? (
                <X className="size-4" strokeWidth={2} aria-hidden="true" />
              ) : (
                <Menu className="size-4" strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </div>
        </motion.nav>

        {/* ── Dark CTA — outside the pill ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
        >
          <motion.a
            href="/start?start=1"
            className="mkt-cta-dark shrink-0"
            whileHover={{ y: -1.5 }}
            whileTap={{ y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="hidden sm:inline">{CTA_PRIMARY}</span>
            <span className="sm:hidden">Start</span>
          </motion.a>
        </motion.div>
      </div>

      {/* ── Mobile menu dropdown ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="marketing-mobile-nav-menu"
            className="absolute inset-x-4 top-[calc(100%+8px)] z-40 md:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mkt-mobile-menu">
              {NAV_LINKS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-active={active}
                    className="mkt-mobile-menu-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <a
                href="/start?start=1"
                className="mkt-mobile-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                {CTA_PRIMARY}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MarketingFooter() {
  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-20 md:px-6 md:py-24">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* Brand column */}
          <div className="col-span-2">
            <Logo variant="reverse" />
            <p className="mt-5 max-w-[260px] text-[14px] leading-[1.6] text-[#A5A0AE]">
              {BRAND_TAGLINE}
            </p>
            <p className="mt-3 max-w-[260px] text-[12px] leading-[1.5] text-[#A5A0AE]">
              {DATA_HANDLING_LINE}
            </p>
          </div>
          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A5A0AE]">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="link-underline text-[13px] text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-[#A5A0AE] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span>{COMPANY_NAME}</span>
            <span aria-hidden="true" className="size-1 rounded-full bg-white/25" />
            <span>{new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span>Figures are estimates, not financial advice.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

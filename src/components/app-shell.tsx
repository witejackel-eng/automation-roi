'use client';

/**
 * Viableo app shell (Section 8).
 *
 * Marketing views (landing, pricing) use a conventional top nav: Logo primary
 * lockup left (clickable → landing), Pricing + the coral primary CTA right.
 *
 * App views (calculator, results, projects, settings) use a compact 64px
 * sidebar rail on md+ (LogoCompact top-left, icon+label nav, tier StatusPill
 * + Upgrade). On mobile the same rail collapses to a fixed bottom tab bar so
 * the 64px-icon chrome doesn't fight a narrow viewport.
 *
 * Footer is sticky to the bottom (min-h-screen flex flex-col, mt-auto) on
 * marketing views and on desktop app views. On mobile app views the bottom tab
 * bar handles navigation, so the long footer is hidden — content gets pb-16 so
 * the last items clear the fixed bar.
 */
import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calculator,
  FileText,
  Settings2,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useApp, useTier, type View } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/status-pill';
import { Logo, LogoCompact, DotSeparator, SuperadminLink } from '@/components/viableo';
import {
  BRAND_TAGLINE,
  CTA_PRIMARY,
  COMPANY_NAME,
} from '@/lib/brand';
import { TIER_LABEL, type Tier } from '@/lib/entitlement';

interface NavItem {
  view: View;
  label: string;
  icon: LucideIcon;
  /** Minimum tier required to use this destination; used for the mobile badge. */
  minTier?: Tier;
}

// Per Section 8: "primary nav items as icons+labels".
// Calculator is the product surface; Reports (Agency+ client history); Settings.
const APP_NAV: NavItem[] = [
  { view: 'calculator', label: 'Calculator', icon: Calculator },
  { view: 'projects', label: 'Reports', icon: FileText, minTier: 'agency' },
  { view: 'settings', label: 'Settings', icon: Settings2 },
];

// Marketing top-nav — real routes (Pricing is a server-rendered indexable page).
// The logo links home; Home is therefore redundant. `/automation-roi` is now a
// 308 redirect to `/`, so the canonical nav destination is `/`.
const MARKETING_NAV_LINKS: { href: string; label: string }[] = [
  { href: '/', label: 'Automation ROI' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/pricing', label: 'Pricing' },
];

function isMarketingView(v: View): boolean {
  return v === 'landing';
}

function tierLabel(tier: Tier): string {
  return TIER_LABEL[tier];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const view = useApp((s) => s.view);
  const marketing = isMarketingView(view);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {marketing ? (
        <MarketingTopNav />
      ) : (
        <>
          <AppLeftRail />
          <MobileTabBar />
        </>
      )}
      <div
        className={cn(
          'flex flex-1 flex-col',
          marketing ? 'w-full' : 'pb-16 md:pb-0 md:pl-16'
        )}
      >
        {children}
      </div>
      <AppFooter marketing={marketing} />
    </div>
  );
}

// ── Marketing top nav (piplanning.io-inspired: floating pill + dark CTA) ─
//
// Structure (matches piplanning.io):
//   - Left side: a floating white rounded pill that contains the Logo + the
//     nav links (Automation ROI, Methodology, Pricing). Soft shadow
//     under the pill; the whole thing feels slightly elevated from the page.
//   - Right side: the dark "Start free analysis →" button, OUTSIDE the pill.
//   - The header itself is borderless and transparent at the top; on scroll
//     the header backdrop gains a faint blur so content never collides.
//   - On mobile the pill shows logo + a hamburger; the dark CTA stays
//     visible. The hamburger opens a clean dropdown menu.
// Premium easing [0.16, 1, 0.3, 1] is shared across every header transition.

const HEADER_EASE = [0.16, 1, 0.3, 1] as const;

function MarketingTopNav() {
  const go = useApp((s) => s.go);
  const startCalculator = useApp((s) => s.startCalculator);
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
          transition={{ duration: 0.56, ease: HEADER_EASE, delay: 0.08 }}
          className="mkt-nav-pill relative"
          aria-label="Marketing"
        >
          <button
            type="button"
            onClick={() => { go('landing'); setMenuOpen(false); }}
            className="flex min-h-[34px] shrink-0 items-center text-left"
            aria-label={`${COMPANY_NAME} — home`}
          >
            <Logo variant="primary" />
          </button>

          {/* Desktop nav links — inside the pill, separated by a hairline. */}
          <div className="hidden items-center md:flex">
            <span aria-hidden="true" className="mkt-nav-pill-sep" />
            {MARKETING_NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mkt-nav-link link-underline"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger — inside the pill, separated by a hairline. */}
          <div className="flex items-center md:hidden">
            <span aria-hidden="true" className="mkt-nav-pill-sep" />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex min-h-[34px] min-w-[34px] items-center justify-center rounded-full text-ink transition-colors hover:bg-canvas"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
            >
              {menuOpen ? (
                <X className="size-4" strokeWidth={2} aria-hidden="true" />
              ) : (
                <Menu className="size-4" strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </div>
        </motion.nav>

        {/* ── Dark CTA — outside the pill, always visible ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.56, ease: HEADER_EASE, delay: 0.16 }}
        >
          <motion.button
            type="button"
            onClick={() => startCalculator()}
            className="mkt-cta-dark shrink-0"
            whileHover={{ y: -1.5 }}
            whileTap={{ y: 0 }}
            transition={{ duration: 0.2, ease: HEADER_EASE }}
          >
            <span className="hidden sm:inline">{CTA_PRIMARY}</span>
            <span className="sm:hidden">Start</span>
          </motion.button>
        </motion.div>
      </div>

      {/* ── Mobile menu dropdown — slides down under the pill ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav-menu"
            className="absolute inset-x-4 top-[calc(100%+8px)] z-40 md:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: HEADER_EASE }}
          >
            <div className="mkt-mobile-menu">
              {MARKETING_NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mkt-mobile-menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => { setMenuOpen(false); startCalculator(); }}
                className="mkt-mobile-menu-link w-full text-left"
              >
                {CTA_PRIMARY}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── App left rail (desktop) ───────────────────────────────────────────────

function AppLeftRail() {
  const view = useApp((s) => s.view);
  const go = useApp((s) => s.go);
  const tier = useTier();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 hidden w-16 flex-col border-r border-border bg-surface md:flex"
      aria-label="Primary"
    >
      <button
        type="button"
        onClick={() => go('landing')}
        className="flex h-14 min-h-[44px] w-full items-center justify-center border-b border-border"
        aria-label={`Back to ${COMPANY_NAME} home`}
      >
        <LogoCompact />
      </button>
      <nav className="flex flex-1 flex-col gap-1 p-2" aria-label="App">
        {APP_NAV.map((item) => {
          const active = view === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => go(item.view)}
              className={cn(
                'group relative flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-md py-2 text-[10px] font-medium transition-colors duration-hover',
                active
                  ? 'bg-brand-subtle text-brand'
                  : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
              )}
              title={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
        {/* Superadmin-only entry — renders nothing for normal users. Backend
            /admin/* remains protected by requireSuperAdmin() server-side. */}
        <SuperadminLink />
      </nav>
      <div className="border-t border-border p-2">
        <div className="flex flex-col items-center gap-1.5 py-2">
          <StatusPill variant={tier === 'free' ? 'draft' : 'paid'}>
            {tierLabel(tier)}
          </StatusPill>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => go('pricing')}
            className="h-7 px-2 text-[10px] text-ink-muted hover:text-ink"
          >
            Upgrade
          </Button>
        </div>
      </div>
    </aside>
  );
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────────

function MobileTabBar() {
  const view = useApp((s) => s.view);
  const go = useApp((s) => s.go);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border bg-surface md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Primary mobile"
    >
      {APP_NAV.map((item) => {
        const active = view === item.view;
        const Icon = item.icon;
        return (
          <button
            key={item.view}
            type="button"
            onClick={() => go(item.view)}
            className={cn(
              'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors duration-hover',
              active ? 'text-brand' : 'text-ink-muted'
            )}
            aria-current={active ? 'page' : undefined}
          >
            <div className="flex flex-col items-center gap-0.5">
              <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
              {active && (
                <span className="block size-1 rounded-full bg-brand" aria-hidden="true" />
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────

function AppFooter({ marketing }: { marketing: boolean }) {
  const go = useApp((s) => s.go);
  const view = useApp((s) => s.view);

  // On mobile app views the bottom tab bar handles navigation, so the long
  // footer is hidden — content gets pb-16 so the last items clear the bar.
  // Marketing views always show the footer; desktop app views show it too.
  return (
    <footer
      className={cn(
        'mt-auto border-t border-border bg-canvas',
        marketing ? 'block' : 'hidden md:block'
      )}
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-4 py-4 text-[12px] text-ink-muted md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-wrap items-center gap-1">
          <Logo
            variant="compact"
            withWordmark={false}
            style={{ width: 16, height: 16 }}
            aria-label={COMPANY_NAME}
          />
          <DotSeparator />
          <span className="text-ink">{BRAND_TAGLINE}</span>
          <DotSeparator />
          <span>Figures are estimates, not financial advice.</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {view !== 'landing' && (
            <button
              type="button"
              onClick={() => go('landing')}
              className="min-h-[44px] px-2 py-1 hover:text-ink"
            >
              Home
            </button>
          )}
          <DotSeparator />
          <Link
            href="/pricing"
            className="min-h-[44px] px-2 py-1 hover:text-ink"
          >
            Pricing
          </Link>
          <DotSeparator />
          <Link
            href="/methodology"
            className="min-h-[44px] px-2 py-1 hover:text-ink"
          >
            Methodology
          </Link>
        </div>
      </div>
    </footer>
  );
}

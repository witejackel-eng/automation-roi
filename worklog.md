---
Task ID: 1
Agent: main
Task: Clone and set up the automation-roi project from GitHub

Work Log:
- Cloned the repository from https://github.com/witejackel-eng/automation-roi
- Analyzed the full project structure: Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma SQLite, Zustand, Framer Motion, Recharts
- Copied all source files (88 new files) into /home/z/my-project:
  - src/lib/ (calculations, pdf, validation, brand, entitlement, store, format, etc.)
  - src/components/ (views, calculator, charts, marketing, viableo, ui)
  - src/hooks/
  - src/app/ (api routes, marketing pages, share pages)
  - prisma/schema.prisma
  - public/ (fonts, favicon, logo)
  - scripts/
- Installed missing dependencies: @fontsource/ibm-plex-mono, @fontsource/ibm-plex-sans, @fontsource/inter, @react-pdf/renderer, @swc/helpers, motion
- Pushed Prisma schema to SQLite database (Organization, Project, Report, Share, License models)
- Added missing site.webmanifest file
- Ran lint check - passed with no errors
- Started dev server and verified compilation:
  - GET / 200 (page renders correctly, 104KB HTML)
  - GET /api/entitlement 200 (API working)
  - Prisma queries executing correctly
  - Page title: "Viableo — Automation ROI | Know what's worth building."

Stage Summary:
- Project fully cloned and operational in /home/z/my-project
- All 88 source files copied, dependencies installed, database configured
- Page renders correctly with Viableo branding and all key components
- Dev server running on port 3000
- Ready for development work

---
Task ID: 2
Agent: main
Task: Hero section redesign — bold visual improvements

Work Log:
- Read and analyzed the full HeroSection + HeroVerdictMock implementation in landing-view.tsx
- Read motion-primitives.tsx, marketing-primitives.tsx, marketing-shell.tsx, globals.css
- Made bold changes to HeroSection in landing-view.tsx:
  1. Headline: Replaced mkt-display (clamp 2.75rem→6.5rem) with inline clamp(3.25rem,9.5vw,8.5rem), font-extrabold, leading-[0.88], tracking-[-0.045em]
  2. Eyebrow: Changed dot from bg-ink-muted to bg-brand (coral accent)
  3. Background: Replaced single faint gradient with two-layer ambient depth (charcoal 5.5% + coral 1.8% warm wash)
  4. Stagger: Increased staggerChildren 0.09→0.11, delayChildren 0.12→0.15, rise distances 14→18px, headline 18→24px
  5. Card entrance: Added scale:0.97→1 animation, increased y:24→32, delay 0.42→0.5, duration 0.7→0.8
  6. Card hover: Increased y:-4→-6 lift
  7. Spacing: py-24/py-40→py-28/py-44, gap-12/gap-16→gap-16/gap-20, grid cols 1.1fr/0.9fr→1.15fr/0.85fr
  8. Subcopy: Increased 17px/19px→18px/20px, mt-8→mt-9
  9. CTAs: Increased mt-10→mt-11, primary hover y:-1.5→y:-2, secondary x:2→x:3
- Made bold changes to HeroVerdictMock in landing-view.tsx:
  1. New CSS class: hero-verdict-card (replaces mkt-verdict-mock) with multi-layer shadow
  2. Max-width: 380px→400px, padding p-7/p-8→p-8/p-9
  3. Header dot: bg-ink-faint→bg-brand/40 (coral tint)
  4. Annual figure: clamp(2.25rem,5vw,3rem)→clamp(2.5rem,5.5vw,3.25rem)
  5. Supporting figures: text-[18px]→text-[20px], gap-4→gap-5
  6. Payback text: text-[13px]→text-[14px] font-medium
- Added .hero-verdict-card CSS in globals.css:
  - Resting: 4-layer shadow (contact + ambient + wash + deep), 1px border, 16px radius
  - Hover: 5-layer shadow (deepest in system) + faint coral ring glow (0 0 0 1px rgba(255,22,75,0.06))
- Enhanced HeroStat: clamp(2.5rem,5vw,3.5rem)→clamp(2.75rem,5.5vw,3.75rem)
- All changes verified: lint passes, page renders 104KB+ with all new elements confirmed in HTML

Stage Summary:
- Hero headline is now significantly more dominant (30% larger at desktop, extra-bold, tighter leading)
- Business case card has premium multi-layer shadow with deep hover state + coral ring glow
- Staggered entrance animations are more dramatic (larger rises, longer stagger, scale entrance on card)
- Hero background has two-layer ambient depth (charcoal warmth + coral wash)
- Spacing is more commanding throughout the hero
- Eyebrow dot changed to coral accent for the one sanctioned color moment
- All changes confined to Hero section only — no other sections touched

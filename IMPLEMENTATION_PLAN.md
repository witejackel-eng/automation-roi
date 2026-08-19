# Viableo — Implementation Plan (Phase 2 deliverable)

Reference: `Viableo — Final Research, Strategy, and ZAI Implementation Prompt.md`
(Part 5, EXECUTION ORDER — PHASES 0 THROUGH 13).

Worktree: `/home/z/my-project` (automation-roi brought up as the running project on :3000).
Baseline (Phase 1, recorded honestly per mandate §"Limitation you must respect"):
- `bun run lint` → **0 errors** (eslint.config.mjs disables `react-hooks/exhaustive-deps` + `react-hooks/purity`; the set-state-in-effect pattern in count-up.tsx/breaking-point-slider.tsx is NOT flagged. Underlying pattern still fixed per P0-12.)
- `bunx tsc --noEmit` → **23 errors** (all third-party: @react-pdf `Style` vs `CSSProperties` 15, next-auth `AuthOptions` 5, recharts `ContentType` 2, `SessionProviderProps` 1). Hidden by `next.config.ts ignoreBuildErrors: true` (line 41). Zero in calculations/brand/format/marketing.
- `bun run test` → **6 files / 40 tests pass** (1.17s).
- Apex numbers independently recomputed — all match mandate §N exactly.
- Live-verification discrepancies (mandate says "what you find wins — say so explicitly"):
  - **P0-1 blank body does NOT reproduce in dev SSR** (Next dev server-renders client components → 631 words). The defect IS real for `next build` production (`useSearchParams()` + `<Suspense>` triggers CSR bailout → empty static body). Route split is still the correct fix.
  - `/r/example` → 404 locally (live was 500). Either way broken.
  - `/app` → 404 locally (live was 307→signin). Either way a dead end — no `src/app/app/**` routes exist.

## Route split (P0-1, P0-11)

| Route | Type | Contents |
|---|---|---|
| `/` | **server component** | New E1–E13 marketing homepage. Metadata + JSON-LD + all narrative as server HTML. Small client islands only where interaction is genuine (none required for v1 — `BreakingPointSlider` optional, static fallback mandatory). |
| `/start` | client component | The existing `HomeContent` view-switcher, moved verbatim from `src/app/page.tsx`. Keeps `?start=1` (auto-launch calculator) and `?example=apex` (pre-fill Apex inputs). Not gated by middleware. |

Every homepage CTA becomes `<Link href="/start?start=1">` or `<Link href="/start?start=1&example=apex">`. `marketing-primitives.tsx` `PrimaryCTA`/`SecondaryCTA` hrefs → `/start?start=1`. `marketing-shell.tsx` footer Product links → `/start?start=1`.

## File-by-file change list

### New files
- `src/components/viableo/threshold-line.tsx` — server-renderable SVG, scales `hero`/`divider`/`inline`. Required props `thresholdLabel`/`positionLabel` (no defaults). No `'use client'`.
- `src/lib/pdf/threshold-line.tsx` — `@react-pdf` `View`-primitive variant for client reports.
- `src/components/marketing/sections/` — E1..E13 section server components (Hero, Problem, Consequence, WhatViableoDoes, Verdict, BreakIt, ClientReport, Proof, WhereItFits, Comparison, Pricing, Close). Replaces the 1,531-line `landing-view.tsx` marketing narrative on `/`.
- `src/app/start/page.tsx` — moved `HomeContent` (verbatim client view-switcher).
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` — real content, 200.
- `src/lib/calculations/__tests__/recommendation.test.ts`
- `src/lib/calculations/__tests__/stress-test.test.ts`
- `src/lib/calculations/__tests__/confidence.test.ts`
- `src/lib/calculations/__tests__/scenarios.test.ts`
- `src/lib/calculations/__tests__/marketing-numbers.test.ts` — the guard test: asserts displayed homepage numbers equal engine-computed values.

### Modified files
- `src/lib/brand.ts` — `PRICING_TIERS` → one-time $0/$39-per-case/$249/$499; new E1–E13 copy constants per section F; fix `PROBLEM_HEADLINE` divergence; correct `DECISION_COLORS` ratio comments (5.48/4.71/6.61); trim `NAV_LABELS` (drop calculator/projects/reports/settings); trim `COMPARISON_ROWS` to scarce-only rows; add `DATA_HANDLING_LINE`.
- `src/app/globals.css` — re-point verdict vars to brand.ts hexes (#0D6B3F/#8B5E0A/#9B0A2E); `--color-ink-faint` → #635F6B; add `--color-brand-cta`/`--color-brand-cta-hover` (#B70F38/#8F0526); add dark-surface verdict tints; footer/muted text fixes; remove `.reveal-on-scroll`/`.hero-rise` from reduced-motion block.
- `src/app/page.tsx` — rewrite as server component rendering `<MarketingShell>{E1..E13 sections}</MarketingShell>` + metadata + JSON-LD.
- `src/app/layout.tsx` — wrap children in `<MotionConfig reducedMotion="user">`.
- `src/components/viableo/count-up.tsx` — use `useReducedMotion()` from `motion/react`; render final value immediately when reduced; restructure to avoid setState-in-effect.
- `src/components/views/landing-view.tsx` — fix P0-2..6 hardcoded numbers (replace `27400`/`60+`/`STRESS_SHIFT_ROWS`/`SENSITIVITY_ROWS`/`STRESS_MOCK_SLIDERS` with engine-derived values); convert `<motion.button onClick>` CTAs to `<Link>`. (LandingView stays as the /start `view==='landing'` fallback; numbers fixed so `grep -r 27400 src/` is empty.)
- `src/components/views/pricing-view.tsx` — match `brand.ts` tiers exactly; working CTAs (Free→`/start?start=1`, paid→mailto/contact until Whop URLs verified).
- `src/app/(marketing)/pricing/page.tsx` — JSON-LD `offers` + meta description match the cards.
- `middleware.ts` — remove `/app` from the gated set; redirect `/app` → `/start` (no `/app/**` routes exist to land on).
- `src/app/r/[shareId]/page.tsx` — handle invalid `shareId` with 404 (not 500).
- `next.config.ts` — keep `ignoreBuildErrors: true` but add a comment listing exactly the 23 third-party mismatches it hides (per acceptance criterion #30).
- `src/lib/calculations/stress-test.ts` — fix the JSDoc example at line 159 (`$27,400` → real Apex figure or non-numeric).

### Untouched (per mandate §N "Do not touch")
- `prisma/`, `src/app/api/**`, `src/app/admin/**`, `src/lib/auth.ts`, the webhook receiver, the calculation logic itself. **The engine is correct. The marketing surface is what misreports it.**

## Execution order within Phase 3 (P0)

1. `brand.ts` + `globals.css` token updates (foundational — everything else references them).
2. `threshold-line.tsx` component (needed by homepage sections).
3. Route split: `/start/page.tsx` (moved HomeContent) + new `/` server homepage rendering E1–E13 sections.
4. Number fixes P0-2..6 (by construction in the new homepage; also fixed in old LandingView for /start fallback + grep cleanliness).
5. Pricing consistency P0-7/8 + working CTAs P0-9.
6. `/app` dead-end P0-10 (middleware).
7. CTA contrast P0-11 (globals.css).
8. Reduced motion P0-12 (layout.tsx MotionConfig + count-up fix + dead CSS removal).
9. Broken routes P0-13 (/privacy, /terms, /r/example).
10. 5 test suites — written in Phase 3 (not deferred). Gate: `bun run test` must pass with the new suites and `/` must server-render ≥500 words before proceeding to Phase 4.

## Phases 4–13

- **Phase 4 (IA):** E1–E13 section components extracted; `ScenarioModeling`+`StressTestTeaser`+`SensitivityTeaser` merged into E6 "Break it on purpose"; Consequence (E3) + Proof (E8) added; one footer + one `Stepper`.
- **Phase 5 (copy):** every string from section F sourced via `brand.ts`; source links for every statistic; banned-word grep.
- **Phase 6 (visual):** single verdict palette, 7 token corrections, dark-surface tints, typography, tabular figures, measured contrast table.
- **Phase 7 (motif):** `threshold-line.tsx` at hero/divider/inline/PDF scales; replace every decorative divider.
- **Phase 8 (animation):** MotionConfig, CountUp reduced-motion, dead CSS gone; verify JS-disabled + reduced-motion in browser.
- **Phase 9 (demo):** extend real-value pattern from HeroVerdictMock/ReportPreview to all components; no interactive island with incomplete static fallback.
- **Phase 10 (pricing):** one price everywhere, working buttons, JSON-LD matching, only features gated in code.
- **Phase 11 (mobile):** 360/390/768/1024/1440px.
- **Phase 12 (QA):** section P item by item.
- **Phase 13 (gates):** lint, typecheck, test, build, verify:golden, certify; Agent Browser end-to-end verification.

## Open `[VERIFY BEFORE IMPLEMENTATION]` items

- Whop checkout URLs: repo-wide grep confirmed NONE exist. Paid-tier CTAs link to an honestly-labelled waitlist/contact route (mailto) until URLs are provided. Free tier → `/start?start=1`.
- `SITE_URL`/`sitemap.ts` declare `https://viableo.app`; local dev uses `http://localhost:3000`. Set `NEXT_PUBLIC_SITE_URL` per environment; sitemap will read it.
- Data-handling line ("Viableo needs no client-identifying data…"): confirmed true — `CalculatorInputs` is hours/rates/volumes/fee only, no PII. Ship the line.
- Free-tier feature gating ("watermarked document" vs "No PDF export"): resolve to "watermarked document" in both `brand.ts` and pricing-view.

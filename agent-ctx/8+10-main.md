# Task 8+10 — Agent: main

## Summary
Hero instrument panel + chart language unification + OG image + engine hardening — all 6 subtasks completed.

## Key Changes
1. **Hero Instrument Panel**: Replaced HeroVerdictMock white card with dark analytical Decision Instrument Panel showing annual benefit, ROI, payback, BUILD verdict, and confidence bar. Uses `hero-instrument-panel` CSS class with dot-grid background pattern.
2. **Hero Dot Matrix**: Added faint analytical dot-grid to hero section background.
3. **Chart Language**: Both roi-bridge.tsx and scenario-comparison.tsx now use thin grids (strokeWidth:1, no dash), monospace labels, and Viableo semantic colors (coral=brand, indigo=secondary, emerald=positive, crimson=negative).
4. **Stress Test Bars**: ThresholdCardWithBar shows current vs threshold with "STILL VIABLE"/"DECISION BREAKS" semantic labels.
5. **OG Image**: Generated /public/og-image.png (1200×630, dark charcoal + coral), updated layout.tsx metadata.
6. **Engine Guards**: validateInputs() checks finite/non-negative/percentage bounds, throws descriptive errors.

## Files Modified
- `src/components/views/landing-view.tsx` (HeroVerdictMock → Instrument Panel, hero dot-matrix, confidence imports)
- `src/app/globals.css` (hero-verdict-card → hero-instrument-panel CSS)
- `src/components/charts/roi-bridge.tsx` (chart language unification)
- `src/components/charts/scenario-comparison.tsx` (chart language unification)
- `src/components/viableo/stress-test-section.tsx` (ThresholdCardWithBar)
- `src/lib/calculations/engine.ts` (validateInputs defensive guards)
- `src/app/layout.tsx` (OG image metadata)
- `public/og-image.png` (new, generated with PIL)

## Verification
- `bun run lint` — zero errors
- Dev server GET / 200

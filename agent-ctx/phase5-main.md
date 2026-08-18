# Phase 5 Implementation Summary

## Task ID: Phase 5
## Agent: main

## All Changes Made

### 5.1 Information Architecture
- **wizard stepper** (`src/components/calculator/stepper.tsx`): Renamed step nouns from data-model terms to job-oriented terms:
  - "Business" → "Describe the automation"
  - "Revenue" → "What would it earn?"
  - "Automation" → "What does it cost today?"
  - Added overall product flow comment (decision-first hierarchy)
- **wizard** (`src/components/calculator/wizard.tsx`): Updated STEP_TITLES to match new job-oriented names; "Review your assumptions" → "Review your case"
- **summary-step** (`src/components/calculator/steps/summary-step.tsx`): Updated SummaryGroup titles to match new names
- **viableo stepper** (`src/components/viableo/stepper.tsx`): Reframed PRIMARY_STEPS from feature list to Decision → Business Case → Proposal → Approved flow; promoted Decision to position 0 (was position 2)
- **brand** (`src/lib/brand.ts`): Updated PRODUCT_STEPS to Decision-first hierarchy

### 5.2 Homepage Changes
- **Single visually dominant CTA** (`landing-view.tsx`): Demoted secondary CTA from link-underline style to ghost pill (smaller text-[13px], border, rounded-full, min-h-[40px])
- **Sharpened problem section** (`lib/brand.ts`): Changed PROBLEM_HEADLINE from "A good idea isn't a business case." → "Clients don't trust agency-generated numbers."; Updated PROBLEM_BODY to focus on client distrust of agency numbers
- **Reframed "How it works"** (`src/components/viableo/stepper.tsx`): Changed from "Automation idea → Financial analysis → Viableo Decision → Client business case" to "Viableo Decision → Business Case → Proposal → Approved"
- **Strengthened decision-system section** (`landing-view.tsx`): Increased DecisionFramework padding (py-28→py-36, md:py-36→md:py-48), margin (mb-16→mb-20), card gaps (gap-6→gap-8, md:gap-8→md:gap-10), stagger delay (0.08→0.1)
- **Plain-English breaking-point one-liner** (`landing-view.tsx`): Added bullet point: "The breaking point is the exact value where your recommendation changes from BUILD to DON'T BUILD."
- **Comparison table "Generic ROI calculator" row** (`lib/brand.ts`): Added genericRoi field to all COMPARISON_ROWS; added new row "Stress-test & breaking point"; updated comparison-table.tsx with new "ROI calculator" column

### 5.3 Visual System
- **Typography enforcement** (`layout.tsx`): Added IBM_Plex_Sans font with --font-plex-sans variable; Applied to body className
- **Typography enforcement** (`globals.css`): Changed --font-display from var(--font-inter) to var(--font-plex-sans), var(--font-inter) fallback; Updated font comment
- **Surface system** (`globals.css`): Added .surface-editorial and .surface-editorial-raised CSS classes for warm editorial light surfaces
- **Brand signatures** (`globals.css`): Added .brand-signature-meter, .brand-signature-confidence, .brand-signature-verdict, .brand-signature-datagrid CSS classes in priority order
- **Motion discipline** (`globals.css`): Enhanced prefers-reduced-motion block with explicit animation: none for reveal-on-enter, reveal-on-scroll, hero-rise, dot-drop, count-pulse, stepper-line-draw

### 5.4 Mobile
- **Sticky top bar** (`results-view.tsx`): Added mobile-only sticky top bar showing DecisionBadge + net annual benefit + ROI + payback; md:hidden; z-30; backdrop-blur; aria-live="polite"
- **Collapsible assumptions** (`results-view.tsx`): Added progressive disclosure wrapper around AssumptionsTable
- **Stress-test slider** (`breaking-point-slider.tsx`): Increased slider height from h-3 to h-[44px] for min 44px touch targets; made container w-full; updated breaking point text to plain-English one-liner
- **Client share view** (`share-report-view.tsx`): Made approval buttons mobile-first with w-full sm:w-auto, min-h-[48px], larger text-[15px] font-semibold, larger icons size-5

### 5.5 Accessibility
- **Keyboard navigation**: Wizard already tab-reachable via standard form elements; stepper buttons already have type="button" and keyboard handling
- **Decision not color-only** (`decision-badge.tsx`): Changed symbol from aria-hidden="true" to role="img" with aria-label="${decision} indicator" — ensures shape/symbol is communicated alongside text label
- **ARIA live regions** (`results-view.tsx`): Added aria-live="polite" on decision cross-fade div; Added role="status" on N/A and "Never" fallback financial figures
- **ARIA live regions** (`scenario-slider.tsx`): Added aria4aria-live="polite" on radiogroup container
- **ARIA live regions** (`wizard.tsx`): Changed error banner from aria-live="polite" to aria-live="assertive" for immediate screen reader notification
- **prefers-reduced-motion** (`globals.css`): Enhanced media query with explicit animation resets for all motion classes
- **role="status"** (`results-view.tsx`): Added to mobile sticky bar financial figures and hero figure fallback values

## Lint Status
- `bun run lint` passed with no errors

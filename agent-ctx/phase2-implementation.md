# Phase 2 Implementation Summary

## 2.1 Share-link engagement tracking

### Files created:
- `src/app/api/share/[shareId]/event/route.ts` — POST handler that creates ShareEvent records. Validates shareId format (24 hex chars), checks share not revoked/expired. Records eventType, section, value, metadata. On first 'view' event, updates Share's decisionState from 'sent' to 'viewed'.
- `src/app/api/share/[shareId]/engagement/route.ts` — GET handler that returns engagement summary (viewCount, firstViewed, lastViewed, sectionBreakdown, totalTimeOnPage, decisionState). Requires auth + org ownership.

### Files modified:
- `src/components/views/share-report-view.tsx` — Added engagement tracking:
  - On mount, sends POST to `/api/share/[shareId]/event` recording a 'view' event
  - Tracks section scroll depth using IntersectionObserver on 4 sections (Verdict, Scenarios, Comparison, Assumptions)
  - Tracks time-on-page with beforeunload handler using navigator.sendBeacon
  - Added `id` attributes to section elements for IntersectionObserver targeting
- `src/lib/store.ts` — Added `ShareEngagement` interface and `shareEngagement` field to `SavedProject`
- `src/app/api/projects/route.ts` — Updated GET to include share engagement data (viewCount, lastViewed, decisionState) from the most recent non-revoked share
- `src/components/views/projects-view.tsx` — Added engagement display next to decision pill: "Client opened X times · last viewed Y ago" with Eye icon. Added `relativeTime()` helper for human-readable relative timestamps.

## 2.2 Client approval action

### Files created:
- `src/app/api/share/[shareId]/approve/route.ts` — POST handler that creates ShareApproval records. Accepts action ('approve' | 'request_changes'), name (required), email (optional), comment (optional). Updates Share's decisionState to 'approved' or 'changes_requested'. Also records an 'approval' ShareEvent for the engagement timeline. No auth required — frictionless for the client.

### Files modified:
- `src/components/views/share-report-view.tsx` — Added approval section after assumptions:
  - "Your decision" callout with "Approve" and "Request changes" buttons
  - Inline form: name (required), email (optional), comment (optional)
  - Submit to POST `/api/share/[shareId]/approve`
  - Success state shows confirmation with CheckCircle2 icon
  - No account required for the client

## 2.3 Next steps in PDF output

### Files modified:
- `src/lib/pdf/client-report.tsx` — Added "Recommended Next Steps" page (page 8 of 9):
  - Import `computeSensitivity` and `SensitivityItem` from stress-test module
  - Compute sensitivity at render time to identify top driver
  - BUILD: Scope confirmation, Approval, Implementation guidance
  - CONSIDER: Validate assumptions (cites top driver), Pilot recommendation
  - DON'T BUILD: What would change (cites top driver + improvement %), Revisit guidance
  - Updated total page count from 8 to 9

## 2.4 Ranked drivers callout

### Files modified:
- `src/components/views/results-view.tsx` — Added `TopDriversCallout` component after StressTestSection:
  - Shows top 3 sensitivity items ranked by impact
  - Numbered list with sensitivity level color coding (high=red, medium=amber, low=green)
  - Shows ±Xpp ROI for each driver
  - Summary text: "These assumptions move the verdict the most. Confirm them before committing."
  - Added imports for `computeSensitivity`, `CalculatorInputs`, `cn`
- `src/lib/pdf/client-report.tsx` — Added top drivers callout in the Scenario Analysis page (page 6):
  - "Top drivers of this outcome" section after the scenario table
  - Numbered list with ±Xpp ROI, color-coded by sensitivity level
  - Summary text matching the web view

## 2.5 Reconcile stress-test claim

### Analysis:
The original `computeSensitivity` varies 4 levers individually at ±20%, producing only 8 permutations. The "50+ assumption permutations" claim was overstated.

### Solution: Expanded the engine to genuinely produce 64 permutations

### Files modified:
- `src/lib/calculations/stress-test.ts` — Added multi-lever permutation engine:
  - `MULTI_LEVER_KEYS`: 4 material levers with conservative/upside multipliers matching the scenario engine (automation: 0.65×/1.25×, costs: 0.8×/1.2×, conversion: 0.65×/1.5×)
  - `PERMUTATION_COUNT = 64`: documented constant
  - `PermutationResult` interface: label, multipliers, roiPct, netAnnualBenefit
  - `computeMultiLeverPermutations()`: generates all permutations by varying combinations:
    - Single-lever: 4 × 2 = 8
    - Two-lever: C(4,2) × 4 = 24
    - Three-lever: C(4,3) × 8 = 32
    - Total: 64 unique permutations (exceeds 50+)
  - Updated module docstring with permutation breakdown
- `src/components/views/landing-view.tsx` — Updated marketing copy from "50+ assumption permutations" to "60+ assumption permutations — varying individual levers and multi-lever combinations" to accurately describe the engine
- Searched all src/ for "50+" and "permutations" references — only found the landing-view.tsx instance (now updated)

## Lint status
Zero errors, zero warnings.

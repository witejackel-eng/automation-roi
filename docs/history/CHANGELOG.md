# CHANGELOG.md

## Phase 1 — Foundations

### 1.1 Real authentication and multi-tenancy
- Wired up NextAuth v4 with GitHub OAuth + dev credentials provider
- Added User, Account, Session, Membership, VerificationToken models to Prisma schema
- Created tenant-scoped data access layer (`src/lib/tenant.ts`) — all tenant queries go through `tenant(orgId)`
- Replaced all `getDemoOrganization()` / `DEMO_ORG_ID` calls with `requireOrg()` + tenant-scoped queries
- Created sign-in page at `/auth/signin`
- Created AuthProvider component wrapping app with SessionProvider
- Updated seed script to create real user + organization + membership

### 1.2 Kill entitlement bypass
- Removed `setDemoTier()` from session.ts
- Removed all client-side tier mutation paths
- Added server-side `assertEntitlement(orgId, capability)` guard
- Applied entitlement guard to every gated API route
- `/api/entitlement/set` now requires auth + owner role

### 1.3 Decision-color saturation fix
- Deepened all three verdict colors for higher contrast and visual authority
- DON'T BUILD now reads with the same visual weight as BUILD
- Added matching borders to DecisionBadge
- All text-on-bg combinations pass WCAG AA (≥4.5:1)
- Established three semantically separate color roles: Verdict, UI Accent, Brand Accent
- Added `UI_ACCENT` and `ANALYTICAL_SURFACE` token exports from brand.ts

### 1.4 Distributed rate limiting
- Installed @upstash/ratelimit + @upstash/redis
- Replaced in-memory limiter with Upstash Redis sliding window
- Falls back to in-memory limiter if Redis is not configured
- Fails open with structured logging if Redis is unreachable
- Updated calculate API to use async `checkRateLimit()`

### 1.5 Operational verification
- Created `src/lib/env.ts` with startup env validation
- Updated `.env.example` with all required/optional vars
- Documented NEXTAUTH_SECRET, GITHUB_ID, GITHUB_SECRET, UPSTASH vars

## Phase 2 — Close the Loop

### 2.1 Share-link engagement tracking
- Created ShareEvent model in Prisma schema
- Created `POST /api/share/[shareId]/event` endpoint
- Created `GET /api/share/[shareId]/engagement` endpoint
- Updated share view to track views, section scroll depth, time-on-page
- Share decisionState transitions: sent → viewed on first view
- Engagement summary shown in projects view

### 2.2 Client approval action
- Created ShareApproval model in Prisma schema
- Created `POST /api/share/[shareId]/approve` endpoint
- Added Approve / Request changes buttons to share view
- Frictionless: no account required, just name + optional email/comment
- Share decisionState transitions: viewed → approved | changes_requested

### 2.3 Next steps in PDF output
- Added "Recommended Next Steps" section to client-report.tsx
- BUILD → scope confirmation, implementation timeline, approval ask
- CONSIDER → validate specific assumptions first, pilot recommendation
- DON'T BUILD → what would need to change, when to revisit

### 2.4 Ranked drivers callout
- Added "Top drivers of this outcome" callout to results view
- Added same callout to PDF report
- Shows top 3 sensitivity items with color-coded impact levels

### 2.5 Reconcile stress-test claim
- Expanded stress-test engine with `computeMultiLeverPermutations()`
- 64 genuine permutations (8 single + 24 two-lever + 32 three-lever)
- Updated marketing copy to "60+ assumption permutations"
- Exported `PERMUTATION_COUNT = 64` constant

## Phase 3 — Differentiate

### 3.1 Breaking-Point Slider (signature interaction)
- New `BreakingPointSlider` component
- Drag any assumption until verdict changes BUILD → CONSIDER → DON'T BUILD
- 60fps with requestAnimationFrame throttling
- Keyboard accessible (Arrow=1%, Shift+Arrow=5%)
- ARIA live-region announcements
- Exact breaking point labeled with plain-English explanation
- Mobile: full-width touch control, 44px hit targets

### 3.2 Confidence, Explained
- New `ConfidenceExplained` component
- Qualitative bands: LOW (0-39), MODERATE (40-59), HIGH (60-100)
- Interactive: upgrade inputs from assumption → estimated → provided
- Plain-language rationale always paired with score
- No false precision — rounded to whole number

### 3.3 Verdict Reveal
- New `VerdictReveal` component with count-up on confidence, ROI, net benefit
- Respects prefers-reduced-motion

### 3.4 Recurring-economics-first view
- New `RecurringEconomicsView` component
- Monthly recurring benefit vs cost comparison
- Monthly net benefit with annualized run rate
- First-class view section

### 3.5 Platform/API cost as distinct input
- Added `platformApiCost` to CalculatorInputs, engine, validation, wizard
- Labeled: "Ongoing platform/API cost (Zapier, Make, n8n task costs)"
- Own confidence status in the model
- Included in stress test and assumptions

### 3.6 Client history reuse
- New `ClientHistoryReuse` component
- Reuse from prior client dropdown (when org has existing projects)
- Pre-fills wizard with prior project inputs
- Gated by `client_history` capability

## Phase 4 — AI, Narrowly and Honestly

### 4.1 Top risks summary
- `POST /api/ai/risks` — grounded in stress-test sensitivity data
- `AiRisksSummary` component with loading, display, regenerate

### 4.2 AI-assisted input estimation
- `POST /api/ai/estimate` — suggests ranges by industry/role
- All values auto-tagged as `assumption` (0.3× confidence multiplier)
- `AiInputEstimator` component with "Use typical value" button

### 4.3 AI-drafted narrative sections
- `POST /api/ai/narrative` — strictly templated from structured inputs
- Double-pass banned buzzword scrubbing
- `AiNarrativeDraft` component with editable textareas

### 4.4 DO NOT BUILD
- No conversational chatbot for wizard input
- No separate AI confidence score

## Phase 5 — Surface

### 5.1 Information architecture
- Renamed wizard steps to job-oriented language
- Decision promoted above Business Case in hierarchy

### 5.2 Homepage
- Single visually dominant CTA above fold
- Sharpened problem: "Clients don't trust agency-generated numbers"
- Reframed "How it works" as Decision → Business Case → Proposal → Approved
- Strengthened decision-system section visually
- Added breaking-point one-liner
- Added "Generic ROI calculator" to comparison table

### 5.3 Visual system
- IBM Plex Sans for headings, IBM Plex Mono for numbers, Inter for body
- Editorial surface classes for marketing/onboarding
- Brand signature CSS classes in priority order
- Enhanced prefers-reduced-motion resets

### 5.4 Mobile
- Sticky top bar with verdict + key figures on results view
- Progressive-disclosure assumption tables
- 44px touch targets on stress-test slider
- Thumb-reachable approval buttons on share view

### 5.5 Accessibility
- DecisionBadge: symbol role="img" with aria-label
- ARIA live regions on scenario switches and decision transitions
- role="status" on live-updating financial figures
- Full prefers-reduced-motion support
- Keyboard navigation on all interactive elements

## Phase 6 — Pricing Migration

- Moved from one-time to case-based hybrid model
- Free: 1 active case, full analytical rigor, watermarked PDF
- Pro: $29/mo, 5 cases/mo included, $9/case overage
- Agency: $79/mo, unlimited cases, multi-seat, client history
- Agency Pro: $790/yr, white-label, API/webhook, dedicated support
- Updated entitlement capabilities with new free-tier boundary
- Added `checkCaseLimit()` for case counting

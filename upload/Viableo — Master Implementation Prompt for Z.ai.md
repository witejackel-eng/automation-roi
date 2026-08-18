# VIABLEO — MASTER IMPLEMENTATION PROMPT (single pass)

> Paste this entire document as one prompt into Z.ai (GLM coding agent) with the repository attached/connected.

---

## 0. ROLE AND OPERATING MODE

You are a senior full-stack product engineer with design-systems and B2B SaaS experience. You are taking over an existing, working Next.js product and executing a complete, pre-researched transformation in **one continuous pass**.

Rules of engagement:

1. **Do not redesign from scratch.** This codebase is far more advanced than "a calculator." Read it first, then extend it. Preserve every existing strength listed in Section 2.
2. **Do not ask me clarifying questions.** Every decision you need has already been made below. Where a detail is genuinely unspecified, choose the option most consistent with the stated principles and record it in `DECISIONS.md`.
3. **Work in ordered phases** (Section 4). Do not start Phase 2 until Phase 1 typechecks, builds, and passes tests. Commit at the end of each phase with a conventional-commit message.
4. **Never break the decision engine's invariants.** Specifically: never recommend BUILD on negative net benefit; never let a confidence score below the gate produce a BUILD verdict.
5. **No new dependencies** unless explicitly named below or strictly required. Prefer what is already in `package.json`.
6. At the end, output a written report per Section 8.

---

## 1. PROJECT CONTEXT

**Product:** Viableo (currently shipping as "Automation ROI")
**Repo:** `https://github.com/witejackel-eng/automation-roi`
**Live:** `https://automation-roi-delta.vercel.app/`
**Stack (confirmed):** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Prisma 6, PostgreSQL (with a SQLite dev fallback), Vercel Blob, `@react-pdf/renderer`, Whop payments, Zustand, Recharts, `motion`, `bun`.

**What Viableo is becoming:** not an ROI calculator, but the **decision-and-proof platform** automation agencies use to decide, justify, sell, and stand behind an automation recommendation.

**Positioning statement to build toward:**
> For automation agencies and consultants who need client buy-in on automation investments, Viableo is the decision-and-proof platform that turns a raw automation idea into a stress-tested, client-ready business case in minutes — unlike generic ROI calculators or proposal tools, Viableo produces a defensible decision, not just a number.

**The three jobs every change must serve:**
- **PROBLEM** — know whether the automation is financially worth building.
- **EXPERIENCE** — messy idea → validated decision → client-ready business case.
- **CONVENIENCE** — compress spreadsheets, modeling, stress testing, report writing, proposal creation into one workflow.

**Core insight driving all of this:** the client is skeptical of agency-generated numbers by default. Viableo's value is not the number — it is the *visible reasoning, labeled uncertainty, and stress-testing behind* the number. A system that can say "DON'T BUILD" is more credible than one that always says yes. Protect that.

---

## 2. EXISTING STRENGTHS — PRESERVE, DO NOT REWRITE

Read and understand these before changing anything:

- `src/lib/calculations/engine.ts` — deterministic, null-safe financial formulas.
- `src/lib/calculations/confidence.ts` — weighted 7-input confidence model (weights 15/15/15/15/20/10/10; status multipliers provided 1.0 / estimated 0.6 / assumption 0.3).
- `src/lib/calculations/stress-test.ts` — algebraic break-even solves plus ±20% sensitivity ranking across 4 levers.
- `src/lib/calculations/recommendation.ts` — deterministic BUILD / CONSIDER / DON'T BUILD tree gated on confidence ≥ 60.
- `src/lib/pdf/client-report.tsx` (~535 lines) — multi-page business case in pyramid-principle order.
- `src/lib/pdf/proposal.tsx` (~223 lines) — separate proposal document.
- `Share` model + public `/r/[shareId]` route with `expiresAt` / `revokedAt`.
- `src/lib/brand.ts` — proprietary terminology (Viableo Analysis / Score / Scenarios / Decision / Business Case) and agency workflow naming (Discover → Prove → Propose → Close).
- Whop webhook handler at `/api/webhooks/whop` — HMAC-SHA256 with constant-time comparison, Zod validation, idempotency via unique `whopEventId`. **This is correct. Do not touch it.**
- Programmatic SEO pages: `/solutions/{zapier,make,n8n,automation}-agencies`, `/resources/automation-{business-case,cost,payback,roi}`.
- Banned-buzzword list already in code comments: `revolutionize`, `unlock the power of`, `cutting-edge`, `leverage`, `seamless`, `empower`, `game-changing`, `next-generation`, `robust`, `best-in-class`.

---

## 3. THE SIX PROBLEMS YOU ARE FIXING

1. **No real multi-tenancy.** `session.ts` hardcodes a single `DEMO_ORG_ID = 'org_apex_demo'`; all data belongs to one seeded demo org. `next-auth` is a dependency but wired up nowhere in `/src`. This blocks safely charging a second customer.
2. **Entitlements are bypassable.** A client-side `setDemoTier()` helper changes a user's tier with no verified payment.
3. **The journey stops one step short.** Nine of ten stages exist; there is no share-link engagement tracking and no client-side approve/request-changes action. The stated end goal — "get the automation approved" — has no product surface.
4. **Decision colors are too pale.** Current: emerald `#1F8A5A` on `#E7F4ED`, amber `#C98A1B` on `#FBF1E0`, crimson `#B70F38` on `#FBE9EE`. Right hues, wrong saturation and contrast. This is the highest visual-impact-to-effort fix in the product.
5. **In-memory rate limiting.** The Map-based 30 req/min/IP limiter on `/api/calculate` does not survive horizontal serverless scaling.
6. **A marketing claim outruns the mechanics.** The site advertises "50+ assumption permutations" while `stress-test.ts` performs algebraic break-even plus ±20% sensitivity. For a product whose entire trust mechanism is "we show our work," this mismatch is a liability.

---

## 4. EXECUTION PLAN — DO THESE IN THIS EXACT ORDER

### PHASE 1 — FOUNDATIONS (make it safe to have a second paying customer)

**1.1 Real authentication and multi-tenancy** *(P0, critical path)*
- Wire up real auth using **Auth.js (NextAuth v5)**, which is already a dependency. Email/magic-link plus at least one OAuth provider. Do not add Clerk unless Auth.js proves blocked — if you switch, document why in `DECISIONS.md`.
- Introduce a real `User` ↔ `Organization` membership model (a user may belong to one or more organizations, with a role: `owner` | `member`).
- Add `organizationId` to every tenant-owned Prisma model that lacks it. Enforce scoping **at the query layer** — create a single `getScopedPrisma(orgId)` / repository helper and route all tenant reads and writes through it. No raw `prisma.model.findMany()` on tenant data anywhere in `/src`.
- Add **Postgres row-level security** policies as defense-in-depth *beneath* the application checks, not instead of them. Include the migration SQL.
- Delete `DEMO_ORG_ID` and all hardcoded-org code paths. Keep the seed script, but make it seed a real org owned by a real seeded user.
- Write a migration that safely assigns existing demo data to the seeded organization.

**1.2 Kill the entitlement bypass** *(P0)*
- Remove `setDemoTier()` and every client-side tier mutation path.
- Entitlement tier must change **only** via a verified Whop webhook event, persisted server-side, and read server-side.
- Add a server-side `assertEntitlement(orgId, capability)` guard and apply it to every gated route, server action, and API handler. Client-side gating is presentation only and must never be the sole check.
- Preserve the existing ranked tier model (`free` < `pro` < `agency` < `agency_pro`) and existing capability flags (`multi_seat`, `client_history`, white-label, etc.).

**1.3 Decision-color saturation fix** *(P0, do in parallel — near-zero regression risk)*
- Deepen and saturate the three verdict colors; replace pastel tinted backgrounds with higher-contrast surfaces.
- **The DON'T BUILD state must read with the same visual authority as BUILD.** A system that visually softens its "no" undermines its own credibility.
- Verify WCAG AA contrast for all text-on-verdict-surface combinations.
- Introduce three **semantically separate** color roles and never mix them:
  - **Verdict colors** — emerald / amber / crimson. Used only for BUILD / CONSIDER / DON'T BUILD.
  - **UI accent** — indigo/cobalt family. Interactive elements: sliders, links, focus rings, active states.
  - **Brand accent** — Viableo coral. Logo and marketing surfaces only. Never in the decision system.
- Establish **deep analytical surfaces**: dark, data-dense panels for the decision and results experience; lighter warm editorial surfaces for marketing and onboarding.

**1.4 Distributed rate limiting** *(P1)*
- Replace the in-memory limiter with **Upstash Redis** (`@upstash/ratelimit` + `@upstash/redis`), sliding window, keyed by IP and, when authenticated, by organization.
- Fail open with structured logging if Redis is unreachable — never hard-fail a paying customer's calculation because the limiter is down.

**1.5 Operational verification** *(P2)*
- Confirm `BLOB_READ_WRITE_TOKEN` and all required env vars are documented in `.env.example` with a startup validation check that fails loudly on missing production vars.
- Remove or clearly quarantine the SQLite dev fallback so it can never be reached in production.

**Phase 1 exit criteria:** two separate seeded organizations cannot see or mutate each other's data under any route, entitlements cannot be changed from the client, decision colors pass AA, and the build is green.

---

### PHASE 2 — CLOSE THE LOOP (the journey's missing last mile)

**2.1 Share-link engagement tracking** *(P0)*
- On the public `/r/[shareId]` view, record: first view, view count, viewing timestamps, time-on-page, and section scroll depth.
- Store events in a `ShareEvent` model scoped to the owning organization. No third-party analytics SDK required — own the data.
- Surface this on the agency side as a clear timeline: "Client opened this 3 times · last viewed 2 hours ago · spent longest on Financial Impact."
- Respect the existing `expiresAt` / `revokedAt` logic. Do not track after revocation or expiry.

**2.2 Client approval action** *(P0)*
- Add explicit **"Approve"** and **"Request changes"** actions to the shared client view.
- Capture: name, email (optional), timestamp, optional comment. No account required for the client — this must stay frictionless.
- Add a `decisionState` to the share/case: `sent` → `viewed` → `approved` | `changes_requested`.
- Notify the agency owner in-app when state changes.

**2.3 "Next steps" in the output itself** *(P0, low effort)*
- Add an explicit **Recommended Next Steps** section to `client-report.tsx`, generated from the verdict:
  - BUILD → scope confirmation, implementation timeline, approval ask.
  - CONSIDER → which specific assumptions to validate first, and how.
  - DON'T BUILD → what would have to change for this to become viable.
- A decision memo without a stated next action defeats the entire purpose.

**2.4 Ranked drivers callout** *(P1)*
- `stress-test.ts` already computes sensitivity ranking. Surface the **top 3 drivers of this outcome** as an explicit callout in both the web results view and the PDF. This is a presentation change over existing data, not new math.

**2.5 Reconcile the stress-test claim** *(P0 — trust-critical)*
- Either genuinely expand the permutation count to substantiate "50+ assumption permutations," or rewrite the marketing copy to describe exactly what the engine does: break-even solves plus ranked ±20% sensitivity across four levers.
- **Prefer substantiating it** if the engine can be extended cheaply and deterministically. Do not fabricate. Document which path you chose.

**Phase 2 exit criteria:** an agency can send a case, see that the client opened it and where they lingered, and receive an approval — end to end.

---

### PHASE 3 — DIFFERENTIATE

**3.1 Signature interaction: the Stress-Test / Breaking-Point slider** *(P0 — this is the product's single most distinctive moment)*
- Elevate this into the flagship interaction. The user drags an assumption until the decision breaks, and the verdict visibly transitions BUILD → CONSIDER → DON'T BUILD in real time.
- Requirements: 60fps, sub-16ms recalculation (the engine is algebraic, so this is achievable), keyboard-accessible, live-region announcements for screen readers, clear labeling of the exact breaking point ("this stays viable until hourly cost assumption drops below $X").
- Add a one-line plain-English explanation of what "breaking point" means for first-time viewers.

**3.2 Signature interaction: Confidence, explained** *(P0)*
- Make the confidence score interactive: show which inputs are dragging it down, and let the user see confidence rise as they upgrade an input from `assumption` → `estimated` → `provided`.
- Always pair the number with a plain-language rationale sentence ("Strong on labor volume, relies on an estimated hourly cost").
- Never present false precision. Show the score alongside a qualitative band (LOW / MODERATE / HIGH).

**3.3 Verdict reveal** *(P2)*
- Extend the existing `count-up` component to the confidence score and ROI multiple on first reveal. Count-up on financial figures reinforces that a number was *computed*, not typed — directly serving the anti-"AI made it up" goal.
- Respect `prefers-reduced-motion` throughout.

**3.4 Recurring-economics-first view** *(P1)*
- Agencies increasingly sell retainers, not one-off builds. Make monthly recurring benefit vs. monthly recurring cost a **first-class view**, not a derivative of a one-time ROI snapshot. `recurringCost` already exists in the engine — build on it.

**3.5 Platform/API cost as a distinct, confidence-rated input** *(P1)*
- Zapier/Make/n8n task-based platform costs are a real client objection and a real post-sale credibility risk. Prompt for ongoing platform/API cost as its own labeled line item with its own confidence status. Do not bury it in a generic recurring-cost bucket.

**3.6 Client history reuse** *(P1, depends on Phase 1)*
- Let a new case auto-populate from a client's prior projects. This matches the already-defined `client_history` capability flag and is a genuine switching-cost lever.

---

### PHASE 4 — AI, NARROWLY AND HONESTLY

Build only these, in this order. Every AI output must be grounded in already-computed deterministic data and must be editable by the user.

**4.1 "Top risks to this decision" summary** *(P1 — highest value-to-effort AI feature in the product)*
- Summarize the existing stress-test sensitivity ranking into 2–4 plain-language risks. Grounded entirely in computed output, so generation risk is near zero.

**4.2 AI-assisted input estimation** *(P1)*
- Suggest plausible ranges for unknown inputs by industry/role. Every AI-suggested value must be written with `assumption` status so the existing confidence model automatically applies its 0.3x multiplier. The trust architecture handles the skepticism for you — use it.

**4.3 AI-drafted narrative sections** *(P2, tightly constrained)*
- Draft only the "current state" and "proposed automation" prose in `client-report.tsx`, strictly templated from structured inputs. No free-form generation. Always user-editable before export. Enforce the banned-buzzword list on output.

**4.4 DO NOT BUILD**
- **No conversational chatbot for wizard input.** A chatbot for structured numeric entry is a regression from a well-designed form and a known source of user error. Explicitly out of scope.
- **No separate "AI confidence" score.** It would contradict and dilute the existing calibrated confidence engine.

**Constraint:** AI generation must complete well within Vercel's 120-second proxied request timeout. If latency becomes material, use streaming or an async job pattern — do not let a PDF export hang.

---

### PHASE 5 — SURFACE: IA, HOMEPAGE, VISUAL SYSTEM, MOBILE

**5.1 Information architecture**
Implement this structure. Note the two amendments: Opportunity and Economics stay collapsed into one continuous guided flow, and Decision is promoted above Business Case in *perceived hierarchy* — the decision is the destination, the documents are exports of it.

```
Home (marketing)
├── Start an Analysis → Wizard (Idea → Opportunity/Economics → Assumptions)
│                            ↓
│                      Confidence Check
│                            ↓
│                      Scenarios & Stress Test
│                            ↓
│                      DECISION (BUILD / CONSIDER / DON'T BUILD)
│                            ↓
│                      Business Case ──→ Proposal
│                                            ↓
│                                      Share / Deliver → /r/[shareId]
│                                                            ↓
│                                                  Approve / Request changes
├── Projects (dashboard — requires auth)
├── Client History (requires auth)
├── Pricing
├── Solutions /solutions/{zapier,make,n8n,automation}-agencies
└── Resources /resources/automation-{business-case,cost,payback,roi}
```

Label wizard steps by the **job the user came to do** ("Describe the automation," "What does it cost today?"), never by the data model ("Business Inputs," "Revenue Parameters").

**5.2 Homepage**
Keep the existing structure — it already does several evidence-backed things right (concrete outcome headline, live worked example, visible pricing). Make these changes:
- Reduce to **exactly one visually dominant CTA** above the fold. Demote competing secondary CTAs.
- Sharpen the problem section toward the real problem: **clients don't trust agency-generated numbers** — not generic "ROI is hard to calculate."
- Reframe "How it works" around Decision → Business Case → Proposal → Approved.
- Strengthen the decision-system section visually (it is the highest-leverage differentiator on the page and is currently underplayed).
- Add a plain-English one-liner explaining "breaking point."
- In the comparison table, add a named "generic ROI calculator" row alongside the spreadsheet and generic-AI rows.
- Keep the PDF/report demo — letting a buyer see the literal deliverable before paying is strong proof.
- Keep pricing visible. Keep the Discover → Prove → Propose → Close vocabulary.

**5.3 Visual system**
- **Typography:** IBM Plex Mono for **all** numbers, percentages, currency, and confidence scores (tabular alignment, precision-instrument feel). IBM Plex Sans for headings and UI labels. Inter for long-form body copy. All three are already available.
- **Surfaces:** deep analytical dark panels for decision/results; warm editorial light surfaces for marketing/onboarding.
- **Motion:** purposeful only — count-up on computed figures, verdict state transitions, stress-test slider response. No decorative gradients, no ambient animation.
- **Brand signatures to invest in (pick these, in this order):** the stress-test breaking-point meter, the confidence indicator, the decision verdict badge/stamp, the analytical data-grid pattern.
- Convert the banned-buzzword list from a code comment into an **actual enforced lint rule** so it survives future contributors.

**5.4 Mobile**
Do not shrink the desktop layout. Specifically:
- Verdict, confidence score, and headline financial figures stay visible at all times.
- Detailed assumption tables collapse into progressive-disclosure cards.
- The stress-test slider becomes a full-width touch control with large hit targets and a persistent verdict readout above it.
- The PDF/report becomes a scrollable native preview, not an embedded PDF viewer.
- The client share view is **mobile-first** — clients will open it on a phone. Approval actions must be thumb-reachable.

**5.5 Accessibility** *(currently unaudited — treat as a real gap)*
- Full keyboard navigation on the wizard, sliders, and share view.
- Verdict must never be communicated by color alone — always pair with text and an icon/shape.
- ARIA live regions for dynamically recalculated values.
- WCAG AA contrast everywhere. Respect `prefers-reduced-motion`.

---

### PHASE 6 — PRICING MIGRATION

Move from one-time Whop purchases to a **hybrid, case-based** model. The value metric is a **case** (one full idea → decision → business-case run) — legible to a buyer who thinks in "how many client pitches this month," not seats or logins.

| Tier | Structure |
|---|---|
| Free | 1 active case, watermarked PDF, no share-link approval tracking |
| Pro | Low monthly subscription + included case credits, per-case overage |
| Agency | Monthly subscription, multi-seat, unlimited cases, client history, benchmarking |
| Agency Pro | Annual contract, white-label, API/webhook access, dedicated support |

**Free/paid boundary — important:** the free tier must keep the *analytical rigor* (confidence scoring and stress test). Gating those would make Viableo look like the generic calculators it is differentiating from. Gate the **client-facing outputs** instead: business-case PDF, proposal, share-link approval tracking, white-labeling.

Only ship this after Phase 1 entitlement enforcement is live and verified in production.

---

## 5. COPYWRITING RULES

- Banned, permanently: `AI-powered`, `transform your business`, `unlock`, `revolutionize`, `next-generation`, `cutting-edge`, `leverage`, `seamless`, `empower`, `game-changing`, `robust`, `best-in-class`, `streamline your workflow`.
- Voice: precise, intelligent, confident, commercially clear. Write like a good analyst, not a marketer.
- Lead with concrete outcomes and real numbers, never generic capability claims.
- Never overstate a mechanic. If the engine does algebraic sensitivity analysis, say that — do not imply Monte Carlo.
- Preserve the proprietary vocabulary in `src/lib/brand.ts` exactly. It is a moat lever, not filler.

---

## 6. HARD CONSTRAINTS

1. Never recommend BUILD on negative net benefit. Never bypass the confidence gate.
2. No tenant data access without an enforced `organizationId` scope.
3. No client-side entitlement authority, ever.
4. All AI output is grounded in computed data and user-editable before export.
5. Keep infrastructure lean: Vercel + Postgres + Vercel Blob + Upstash free/low tiers. No new paid services.
6. Do not modify the Whop webhook signature-verification logic — it is already correct.
7. Every phase must typecheck, build, and pass tests before the next begins.

---

## 7. TESTING REQUIREMENTS

- **Unit:** engine, confidence, stress-test, recommendation — including boundary cases (negative net benefit, confidence exactly at the gate, zero-volume, null inputs).
- **Tenancy isolation:** explicit tests proving org A cannot read or write org B's data on every tenant route.
- **Entitlements:** tests proving a free-tier org cannot reach gated capabilities via direct API call.
- **Integration:** full wizard → decision → PDF → share → approve happy path.
- **Webhook:** signature verification, replay/idempotency, malformed payloads.
- **Accessibility:** automated axe pass on the wizard, results, and share views.

---

## 8. REQUIRED OUTPUT WHEN YOU FINISH

Produce, in the repo:

1. `DECISIONS.md` — every judgment call you made, with reasoning. Especially: the auth library choice, and how you resolved the "50+ permutations" claim.
2. `MIGRATION.md` — exact steps to deploy this safely, including the data migration for existing demo records and required environment variables.
3. `CHANGELOG.md` — grouped by phase.
4. A final summary message covering: what shipped per phase, what you deliberately did not build and why, any place you disagreed with this prompt (with your reasoning), and the highest-risk part of the change set with a rollback plan.

---

## 9. THE PRINCIPLE TO HOLD ONTO

Viableo does not win by being the best calculator. It wins because it takes an automation idea and turns it into a decision an agency can **trust, explain, sell, and deliver** to a client.

Every change should make one of these three more true:
- **A decision the agency can trust.**
- **A business case the client can understand.**
- **An output the agency can deliver.**

If a change does not serve one of those, do not build it.

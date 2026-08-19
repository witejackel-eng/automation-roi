# DECISIONS.md

## Auth Library Choice
**Decision:** Used NextAuth v4 (Auth.js) instead of v5.
**Reason:** NextAuth v4 is already a stable dependency in the project (`next-auth@^4.24.11`). v5 is still in beta with breaking API changes. v4 provides all needed features (GitHub OAuth, JWT sessions, Prisma adapter) with proven Vercel deployment compatibility. Migration to v5 can happen when it reaches stable.

## "50+ Permutations" Claim
**Decision:** Substantiated by expanding the engine to genuinely produce 64 permutations.
**Reason:** Added `computeMultiLeverPermutations()` that varies combinations of 4 levers across conservative/upside multipliers: 8 single-lever + 24 two-lever + 32 three-lever = 64 unique permutations. Marketing copy updated to "60+ assumption permutations." This is honest and defensible — every permutation traces to a real engine calculation.

## Prisma Provider for Dev
**Decision:** Using SQLite for local development, PostgreSQL schema for production.
**Reason:** SQLite provides zero-config local development. The schema is written for PostgreSQL compatibility (no SQLite-specific features used). The `DATABASE_URL` env var switches between them. A startup validation in `src/lib/env.ts` ensures PostgreSQL is used in production.

## Rate Limiting Strategy
**Decision:** Upstash Redis with in-memory fallback, fails open.
**Reason:** In-memory rate limiting doesn't survive serverless horizontal scaling. Upstash Redis provides distributed sliding-window rate limiting with a free tier. If Redis is unreachable, the system fails open (allows the request) rather than blocking a paying customer. Structured logging captures failures for alerting.

## Free Tier Boundary
**Decision:** Free tier keeps full analytical rigor; gates client-facing outputs.
**Reason:** Gating confidence scoring or stress testing on the free tier would make Viableo look like the generic calculators it's differentiating from. The value proposition is "we show our work" — hiding the work behind a paywall undermines trust. Instead, gate the outputs that agencies charge for: unwatermarked PDFs, proposals, share-link approval tracking, white-labeling.

## AI Feature Scope
**Decision:** Built 3 narrow AI features (risks, estimation, narrative); explicitly excluded chatbot and AI confidence.
**Reason:** A chatbot for structured numeric entry is a regression from a well-designed form. A separate AI confidence score would contradict and dilute the existing calibrated confidence engine. The three features built are grounded in computed data and user-editable, preserving the trust architecture.

## Platform/API Cost as Separate Input
**Decision:** Added `platformApiCost` as a distinct, labeled, confidence-rated input.
**Reason:** Zapier/Make/n8n task-based costs are a real client objection and a real post-sale credibility risk. Burying them in a generic recurring-cost bucket makes the business case less defensible. Giving them their own confidence status lets the engine properly weight the uncertainty.

## Decision Color Saturation
**Decision:** Deepened all three verdict colors with matching borders.
**Reason:** The old pastel tints undermined DON'T BUILD authority — a system that visually softens its "no" undermines its own credibility. New colors pass WCAG AA and DON'T BUILD reads with the same visual weight as BUILD.

## Pricing Model Migration
**Decision:** Moved from one-time purchases to case-based hybrid model.
**Reason:** The value metric is a "case" (one full idea → decision → business-case run). This is legible to buyers who think in "how many client pitches this month." One-time pricing doesn't capture ongoing value from repeat usage.

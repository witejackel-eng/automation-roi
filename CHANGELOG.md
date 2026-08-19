# Changelog

All notable changes to Viableo are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-08-19

### Added
- Agency-tier features: versioned case history (`CaseVersion`), challenge
  workflow (`Challenge`), client directory (`Client`).
- `docs/ARCHITECTURE.md`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`.
- `.github/` PR and issue templates.
- `docs/TESTING.md` with full test-file map and CI instructions.
- `docs/DEPLOYMENT.md` and `docs/FOUNDER_RUNBOOK.md` for provisioning.
- `docs/PRE_LAUNCH_CHECKLIST.md` with verification commands for every item.

### Changed
- Middleware fallback from `proxy.ts` to `middleware.ts` (Next.js 16.1.3
  compatibility).
- Redirect `/app/**` to `/start` for legacy URL support.

## [0.2.0] - 2025-08-19

### Added
- Whop billing integration: subscription lifecycle, payment tracking,
  webhook handler with HMAC signature verification.
- `Subscription`, `Payment`, `PlanMapping` models in Prisma schema.
- Admin dashboard: customers, subscriptions, payments, events, audit log,
  entitlements, organizations, QA tier switching, system health.
- Rate limiting via Upstash Redis (degrades to in-memory when absent).
- AI-powered narrative generation, risk analysis, and input estimation
  via `z-ai-web-dev-sdk`.
- PDF generation for client reports and proposals (`@react-pdf/renderer`).
- Public share links (`/r/[shareId]`) with engagement tracking and
  approval workflow.
- Multi-tenant organization model with owner/member roles.
- Cross-tenant isolation tests (fail-loud, never skip).

### Security
- Defense-in-depth: middleware UX layer + per-route `requireAuth()` /
  `requireOrg()` / `requireSuperAdmin()` guards.
- Superadmin bootstrap via one-time token with forced rotation.
- Observability: `SystemEvent` (telemetry) and `AuditLog` (accountability)
  tables with string IDs to avoid FK blocking.

## [0.1.0] - 2025-08-19

### Added
- Initial release.
- ROI calculation engine with three scenarios (conservative, moderate,
  optimistic), stress testing, confidence scoring, and recommendation logic.
- Golden-case verification (`scripts/verify-golden.ts`).
- Calculator wizard with business, revenue, and automation input steps.
- Marketing pages: landing, pricing, methodology, solutions, resources.
- GitHub and Google OAuth via NextAuth v4.
- Neon (PostgreSQL) via Prisma ORM.
- Vercel deployment with auto-migration on deploy.
- OG image generation, sitemap, robots.txt.
- Unit tests: calculations, env contract, auth providers, subscription model,
  plan mapping, admin authorization, webhook signature verification.
- E2E tests: smoke, authenticated flows (Playwright).

[0.2.1]: https://github.com/witejackel-eng/automation-roi-repo/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/witejackel-eng/automation-roi-repo/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/witejackel-eng/automation-roi-repo/releases/tag/v0.1.0

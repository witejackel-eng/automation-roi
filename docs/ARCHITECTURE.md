# Viableo — Architecture Overview

Viableo is a SaaS application that helps automation agencies build 
data-driven ROI business cases for their clients. This document describes 
the system architecture, key design decisions, and data flow.

---

## Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | React 19, server + client components |
| Language | TypeScript 5 | Strict mode enabled |
| Runtime | Bun | `bun@1.3.14` package manager, Node >= 20 < 23 |
| Database | PostgreSQL 16 (Neon) | Serverless, pooled connections via PgBouncer |
| ORM | Prisma 6 | Migrations-first, no introspection in production |
| Auth | NextAuth v4 | JWT sessions, GitHub + Google OAuth |
| Billing | Whop SDK | Subscription lifecycle, payment events |
| AI | z-ai-web-dev-sdk | Narrative generation, risk analysis, estimation |
| Styling | Tailwind CSS 4 + shadcn/ui | Component library in `src/components/ui/` |
| Charts | Recharts | ROI bridge, scenario comparison |
| PDF | @react-pdf/renderer | Client reports and proposals |
| State | Zustand | Client-side calculator state |
| Testing | Vitest + Playwright | Unit/integration + E2E |
| Rate Limiting | Upstash Redis | Degrades to in-memory when absent |
| Blob Storage | Vercel Blob | PDF uploads |
| Deployment | Vercel | Auto-migration on deploy |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   Vercel Edge                    │
│  middleware.ts (UX-level redirect for /admin)   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              Next.js App Router                  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │Marketing  │  │ App      │  │ Admin        │  │
│  │ (public)  │  │ (authed) │  │ (superadmin) │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ API Route Handlers                       │   │
│  │  /api/auth/*   /api/projects/*           │   │
│  │  /api/admin/*  /api/billing/*            │   │
│  │  /api/ai/*     /api/share/*              │   │
│  │  /api/webhooks/whop                      │   │
│  └──────────────────────────────────────────┘   │
└────────┬───────────────┬───────────────┬────────┘
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌─────▼─────┐
    │  Neon   │    │  Whop   │    │ Upstash   │
    │Postgres │    │ Billing │    │  Redis    │
    └─────────┘    └─────────┘    └───────────┘

         │               │
    ┌────▼───────────────▼─────┐
    │  Vercel Blob (PDFs)      │
    │  z-ai-web-dev-sdk (AI)   │
    └──────────────────────────┘
```

---

## Authentication & Authorization

### Auth Flow

1. User signs in via GitHub or Google OAuth.
2. NextAuth creates a JWT session cookie (HTTP-only, signed with `NEXTAUTH_SECRET`).
3. The `jwt()` callback enriches the token with:
   - `sub` — user ID
   - `organizationId` — from the user's first `Membership`
   - `role` — org-level role (`owner` | `member`)
   - `systemRole` — system-level role (`USER` | `SUPERADMIN`)
4. The `session()` callback copies these onto the session object.
5. On first sign-in, `ensureUserHasOrganization()` creates an org if needed.

### Authorization Layers

| Layer | Mechanism | Purpose |
|---|---|---|
| Edge middleware | `middleware.ts` | UX redirect for `/admin/**`. **Not** the security decision. |
| Route handler guards | `requireAuth()`, `requireSuperAdmin()` | Real authorization. Every protected route calls these. |
| Tenant isolation | `organizationId` filter on all queries | Prevents cross-tenant data access. |

**Privacy boundary**: Superadmin access grants system-level operational 
visibility but does **not** authorize reading customer proprietary 
financial data (inputs, results). Admin routes use `operational-queries.ts` 
which structurally excludes content fields.

---

## Multi-Tenancy Model

```
Organization (tenant)
├── Memberships (user ↔ org link with role)
├── Projects (ROI calculations per client)
│   ├── Reports (PDF outputs)
│   ├── Shares (public links to reports)
│   ├── CaseVersions (versioned history)
│   └── Challenges (client pushback workflow)
├── Subscriptions (billing lifecycle)
├── Payments (Whop payment events)
├── Licenses (cached tier — derived from Subscription)
├── Clients (client directory)
└── ShareEvents (engagement analytics)
```

- Every authenticated user belongs to exactly one `Organization` (at least).
- All data is scoped by `organizationId`.
- Cross-tenant isolation is tested via 
  `src/lib/tenant/__tests__/cross-tenant-isolation.test.ts`.

---

## Calculation Engine

Located in `src/lib/calculations/`. Design principle: **pure functions only**.

### Module Map

| File | Responsibility |
|---|---|
| `engine.ts` | Input validation + three-scenario computation |
| `scenarios.ts` | Scenario assumption profiles (conservative/moderate/optimistic) |
| `stress-test.ts` | Sensitivity analysis: what inputs break the business case |
| `confidence.ts` | Confidence scoring (0–100) based on data completeness |
| `recommendation.ts` | Build / Consider / Don't Build recommendation |

### Flow

1. User enters inputs via the wizard (business, revenue, automation steps).
2. `engine.ts` validates all numeric inputs.
3. Three scenarios are computed in parallel:
   - **Conservative**: lower automation %, higher costs
   - **Moderate**: user's stated assumptions
   - **Optimistic**: higher automation %, lower costs
4. `stress-test.ts` finds the breaking point for key variables.
5. `confidence.ts` scores the result based on how many inputs were 
   provided vs. defaulted.
6. `recommendation.ts` maps confidence + financials to a verdict.

### Golden Case

`scripts/verify-golden.ts` runs a fixed input set and asserts the outputs 
match known-good values. This prevents silent formula regressions.

---

## Billing & Subscription Lifecycle

### Whop Integration

```
Whop Dashboard
    │
    │  (webhook events: subscription.created, .cancelled, .paused, .resumed)
    │
    ▼
/api/webhooks/whop
    │
    │  1. Verify HMAC-SHA256 signature
    │  2. Parse event, extract membership + payment data
    │  3. Upsert Subscription row
    │  4. Upsert License.tier (derived cache)
    │  5. Log Payment (if payment event)
    │
    ▼
PostgreSQL (Subscription, License, Payment tables)
```

### Plan Mapping

`PlanMapping` is a data table that maps Whop's `plan_...` IDs to Viableo's 
internal tier strings (`pro`, `agency`, `agency_pro`). This decouples 
plan renames in Whop's dashboard from code deploys.

### Entitlements

`src/lib/entitlement.ts` checks the user's `License.tier` to gate features:

| Tier | Projects | PDF Reports | AI Narratives |
|---|---|---|---|
| free | 1 | Watermarked | No |
| pro | Unlimited | Branded | Yes |
| agency | Unlimited | Branded + white-label | Yes |
| agency_pro | Unlimited | White-label | Yes |

---

## Public Share Links

```
Agency user clicks "Share" → POST /api/projects/[id]/share
    │
    │  Creates a Share row with a random opaque shareId
    │
    ▼
Client receives /r/[shareId]
    │
    │  1. Server component resolves shareId → Share + Report + Project
    │  2. Logs a 'view' ShareEvent
    │  3. Renders the report in a branded client view
    │
    ▼
Client scrolls, spends time → events logged via /api/share/[shareId]/event
Client approves → POST /api/share/[shareId]/approve
```

---

## Observability

Two-table design (per Viableo Production Architecture §9.1):

| Table | Purpose | Generated by | Retention |
|---|---|---|---|
| `SystemEvent` | Software behavior telemetry | Code paths (fire-and-forget) | May be pruned/aggregated |
| `AuditLog` | Human/admin accountability trail | Superadmin actions (append-only) | Long-term, defensible |

**Design decision**: Both tables use **string IDs** (no FK relations to 
User/Organization) so high-volume logging is never blocked by a missing 
or cascading foreign key.

---

## API Routes

### Public

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/webhooks/whop` | POST | Whop webhook receiver (HMAC verified) |
| `/api/share/[shareId]` | GET | Public share link data |
| `/api/share/[shareId]/event` | POST | Client engagement tracking |
| `/api/share/[shareId]/approve` | POST | Client approval action |
| `/api/share/[shareId]/analytics` | GET | Share link analytics |
| `/api/share/[shareId]/engagement` | GET | Engagement summary |
| `/api/calculate` | POST | Server-side calculation endpoint |
| `/api/ai/estimate` | POST | AI-powered input estimation |
| `/api/ai/narrative` | POST | AI narrative generation |
| `/api/ai/risks` | POST | AI risk analysis |

### Authenticated

| Route | Method | Purpose |
|---|---|---|
| `/api/projects` | GET/POST | List/create projects |
| `/api/projects/[id]` | GET/PATCH/DELETE | Project CRUD |
| `/api/projects/[id]/report` | POST | Generate PDF report |
| `/api/projects/[id]/proposal` | POST | Generate PDF proposal |
| `/api/projects/[id]/share` | POST | Create share link |
| `/api/projects/[id]/versions` | GET | Case version history |
| `/api/projects/[id]/challenge` | POST | Submit a challenge |
| `/api/billing/checkout` | POST | Initiate Whop checkout |
| `/api/entitlement` | GET | Check current entitlements |
| `/api/entitlement/set` | POST | Dev-only entitlement override |
| `/api/upload` | POST | Upload to Vercel Blob |
| `/api/organizations` | GET | Current org info |
| `/api/organizations/[orgId]/members` | GET | Org member list |
| `/api/organizations/[orgId]/clients` | GET/POST | Client directory |

### Admin (Superadmin)

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/system/health` | GET | System health check |
| `/api/admin/analytics/engagement` | GET | Platform-wide engagement metrics |
| `/api/admin/organizations/[id]/impersonate` | POST | Impersonate an org (audit-logged) |
| `/api/admin/entitlements/[orgId]/override` | POST | Manual entitlement override (audit-logged) |
| `/api/admin/qa/tier` | POST | QA tier switching (audit-logged) |
| `/api/admin/qa/replay-webhook` | POST | Replay a Whop webhook (QA only) |

---

## Deployment

- **Platform**: Vercel
- **Build**: `prisma generate && bash scripts/migrate-or-warn.sh && next build`
- **Migrations**: Run automatically during build via `scripts/migrate-or-warn.sh`
- **Region**: Aligned with Neon database region (typically `us-east-1`)

See `docs/DEPLOYMENT.md` for the full provisioning guide and 
`docs/FOUNDER_RUNBOOK.md` for the step-by-step founder setup.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Pure-function calculation engine | Testable, deterministic, no side effects. Every dollar traces to a formula. |
| Fail-loud tests (never skip) | A skipped test is a silent regression. CI must catch missing databases. |
| String IDs for observability tables | High-volume logging must never be blocked by FK constraints. |
| Data-table PlanMapping | Decouples Whop plan renames from code deploys. |
| JWT sessions (not DB sessions) | Stateless, fast, works with Vercel serverless. |
| Defense-in-depth auth | Middleware + route guards independently. Neither is sufficient alone. |
| Single-use bootstrap token | Eliminates persistent superadmin-creation attack surface. |
| DOMPurify for PDF HTML | Prevents XSS in generated PDF documents. |
| In-memory rate limit fallback | App remains functional when Upstash is not configured. |
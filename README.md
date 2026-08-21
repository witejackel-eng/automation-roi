# Viableo

**Viableo** is a decision instrument for automation agencies. It turns operational
assumptions — hours, rates, volumes, a fee — into a financially defensible
**BUILD / CONSIDER / DON'T BUILD** verdict, with three scenarios, a confidence
score, a 64-permutation stress test, and a client-ready PDF business case.

> **Product contract:** No black box. The math is deterministic, reproducible,
> and published on the Methodology page. Every number traces back to an input.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Styling | Tailwind CSS v4 + shadcn/ui (New York) |
| Database | Prisma + Neon PostgreSQL |
| Auth | NextAuth v4 (Google + GitHub OAuth) |
| Billing | Whop (checkout + HMAC-signed webhooks) |
| State | Zustand (client) + TanStack Query (server) |
| Charts | Recharts |
| PDF | `@react-pdf/renderer` (client report + proposal) |
| Motion | Motion (`motion/react`) |
| Deployment | Vercel (standalone build) |

---

## Quick start

```bash
# 1. Install
bun install

# 2. Configure environment
cp .env.example .env
# Fill in the TODO_HUMAN_ values (see "Founder actions" below)

# 3. Database
bun run db:push          # push schema to your Neon Postgres
bun run db:generate      # regenerate Prisma client

# 4. Seed plan mappings (after provisioning the Whop Pro plan)
bun run seed:plans

# 5. Run
bun run dev              # http://localhost:3000

# 6. Verify the deterministic engine
bun run verify:golden    # ALL GOLDEN CHECKS PASSED
```

### Sign in

OAuth is the only sign-in method (Google + GitHub). To bootstrap the first
superadmin (founder) for the `/admin` control plane:

```bash
bun run scripts/bootstrap-superadmin.ts \
  --email you@yourdomain.com \
  --token "$SUPERADMIN_BOOTSTRAP_TOKEN"
```

The user must sign in once via OAuth first (so the NextAuth adapter creates the
`User` row), then the script elevates `User.systemRole` to `SUPERADMIN`.

---

## Key scripts

| Script | Purpose |
|---|---|
| `bun run dev` | Next.js dev server (port 3000) |
| `bun run build` | Production build (`prisma generate` + migrate + `next build`) |
| `bun run start` | Serve the standalone production build |
| `bun run lint` | ESLint |
| `bun run typecheck` | `tsc --noEmit` (build ignores errors via `ignoreBuildErrors`) |
| `bun run test` | Vitest unit tests |
| `bun run verify:golden` | Apex golden-case engine verification (deterministic) |
| `bun run seed:plans` | Seed Whop plan → tier mappings (Pro only) |
| `bun run seed:qa` | Seed the dedicated QA test organization |
| `bun run db:push` | Push schema to the database |
| `bun run db:migrate` | Create + apply a Prisma migration |

---

## Project structure

```
src/
  app/
    (marketing)/         Public marketing pages (Server Components, light cream system)
      methodology/       Three-formula methodology + decision tree
      pricing/           Two-tier pricing (Starter + Pro)
      resources/         Automation ROI / payback / cost / business-case guides
      solutions/         Agency vertical pages (automation / n8n / make / zapier)
    admin/               Superadmin control plane (server-side gated)
    auth/signin/         Liquid-glass OAuth sign-in
    billing/             Whop checkout completion
    docs/                Product documentation
    privacy/  terms/     Legal (from viableo-legal-docs)
    r/[shareId]/         Public client share view (login-free, noindex)
    start/               Authenticated workspace (Zustand view-switcher)
    api/                 Route handlers (calculate, projects, share, billing, admin, webhooks)
  components/
    marketing/           MarketingShell + marketing-primitives + legal-prose
    dashboard/           Pulse-style 3-column authenticated dashboard shell
    views/               Zustand view components (dashboard, calculator, results, projects, settings, pricing, library)
    calculator/          ROI wizard steps
    charts/              Recharts wrappers (ROI bridge, scenario comparison)
    viableo/             Homepage-exclusive components (do not modify)
    orbit/               Authenticated app-shell primitives (command dock, case list, stage)
    ui/                  shadcn/ui component library
    admin/               Admin control-plane UI primitives
  lib/
    calculations/        Deterministic engine (engine, scenarios, confidence, recommendation, stress-test)
    entitlement/         Tier + capability resolver (Starter 10 cases / Pro unlimited)
    pdf/                 @react-pdf/renderer documents (client-report, proposal, watermark, verdict-stamp)
    observability/       SystemEvent + AuditLog
    admin/               Privacy-boundary read layer (operational-queries)
    auth.ts  session.ts  NextAuth config + requireAuth / requireOrg / requireSuperAdmin
    tenant.ts            Org-scoped Prisma delegates (OWASP A01 defense-in-depth)
    brand.ts             Viableo brand constants + canonical pricing
    db.ts                Prisma client singleton
    store.ts             Zustand client store
docs/
  ARCHITECTURE.md        System architecture
  PRODUCT_CONTRACT.md    Transparency + defensibility rules
  DEPLOYMENT.md          Vercel deployment guide
  PRE_LAUNCH_CHECKLIST.md  Pre-launch founder actions
  FOUNDER_RUNBOOK.md     Operational runbook
  TESTING.md             Test strategy
  COPY_GUIDELINES.md     Voice + tone
  PR_CHECKLIST.md        Pull-request checklist
prisma/
  schema.prisma          Data model (User, Organization, Membership, Project, Report, Share, Subscription, Payment, License, SystemEvent, AuditLog, …)
  migrations/            Prisma migrations
scripts/
  bootstrap-superadmin.ts  Elevate the first founder
  seed-plan-mappings.ts    Seed Whop plan → tier mappings
  seed-qa-org.ts            Seed the QA test organization
  verify-golden.ts          Apex golden-case verification
  elevate-founder.ts        Founder elevation helper
  certify.ts                Production certification gate
  contract-audit.ts         Product-contract audit
  migrate-or-warn.sh        Migration safety wrapper (used by build)
e2e/                       Playwright end-to-end specs
tests/                     Vitest unit tests
```

---

## Pricing model (canonical two-tier)

| Plan | Price | Cases / month | PDFs | Features |
|---|---|---|---|---|
| **Starter** | $0 forever | 10 | Watermarked | Full analytical engine: three scenarios, confidence scoring, 64-permutation stress test, BUILD/CONSIDER/DON'T BUILD verdict |
| **Pro** | $49/month | Unlimited | Clean | Everything in Starter + unwatermarked client reports & proposals, agency branding, share links with approval tracking, client directory, case library, versioning, challenge workflow, team seats |

Legacy Agency ($79) and Agency Pro ($790) tiers are retired; their entitlements
are now included in Pro. Historical subscriptions normalize to Pro at read time.

---

## Entitlement + case metering

- `src/lib/entitlement.ts` — the single source of truth for tier → capability
  resolution. `checkCaseLimit()` enforces the 10-case monthly cap on Starter
  (the 11th save returns HTTP 402, nudging the upgrade).
- PDFs: Starter PDFs are watermarked "VIABLEO STARTER — for evaluation" via
  `src/lib/pdf/watermark.tsx`. Pro PDFs are clean and support agency branding
  (logo + brand color) when the organization has uploaded assets.
- Superadmin bypasses via `getEffectiveEntitlement()` (returns Pro).

---

## Founder actions (before production launch)

These `TODO_HUMAN_` values in `.env.example` must be replaced with real secrets:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth JWT signing secret |
| `NEXTAUTH_URL` | Canonical production URL |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth app credentials |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `WHOP_API_KEY` / `WHOP_COMPANY_ID` / `WHOP_WEBHOOK_SECRET` | Whop billing |
| `WHOP_PLAN_ID_PRO` | The Whop plan ID for the $49/mo Pro plan |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (PDF storage) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting (optional; fails open if absent) |
| `ZAI_API_KEY` | ZAI SDK for the optional AI estimate/narrative features (degrades gracefully if absent) |
| `SUPERADMIN_BOOTSTRAP_TOKEN` | One-time token to bootstrap the first superadmin |
| `ENABLE_QA_ENDPOINTS` + `QA_ORG_ID` | Unlock the founder QA console (`/admin/qa`) |

Also replace placeholder emails in `/privacy` and `/terms`
(`privacy@TODO_HUMAN_DOMAIN`, `legal@TODO_HUMAN_DOMAIN`, `support@TODO_HUMAN_DOMAIN`)
with monitored mailboxes. See `docs/PRE_LAUNCH_CHECKLIST.md` for the full list.

---

## Design systems

The product uses three deliberate visual systems, kept strictly separate:

1. **Public site (agentic light):** cream page (`bg-[#F5F4F0]`), dark text
   (`text-[#111]`, `text-black/60`), white cards (`bg-white border-black/[0.07]`),
   dark primary CTA (`bg-[#111] text-white rounded-full`). **No dark sections.**
   Applied to: homepage, methodology, pricing, solutions, resources, privacy,
   terms, docs.
2. **Sign-in (liquid glass):** pastel gradient + frosted glass card. OAuth only.
3. **Authenticated dashboard (Pulse light):** three-column console
   (sidebar + main + right panel), metric cards, semantic verdict colors
   (BUILD green / CONSIDER amber / DON'T BUILD crimson), real entitlement +
   case data.

See `docs/COPY_GUIDELINES.md` for voice + tone (precise, transparent, non-hype).

---

## License

See `LICENSE`. All rights reserved.

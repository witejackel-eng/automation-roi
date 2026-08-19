# Testing Guide

## Quick Reference

| Suite | Command | Requires `TEST_DATABASE_URL`? |
|---|---|---|
| All unit + integration tests | `bun run test` | Yes — tests that hit the DB **FAIL** if it is not set |
| Golden case verification | `bun run verify:golden` | No (pure computation) |
| Typecheck | `bun run typecheck` | No |
| Lint | `bun run lint` | No |
| Cross-tenant isolation | `bun run test src/lib/tenant/__tests__/cross-tenant-isolation.test.ts` | Yes — **FAILS** if not set |
| Output consistency | `bun run test src/lib/calculations/__tests__/output-consistency.test.ts` | No (pure computation) |
| Playwright E2E (all) | `bunx playwright test` | Yes — **FAILS** if not set |
| Playwright E2E (authenticated flows) | `bunx playwright test e2e/authenticated-flows.spec.ts` | Yes — **FAILS** if not set |
| Playwright E2E (smoke) | `bunx playwright test e2e/smoke.spec.ts` | Yes — **FAILS** if not set |

## Critical Policy: Tests That Need a Database **FAIL**, Not Skip

Any test file that requires `TEST_DATABASE_URL` will throw an error at the top
of the file (or in a `beforeAll` block) if the variable is absent. The process
will exit with a non-zero code. There are **no** `test.skip()` guards or
conditional skips based on environment variables.

This is intentional: a skipped test is a silent regression. If a test needs a
database and you don't have one configured, the suite must **fail loudly** so
CI catches it and the developer knows to set up the database.

## Running Tests Locally

### Prerequisites

1. A Postgres 16 instance running (Docker recommended):

```bash
docker run -d --name viableo-pg \
  -e POSTGRES_USER=viableo \
  -e POSTGRES_PASSWORD=viableo \
  -e POSTGRES_DB=viableo_test \
  -p 5432:5432 \
  postgres:16
```

2. Set `TEST_DATABASE_URL`:

```bash
export TEST_DATABASE_URL="postgresql://viableo:viableo@localhost:5432/viableo_test"
```

3. Set `NEXTAUTH_SECRET` (required by E2E tests for session signing):

```bash
export NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

4. Run migrations:

```bash
bunx prisma migrate deploy
```

### Unit + Integration Tests

```bash
bun run test
```

### E2E Tests

```bash
# Install Chromium once
bunx playwright install --with-deps chromium

# Run all E2E tests
bunx playwright test

# Run a specific spec
bunx playwright test e2e/authenticated-flows.spec.ts
```

### Watch Mode (unit tests only)

```bash
bun run test --watch
```

## CI

The CI pipeline (`.github/workflows/ci.yml`) runs all of the above in order
against a Postgres 16 service container. See that file for the full step list.

## Test File Map

| Path | What it tests |
|---|---|
| `src/lib/__tests__/env-contract.test.ts` | All required env vars documented in `.env.example` |
| `src/lib/__tests__/subscription-model.test.ts` | Subscription tier logic |
| `src/lib/__tests__/tenant.test.ts` | Tenant resolution helpers |
| `src/lib/__tests__/auth-providers.test.ts` | Auth provider configuration |
| `src/lib/__tests__/plan-mapping.test.ts` | PlanMapping CRUD |
| `src/lib/tenant/__tests__/cross-tenant-isolation.test.ts` | Data isolation between orgs |
| `src/lib/calculations/__tests__/output-consistency.test.ts` | Deterministic calculation output |
| `src/lib/calculations/__tests__/stress-test.test.ts` | Edge-case inputs |
| `src/lib/calculations/__tests__/marketing-numbers.test.ts` | Marketing copy matches real calculations |
| `src/lib/calculations/__tests__/scenarios.test.ts` | Scenario generation |
| `src/lib/calculations/__tests__/recommendation.test.ts` | Recommendation logic |
| `src/lib/calculations/__tests__/confidence.test.ts` | Confidence scoring |
| `src/lib/observability/__tests__/types.test.ts` | System event types |
| `src/lib/observability/__tests__/system-event.test.ts` | Audit log creation |
| `src/lib/webhooks/whop/__tests__/verify-signature.test.ts` | Whop webhook HMAC verification |
| `src/app/__tests__/pricing-regression.test.ts` | Pricing page shows correct tiers |
| `src/app/__tests__/metadata-consistency.test.ts` | OG/metadata consistency |
| `src/app/api/admin/__tests__/admin-authz.test.ts` | Admin route authz guards |
| `src/app/api/webhooks/whop/__tests__/handler-security.test.ts` | Webhook handler security |
| `e2e/smoke.spec.ts` | Basic smoke: landing page loads |
| `e2e/authenticated-flows.spec.ts` | Full authenticated user flows (DB required) |
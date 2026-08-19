# Contributing to Viableo

Thank you for your interest in contributing. This guide covers the
full development workflow.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Bun | 1.3.x | [bun.sh](https://bun.sh) |
| Node.js | >= 20, < 23 | [nodejs.org](https://nodejs.org) |
| PostgreSQL 16 | 16.x | Docker: `docker run -d --name viableo-pg -e POSTGRES_USER=viableo -e POSTGRES_PASSWORD=viableo -e POSTGRES_DB=viableo_test -p 5432:5432 postgres:16` |
| Playwright (E2E) | Latest | `bunx playwright install --with-deps chromium` |

## Setup

```bash
# 1. Clone and install
git clone https://github.com/witejackel-eng/automation-roi-repo.git
cd automation-roi-repo
bun install

# 2. Copy env file and fill in values
cp .env.example .env
# Edit .env — at minimum set NEXTAUTH_SECRET (for local dev, any string works)

# 3. Generate Prisma client and run migrations
bun run db:generate
bun run db:migrate

# 4. (Optional) Seed a test database
export TEST_DATABASE_URL="postgresql://viableo:viableo@localhost:5432/viableo_test"
bunx prisma migrate deploy --url "$TEST_DATABASE_URL"
```

## Development

```bash
bun run dev        # Starts Next.js on port 3000
bun run test:watch # Vitest in watch mode
bun run lint       # ESLint
bun run typecheck  # TypeScript type checking
```

## Project Structure

```
automation-roi-repo/
├── src/
│   ├── app/              # Next.js App Router pages + API routes
│   │   ├── api/          # Route handlers (auth, billing, projects, admin, webhooks)
│   │   ├── (marketing)/  # Public marketing pages
│   │   ├── admin/        # Superadmin dashboard pages
│   │   └── app/          # Authenticated application pages
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui primitives (do not edit manually)
│   │   ├── viableo/      # Domain-specific components
│   │   ├── views/        # Top-level view switcher pages
│   │   ├── charts/       # Recharts-based chart components
│   │   ├── calculator/   # Wizard + step components
│   │   └── marketing/    # Landing page + marketing shell
│   └── lib/              # Business logic, utilities, integrations
│       ├── calculations/ # Pure-function ROI engine
│       ├── ai/           # AI SDK integration
│       ├── pdf/          # PDF generation
│       ├── observability/# SystemEvent + AuditLog
│       ├── validation/   # Zod schemas
│       └── webhooks/     # Whop webhook handling
├── prisma/               # Database schema + migrations
├── e2e/                  # Playwright E2E tests
├── scripts/              # Operational scripts (bootstrap, seed, verify)
├── docs/                 # Project documentation
└── tests/                # Runtime build tests
```

## Coding Standards

### TypeScript

- Strict mode is enabled in `tsconfig.json`.
- Run `bun run typecheck` before pushing.
- Prefer `interface` over `type` for object shapes.

### Components

- Use React functional components with hooks.
- shadcn/ui primitives live in `src/components/ui/` — regenerate via
  `npx shadcn@latest add <component>`, do not hand-edit.
- Domain components go in `src/components/viableo/`.

### Styling

- Tailwind CSS 4. Use utility classes.
- Follow the existing color palette and spacing conventions.

### Calculations

- The ROI engine (`src/lib/calculations/`) is **pure functions only**.
- No side effects, no database calls, no `process.env` access.
- If you change a formula, run `bun run verify:golden` — it must pass.
- Add/update tests in `src/lib/calculations/__tests__/`.

### Tests

- Unit tests: Vitest. Files: `*.test.ts` / `*.test.tsx` under `src/`.
- E2E tests: Playwright. Files: `*.spec.ts` under `e2e/`.
- Tests that need a database **fail** if `TEST_DATABASE_URL` is not set.
  They never skip silently.
- See `docs/TESTING.md` for the full test map.

## Pull Request Process

1. **Branch**: Create a feature branch from `main`.
   ```
   git checkout main && git pull && git checkout -b feat/my-feature
   ```

2. **Make changes**: Write code + tests.

3. **Verify locally**:
   ```bash
   bun run typecheck
   bun run lint
   bun run test
   bun run verify:golden  # if you touched calculations
   ```

4. **Commit**: Use [Conventional Commits](https://www.conventionalcommits.org/).
   ```
   feat: add break-even chart to results view
   fix: correct confidence score clamping
   docs: update DEPLOYMENT.md with new env vars
   ```

5. **Push and open PR**: Fill in the PR template (`.github/pull_request_template.md`).

6. **Review**: At least one approval required. CI must pass.

### PR Checklist

- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run test` passes
- [ ] `bun run verify:golden` passes (if calculations changed)
- [ ] New public APIs have tests
- [ ] No `TODO_HUMAN_` values in committed code
- [ ] No secrets or PII in committed code
- [ ] Migration SQL is backwards-compatible or documented as breaking

## Database Migrations

1. Modify `prisma/schema.prisma`.
2. Create a migration: `bun run db:migrate`.
3. Review the generated SQL in `prisma/migrations/<timestamp>/migration.sql`.
4. Migrations run automatically on deploy via `scripts/migrate-or-warn.sh`.

**Do not** use `prisma db push` in production. It bypasses the migration
history and makes rollback impossible.

## Adding a New API Route

1. Create the route handler in the appropriate `src/app/api/` directory.
2. Add auth guards: `requireAuth()` for authenticated routes,
   `requireOrg()` for tenant-scoped routes, `requireSuperAdmin()` for
   admin routes. Import from `src/lib/auth.ts`.
3. Add tenant isolation: ensure all Prisma queries filter by
   `organizationId` from the session.
4. Add tests — especially for authorization edge cases.
5. Update `docs/TESTING.md` test file map if you add a new test file.

## Questions?

Open a GitHub Discussion or contact witejackel@gmail.com.

# Deployment and Rollback Procedure

## Normal deploy flow

1. Merge a pull request into `main`.
2. GitHub Actions runs the `certify` job (typecheck, lint, unit tests, tenant isolation, output-consistency, golden-case, build, Playwright E2E). If any gate fails, the commit is marked failing.
3. Vercel's GitHub integration (configured per the founder runbook to wait for CI) deploys the commit to production only after the GitHub Actions check succeeds.
4. Vercel's build step runs `prisma migrate deploy` (via `vercel.json`'s `buildCommand`) before `next build`, applying any new migrations to the production Neon database.

## Rollback procedure (if a bad deploy reaches production)

1. Go to the Vercel dashboard → the `automation-roi` project → **Deployments** tab.
2. Find the last known-good deployment (identifiable by commit message/timestamp before the bad one).
3. Click the three-dot menu on that deployment → **Promote to Production**. This immediately points production traffic at the old build without rebuilding, taking effect within seconds.
4. **Database migrations are NOT automatically rolled back by this action** — a Vercel rollback only changes which built application code serves traffic, it does not revert schema changes already applied to Neon. If the bad deploy included a destructive migration (dropped/renamed a column or table), the old application code may now be incompatible with the current database schema.
5. For a migration that needs reverting: run `bunx prisma migrate resolve --rolled-back <migration_name>` locally against the production `DATABASE_URL` to mark it as rolled back in Prisma's `_prisma_migrations` tracking table, then write and apply a new forward migration that reverses the schema change (Prisma does not support automatic down-migrations; every rollback is itself a new forward migration that undoes the previous one). Never manually edit `_prisma_migrations` rows by hand outside of `prisma migrate resolve`.
6. After rollback, re-run `bun run certify` locally against a copy of the production schema to confirm the promoted old code is actually compatible with the current (possibly-reverted) database state before considering the incident closed.
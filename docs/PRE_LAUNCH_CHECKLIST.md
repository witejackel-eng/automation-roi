# Pre-Launch Checklist

Every item has a verification command or observable outcome. No "looks fine" items.

---

## Database

- [ ] Neon project created and connection string obtained
  - **Verify:** `psql "$DATABASE_URL" -c "SELECT 1"` returns `1`
- [ ] Prisma migrations apply cleanly
  - **Verify:** `bunx prisma migrate status` shows "Database schema is up to date!"
- [ ] No pending Drift
  - **Verify:** `bunx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma` produces empty output

## Authentication

- [ ] GitHub OAuth app created with correct callback URL
  - **Verify:** Callback URL is `<SITE>/api/auth/callback/github` in GitHub Developer Settings
- [ ] Google OAuth app created with correct redirect URI
  - **Verify:** Redirect URI is `<SITE>/api/auth/callback/google` in Google Cloud Console
- [ ] `NEXTAUTH_SECRET` is set to a random 32+ char value
  - **Verify:** `echo $NEXTAUTH_SECRET | wc -c` is ≥ 43
- [ ] Sign-in with GitHub works end-to-end
  - **Verify:** Open `/api/auth/signin`, click GitHub, complete OAuth, land on `/app`
- [ ] Sign-in with Google works end-to-end
  - **Verify:** Open `/api/auth/signin`, click Google, complete OAuth, land on `/app`
- [ ] Sign-out works
  - **Verify:** Click sign-out, verify `/api/auth/session` returns `{}`

## Environment Variables

- [ ] All required env vars are set in Vercel Production
  - **Verify:** `vercel env ls` shows all vars from `.env.example` (except `DEV_*` and `CI-ONLY`)
- [ ] No `TODO_HUMAN_` values in production
  - **Verify:** `vercel env pull .env.check --environment production && grep -c 'TODO_HUMAN_' .env.check && rm .env.check` outputs `0`

## Billing (Whop)

- [ ] Whop company created
  - **Verify:** `WHOP_COMPANY_ID` is a non-empty string in Vercel env
- [ ] 3 plans created (pro, agency, agency_pro)
  - **Verify:** `WHOP_PLAN_ID_PRO`, `WHOP_PLAN_ID_AGENCY`, `WHOP_PLAN_ID_AGENCY_PRO` are all set
- [ ] Webhook configured pointing to `<SITE>/api/webhooks/whop`
  - **Verify:** Whop dashboard shows the webhook URL and recent deliveries
- [ ] Plan mappings seeded
  - **Verify:** `bunx tsx scripts/seed-plan-mappings.ts` outputs "Done. 3 mapping(s) upserted."
- [ ] Test purchase completes
  - **Verify:** Complete a checkout, verify `Subscription` row exists in DB with `status: 'active'`

## Storage

- [ ] Vercel Blob store created
  - **Verify:** `BLOB_READ_WRITE_TOKEN` is set in Vercel env
- [ ] PDF upload works
  - **Verify:** Upload a test blob via the `/api/upload` route, confirm 200 response

## Security

- [ ] Unauthenticated `/api/projects` returns 401/403
  - **Verify:** `curl -s -o /dev/null -w '%{http_code}' <SITE>/api/projects` returns `401` or `403`
- [ ] Unauthenticated `/api/admin/*` returns 401/403
  - **Verify:** `curl -s -o /dev/null -w '%{http_code}' <SITE>/api/admin/system/health` returns `401` or `403`
- [ ] Unauthenticated `/api/billing/checkout` returns 401/403
  - **Verify:** `curl -s -o /dev/null -w '%{http_code}' -X POST <SITE>/api/billing/checkout` returns `401` or `403`
- [ ] Cross-tenant isolation holds
  - **Verify:** `bun run test src/lib/tenant/__tests__/cross-tenant-isolation.test.ts` — all tests pass
- [ ] Webhook signature verification works
  - **Verify:** `bun run test src/lib/webhooks/whop/__tests__/verify-signature.test.ts` — all tests pass

## Calculation Integrity

- [ ] Golden case passes
  - **Verify:** `bun run verify:golden` exits 0
- [ ] Output consistency passes
  - **Verify:** `bun run test src/lib/calculations/__tests__/output-consistency.test.ts` — all tests pass
- [ ] All unit tests pass
  - **Verify:** `bun run test` exits 0

## Production Build

- [ ] `next build` succeeds
  - **Verify:** `bun run build` exits 0 with no type errors
- [ ] Health endpoint responds
  - **Verify:** `curl <SITE>/api/admin/system/health` (with admin session) returns 200 with `status: "ok"`
- [ ] Landing page loads
  - **Verify:** `curl -s -o /dev/null -w '%{http_code}' <SITE>` returns `200`
- [ ] OG image generates
  - **Verify:** `curl -sI <SITE>/opengraph-image` returns `Content-Type: image/`

## SEO & Metadata

- [ ] robots.txt is served
  - **Verify:** `curl <SITE>/robots.txt` contains `User-agent:`
- [ ] sitemap.xml is served
  - **Verify:** `curl <SITE>/sitemap.xml` contains `<urlset`

## Post-Launch

- [ ] Superadmin bootstrap token removed from Vercel env
  - **Verify:** `vercel env ls` does NOT show `SUPERADMIN_BOOTSTRAP_TOKEN`
- [ ] `DEV_ENTITLEMENT_SECRET` is NOT set in production
  - **Verify:** `vercel env ls` does NOT show `DEV_ENTITLEMENT_SECRET`
- [ ] `DEBUG_PRISMA` is NOT set in production
  - **Verify:** `vercel env ls` does NOT show `DEBUG_PRISMA`

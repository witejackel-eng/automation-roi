# Viableo — Deployment Guide

Every step is tagged **[FOUNDER ACTION]** (requires your manual input) or
**[CODE — ALREADY DONE]** (handled by committed code).

---

## 1. Neon Database

**[FOUNDER ACTION]** Create a Neon project at [neon.tech](https://neon.tech).

1. Create a new project. Note the region — pick the closest to your Vercel region
   (typically `us-east-1`).
2. Once created, Neon gives you two connection strings:
   - **Pooled** (port 5432, routed through PgBouncer)
   - **Direct** (port 5432, straight to the primary)
3. Copy the **pooled** connection string — this is your `DATABASE_URL`.

### Pooled vs. Direct (`DIRECT_URL`)

**[CODE — ALREADY DONE]** In `prisma/schema.prisma`, the `directUrl` line is
**commented out**. This is intentional.

| Situation | Which URL | Why |
|---|---|---|
| Vercel serverless functions | `DATABASE_URL` (pooled) | PgBouncer limits connections so serverless lambdas don't exhaust Postgres. |
| `prisma migrate deploy` (CI / local) | `DATABASE_URL` (same pooled) | Neon's pooled endpoint supports migrations. Direct URL is **not** needed unless you see `P1012` errors. |
| Prisma introspection | N/A | We don't use introspection in this project. |

**Why `directUrl` is commented out:** Neon's pooled connection string now supports
prepared statements and migrations. Using a separate `directUrl` caused `P1012`
errors in some CI environments when the two URLs pointed to different backends.
If you ever hit `P1012`, uncomment the `directUrl` line in `schema.prisma` and set
it to the **direct** connection string.

---

## 2. Vercel Project

**[FOUNDER ACTION]** Import the repo into Vercel.

1. Go to [vercel.com/new](https://vercel.com/new) → import the GitHub repo.
2. Framework preset: **Next.js**.
3. Root directory: `.` (default).
4. Build command: leave as auto-detected (`next build`).
5. Install command: leave as auto-detected (`bun install --frozen-lockfile`).
6. No custom output directory.

---

## 3. Environment Variables

**[FOUNDER ACTION]** Set the following in **Vercel → Settings → Environment Variables**.

Reference `.env.example` at the repo root for the full list with descriptions.

### Required (must be set before first deploy)

| Variable | Source |
|---|---|
| `DATABASE_URL` | Neon pooled connection string (step 1) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel domain, e.g. `https://viableo.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | Same as `NEXTAUTH_URL` |
| `GITHUB_ID` | GitHub OAuth App (step 4) |
| `GITHUB_SECRET` | GitHub OAuth App (step 4) |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth (step 5) |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth (step 5) |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Create store |
| `WHOP_API_KEY` | Whop API settings |
| `WHOP_COMPANY_ID` | Whop dashboard (after creating company) |
| `WHOP_WEBHOOK_SECRET` | Whop → Webhooks |
| `WHOP_PLAN_ID_PRO` | Whop → Plans (after creating plans) |
| `WHOP_PLAN_ID_AGENCY` | Whop → Plans |
| `WHOP_PLAN_ID_AGENCY_PRO` | Whop → Plans |

### Optional

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Rate limiting (degrades to in-memory if absent) |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |
| `ZAI_API_KEY` | AI narrative generation |

### Never set in production

| Variable | Reason |
|---|---|
| `DEV_ENTITLEMENT_SECRET` | Bypasses entitlement checks |
| `SUPERADMIN_BOOTSTRAP_TOKEN` | One-time use only; rotate after bootstrap |
| `DEBUG_PRISMA` | Logs every SQL query |

---

## 4. Migrations on Deploy

**[CODE — ALREADY DONE]** The script `scripts/migrate-or-warn.sh` is wired into
`postinstall` in `package.json`. It runs `prisma migrate deploy` automatically.

**How it behaves:**
- If `DATABASE_URL` is set and points to a real Postgres instance, it applies
  pending migrations.
- If `DATABASE_URL` is missing or points to a local SQLite file, it prints a
  warning and exits with code 0 (non-blocking for local dev).
- On Vercel, `postinstall` runs during the build step, so migrations are applied
  before the new build goes live.

---

## 5. Verifying a Deploy Shipped

**[FOUNDER ACTION]** After a merge to `main` triggers a Vercel deploy:

1. Open the Vercel dashboard → Deployments.
2. Note the **commit SHA** of the latest successful deployment.
3. Compare it to `git log --oneline -1` on the `main` branch.

```bash
# Locally:
git log --oneline -1 main

# If they match, the deploy shipped that commit.
# If they don't, check Vercel build logs for failures.
```

4. Hit `/api/admin/system/health` (requires admin session) to confirm the
   `commitSha` field matches.

---

## 6. OAuth Callback URLs

**[FOUNDER ACTION]** After setting `NEXTAUTH_URL`, configure callback URLs in
your OAuth providers:

- **GitHub**: `<NEXTAUTH_URL>/api/auth/callback/github`
- **Google**: `<NEXTAUTH_URL>/api/auth/callback/google`

---

## 7. Webhook Endpoint

**[CODE — ALREADY DONE]** The Whop webhook handler lives at
`/api/webhooks/whop`. Set the webhook URL in the Whop dashboard to:

```
<NEXTAUTH_URL>/api/webhooks/whop
```

---

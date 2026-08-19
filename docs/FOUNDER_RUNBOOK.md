# Founder Runbook — Provisioning Sequence

Complete each step **in order**. Every item is tagged
**[FOUNDER ACTION]** (you must do this) or
**[CODE — ALREADY DONE]** (code handles it).

---

## 1. Neon Database

**[FOUNDER ACTION]**

1. Create a Neon project at [neon.tech](https://neon.tech).
2. Choose `us-east-1` (or the region closest to your Vercel deployment).
3. Copy the **pooled** connection string.
4. Set it as `DATABASE_URL` in Vercel → Settings → Environment Variables.
5. Set the same value as `TEST_DATABASE_URL` in the Vercel **Preview** environment.

**[CODE — ALREADY DONE]** Prisma migrations run automatically via `scripts/migrate-or-warn.sh`
during `postinstall`. The schema is in `prisma/schema.prisma`.

---

## 2. Environment Variables

**[FOUNDER ACTION]**

Set all variables listed in `.env.example` in Vercel → Settings → Environment Variables.

Minimum viable set for a working deploy:

- `DATABASE_URL` (from step 1)
- `NEXTAUTH_SECRET` — generate: `openssl rand -base64 32`
- `NEXTAUTH_URL` — your production URL, e.g. `https://viableo.vercel.app`
- `NEXT_PUBLIC_SITE_URL` — same as `NEXTAUTH_URL`
- `GITHUB_ID` / `GITHUB_SECRET` (from step 3)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (from step 4)
- `BLOB_READ_WRITE_TOKEN` (from step 5)
- `WHOP_API_KEY` / `WHOP_COMPANY_ID` / `WHOP_WEBHOOK_SECRET` (from steps 7–8)
- `WHOP_PLAN_ID_PRO` / `WHOP_PLAN_ID_AGENCY` / `WHOP_PLAN_ID_AGENCY_PRO` (from step 7)

---

## 3. GitHub OAuth App

**[FOUNDER ACTION]**

1. Go to [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. Set:
   - **Application name**: `Viableo`
   - **Homepage URL**: `<SITE>`
   - **Authorization callback URL**: `<SITE>/api/auth/callback/github`
4. Click **Register application**.
5. Copy **Client ID** → set as `GITHUB_ID`.
6. Click **Generate a new client secret** → set as `GITHUB_SECRET`.

---

## 4. Google Cloud OAuth App

**[FOUNDER ACTION]**

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Set:
   - **Name**: `Viableo Production`
   - **Authorized redirect URIs**: `<SITE>/api/auth/callback/google`
5. Click **Create**.
6. Copy **Client ID** → set as `GOOGLE_CLIENT_ID`.
7. Copy **Client Secret** → set as `GOOGLE_CLIENT_SECRET`.

---

## 5. Blob Store

**[FOUNDER ACTION]**

1. Go to Vercel → **Storage** → **Create Store**.
2. Choose **Blob**.
3. Once created, Vercel automatically injects `BLOB_READ_WRITE_TOKEN` into
   your Vercel project's environment. Verify it appears in Settings → Environment
   Variables.

---

## 6. Superadmin Bootstrap + Token Rotation

**[FOUNDER ACTION]**

1. Generate a one-time token: `openssl rand -hex 32`.
2. Set `SUPERADMIN_BOOTSTRAP_TOKEN` in Vercel env vars.
3. Deploy (or redeploy) so the env var is live.
4. Run the bootstrap:

```bash
# Replace YOUR_TOKEN and YOUR_DOMAIN
npx tsx scripts/bootstrap-superadmin.ts \
  --token YOUR_TOKEN \
  --url https://your-domain.vercel.app/api/auth/callback/credentials
```

5. **Immediately after success**, remove `SUPERADMIN_BOOTSTRAP_TOKEN` from Vercel
   env vars and redeploy. This token is single-use by design.

**[CODE — ALREADY DONE]** `scripts/bootstrap-superadmin.ts` validates the token,
creates the superadmin user + org, and then the route rejects any subsequent
requests with the same token.

---

## 7. Whop Company + 3 Plans + Plan IDs

**[FOUNDER ACTION]**

1. Create a [Whop](https://whop.com) account (or log in).
2. Create a **Company**.
3. Note the **Company ID** → set as `WHOP_COMPANY_ID`.
4. Create **3 plans**:

| Plan | Tier | Billing | Whop plan ID env var |
|---|---|---|---|
| Viableo Pro | `pro` | Monthly | `WHOP_PLAN_ID_PRO` |
| Viableo Agency | `agency` | Monthly | `WHOP_PLAN_ID_AGENCY` |
| Viableo Agency Pro | `agency_pro` | Annual | `WHOP_PLAN_ID_AGENCY_PRO` |

5. For each plan, copy the **Plan ID** and set the corresponding env var in Vercel.

---

## 8. Whop API Key + Webhook + Secret

**[FOUNDER ACTION]**

1. In Whop dashboard → **API**, generate an API key → set as `WHOP_API_KEY`.
2. In Whop dashboard → **Webhooks**, create a webhook pointing to:

```
<SITE>/api/webhooks/whop
```

3. Subscribe to events: `subscription.created`, `subscription.cancelled`,
   `subscription.paused`, `subscription.resumed`.
4. Copy the **Webhook Secret** → set as `WHOP_WEBHOOK_SECRET`.

**[CODE — ALREADY DONE]** `/api/webhooks/whop/route.ts` verifies the Whop
signature before processing any event.

---

## 9. Seed Plan Mappings

**[FOUNDER ACTION]**

After step 7 (plan IDs are set in Vercel), seed the `PlanMapping` table:

```bash
bunx tsx scripts/seed-plan-mappings.ts
```

This reads `WHOP_PLAN_ID_PRO`, `WHOP_PLAN_ID_AGENCY`, and
`WHOP_PLAN_ID_AGENCY_PRO` from the environment and upserts rows.

**Expected output:**

```
Seeding PlanMappings...
OK pro -> plan_xxxxx
OK agency -> plan_yyyyy
OK agency_pro -> plan_zzzzz
Done. 3 mapping(s) upserted.
```

If any env var still starts with `TODO_HUMAN_`, that plan will be SKIPPED.

---

## 10. First Real Purchase + Verification

**[FOUNDER ACTION]**

1. Open the live site.
2. Sign in with your GitHub or Google account.
3. Navigate to **Pricing** and complete a checkout for the **Pro** plan (use
   a test card if Whop provides one in sandbox mode).
4. Verify:
   - The webhook fires (check Whop dashboard → Webhooks → Recent Deliveries).
   - Your account now shows an **active** subscription in the database:

```bash
# Use Prisma Studio or a direct DB query
bunx prisma studio
```

5. Verify you can access paid features (report download, proposal PDF).
6. Cancel the subscription in the Whop dashboard and verify access is revoked.

---

## 11. Duplicate-Account Recovery Procedure

If a user signs in with GitHub first, then later with Google (or vice versa),
they may end up with two separate accounts. Recovery steps:

1. Identify both user records in the database (same email, different `id`).
2. Choose the account with the subscription / data to **keep**.
3. Reassign all `Project`, `Subscription`, and related records from the
   **discarded** account to the **kept** account's `organizationId`.
4. Delete the discarded `User` and its empty `Organization`.

**[CODE — ALREADY DONE]** The `src/lib/org-bootstrap.ts` module creates an org
on first sign-in. If the user already exists (matched by email), it links to
the existing org instead of creating a duplicate.

---

# MIGRATION.md

## Deployment Steps

### 1. Environment Variables
Set these in your Vercel project settings (or hosting platform):

```bash
# REQUIRED
DATABASE_URL="postgresql://user:password@host:5432/viableo?sslmode=require"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="https://your-domain.com"
GITHUB_ID="<from GitHub OAuth App settings>"
GITHUB_SECRET="<from GitHub OAuth App settings>"

# REQUIRED for PDF/logo storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# REQUIRED for payment webhooks
WHOP_WEBHOOK_SECRET="whsec_..."

# OPTIONAL (falls back to in-memory if not set)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# OPTIONAL (AI features still work without, returns 503 gracefully)
ZAI_API_KEY="xxx"
```

### 2. GitHub OAuth App Setup
1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Authorization callback URL: `https://your-domain.com/api/auth/callback/github`
4. Copy Client ID → `GITHUB_ID`
5. Generate Client Secret → `GITHUB_SECRET`

### 3. Database Migration
For existing deployments with demo data:

```bash
# 1. Push the new schema (adds User, Account, Session, Membership, ShareEvent, ShareApproval models)
bun run db:push

# 2. Seed the database with the demo user + organization
bun run db:seed

# 3. Existing Project/Report/Share/License data is preserved.
#    The seeded organization (org_apex_demo) owns all existing data.
#    The seeded user (demo@viableo.app) is the owner of that organization.
```

### 4. Data Migration for Existing Demo Records
The seed script uses `upsert` — it's safe to run on an existing database:
- If `org_apex_demo` already exists, it's kept with all existing data
- A new User + Membership is created linking the demo user to the existing org
- If a free-tier License already exists, it's kept

### 5. Whop Webhook Update
Update your Whop webhook configuration:
- The webhook payload must now include `metadata.organizationId`
- This replaces the old hardcoded `DEMO_ORG_ID`
- Without `organizationId` in the metadata, the webhook returns 422

### 6. Vercel Blob
Ensure `BLOB_READ_WRITE_TOKEN` is set. PDFs and logos are stored in Vercel Blob
(not in `public/reports/` which is read-only on Vercel).

### 7. Post-Deployment Verification
1. Sign in via GitHub OAuth at `/auth/signin`
2. Verify the calculator loads and computes correctly
3. Verify the results view shows all new components (BreakingPointSlider, ConfidenceExplained, etc.)
4. Verify the share view tracks engagement and allows approvals
5. Verify the entitlement system gates correctly for each tier
6. Verify rate limiting works (check Upstash dashboard if configured)

## Rollback Plan
If issues arise after deployment:
1. **Highest-risk change:** The auth migration (Phase 1.1). If GitHub OAuth fails, users can't sign in. **Mitigation:** Keep the credentials provider enabled in dev; in production, ensure GitHub OAuth is tested before removing any fallback.
2. **Database:** The schema changes are additive-only (new models, new fields). No columns or tables were dropped. Rolling back the application code while keeping the new schema is safe — the new columns/tables will simply be unused.
3. **Entitlement:** The new capability flags are a superset of the old ones. Old client-side entitlement checks still work; new server-side checks provide additional security.
4. **Quick rollback:** `git revert HEAD` on the deployment commit, redeploy.

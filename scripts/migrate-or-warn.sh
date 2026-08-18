#!/bin/bash
# scripts/migrate-or-warn.sh
#
# Vercel-safe wrapper around prisma migrate deploy.
#
# Problem this solves:
#   - Vercel typically sets DATABASE_URL to a POOLED Neon/Supabase URL
#     (PgBouncer) so serverless functions don't exhaust the connection
#     pool. Prisma migrations cannot run over PgBouncer (prepared-
#     statement mismatch) and require the DIRECT (non-pooled) URL.
#   - If DIRECT_URL is unset on Vercel, prisma migrate deploy fails
#     with P1001/P1013 — but the failure must not break the build,
#     otherwise the entire Vercel deploy fails and the user is stuck
#     with the prior (broken) deployment.
#
# Behavior:
#   - If prisma migrate deploy succeeds → exit 0, build continues.
#   - If it fails with a connection-related error (P1001, P1013,
#     P1011, "Can't reach database", "connection") → print a warning
#     explaining how to set DIRECT_URL on Vercel, exit 0 so the build
#     continues. The runtime DATABASE_URL will still work for queries
#     if the schema was previously applied.
#   - If it fails with a real migration error (bad SQL, schema drift) →
#     exit non-zero so the build fails loudly. The user needs to fix
#     the migration before deploying.
set -u

LOG_FILE="${TMPDIR:-/tmp}/prisma-migrate.log"

# Run migrate deploy, capture output + exit code (don't use set -e).
set +e
bunx prisma migrate deploy >"$LOG_FILE" 2>&1
MIGRATE_EXIT=$?
set -e

cat "$LOG_FILE"

if [ "$MIGRATE_EXIT" -eq 0 ]; then
  echo "✓ prisma migrate deploy succeeded"
  exit 0
fi

# Inspect the log for known-benign connection-related errors.
if grep -qE "P1001|P1011|P1013|Can't reach database|connection.*refused|connection.*timed out" "$LOG_FILE"; then
  echo ""
  echo "⚠  prisma migrate deploy could not connect to the database."
  echo "   This is benign when Vercel's DATABASE_URL is a pooled Neon URL"
  echo "   and DIRECT_URL is not set (PgBouncer can't run migrations)."
  echo ""
  echo "   To fix: add DIRECT_URL on Vercel → Settings → Environment Variables"
  echo "   → set it to the direct (non-pooled) Neon connection string, then redeploy."
  echo "   The runtime DATABASE_URL will still work for queries if the schema"
  echo "   was previously applied (e.g. a manual prisma migrate deploy)."
  echo ""
  echo "   Build will continue — the homepage and all non-DB routes will deploy."
  exit 0
fi

# Real migration error — fail loudly.
echo ""
echo "✗ prisma migrate deploy failed with a non-connection error."
echo "  See the log above for the SQL/migration error. Fix the migration"
echo "  file before redeploying."
exit "$MIGRATE_EXIT"

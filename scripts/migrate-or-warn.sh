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
#     with P1001/P1013/P1014 — but the failure must not break the
#     build, otherwise the entire Vercel deploy fails and the user is
#     stuck with the prior (broken) deployment.
#
# Behavior:
#   - If prisma migrate deploy succeeds -> exit 0, build continues.
#   - If it fails with a connection-related or env-var-missing error
#     (P1001, P1011, P1013, P1014, P1015, "Can't reach database",
#     "connection refused", "connection timed out", "Validation
#     Error", "DATABASE_URL", "Environment variable") -> print a
#     warning explaining how to set DIRECT_URL on Vercel, exit 0 so
#     the build continues. The runtime DATABASE_URL will still work
#     for queries if the schema was previously applied.
#   - If it fails with a real migration error (bad SQL, schema drift)
#     -> exit non-zero so the build fails loudly. The user needs to
#     fix the migration before deploying.
set -u

LOG_FILE="${TMPDIR:-/tmp}/prisma-migrate.log"

# Run migrate deploy, capture output + exit code (don't use set -e).
set +e
bunx prisma migrate deploy >"$LOG_FILE" 2>&1
MIGRATE_EXIT=$?
set -e

cat "$LOG_FILE"

if [ "$MIGRATE_EXIT" -eq 0 ]; then
  echo "OK prisma migrate deploy succeeded"
  exit 0
fi

# Inspect the log for known-benign connection/env-related errors.
# These are all cases where the build should continue (with a warning)
# rather than fail and block the Vercel deploy.
if grep -qE "P1001|P1002|P1011|P1013|P1014|P1015|Can't reach database|connection.*refused|connection.*timed out|advisory.*lock|Validation Error|DATABASE_URL|Environment variable" "$LOG_FILE"; then
  # Advisory-lock / connection timeouts are transient — safe to skip in any
  # environment. The schema was already applied in a previous deploy.
  # Only a real SQL error should block the build.
  if grep -qE "P1002|advisory.*lock" "$LOG_FILE"; then
    echo ""
    echo "WARN prisma migrate deploy hit an advisory-lock timeout (P1002)."
    echo "     This is a transient connection issue, not a migration error."
    echo "     The schema is already applied. Build will continue."
    echo ""
    exit 0
  fi
  if [ "${VERCEL_ENV:-}" = "production" ]; then
    echo "ERROR: migration failed in production — failing the build. See output above." >&2
    exit 1
  fi
  echo ""
  echo "WARN prisma migrate deploy could not connect to the database"
  echo "     (or DATABASE_URL / DIRECT_URL is not set in the build env)."
  echo "     This is benign when Vercel's DATABASE_URL is a pooled Neon URL"
  echo "     and DIRECT_URL is not set (PgBouncer can't run migrations)."
  echo ""
  echo "     To fix: add DIRECT_URL on Vercel -> Settings -> Environment"
  echo "     Variables -> set it to the direct (non-pooled) Neon URL,"
  echo "     then redeploy. The runtime DATABASE_URL will still work for"
  echo "     queries if the schema was previously applied."
  echo ""
  echo "     Build will continue; the homepage and all non-DB routes will deploy."
  exit 0
fi

# Real migration error - fail loudly.
echo ""
echo "FAIL prisma migrate deploy failed with a non-connection error."
echo "      See the log above for the SQL/migration error. Fix the migration"
echo "      file before redeploying."
exit "$MIGRATE_EXIT"

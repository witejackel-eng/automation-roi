/**
 * Next.js instrumentation hook — runs once on app startup.
 *
 * Per Viableo Production Architecture §0.1 (F-5) and Agent 1 master
 * prompt Phase 7: src/lib/env.ts defines validateEnv() but had zero
 * call sites — dead code. The idiomatic Next.js location for startup
 * validation is instrumentation.ts (project root, exporting
 * `register()`).
 *
 * Behavior:
 *   - In production: validateEnv() throws on missing required vars.
 *   - In development: console.warn only — dev is allowed to omit
 *     production-only-required vars.
 *
 * CRITICAL — non-fatal wrapper:
 *   Per the operator's "deploy on Vercel in one go" requirement, this
 *   register() hook must NOT crash the app if some production-only
 *   env vars (GITHUB_ID, GITHUB_SECRET, BLOB_READ_WRITE_TOKEN) are
 *   not yet configured. Routes that need those vars will fail
 *   individually (e.g. /api/auth without GITHUB_ID), but the
 *   homepage and other non-dependent routes will still load.
 *
 *   So we wrap validateEnv() in try/catch: log the warning, but let
 *   the app continue. The founder sees the warning in Vercel logs and
 *   knows to set the missing vars.
 *
 * Note: `register()` runs in the Node.js runtime, so it is safe to
 * import server-only code here.
 */
export async function register() {
  const { validateEnv } = await import('./src/lib/env');
  try {
    validateEnv();
  } catch (e) {
    // Log the warning but DO NOT re-throw — the app must still load
    // so routes that don't depend on the missing env vars can serve.
    console.warn(
      '[instrumentation] env validation warning:',
      e instanceof Error ? e.message : String(e),
    );
  }
}

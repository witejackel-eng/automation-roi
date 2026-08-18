/**
 * Next.js 16 instrumentation hook — runs once on app startup.
 *
 * Per Viableo Production Architecture §0.1 (F-5) and Agent 1 master
 * prompt Phase 7: src/lib/env.ts defines validateEnv() but had zero
 * call sites — dead code. The idiomatic Next.js 16 location for
 * startup validation is instrumentation.ts (project root, exporting
 * `register()`).
 *
 * Behavior:
 *   - In production: throws on missing required env vars (the build
 *     will fail loudly with the list of missing vars).
 *   - In development: console.warn only — dev is allowed to omit
 *     production-only-required vars (NEXTAUTH_SECRET, NEXTAUTH_URL,
 *     GITHUB_ID, GITHUB_SECRET, BLOB_READ_WRITE_TOKEN).
 *
 * The existing dev/prod branching in src/lib/env.ts already handles
 * this correctly — we just wire it up here.
 *
 * Note: `register()` runs in the Node.js runtime, so it is safe to
 * import server-only code here.
 */
export async function register() {
  // Dynamic import to keep this file's static analysis simple and to
  // ensure the import is only resolved at runtime.
  const { validateEnv } = await import('./src/lib/env');
  validateEnv();
}

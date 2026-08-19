/**
 * Environment variable validation — fails loudly on missing production vars.
 *
 * Called at app startup to ensure all required configuration is present.
 * In development, most vars are optional with sensible defaults.
 * In production, missing required vars throw an error.
 */
const isProduction = process.env.NODE_ENV === 'production';

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  { name: 'DATABASE_URL', required: true, description: 'Prisma pooled/runtime connection string (Neon pooled endpoint in production)' },
  { name: 'DIRECT_URL', required: isProduction, description: 'Prisma direct (non-pooled) connection string, used only for prisma migrate deploy' },
  { name: 'NEXTAUTH_SECRET', required: isProduction, description: 'NextAuth JWT/session signing secret, 32+ bytes' },
  { name: 'NEXTAUTH_URL', required: isProduction, description: 'Canonical base URL of the deployment, no trailing slash' },
  { name: 'GITHUB_ID', required: isProduction, description: 'GitHub OAuth App client ID' },
  { name: 'GITHUB_SECRET', required: isProduction, description: 'GitHub OAuth App client secret' },
  { name: 'BLOB_READ_WRITE_TOKEN', required: isProduction, description: 'Vercel Blob read/write token, for uploads/branding assets' },
  { name: 'WHOP_WEBHOOK_SECRET', required: isProduction, description: 'Whop webhook signing secret (ws_...), required in production per Prompt 2' },
  { name: 'NEXT_PUBLIC_SITE_URL', required: isProduction, description: 'Public canonical site URL used by metadata/OG tags' },
  { name: 'SUPERADMIN_BOOTSTRAP_TOKEN', required: isProduction, description: 'Shared secret required by scripts/bootstrap-superadmin.ts' },
  { name: 'UPSTASH_REDIS_REST_URL', required: false, description: 'Optional distributed rate limiting' },
  { name: 'UPSTASH_REDIS_REST_TOKEN', required: false, description: 'Optional distributed rate limiting' },
  { name: 'ZAI_API_KEY', required: false, description: 'AI SDK key; blank disables /api/ai/* routes gracefully' },
  { name: 'DEV_ENTITLEMENT_SECRET', required: false, description: 'Guards /api/entitlement/set dev backdoor' },
  { name: 'DEBUG_PRISMA', required: false, description: '1 enables Prisma query logging' },
];

/**
 * Validate environment variables. Throws on missing required vars.
 * Call this once at app startup (e.g. in instrumentation.ts or layout.tsx).
 */
export function validateEnv(): void {
  const missing: string[] = [];

  for (const v of ENV_VARS) {
    if (v.required && !process.env[v.name]) {
      missing.push(v.name);
    }
  }

  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}. ` +
      'Check .env.example for required configuration.';
    if (isProduction) {
      throw new Error(msg);
    } else {
      console.warn(`[env] ${msg} (allowed in development)`);
    }
  }
}

/**
 * Get a validated env var, throwing if missing.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

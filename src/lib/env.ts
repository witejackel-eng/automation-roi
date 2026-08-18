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
  { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string (or SQLite for dev)' },
  { name: 'NEXTAUTH_SECRET', required: isProduction, description: 'NextAuth JWT signing secret (openssl rand -base64 32)' },
  { name: 'NEXTAUTH_URL', required: isProduction, description: 'NextAuth callback URL base' },
  { name: 'GITHUB_ID', required: isProduction, description: 'GitHub OAuth App ID' },
  { name: 'GITHUB_SECRET', required: isProduction, description: 'GitHub OAuth App Secret' },
  { name: 'BLOB_READ_WRITE_TOKEN', required: isProduction, description: 'Vercel Blob read-write token for PDF/logo storage' },
  { name: 'WHOP_WEBHOOK_SECRET', required: false, description: 'Whop webhook HMAC secret' },
  { name: 'UPSTASH_REDIS_REST_URL', required: false, description: 'Upstash Redis REST URL (optional, falls back to in-memory rate limit)' },
  { name: 'UPSTASH_REDIS_REST_TOKEN', required: false, description: 'Upstash Redis REST token' },
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

/**
 * Rate limiting — Upstash Redis sliding window with in-memory fallback.
 *
 * In production (UPSTASH_REDIS_REST_URL set): uses @upstash/ratelimit
 * for distributed rate limiting that survives horizontal serverless scaling.
 *
 * In development (no Upstash config): falls back to the existing
 * in-memory sliding-window limiter.
 *
 * FAILS OPEN: if Redis is unreachable, the request is allowed through
 * with structured logging. Never hard-fail a paying customer's
 * calculation because the limiter is down.
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ── In-memory fallback ───────────────────────────────────────────

const buckets = new Map<string, number[]>();

function inMemoryCheck(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const arr = (buckets.get(key) ?? []).filter((t) => t > cutoff);
  if (arr.length >= max) {
    buckets.set(key, arr);
    return false;
  }
  arr.push(now);
  buckets.set(key, arr);
  return true;
}

// ── Upstash Redis limiter (lazy init) ────────────────────────────

let ratelimiter: Ratelimit | null = null;
let redisInitAttempted = false;

function getRatelimiter(): Ratelimit | null {
  if (redisInitAttempted) return ratelimiter;
  redisInitAttempted = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.info('[rate-limit] No Upstash Redis configured — using in-memory fallback.');
    return null;
  }

  try {
    const redis = new Redis({ url, token });
    ratelimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
      prefix: 'viableo:ratelimit:',
    });
    console.info('[rate-limit] Upstash Redis rate limiter initialized.');
    return ratelimiter;
  } catch (err) {
    console.error('[rate-limit] Failed to initialize Upstash Redis — falling back to in-memory.', err);
    return null;
  }
}

// ── Share-view rate limiter (dedicated) ────────────────────────

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const shareViewLimiter: Ratelimit | null = hasRedis
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      prefix: 'viableo:share-view',
    })
  : null;

export async function checkShareViewRateLimit(identifier: string): Promise<boolean> {
  if (!shareViewLimiter) return true;
  try {
    const { success } = await shareViewLimiter.limit(identifier);
    return success;
  } catch {
    return true;
  }
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Check rate limit for a given key. Returns true if allowed, false if blocked.
 *
 * @param key - IP address or organization ID
 * @param windowMs - Window in milliseconds (default: 60_000 = 1 minute)
 * @param max - Max requests per window (default: 30)
 */
export async function checkRateLimit(
  key: string,
  windowMs: number = 60_000,
  max: number = 30
): Promise<boolean> {
  const limiter = getRatelimiter();

  if (limiter) {
    try {
      const result = await limiter.limit(key);
      return result.success;
    } catch (err) {
      // FAIL OPEN: never block a request because Redis is down.
      console.error('[rate-limit] Redis check failed — allowing request (fail-open).', err);
      return true;
    }
  }

  // Fallback to in-memory limiter.
  return inMemoryCheck(key, windowMs, max);
}

/**
 * Legacy sync API for backward compatibility.
 * @deprecated Use checkRateLimit() instead.
 */
export function safeCalc(key: string, windowMs: number, max: number): boolean {
  return inMemoryCheck(key, windowMs, max);
}

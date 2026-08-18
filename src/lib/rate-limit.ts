/**
 * Tiny in-memory rate limiter (Section 24). /api/calculate is unauthenticated
 * and cheap to abuse, so it is capped at 30 req/min/IP. Sliding window.
 */
const buckets = new Map<string, number[]>();

export function safeCalc(
  key: string,
  windowMs: number,
  max: number
): boolean {
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

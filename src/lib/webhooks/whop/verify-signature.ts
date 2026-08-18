/**
 * Whop webhook signature verification — Standard Webhooks spec.
 *
 * Extracted from src/app/api/webhooks/whop/route.ts for unit testability.
 * The route handler imports this and calls it; the test suite imports it
 * directly without needing a full Next.js request.
 *
 * Spec (per Viableo Production Architecture §5.1, citing Whop's own docs):
 *   - HMAC-SHA256 over the string `{webhook-id}.{webhook-timestamp}.{raw-body}`.
 *   - The webhook-signature header is `v1,<base64>` (possibly space-separated
 *     multiple values when the secret has been rotated).
 *   - Reject requests where |now - webhook-timestamp| > 5 minutes (replay
 *     protection).
 *   - Use constant-time comparison (timingSafeEqual) to prevent timing
 *     attacks.
 */
import { createHmac, timingSafeEqual } from 'crypto';

/** 5-minute replay-protection window (per Whop docs). */
export const WEBHOOK_TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;

/**
 * Compute the expected Whop signature for a given payload.
 * Exposed for testing — production callers use verifyWebhookSignature().
 */
export function computeExpectedSignature(
  webhookId: string,
  webhookTimestamp: string,
  rawBody: string,
  secret: string,
): string {
  const signedPayload = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  return createHmac('sha256', secret).update(signedPayload).digest('base64');
}

/**
 * Verify a Whop webhook signature per the Standard Webhooks spec.
 *
 * Returns true only if:
 *   (a) webhookId, webhookTimestamp, and webhookSignature are all present;
 *   (b) the timestamp parses as a finite number AND is within the
 *       5-minute tolerance window of the current time;
 *   (c) at least one of the space-separated `v1,<base64>` signatures in
 *       the webhook-signature header matches the HMAC-SHA256 of
 *       `{id}.{timestamp}.{body}`, compared in constant time.
 *
 * Returns false otherwise — including on any malformed/missing input.
 * (Never throws — the route handler treats a `false` return as a 401.)
 */
export function verifyWebhookSignature(
  rawBody: string,
  webhookId: string | null,
  webhookTimestamp: string | null,
  webhookSignatureHeader: string | null,
  secret: string,
): boolean {
  if (!webhookId || !webhookTimestamp || !webhookSignatureHeader) {
    return false;
  }

  // Replay-protection: reject timestamps more than 5 minutes old (or future).
  const ts = Number(webhookTimestamp);
  if (!Number.isFinite(ts)) return false;
  const ageMs = Math.abs(Date.now() - ts * 1000);
  if (ageMs > WEBHOOK_TIMESTAMP_TOLERANCE_MS) {
    return false;
  }

  const expectedSig = computeExpectedSignature(webhookId, webhookTimestamp, rawBody, secret);

  // The signature header may contain multiple space-separated `v1,<sig>`
  // values (for secret rotation). Accept any match.
  const sigs = webhookSignatureHeader
    .split(' ')
    .map((s) => s.trim())
    .filter((s) => s.startsWith('v1,'))
    .map((s) => s.slice(3));

  if (sigs.length === 0) return false;

  // Constant-time comparison against each candidate.
  const expectedBuf = Buffer.from(expectedSig, 'base64');
  for (const sig of sigs) {
    try {
      const sigBuf = Buffer.from(sig, 'base64');
      if (expectedBuf.length === sigBuf.length && timingSafeEqual(expectedBuf, sigBuf)) {
        return true;
      }
    } catch {
      // Malformed base64 in a candidate — skip it, try the next.
      continue;
    }
  }
  return false;
}

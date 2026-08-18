/**
 * Whop webhook signature verification tests (Phase 5).
 *
 * Per the master prompt §7: valid signature accepted, invalid rejected,
 * expired timestamp rejected, malformed payload rejected. Constant-time
 * comparison enforced.
 *
 * These tests use REAL HMAC computation (no mocks) — they exercise the
 * exact code path the production webhook handler uses.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import {
  verifyWebhookSignature,
  computeExpectedSignature,
  WEBHOOK_TIMESTAMP_TOLERANCE_MS,
} from '../verify-signature';
import { createHmac } from 'crypto';

const SECRET = 'whop_test_secret_ws_xxxxxxxxxxxxxxxxxxxxxxxx';

// A representative Whop webhook payload (sanitized).
const RAW_BODY = JSON.stringify({
  id: 'evt_001',
  type: 'payment.succeeded',
  data: {
    id: 'pay_001',
    amount: 4900,
    currency: 'usd',
    metadata: { organizationId: 'org_abc123' },
  },
});

const WEBHOOK_ID = 'evt_whop_abc123';
const NOW_UNIX = Math.floor(Date.now() / 1000).toString();
const FUTURE_UNIX = Math.floor((Date.now() + 60_000) / 1000).toString(); // +1 min
const EXPIRED_UNIX = Math.floor((Date.now() - 10 * 60_000) / 1000).toString(); // -10 min
const TOO_FAR_FUTURE_UNIX = Math.floor((Date.now() + 10 * 60_000) / 1000).toString(); // +10 min

function sign(id: string, ts: string, body: string, secret: string): string {
  // Standard Webhooks: v1,<base64-HMAC-SHA256 over `{id}.{ts}.{body}`>
  const sig = computeExpectedSignature(id, ts, body, secret);
  return `v1,${sig}`;
}

describe('verifyWebhookSignature — Standard Webhooks spec', () => {
  it('accepts a valid signature', () => {
    const sig = sign(WEBHOOK_ID, NOW_UNIX, RAW_BODY, SECRET);
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, NOW_UNIX, sig, SECRET);
    expect(ok).toBe(true);
  });

  it('rejects a signature computed with the wrong secret', () => {
    const sig = sign(WEBHOOK_ID, NOW_UNIX, RAW_BODY, 'wrong_secret');
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, NOW_UNIX, sig, SECRET);
    expect(ok).toBe(false);
  });

  it('rejects a signature computed over the wrong body', () => {
    const sig = sign(WEBHOOK_ID, NOW_UNIX, 'different body', SECRET);
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, NOW_UNIX, sig, SECRET);
    expect(ok).toBe(false);
  });

  it('rejects a signature with the wrong webhook-id in the signed payload', () => {
    const sig = sign('wrong_id', NOW_UNIX, RAW_BODY, SECRET);
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, NOW_UNIX, sig, SECRET);
    expect(ok).toBe(false);
  });

  it('rejects an expired timestamp (> 5 minutes old)', () => {
    const sig = sign(WEBHOOK_ID, EXPIRED_UNIX, RAW_BODY, SECRET);
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, EXPIRED_UNIX, sig, SECRET);
    expect(ok).toBe(false);
  });

  it('rejects a timestamp too far in the future (> 5 minutes ahead)', () => {
    const sig = sign(WEBHOOK_ID, TOO_FAR_FUTURE_UNIX, RAW_BODY, SECRET);
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, TOO_FAR_FUTURE_UNIX, sig, SECRET);
    expect(ok).toBe(false);
  });

  it('accepts a timestamp 1 minute in the future (within tolerance)', () => {
    const sig = sign(WEBHOOK_ID, FUTURE_UNIX, RAW_BODY, SECRET);
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, FUTURE_UNIX, sig, SECRET);
    expect(ok).toBe(true);
  });

  it('rejects a malformed webhook-signature header (no v1, prefix)', () => {
    const sig = 'v2,abcdef'; // wrong version prefix
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, NOW_UNIX, sig, SECRET);
    expect(ok).toBe(false);
  });

  it('rejects a malformed webhook-signature header (not base64)', () => {
    const ok = verifyWebhookSignature(
      RAW_BODY,
      WEBHOOK_ID,
      NOW_UNIX,
      'v1,!!!not-base64!!!',
      SECRET,
    );
    expect(ok).toBe(false);
  });

  it('rejects when webhook-id is missing', () => {
    const sig = sign(WEBHOOK_ID, NOW_UNIX, RAW_BODY, SECRET);
    const ok = verifyWebhookSignature(RAW_BODY, null, NOW_UNIX, sig, SECRET);
    expect(ok).toBe(false);
  });

  it('rejects when webhook-timestamp is missing', () => {
    const sig = sign(WEBHOOK_ID, NOW_UNIX, RAW_BODY, SECRET);
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, null, sig, SECRET);
    expect(ok).toBe(false);
  });

  it('rejects when webhook-signature header is missing', () => {
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, NOW_UNIX, null, SECRET);
    expect(ok).toBe(false);
  });

  it('rejects a non-numeric timestamp', () => {
    const sig = sign(WEBHOOK_ID, NOW_UNIX, RAW_BODY, SECRET);
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, 'not-a-number', sig, SECRET);
    expect(ok).toBe(false);
  });

  it('accepts any of multiple space-separated v1 signatures (secret rotation)', () => {
    // Simulate a rotated secret: the header carries signatures for both
    // the old and new secrets. Either should validate against the
    // current secret.
    const newSig = sign(WEBHOOK_ID, NOW_UNIX, RAW_BODY, SECRET);
    const oldSig = sign(WEBHOOK_ID, NOW_UNIX, RAW_BODY, 'old_secret');
    const header = `${oldSig} ${newSig}`;
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, NOW_UNIX, header, SECRET);
    expect(ok).toBe(true);
  });

  it('rejects when none of the multiple signatures match', () => {
    const oldSig = sign(WEBHOOK_ID, NOW_UNIX, RAW_BODY, 'old_secret_1');
    const otherSig = sign(WEBHOOK_ID, NOW_UNIX, RAW_BODY, 'old_secret_2');
    const header = `${oldSig} ${otherSig}`;
    const ok = verifyWebhookSignature(RAW_BODY, WEBHOOK_ID, NOW_UNIX, header, SECRET);
    expect(ok).toBe(false);
  });
});

describe('WEBHOOK_TIMESTAMP_TOLERANCE_MS', () => {
  it('is 5 minutes (300,000 ms) per Whop docs', () => {
    expect(WEBHOOK_TIMESTAMP_TOLERANCE_MS).toBe(5 * 60 * 1000);
  });
});

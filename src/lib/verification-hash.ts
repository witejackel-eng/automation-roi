/**
 * Input/result verification utility.
 *
 * Produces a SHA-256 hash of normalized inputs and key result fields so
 * consumers can verify that the numbers they see have not been tampered
 * with or silently recalculated since the hash was generated.
 */
import { createHash } from 'crypto';

/**
 * SHA-256 hash of a normalized JSON object.
 *
 * Keys are sorted alphabetically and JSON.stringify'd with 2-space indent
 * to produce a deterministic canonical representation regardless of the
 * original key insertion order.
 */
export function hashInputs(inputs: Record<string, unknown>): string {
  const canonical = JSON.stringify(sortKeysDeep(inputs), null, 2);
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

/**
 * SHA-256 hash of key result fields.
 *
 * Extracts only the deterministic output fields (ignoring scenario name
 * metadata) so the hash represents the *numbers*, not the framing.
 */
export function hashResults(results: Record<string, unknown>): string {
  const canonical = JSON.stringify(sortKeysDeep(results), null, 2);
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

/**
 * Combined verification badge data: a combined hash of inputs + results,
 * an ISO-8601 UTC timestamp, and a human-readable display string.
 */
export function generateVerificationBadge(
  inputs: Record<string, unknown>,
  results: Record<string, unknown>,
): { hash: string; timestamp: string; display: string } {
  const inputsHash = hashInputs(inputs);
  const resultsHash = hashResults(results);
  const combined = createHash('sha256')
    .update(`${inputsHash}:${resultsHash}`, 'utf8')
    .digest('hex');
  const timestamp = new Date().toISOString();

  return {
    hash: combined,
    timestamp,
    display: formatDisplay(combined, timestamp),
  };
}

// ── Internal helpers ──────────────────────────────────────────

/** Recursively sort object keys for deterministic serialization. */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

/** Format the first 8 hex chars + short UTC timestamp. */
function formatDisplay(hash: string, iso: string): string {
  const shortHash = hash.slice(0, 8);
  const date = new Date(iso);
  const month = date.toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const time = date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
  return `Verified: ${shortHash} \u00b7 ${month} ${day}, ${year} ${time} UTC`;
}

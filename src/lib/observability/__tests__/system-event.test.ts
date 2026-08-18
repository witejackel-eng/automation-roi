/**
 * Observability stub tests (Phase 5).
 *
 * The current implementation is a temporary stub (per Agent 1 master
 * prompt §7): console.debug in non-production, no-op in production,
 * never throws. Agent 2 will replace the body with a real Prisma write
 * — the signature MUST stay identical.
 *
 * These tests assert the stub's behavior contract so Agent 2's
 * replacement can be verified to preserve it.
 */
import { describe, it, expect, vi } from 'vitest';
import { logSystemEvent } from '../system-event';
import type { LogSystemEventInput } from '../types';

// Capture console.debug so we can assert the stub's behavior.
function captureConsoleDebug() {
  const original = console.debug;
  const calls: unknown[][] = [];
  console.debug = (...args: unknown[]) => calls.push(args);
  return {
    calls,
    restore() {
      console.debug = original;
    },
  };
}

describe('logSystemEvent — temporary stub (Agent 2 will replace the body)', () => {
  it('accepts a LogSystemEventInput and returns a Promise<void>', async () => {
    const input: LogSystemEventInput = {
      eventType: 'CALCULATION_STARTED',
      organizationId: 'org_123',
      userId: 'user_456',
      severity: 'info',
      metadata: { scenario: 'expected', durationMs: 42 },
      requestId: 'req_789',
    };
    const result = logSystemEvent(input);
    await expect(result).resolves.toBeUndefined();
  });

  it('never throws — observability must not become a source of request failures', async () => {
    const input: LogSystemEventInput = {
      eventType: 'DATABASE_ERROR',
      severity: 'error',
      metadata: { reason: 'observability must never fail the request' },
    };
    // Even with malformed metadata (e.g., circular reference), the stub
    // should not throw. JSON.stringify would throw on circular refs,
    // but the stub doesn't serialize — Agent 2's replacement MUST wrap
    // any Prisma write in try/catch per the master prompt.
    await expect(logSystemEvent(input)).resolves.toBeUndefined();
  });

  it('logs to console.debug in non-production (NODE_ENV !== "production")', async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const cap = captureConsoleDebug();
    try {
      await logSystemEvent({
        eventType: 'CALCULATION_COMPLETED',
        organizationId: 'org_test',
        metadata: { durationMs: 100 },
      });
      // The stub logs to console.debug in dev.
      expect(cap.calls.length).toBeGreaterThan(0);
      const firstCall = cap.calls[0];
      expect(firstCall[0]).toBe('[system-event:stub]');
      expect(firstCall[1]).toBe('CALCULATION_COMPLETED');
    } finally {
      cap.restore();
      process.env.NODE_ENV = original;
    }
  });

  it('is a no-op in production (no console.debug)', async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const cap = captureConsoleDebug();
    try {
      await logSystemEvent({
        eventType: 'CALCULATION_COMPLETED',
        organizationId: 'org_test',
        metadata: { durationMs: 100 },
      });
      expect(cap.calls.length).toBe(0);
    } finally {
      cap.restore();
      process.env.NODE_ENV = original;
    }
  });
});

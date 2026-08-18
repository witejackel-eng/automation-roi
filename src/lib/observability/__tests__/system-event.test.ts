/**
 * SystemEvent logger tests (Agent 2 — real Prisma-backed implementation).
 *
 * Agent 1's tests asserted the stub's behavior (console.debug in dev,
 * no-op in prod, never throws). Agent 2 replaces the stub with a real
 * Prisma write — these tests assert the real write behavior + that
 * the failure-isolation rule still holds (Prisma failures don't throw
 * out of logSystemEvent).
 *
 * The contract is unchanged from Agent 1's perspective: same
 * signature, same "never throws" guarantee.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LogSystemEventInput } from '../types';

// Mock the db so tests don't need a real database.
function makeMockDb() {
  const create = vi.fn();
  return {
    systemEvent: { create },
  };
}

vi.mock('@/lib/db', () => ({
  get db() {
    return (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb;
  },
}));

import { logSystemEvent } from '../system-event';

beforeEach(() => {
  (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb = makeMockDb();
});

describe('logSystemEvent — real Prisma-backed implementation', () => {
  it('persists a SystemEvent row with all fields mapped correctly', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.systemEvent.create.mockResolvedValue({ id: 'evt_1' });

    const input: LogSystemEventInput = {
      eventType: 'CALCULATION_COMPLETED',
      organizationId: 'org_123',
      userId: 'user_456',
      severity: 'info',
      metadata: { durationMs: 42, scenario: 'expected' },
      requestId: 'req_789',
    };
    await logSystemEvent(input);

    expect(mock.systemEvent.create).toHaveBeenCalledTimes(1);
    const args = mock.systemEvent.create.mock.calls[0][0];
    expect(args.data.eventType).toBe('CALCULATION_COMPLETED');
    expect(args.data.organizationId).toBe('org_123');
    expect(args.data.userId).toBe('user_456');
    expect(args.data.severity).toBe('info');
    expect(args.data.metadata).toBe(JSON.stringify({ durationMs: 42, scenario: 'expected' }));
    expect(args.data.requestId).toBe('req_789');
  });

  it('defaults severity to "info" when omitted', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.systemEvent.create.mockResolvedValue({ id: 'evt_2' });
    await logSystemEvent({ eventType: 'AUTH_FAILED' });
    const args = mock.systemEvent.create.mock.calls[0][0];
    expect(args.data.severity).toBe('info');
  });

  it('passes metadata as undefined when omitted (no JSON.stringify of undefined)', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.systemEvent.create.mockResolvedValue({ id: 'evt_3' });
    await logSystemEvent({ eventType: 'USER_SIGNED_IN', userId: 'u1' });
    const args = mock.systemEvent.create.mock.calls[0][0];
    expect(args.data.metadata).toBeUndefined();
  });

  it('NEVER throws — Prisma failures are caught and logged to console.error', async () => {
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.systemEvent.create.mockRejectedValue(new Error('DB connection refused'));
    // Capture console.error so the test output stays clean.
    const original = console.error;
    const calls: unknown[][] = [];
    console.error = (...args: unknown[]) => calls.push(args);
    try {
      // Must NOT throw — observability must never fail the request.
      await expect(logSystemEvent({ eventType: 'DATABASE_ERROR' })).resolves.toBeUndefined();
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('[system-event] failed to persist');
      expect(calls[0][1]).toBe('DATABASE_ERROR');
    } finally {
      console.error = original;
    }
  });

  it('does NOT recurse on DATABASE_ERROR events (would infinite-loop)', async () => {
    // The real impl's catch block logs to console.error but does NOT
    // call logSystemEvent({ eventType: 'DATABASE_ERROR' }) recursively.
    // Verify by failing the write and asserting create was called only once.
    const mock = (globalThis as { __mockDb?: ReturnType<typeof makeMockDb> }).__mockDb!;
    mock.systemEvent.create.mockRejectedValue(new Error('DB down'));
    const original = console.error;
    console.error = () => {};
    try {
      await logSystemEvent({ eventType: 'DATABASE_ERROR' });
      expect(mock.systemEvent.create).toHaveBeenCalledTimes(1);
    } finally {
      console.error = original;
    }
  });
});

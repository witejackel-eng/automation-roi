/**
 * Observability type contract tests (Phase 5).
 *
 * Per the Agent 1 master prompt §7 and Viableo Production Architecture
 * §14.3: this is the SEAM between Agent 1 (emits events) and Agent 2
 * (replaces the stub with a real Prisma write). The contract is
 * append-only/stable — Agent 2 must NOT rename existing event types or
 * LogSystemEventInput fields.
 *
 * These tests assert the contract so any breaking change is caught.
 */
import { describe, it, expect } from 'vitest';
import type { SystemEventType, LogSystemEventInput } from '../types';

describe('SystemEventType contract — stable seam between Agent 1 and Agent 2', () => {
  it('contains all 30 documented event types across the 7 families', () => {
    const expected: SystemEventType[] = [
      // AUTH (2)
      'USER_SIGNED_IN', 'AUTH_FAILED',
      // PRODUCT (6)
      'CALCULATION_STARTED', 'CALCULATION_COMPLETED', 'CALCULATION_FAILED',
      'PROJECT_CREATED', 'PROJECT_SAVED', 'PROJECT_REOPENED',
      // DELIVERABLE (5)
      'REPORT_STARTED', 'REPORT_GENERATED', 'REPORT_FAILED',
      'PROPOSAL_GENERATED', 'PROPOSAL_FAILED',
      // CLIENT-DELIVERY (4)
      'SHARE_CREATED', 'SHARE_VIEWED', 'SHARE_APPROVED', 'SHARE_CHANGES_REQUESTED',
      // AI (5)
      'AI_ESTIMATE_STARTED', 'AI_ESTIMATE_COMPLETED', 'AI_ESTIMATE_FAILED',
      'AI_NARRATIVE_COMPLETED', 'AI_RISK_ANALYSIS_COMPLETED',
      // BILLING (5)
      'WHOP_PAYMENT_RECEIVED', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_UPDATED',
      'SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION_REFUNDED',
      // SYSTEM (3)
      'DATABASE_ERROR', 'STORAGE_ERROR', 'WEBHOOK_ERROR',
    ];
    expect(expected.length).toBe(30);
    // Each name must be assignable to SystemEventType — TypeScript
    // would fail to compile this file if any name is missing or renamed.
    const all: SystemEventType[] = expected;
    expect(all).toEqual(expected);
  });

  it('LogSystemEventInput shape is stable', () => {
    // Build a complete input with every optional field populated.
    const input: LogSystemEventInput = {
      eventType: 'CALCULATION_COMPLETED',
      organizationId: 'org_test',
      userId: 'user_test',
      severity: 'info',
      metadata: { durationMs: 100, scenario: 'expected' },
      requestId: 'req_test',
    };
    expect(input.eventType).toBe('CALCULATION_COMPLETED');
    expect(input.organizationId).toBe('org_test');
    expect(input.userId).toBe('user_test');
    expect(input.severity).toBe('info');
    expect(input.metadata).toEqual({ durationMs: 100, scenario: 'expected' });
    expect(input.requestId).toBe('req_test');
  });

  it('severity is "info" | "warn" | "error"', () => {
    const s1: LogSystemEventInput['severity'] = 'info';
    const s2: LogSystemEventInput['severity'] = 'warn';
    const s3: LogSystemEventInput['severity'] = 'error';
    expect([s1, s2, s3]).toEqual(['info', 'warn', 'error']);
  });

  it('all LogSystemEventInput fields except eventType are optional', () => {
    // Just eventType — all other fields can be omitted.
    const input: LogSystemEventInput = { eventType: 'AUTH_FAILED' };
    expect(input.eventType).toBe('AUTH_FAILED');
  });
});

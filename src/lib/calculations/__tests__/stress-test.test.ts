/**
 * Stress-test + break-even tests — mandate §4.7 suite 2.
 *
 * Covers:
 *  - `PERMUTATION_COUNT` constant (must equal 64 — the homepage publishes
 *    "64 permutations", NOT "60+").
 *  - `computeBreakEven()` against the Apex golden case: implementation-fee
 *    break-even = $149,860 (the figure the homepage must display as the
 *    breaking point — NOT $27,400).
 *  - `computeMultiLeverPermutations()` returns 64 unique entries.
 *  - `computeSensitivity()` returns 4 sorted items with level/lowRoi/highRoi.
 *  - `stillViableStatement()` mentions the formatted break-even figure, and
 *    returns null when alreadyBroken.
 */
import { describe, it, expect } from 'vitest';
import {
  computeBreakEven,
  computeSensitivity,
  stillViableStatement,
  PERMUTATION_COUNT,
  computeMultiLeverPermutations,
  type BreakEvenThresholds,
} from '../stress-test';
import { APEX_INPUTS } from '../../golden-case';
import { calculateScenario } from '../engine';

describe('PERMUTATION_COUNT', () => {
  it('equals 64 (the documented count of unique permutations)', () => {
    expect(PERMUTATION_COUNT).toBe(64);
  });
});

describe('computeBreakEven() — Apex golden case', () => {
  it('implementationFee break-even === $149,860 (Math.round)', () => {
    const be = computeBreakEven(APEX_INPUTS);
    expect(be.implementationFee).not.toBeNull();
    expect(Math.round(be.implementationFee as number)).toBe(149860);
  });

  it('alreadyBroken === false (Apex expected net is +$131,860)', () => {
    const be = computeBreakEven(APEX_INPUTS);
    expect(be.alreadyBroken).toBe(false);
    // Confirm the +$131,860 figure cited in the spec.
    const expected = calculateScenario(APEX_INPUTS, 'expected');
    expect(Math.round(expected.netAnnualBenefit)).toBe(131860);
  });
});

describe('computeMultiLeverPermutations() — Apex', () => {
  it('returns an array of length 64', () => {
    const perms = computeMultiLeverPermutations(APEX_INPUTS);
    expect(perms).toHaveLength(64);
  });

  it('all 64 entries are unique by label string', () => {
    const perms = computeMultiLeverPermutations(APEX_INPUTS);
    const labels = new Set(perms.map((p) => p.label));
    expect(labels.size).toBe(64);
  });
});

describe('computeSensitivity() — Apex', () => {
  it('returns 4 items sorted by impact descending', () => {
    const items = computeSensitivity(APEX_INPUTS);
    expect(items).toHaveLength(4);
    for (let i = 1; i < items.length; i++) {
      expect(items[i].impact).toBeLessThanOrEqual(items[i - 1].impact);
    }
  });

  it('each item has label, impact (number), level (high|medium|low), lowRoi, highRoi', () => {
    const items = computeSensitivity(APEX_INPUTS);
    const validLevels = new Set(['high', 'medium', 'low']);
    for (const item of items) {
      expect(typeof item.label).toBe('string');
      expect(typeof item.impact).toBe('number');
      expect(validLevels.has(item.level)).toBe(true);
      // lowRoi/highRoi may be null only when totalFirstYearCost is zero (not the case for Apex).
      expect(typeof item.lowRoi === 'number' || item.lowRoi === null).toBe(true);
      expect(typeof item.highRoi === 'number' || item.highRoi === null).toBe(true);
    }
  });

  it('the top item is "high" impact (≥ 50pp) — the most material lever for Apex', () => {
    const items = computeSensitivity(APEX_INPUTS);
    expect(items[0].level).toBe('high');
    expect(items[0].impact).toBeGreaterThanOrEqual(50);
  });

  it('items[0].impact >= 15 (the impact is material, not noise)', () => {
    const items = computeSensitivity(APEX_INPUTS);
    expect(items[0].impact).toBeGreaterThanOrEqual(15);
  });

  it('the four lever labels are the expected set', () => {
    const items = computeSensitivity(APEX_INPUTS);
    const labels = items.map((i) => i.label).sort();
    expect(labels).toEqual(
      [
        'Automation coverage',
        'Conversion improvement',
        'Implementation cost',
        'Monthly AI/API cost',
      ].sort()
    );
  });
});

describe('stillViableStatement() — Apex', () => {
  it('returns a non-null string mentioning "$149,860"', () => {
    const be = computeBreakEven(APEX_INPUTS);
    const statement = stillViableStatement(be, APEX_INPUTS);
    expect(statement).not.toBeNull();
    expect(typeof statement).toBe('string');
    // The string must contain the break-even figure. Allow either
    // "149,860" (toLocaleString form) or "149860" (raw form).
    expect(statement).toMatch(/149[,.]?860/);
  });

  it('returns null when alreadyBroken === true', () => {
    // Construct a broken threshold — the engine is not asked to recompute,
    // we just hand stillViableStatement a synthetic object.
    const broken: BreakEvenThresholds = {
      implementationFee: 100,
      automationPct: 0.5,
      monthlyOperatingCost: 50,
      alreadyBroken: true,
    };
    expect(stillViableStatement(broken, APEX_INPUTS)).toBeNull();
  });
});

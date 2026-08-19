/**
 * Scenarios engine tests — mandate §4.7 suite 4.
 *
 * Covers:
 *  - `SCENARIO_MULTIPLIERS` (conservative/expected/upside) for automation and
 *    conversion improvement.
 *  - `UPSIDE_AUTOMATION_CEILING` (0.95).
 *  - `resolveScenarioAssumptions()` for all three scenarios, including the
 *    upside ceiling clamp when 0.8 × 1.25 = 1.0 would otherwise exceed 95%.
 *  - The three published net figures for Apex: conservative $29,284, expected
 *    $131,860, upside $189,700 — the homepage must display these EXACTLY.
 *  - `calculateAllScenarios()` returns all three scenario results.
 */
import { describe, it, expect } from 'vitest';
import {
  SCENARIO_MULTIPLIERS,
  resolveScenarioAssumptions,
  SCENARIO_LABELS,
  SCENARIO_ORDER,
  UPSIDE_AUTOMATION_CEILING,
} from '../scenarios';
import {
  calculateScenario,
  calculateAllScenarios,
} from '../engine';
import { APEX_INPUTS } from '../../golden-case';

describe('SCENARIO_MULTIPLIERS', () => {
  it('conservative.automationMultiplier === 0.65', () => {
    expect(SCENARIO_MULTIPLIERS.conservative.automationMultiplier).toBe(0.65);
  });

  it('conservative.conversionImprovementMultiplier === 0 (zeroes out conversion)', () => {
    expect(SCENARIO_MULTIPLIERS.conservative.conversionImprovementMultiplier).toBe(0);
  });

  it('expected.automationMultiplier === 1.0', () => {
    expect(SCENARIO_MULTIPLIERS.expected.automationMultiplier).toBe(1.0);
  });

  it('expected.conversionImprovementMultiplier === 1.0', () => {
    expect(SCENARIO_MULTIPLIERS.expected.conversionImprovementMultiplier).toBe(1.0);
  });

  it('upside.automationMultiplier === 1.25', () => {
    expect(SCENARIO_MULTIPLIERS.upside.automationMultiplier).toBe(1.25);
  });

  it('upside.conversionImprovementMultiplier === 1.5', () => {
    expect(SCENARIO_MULTIPLIERS.upside.conversionImprovementMultiplier).toBe(1.5);
  });
});

describe('UPSIDE_AUTOMATION_CEILING', () => {
  it('=== 0.95', () => {
    expect(UPSIDE_AUTOMATION_CEILING).toBe(0.95);
  });
});

describe('SCENARIO_LABELS / SCENARIO_ORDER', () => {
  it('labels are friendly proper-case strings', () => {
    expect(SCENARIO_LABELS.conservative).toBe('Conservative');
    expect(SCENARIO_LABELS.expected).toBe('Expected');
    expect(SCENARIO_LABELS.upside).toBe('Upside');
  });

  it('order is conservative, expected, upside', () => {
    expect(SCENARIO_ORDER).toEqual(['conservative', 'expected', 'upside']);
  });
});

describe('resolveScenarioAssumptions()', () => {
  it('conservative: automation 0.20 × 0.65 = 0.13, conversion 0.015 × 0 = 0', () => {
    const r = resolveScenarioAssumptions(0.2, 0.015, 'conservative');
    expect(r.automationPct).toBeCloseTo(0.13, 10);
    expect(r.conversionImprovementPct).toBe(0);
  });

  it('expected: automation 0.20 × 1.0 = 0.20, conversion 0.015 × 1.0 = 0.015', () => {
    const r = resolveScenarioAssumptions(0.2, 0.015, 'expected');
    expect(r.automationPct).toBeCloseTo(0.2, 10);
    expect(r.conversionImprovementPct).toBeCloseTo(0.015, 10);
  });

  it('upside: automation 0.20 × 1.25 = 0.25 (under ceiling), conversion 0.015 × 1.5 = 0.0225', () => {
    const r = resolveScenarioAssumptions(0.2, 0.015, 'upside');
    expect(r.automationPct).toBeCloseTo(0.25, 10);
    expect(r.conversionImprovementPct).toBeCloseTo(0.0225, 10);
  });

  it('upside clamps automation to 0.95 when 0.8 × 1.25 = 1.0 > ceiling', () => {
    const r = resolveScenarioAssumptions(0.8, 0.015, 'upside');
    expect(r.automationPct).toBe(0.95);
    // Conversion improvement is NOT clamped — only automation is.
    expect(r.conversionImprovementPct).toBeCloseTo(0.0225, 10);
  });
});

describe('calculateScenario() — the three published Apex net figures', () => {
  it('conservative netAnnualBenefit ≈ $29,284', () => {
    const r = calculateScenario(APEX_INPUTS, 'conservative');
    expect(Math.round(r.netAnnualBenefit)).toBe(29284);
  });

  it('expected netAnnualBenefit ≈ $131,860', () => {
    const r = calculateScenario(APEX_INPUTS, 'expected');
    expect(Math.round(r.netAnnualBenefit)).toBe(131860);
  });

  it('upside netAnnualBenefit ≈ $189,700', () => {
    const r = calculateScenario(APEX_INPUTS, 'upside');
    expect(Math.round(r.netAnnualBenefit)).toBe(189700);
  });
});

describe('calculateAllScenarios()', () => {
  it('returns an object with conservative/expected/upside keys, each carrying the correct net', () => {
    const all = calculateAllScenarios(APEX_INPUTS);
    expect(Object.keys(all).sort()).toEqual(['conservative', 'expected', 'upside']);
    expect(Math.round(all.conservative.netAnnualBenefit)).toBe(29284);
    expect(Math.round(all.expected.netAnnualBenefit)).toBe(131860);
    expect(Math.round(all.upside.netAnnualBenefit)).toBe(189700);
  });
});

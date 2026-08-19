/**
 * Marketing-numbers guard test — mandate §4.7 suite 5 (THE GUARD TEST).
 *
 * This suite is the guard against the wrong-number class of defect
 * (mandate P0-2..P0-6). The homepage must display only numbers asserted
 * here. If a displayed number is not asserted, add it.
 *
 * Every dollar, percentage, count, and threshold the marketing narrative
 * surfaces is asserted here against the value the engine actually computes.
 * If the engine changes, this test breaks — and the homepage must be updated
 * to match, never the reverse.
 *
 * Defects this guards against (from the mandate):
 *   - P0-2: Homepage displayed "$27,400" as the breaking point.
 *           The actual break-even implFee is $149,860. (Asserted below.)
 *   - P0-3..5: Hardcoded sensitivity rows / verdict-ladder rows / mock-slider
 *           percentages that diverged from engine-derived values.
 *   - P0-6: Homepage said "60+ assumption permutations". The actual count
 *           is 64. (Asserted below; also guarded with .not.toBe(60).)
 */
import { describe, it, expect } from 'vitest';
import { APEX_INPUTS } from '../../golden-case';
import {
  calculateScenario,
  calculateAllScenarios,
} from '../engine';
import {
  computeBreakEven,
  PERMUTATION_COUNT,
} from '../stress-test';
import {
  computeConfidenceScore,
  confidenceLabel,
  CONFIDENCE_WEIGHTS,
  STATUS_MULTIPLIERS,
} from '../confidence';
import { SCENARIO_MULTIPLIERS } from '../scenarios';
import { recommend } from '../recommendation';

// ─── Apex Expected scenario ────────────────────────────────────────────────
describe('Marketing guard — Apex Expected scenario numbers', () => {
  const expected = calculateScenario(APEX_INPUTS, 'expected');

  it('totalAnnualBenefit === $159,360', () => {
    expect(Math.round(expected.totalAnnualBenefit)).toBe(159360);
  });

  it('totalFirstYearCost === $27,500', () => {
    expect(Math.round(expected.totalFirstYearCost)).toBe(27500);
  });

  it('netAnnualBenefit === $131,860', () => {
    expect(Math.round(expected.netAnnualBenefit)).toBe(131860);
  });

  it('roiPct rounds to one decimal === 479.5%', () => {
    // roiPct = 131860 / 27500 * 100 = 479.4909...
    // Math.round(479.49) = 479 (not 480); the displayed value is 479.5 (one-decimal).
    expect(Math.round((expected.roiPct as number) * 10) / 10).toBe(479.5);
    // Sanity band: 479 < roiPct < 480 (the raw value lives in this range).
    expect(expected.roiPct).toBeGreaterThan(479);
    expect(expected.roiPct).toBeLessThan(480);
  });

  it('paybackMonths rounds to two decimals === 1.64 months', () => {
    // paybackMonths = 18000 / (131860/12) = 1.6381...
    expect(Math.round((expected.paybackMonths as number) * 100) / 100).toBe(1.64);
    // Sanity band: 1.6 < payback < 1.7.
    expect(expected.paybackMonths).toBeGreaterThan(1.6);
    expect(expected.paybackMonths).toBeLessThan(1.7);
  });
});

// ─── Apex Conservative scenario ─────────────────────────────────────────────
describe('Marketing guard — Apex Conservative scenario numbers', () => {
  const conservative = calculateScenario(APEX_INPUTS, 'conservative');

  it('netAnnualBenefit === $29,284', () => {
    expect(Math.round(conservative.netAnnualBenefit)).toBe(29284);
  });

  it('roiPct rounds to one decimal === 106.5%', () => {
    // roiPct = 29284 / 27500 * 100 = 106.487...
    expect(Math.round((conservative.roiPct as number) * 10) / 10).toBe(106.5);
  });

  it('paybackMonths rounds to two decimals === 7.38 months', () => {
    // paybackMonths = 18000 / (29284/12) = 7.376...
    expect(Math.round((conservative.paybackMonths as number) * 100) / 100).toBe(7.38);
    // Sanity band: 7.3 < payback < 7.4.
    expect(conservative.paybackMonths).toBeGreaterThan(7.3);
    expect(conservative.paybackMonths).toBeLessThan(7.4);
  });
});

// ─── Apex Upside scenario ──────────────────────────────────────────────────
describe('Marketing guard — Apex Upside scenario numbers', () => {
  const upside = calculateScenario(APEX_INPUTS, 'upside');

  it('netAnnualBenefit === $189,700', () => {
    expect(Math.round(upside.netAnnualBenefit)).toBe(189700);
  });

  it('roiPct rounds to one decimal === 689.8%', () => {
    // roiPct = 189700 / 27500 * 100 = 689.818...
    expect(Math.round((upside.roiPct as number) * 10) / 10).toBe(689.8);
  });

  it('paybackMonths rounds to two decimals === 1.14 months', () => {
    // paybackMonths = 18000 / (189700/12) = 1.1386...
    expect(Math.round((upside.paybackMonths as number) * 100) / 100).toBe(1.14);
    // Sanity band: 1.1 < payback < 1.2.
    expect(upside.paybackMonths).toBeGreaterThan(1.1);
    expect(upside.paybackMonths).toBeLessThan(1.2);
  });
});

// ─── Break-even point (the homepage "breaking point" figure) ───────────────
describe('Marketing guard — Break-even point', () => {
  it('computeBreakEven(APEX_INPUTS).implementationFee === $149,860 (the real net-zero solve)', () => {
    const be = computeBreakEven(APEX_INPUTS);
    expect(be.implementationFee).not.toBeNull();
    // Positive assertion is the guard: the homepage MUST display this exact
    // engine-computed figure. The previously-published wrong figure is absent
    // from src/ by construction (grep -r returns nothing).
    expect(Math.round(be.implementationFee as number)).toBe(149860);
  });
});

// ─── Permutation count (the homepage "X permutations" figure) ───────────────
describe('Marketing guard — Permutation count', () => {
  it('PERMUTATION_COUNT === 64 (NOT 60, and the homepage must say "64 permutations")', () => {
    expect(PERMUTATION_COUNT).toBe(64);
    // Explicit guard: PERMUTATION_COUNT must never regress to 60 (the
    // previous "60+ assumption permutations" copy was wrong).
    expect(PERMUTATION_COUNT).not.toBe(60);
  });
});

// ─── Verdict ladder boundaries (BUILD → CONSIDER → DONT_BUILD) ──────────────
describe('Marketing guard — Verdict ladder boundaries', () => {
  it('BUILD at implFee = $74,000 (below the $74,930 boundary)', () => {
    const r = recommend(
      calculateScenario(
        { ...APEX_INPUTS, implementationFee: 74000 },
        'expected'
      )
    );
    expect(r.recommendation).toBe('build');
  });

  it('CONSIDER at implFee = $80,000 (inside the $74,930–$99,907 band)', () => {
    const r = recommend(
      calculateScenario(
        { ...APEX_INPUTS, implementationFee: 80000 },
        'expected'
      )
    );
    expect(r.recommendation).toBe('consider');
  });

  it('DONT_BUILD at implFee = $100,000 (above the $99,907 boundary)', () => {
    const r = recommend(
      calculateScenario(
        { ...APEX_INPUTS, implementationFee: 100000 },
        'expected'
      )
    );
    expect(r.recommendation).toBe('dont_build');
  });
});

// ─── Confidence weights and status multipliers ────────────────────────────
describe('Marketing guard — Confidence weights and status multipliers', () => {
  it('CONFIDENCE_WEIGHTS sum === 100 (homepage must state these weights)', () => {
    const sum = Object.values(CONFIDENCE_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it('STATUS_MULTIPLIERS provided/estimated/assumption === 1.0/0.6/0.3', () => {
    expect(STATUS_MULTIPLIERS.provided).toBe(1.0);
    expect(STATUS_MULTIPLIERS.estimated).toBe(0.6);
    expect(STATUS_MULTIPLIERS.assumption).toBe(0.3);
  });

  it('SCENARIO_MULTIPLIERS — conservative/expected/upside automation & conversion', () => {
    // Pinned for the homepage's methodology page (which publishes these).
    expect(SCENARIO_MULTIPLIERS.conservative.automationMultiplier).toBe(0.65);
    expect(SCENARIO_MULTIPLIERS.conservative.conversionImprovementMultiplier).toBe(0);
    expect(SCENARIO_MULTIPLIERS.expected.automationMultiplier).toBe(1.0);
    expect(SCENARIO_MULTIPLIERS.expected.conversionImprovementMultiplier).toBe(1.0);
    expect(SCENARIO_MULTIPLIERS.upside.automationMultiplier).toBe(1.25);
    expect(SCENARIO_MULTIPLIERS.upside.conversionImprovementMultiplier).toBe(1.5);
  });

  it('Apex confidence score === 71 (computed from the documented statuses)', () => {
    const result = computeConfidenceScore({
      hourlyLaborCost: 'provided',
      workloadVolume: 'provided',
      implementationFee: 'provided',
      automationCoverage: 'estimated',
      conversionImprovement: 'estimated',
      errorCost: 'assumption',
      otherInputs: 'assumption',
      // platformApiCost omitted -> assumption.
    });
    expect(result.score).toBe(71);
    expect(confidenceLabel(result.score)).toBe('Moderate confidence');
  });
});

// ─── Confidence label bands (homepage publishes these four bands) ──────────
describe('Marketing guard — confidenceLabel four bands', () => {
  it('publishes four bands at 80/60/40 boundaries', () => {
    expect(confidenceLabel(80)).toBe('High confidence');
    expect(confidenceLabel(79)).toBe('Moderate confidence');
    expect(confidenceLabel(60)).toBe('Moderate confidence');
    expect(confidenceLabel(59)).toBe('Material uncertainty');
    expect(confidenceLabel(40)).toBe('Material uncertainty');
    expect(confidenceLabel(39)).toBe('Low confidence');
    expect(confidenceLabel(0)).toBe('Low confidence');
  });
});

// ─── calculateAllScenarios smoke (used by the homepage hero stat row) ──────
describe('Marketing guard — calculateAllScenarios returns all three', () => {
  it('returns conservative/expected/upside with correct net figures', () => {
    const all = calculateAllScenarios(APEX_INPUTS);
    expect(Math.round(all.conservative.netAnnualBenefit)).toBe(29284);
    expect(Math.round(all.expected.netAnnualBenefit)).toBe(131860);
    expect(Math.round(all.upside.netAnnualBenefit)).toBe(189700);
  });
});

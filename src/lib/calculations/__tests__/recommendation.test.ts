/**
 * Recommendation engine tests — mandate §4.7 suite 1.
 *
 * Covers:
 *  - `recommend()` single-scenario verdict across the decision tree.
 *  - The verdict-ladder (BUILD → CONSIDER → DONT_BUILD) as `implementationFee`
 *    is swept from $0 → $160,000 in $1,000 steps.
 *  - `recommendWithConfidence()` project-level verdict across the three gates
 *    (conservative ROI, conservative payback, confidence band).
 *
 * Reference boundaries (verified against the engine):
 *  - BUILD         when implFee ≤ $74,930   (12-month payback gate binds)
 *  - CONSIDER      when $74,930 < implFee ≤ $99,907  (24-month payback gate)
 *  - DONT_BUILD    when implFee > $99,907    (payback > 24mo, OR net ≤ 0)
 *  - DONT_BUILD    at implFee = $149,860     (net = 0 → branch 1 fires)
 */
import { describe, it, expect } from 'vitest';
import {
  recommend,
  recommendWithConfidence,
} from '../recommendation';
import {
  calculateScenario,
  calculateAllScenarios,
  type CalculatorInputs,
} from '../engine';
import { APEX_INPUTS } from '../../golden-case';

describe('recommend() — single-scenario verdict', () => {
  it('returns BUILD at Apex expected (implementationFee = $18,000)', () => {
    const expected = calculateScenario(APEX_INPUTS, 'expected');
    const r = recommend(expected);
    expect(r.recommendation).toBe('build');
    expect(r.reason).toBe('build');
  });

  it('returns DONT_BUILD when netAnnualBenefit <= 0 (reason: "negative")', () => {
    // Construct a result object with the documented negative shape.
    const negativeResult = {
      ...calculateScenario(APEX_INPUTS, 'expected'),
      netAnnualBenefit: -1,
      paybackMonths: null,
      roiPct: -10,
      totalFirstYearCost: 10000,
    };
    const r = recommend(negativeResult);
    expect(r.recommendation).toBe('dont_build');
    expect(r.reason).toBe('negative');
  });
});

describe('recommend() — verdict ladder across implementation-fee sweep', () => {
  // Clone APEX_INPUTS, sweep implementationFee from $0 → $160,000 in $1,000
  // steps. For each step, call recommend(calculateScenario(modified, 'expected'))
  // and collect the verdict. Then assert the documented boundary points.
  const ladder: Record<number, ReturnType<typeof recommend>> = {};
  for (let fee = 0; fee <= 160000; fee += 1000) {
    const modified: CalculatorInputs = {
      ...APEX_INPUTS,
      implementationFee: fee,
    };
    const result = calculateScenario(modified, 'expected');
    ladder[fee] = recommend(result);
  }

  it('BUILD at implFee = $74,000 (below the $74,930 boundary)', () => {
    expect(ladder[74000].recommendation).toBe('build');
  });

  it('CONSIDER at implFee = $80,000 (inside the $74,930–$99,907 band)', () => {
    expect(ladder[80000].recommendation).toBe('consider');
  });

  it('CONSIDER at implFee = $95,000 (upper portion of the CONSIDER band)', () => {
    expect(ladder[95000].recommendation).toBe('consider');
  });

  it('DONT_BUILD at implFee = $100,000 (above the $99,907 boundary)', () => {
    expect(ladder[100000].recommendation).toBe('dont_build');
  });

  it('DONT_BUILD at implFee = $149,860 (net-zero break-even, branch 1 fires)', () => {
    // The $1,000-step sweep lands at 149000 and 150000 — we test the exact
    // break-even value separately to verify branch 1 (negative economics).
    const modified: CalculatorInputs = {
      ...APEX_INPUTS,
      implementationFee: 149860,
    };
    const result = calculateScenario(modified, 'expected');
    const r = recommend(result);
    expect(r.recommendation).toBe('dont_build');
    expect(r.reason).toBe('negative');
    expect(result.netAnnualBenefit).toBe(0);
  });

  it('the sweep produces a strict BUILD → CONSIDER → DONT_BUILD ordering', () => {
    // Sanity: as implFee rises, the verdict only moves build → consider → dont_build.
    const order = ['build', 'consider', 'dont_build'];
    let prevIndex = -1;
    for (let fee = 0; fee <= 160000; fee += 1000) {
      const idx = order.indexOf(ladder[fee].recommendation);
      // allow equal (same verdict) or forward step (next verdict in ladder)
      expect(idx).toBeGreaterThanOrEqual(prevIndex);
      prevIndex = idx;
    }
  });
});

describe('recommendWithConfidence() — project-level verdict', () => {
  // Pull both scenarios via calculateAllScenarios so that helper is exercised.
  const scenarios = calculateAllScenarios(APEX_INPUTS);
  const expected = scenarios.expected;
  const conservative = scenarios.conservative;

  it('returns BUILD when all three gates pass (conservative ROI 106.5 > 50, payback 7.38 ≤ 12, confidence 80 ≥ 60)', () => {
    const r = recommendWithConfidence({
      expected,
      conservative,
      confidenceScore: 80,
    });
    expect(r.recommendation).toBe('build');
    expect(r.reason).toBe('build');
  });

  it('forces CONSIDER when confidence is 40–59 despite passing economics (branch 3 confidence band)', () => {
    const r = recommendWithConfidence({
      expected,
      conservative,
      confidenceScore: 50,
    });
    expect(r.recommendation).toBe('consider');
    expect(r.reason).toBe('consider');
  });

  it('returns DONT_BUILD when expected.netAnnualBenefit <= 0 (branch 1 fires)', () => {
    const negativeExpected = {
      ...expected,
      netAnnualBenefit: -1,
    };
    const r = recommendWithConfidence({
      expected: negativeExpected,
      conservative,
      confidenceScore: 80,
    });
    expect(r.recommendation).toBe('dont_build');
    expect(r.reason).toBe('negative');
  });

  it('BUILD requires all three gates — conservative failing ROI forces CONSIDER (branch 3)', () => {
    // Construct a conservative that fails the ROI gate (roiPct = 30 ≤ 50)
    // while passing the payback gate (8 ≤ 12). With confidence = 80 ≥ 60
    // but conservative ROI < 50, branch 2 cannot fire. Branch 3 fires
    // because expected ROI > 50 AND conservative ROI ≤ 50.
    const weakConservative = {
      ...conservative,
      roiPct: 30,
      paybackMonths: 8,
    };
    const r = recommendWithConfidence({
      expected,
      conservative: weakConservative,
      confidenceScore: 80,
    });
    expect(r.recommendation).not.toBe('build');
    expect(r.recommendation).toBe('consider');
    expect(r.reason).toBe('consider');
  });
});

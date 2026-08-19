/**
 * Confidence score tests — mandate §4.7 suite 3.
 *
 * Covers:
 *  - `CONFIDENCE_WEIGHTS` sum to 100 (homepage must publish these weights).
 *  - `STATUS_MULTIPLIERS` provided/estimated/assumption = 1.0/0.6/0.3
 *    (homepage must publish these multipliers).
 *  - `confidenceLabel()` boundary bands at 80/60/40 (homepage publishes 4 bands).
 *  - `computeConfidenceScore()` against all-provided (100), all-assumption (30),
 *    and the Apex statuses (70.5 → Math.round = 71).
 *  - `confidenceSummary()` "Strong on…" and "relies on…" clauses.
 */
import { describe, it, expect } from 'vitest';
import {
  computeConfidenceScore,
  confidenceLabel,
  confidenceSummary,
  CONFIDENCE_WEIGHTS,
  STATUS_MULTIPLIERS,
  INPUT_LABELS,
  type InputStatus,
} from '../confidence';

describe('CONFIDENCE_WEIGHTS', () => {
  it('sum to 100 (the homepage must publish these weights)', () => {
    const sum = Object.values(CONFIDENCE_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it('every weight is positive', () => {
    for (const w of Object.values(CONFIDENCE_WEIGHTS)) {
      expect(w).toBeGreaterThan(0);
    }
  });
});

describe('STATUS_MULTIPLIERS', () => {
  it('provided === 1.0', () => {
    expect(STATUS_MULTIPLIERS.provided).toBe(1.0);
  });

  it('estimated === 0.6', () => {
    expect(STATUS_MULTIPLIERS.estimated).toBe(0.6);
  });

  it('assumption === 0.3', () => {
    expect(STATUS_MULTIPLIERS.assumption).toBe(0.3);
  });
});

describe('INPUT_LABELS', () => {
  it('provides a friendly label for every weighted input', () => {
    for (const key of Object.keys(CONFIDENCE_WEIGHTS)) {
      expect(INPUT_LABELS[key as keyof typeof INPUT_LABELS]).toBeTruthy();
    }
  });
});

describe('confidenceLabel() — four-band boundary ladder', () => {
  it('80 -> "High confidence" (boundary inclusive)', () => {
    expect(confidenceLabel(80)).toBe('High confidence');
  });

  it('79 -> "Moderate confidence"', () => {
    expect(confidenceLabel(79)).toBe('Moderate confidence');
  });

  it('60 -> "Moderate confidence" (boundary inclusive)', () => {
    expect(confidenceLabel(60)).toBe('Moderate confidence');
  });

  it('59 -> "Material uncertainty"', () => {
    expect(confidenceLabel(59)).toBe('Material uncertainty');
  });

  it('40 -> "Material uncertainty" (boundary inclusive)', () => {
    expect(confidenceLabel(40)).toBe('Material uncertainty');
  });

  it('39 -> "Low confidence"', () => {
    expect(confidenceLabel(39)).toBe('Low confidence');
  });

  it('0 -> "Low confidence"', () => {
    expect(confidenceLabel(0)).toBe('Low confidence');
  });
});

describe('computeConfidenceScore()', () => {
  it('all-provided statuses -> score === 100', () => {
    const statuses: Record<string, InputStatus> = {
      hourlyLaborCost: 'provided',
      workloadVolume: 'provided',
      implementationFee: 'provided',
      automationCoverage: 'provided',
      conversionImprovement: 'provided',
      platformApiCost: 'provided',
      otherInputs: 'provided',
      errorCost: 'provided',
    };
    expect(computeConfidenceScore(statuses).score).toBe(100);
  });

  it('all-assumption statuses -> score === 30 (100 × 0.3)', () => {
    const statuses: Record<string, InputStatus> = {
      hourlyLaborCost: 'assumption',
      workloadVolume: 'assumption',
      implementationFee: 'assumption',
      automationCoverage: 'assumption',
      conversionImprovement: 'assumption',
      platformApiCost: 'assumption',
      otherInputs: 'assumption',
      errorCost: 'assumption',
    };
    expect(computeConfidenceScore(statuses).score).toBe(30);
  });

  it('Apex statuses -> score === 71 (Math.round(70.5)) and label "Moderate confidence"', () => {
    // Apex statuses:
    //   hourlyLaborCost/workloadVolume/implementationFee = provided (15+15+15 = 45)
    //   automationCoverage/conversionImprovement = estimated (15*0.6 + 15*0.6 = 9 + 9 = 18)
    //   errorCost/otherInputs = assumption (5*0.3 + 10*0.3 = 1.5 + 3 = 4.5)
    //   platformApiCost omitted -> assumption (10*0.3 = 3)
    // Sum = 45 + 18 + 4.5 + 3 = 70.5 -> Math.round(70.5) = 71 in JS.
    const statuses: Record<string, InputStatus> = {
      hourlyLaborCost: 'provided',
      workloadVolume: 'provided',
      implementationFee: 'provided',
      automationCoverage: 'estimated',
      conversionImprovement: 'estimated',
      errorCost: 'assumption',
      otherInputs: 'assumption',
      // platformApiCost deliberately omitted -> defaults to assumption.
    };
    const result = computeConfidenceScore(statuses);
    expect(result.score).toBe(71);
    expect(confidenceLabel(result.score)).toBe('Moderate confidence');
  });

  it('breakdown sums to the raw score before rounding', () => {
    const statuses: Record<string, InputStatus> = {
      hourlyLaborCost: 'provided',
      workloadVolume: 'provided',
      implementationFee: 'provided',
      automationCoverage: 'estimated',
      conversionImprovement: 'estimated',
      errorCost: 'assumption',
      otherInputs: 'assumption',
    };
    const result = computeConfidenceScore(statuses);
    const rawSum = result.breakdown.reduce((acc, b) => acc + b.contribution, 0);
    // Apex breakdown: 15 + 15 + 15 (provided) + 9 + 9 (estimated) +
    // 1.5 + 3 + 3 (assumption, including the omitted platformApiCost) = 70.5.
    expect(rawSum).toBeCloseTo(70.5, 5);
    expect(result.score).toBe(Math.round(rawSum));
  });
});

describe('confidenceSummary()', () => {
  it('all-provided -> string starts with "Strong on" and contains no "relies on"', () => {
    const allProvided: Record<string, InputStatus> = {
      hourlyLaborCost: 'provided',
      workloadVolume: 'provided',
      implementationFee: 'provided',
      automationCoverage: 'provided',
      conversionImprovement: 'provided',
      platformApiCost: 'provided',
      otherInputs: 'provided',
      errorCost: 'provided',
    };
    const summary = confidenceSummary(computeConfidenceScore(allProvided).breakdown);
    expect(summary.startsWith('Strong on')).toBe(true);
    expect(summary).not.toContain('relies on');
  });

  it('all-assumption -> string contains "relies on" and does NOT contain "Strong on"', () => {
    const allAssumption: Record<string, InputStatus> = {
      hourlyLaborCost: 'assumption',
      workloadVolume: 'assumption',
      implementationFee: 'assumption',
      automationCoverage: 'assumption',
      conversionImprovement: 'assumption',
      platformApiCost: 'assumption',
      otherInputs: 'assumption',
      errorCost: 'assumption',
    };
    const summary = confidenceSummary(computeConfidenceScore(allAssumption).breakdown);
    expect(summary).toContain('relies on');
    expect(summary).not.toContain('Strong on');
  });
});

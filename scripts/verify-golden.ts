/**
 * Runnable golden-case verification (Section 12). Mirrors engine.test.ts but
 * uses plain assertions so it can be executed directly with `bun run`.
 *
 *   bun run scripts/verify-golden.ts
 */
import { calculateScenario } from '../src/lib/calculations/engine';
import { recommend } from '../src/lib/calculations/recommendation';
import { APEX_INPUTS } from '../src/lib/golden-case';

let failures = 0;
function assert(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures++;
    console.error(`FAIL  ${name}\n        expected ${e}\n        received ${a}`);
  } else {
    console.log(`ok    ${name} = ${a}`);
  }
}
function assertClose(name: string, actual: number, expected: number, tol = 0.05) {
  const ok = Math.abs(actual - expected) < tol;
  if (!ok) {
    failures++;
    console.error(`FAIL  ${name}\n        expected ~${expected}\n        received ${actual}`);
  } else {
    console.log(`ok    ${name} = ${actual}`);
  }
}

console.log('\n=== Apex Home Services — golden verification ===\n');

const exp = calculateScenario(APEX_INPUTS, 'expected');
const con = calculateScenario(APEX_INPUTS, 'conservative');
const ups = calculateScenario(APEX_INPUTS, 'upside');

console.log('— Expected —');
assert('annualLaborCost', exp.annualLaborCost, 436_800);
assert('annualLaborSavings', exp.annualLaborSavings, 87_360);
assert('totalFirstYearCost', exp.totalFirstYearCost, 26_600);
assert('additionalCustomers', exp.additionalCustomers, 90);
assert('additionalAnnualRevenue', exp.additionalAnnualRevenue, 180_000);
assert('additionalGrossProfit', exp.additionalGrossProfit, 72_000);
assert('totalAnnualBenefit', exp.totalAnnualBenefit, 159_360);
assert('netAnnualBenefit', exp.netAnnualBenefit, 132_760);
assert('roiPct (rounded)', Math.round(exp.roiPct as number), 499);
assert('automationPct', exp.automationPct, 0.2);
assert('conversionImprovementPct', exp.conversionImprovementPct, 0.015);
assertClose('paybackMonths', exp.paybackMonths as number, 1.63, 0.05);
assert('recommendation', recommend(exp).recommendation, 'build');

console.log('\n— Conservative —');
assert('annualLaborSavings', con.annualLaborSavings, 56_784);
assert('additionalCustomers', con.additionalCustomers, 0);
assert('netAnnualBenefit', con.netAnnualBenefit, 30_184);
assert('roiPct (rounded)', Math.round(con.roiPct as number), 113);
assert('automationPct', con.automationPct, 0.13);
assert('conversionImprovementPct', con.conversionImprovementPct, 0);

console.log('\n— Upside —');
assert('additionalCustomers', ups.additionalCustomers, 135);
assert('netAnnualBenefit', ups.netAnnualBenefit, 190_600);
assert('roiPct (rounded)', Math.round(ups.roiPct as number), 717);
assert('automationPct', ups.automationPct, 0.25);
assert('conversionImprovementPct', ups.conversionImprovementPct, 0.0225);

console.log('\n— QA matrix spot checks (Section 26) —');

// #2 raise implementation fee to $95,000 -> CONSIDER
const q2 = calculateScenario({ ...APEX_INPUTS, implementationFee: 95_000 }, 'expected');
assert('#2 recommendation', recommend(q2).recommendation, 'consider');
// payback between 12 and 24 months
assert('#2 payback in (12,24]', (q2.paybackMonths as number) > 12 && (q2.paybackMonths as number) <= 24, true);

// #3 raise implementation fee to $400,000 -> DON'T BUILD, net negative
const q3 = calculateScenario({ ...APEX_INPUTS, implementationFee: 400_000 }, 'expected');
assert('#3 recommendation', recommend(q3).recommendation, 'dont_build');
assert('#3 net negative', q3.netAnnualBenefit < 0, true);

// #4 zero leads -> no crash, revenue 0
const q4 = calculateScenario({ ...APEX_INPUTS, leadsPerMonth: 0 }, 'expected');
assert('#4 additionalCustomers', q4.additionalCustomers, 0);
assert('#4 additionalAnnualRevenue', q4.additionalAnnualRevenue, 0);

// #5 zero conversion improvement -> revenue $0, savings computed
const q5 = calculateScenario({ ...APEX_INPUTS, expectedConversionImprovementPct: 0 }, 'expected');
assert('#5 additionalCustomers', q5.additionalCustomers, 0);
assert('#5 annualLaborSavings', q5.annualLaborSavings, 87_360);

// #6 impl fee $500k -> payback shows a large number / Never, not Infinity
const q6 = calculateScenario({ ...APEX_INPUTS, implementationFee: 500_000 }, 'expected');
assert('#6 paybackMonths is null (Never)', q6.paybackMonths, null);
assert('#6 recommendation', recommend(q6).recommendation, 'dont_build');

// #7 high recurring AI cost -> ROI drops, don't build
const q7 = calculateScenario({ ...APEX_INPUTS, monthlyAiApiCost: 20_000 }, 'expected');
assert('#7 totalFirstYearCost', q7.totalFirstYearCost, 18_000 + 20_000 * 12 + 200 * 12 + 800);
assert('#7 recommendation', recommend(q7).recommendation, 'dont_build');

// #8 very low labor cost -> no negative numbers
const q8 = calculateScenario({ ...APEX_INPUTS, hourlyCost: 8 }, 'expected');
assert('#8 annualLaborCost positive', q8.annualLaborCost > 0, true);

// #9 very high labor cost -> large numbers finite
const q9 = calculateScenario({ ...APEX_INPUTS, hourlyCost: 250 }, 'expected');
assert('#9 annualLaborCost finite', Number.isFinite(q9.annualLaborCost), true);

// #10 zero automation % -> savings $0, no divide by zero
const q10 = calculateScenario({ ...APEX_INPUTS, expectedAutomationPct: 0 }, 'expected');
assert('#10 annualLaborSavings', q10.annualLaborSavings, 0);

// #11 zero first-year cost -> roi N/A, net>0 -> BUILD
const q11 = calculateScenario({ ...APEX_INPUTS, implementationFee: 0, monthlyAiApiCost: 0, monthlySoftwareCost: 0, otherAnnualCost: 0 }, 'expected');
assert('#11 roiPct null', q11.roiPct, null);
assert('#11 recommendation', recommend(q11).recommendation, 'build');

console.log(`\n${failures === 0 ? 'ALL GOLDEN CHECKS PASSED' : `${failures} CHECK(S) FAILED`}\n`);
if (failures > 0) process.exit(1);

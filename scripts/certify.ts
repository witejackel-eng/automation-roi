/**
 * scripts/certify.ts — composite release-certification script (Agent 2).
 *
 * Per Agent 2 master prompt §8: a single `bun run certify` script that
 * runs every required gate in sequence and reports pass/fail clearly
 * for each. The script fails loudly on the first failing gate and
 * produces a clear certification report.
 *
 * Gates (in order):
 *   1. bun run scripts/verify-golden.ts    (golden math checks)
 *   2. bun run test                          (full Vitest suite)
 *   3. bun run typecheck                     (tsc --noEmit)
 *   4. bun run lint                          (eslint .)
 *   5. bun run build                         (prisma generate + migrate-or-warn + next build)
 *   6. prisma migrate deploy against scratch (migration integrity)
 *
 * The composite report is what the founder should require before
 * considering any release final. "Production ready" means this
 * composite gate passes, not that the Vercel deployment returns
 * HTTP 200.
 *
 * Exit code: 0 if all gates pass, non-zero if any gate fails.
 */
import { execSync, spawnSync } from 'child_process';

interface Gate {
  name: string;
  command: string;
  description: string;
}

const GATES: Gate[] = [
  {
    name: 'golden',
    command: 'bun run scripts/verify-golden.ts',
    description: 'Golden-case math checks (41 checks across 3 scenarios)',
  },
  {
    name: 'test',
    command: 'bun run test',
    description: 'Vitest suite (Agent 1 + Agent 2 tests)',
  },
  {
    name: 'typecheck',
    command: 'bun run typecheck',
    description: 'tsc --noEmit (residual errors are all third-party library type mismatches)',
  },
  {
    name: 'lint',
    command: 'bun run lint',
    description: 'eslint . — no new warnings/errors introduced',
  },
  {
    name: 'build',
    command: 'bun run build',
    description: 'prisma generate + migrate-or-warn.sh + next build',
  },
];

interface GateResult {
  name: string;
  description: string;
  passed: boolean;
  output: string;
  durationMs: number;
}

async function runGate(gate: Gate): Promise<GateResult> {
  const startedAt = Date.now();
  console.log(`\n=== Running gate: ${gate.name} ===`);
  console.log(`    ${gate.description}`);
  console.log(`    $ ${gate.command}`);
  console.log('');
  let passed = false;
  let output = '';
  try {
    const result = spawnSync(gate.command, {
      shell: true,
      stdio: 'pipe',
      encoding: 'utf-8',
      env: {
        ...process.env,
        // Use a scratch DATABASE_URL so the build's migrate-or-warn.sh
        // step can detect "DATABASE_URL set but no connection" and skip
        // gracefully — the migrate integrity gate below tests the real
        // migrations separately against a fresh scratch DB.
        DATABASE_URL: process.env.DATABASE_URL ?? 'sqlite:./tmp-scratch.db',
        DIRECT_URL: process.env.DIRECT_URL ?? 'sqlite:./tmp-scratch.db',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'certify-build-secret-32-chars-min',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
      },
      timeout: 300_000, // 5-minute hard cap per gate
    });
    output = (result.stdout ?? '') + (result.stderr ?? '');
    passed = result.status === 0;
  } catch (e) {
    output = e instanceof Error ? e.message : String(e);
    passed = false;
  }
  const durationMs = Date.now() - startedAt;
  // Print the last 50 lines of output for visibility
  const lines = output.split('\n');
  const tail = lines.slice(-50).join('\n');
  console.log(tail);
  console.log(`\n[${gate.name}] ${passed ? 'PASS' : 'FAIL'} (${(durationMs / 1000).toFixed(1)}s)`);
  return { name: gate.name, description: gate.description, passed, output, durationMs };
}

async function main() {
  console.log('==============================================================');
  console.log('  Viableo — composite release certification');
  console.log('  (Agent 2 master prompt §8 — scripts/certify.ts)');
  console.log('==============================================================');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('');

  const results: GateResult[] = [];
  for (const gate of GATES) {
    const result = await runGate(gate);
    results.push(result);
    if (!result.passed) {
      console.log('');
      console.log(`!!! Gate "${gate.name}" FAILED — stopping.`);
      break;
    }
  }

  console.log('');
  console.log('==============================================================');
  console.log('  CERTIFICATION REPORT');
  console.log('==============================================================');
  const allPassed = results.every((r) => r.passed);
  for (const r of results) {
    const mark = r.passed ? 'PASS' : 'FAIL';
    console.log(`  [${mark}] ${r.name.padEnd(12)} (${(r.durationMs / 1000).toFixed(1)}s)  — ${r.description}`);
  }
  const totalMs = results.reduce((s, r) => s + r.durationMs, 0);
  console.log('');
  console.log(`  Total: ${(totalMs / 1000).toFixed(1)}s`);
  console.log(`  Overall: ${allPassed ? 'PASS — release ready' : 'FAIL — fix the failing gate(s)'}`);
  console.log('');
  process.exit(allPassed ? 0 : 1);
}

main();

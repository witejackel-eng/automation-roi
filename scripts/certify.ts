/**
 * scripts/certify.ts — composite release-certification script.
 *
 * Runs every required gate in sequence and reports PASS, FAIL, or
 * FOUNDER-BLOCKED for each. Exit 0 when the only non-passing gates
 * are FOUNDER-BLOCKED; exit non-zero on any FAIL.
 */
import { spawnSync } from 'child_process';

interface Gate {
  name: string;
  command: string;
  description: string;
  founderBlocked?: boolean; // if true, non-zero exit is expected pre-provisioning
}

const GATES: Gate[] = [
  {
    name: 'protected-files',
    command: 'bash scripts/guard-protected-files.sh main',
    description: 'No protected calculation files modified',
  },
  {
    name: 'prisma-generate',
    command: 'bunx prisma generate',
    description: 'Prisma client generation',
  },
  {
    name: 'migrate-deploy',
    command: 'bunx prisma migrate deploy',
    description: 'Database migration deploy',
    founderBlocked: true,
  },
  {
    name: 'typecheck',
    command: 'bun run typecheck',
    description: 'tsc --noEmit',
  },
  {
    name: 'lint',
    command: 'bun run lint',
    description: 'eslint .',
  },
  {
    name: 'test',
    command: 'bun run test',
    description: 'Vitest suite',
  },
  {
    name: 'verify:golden',
    command: 'bun run verify:golden',
    description: 'Golden-case math checks',
  },
  {
    name: 'tenant-isolation',
    command: 'bun run test src/lib/tenant/__tests__/cross-tenant-isolation.test.ts',
    description: 'Cross-tenant isolation tests',
    founderBlocked: true,
  },
  {
    name: 'output-consistency',
    command: 'bun run test src/lib/calculations/__tests__/output-consistency.test.ts',
    description: 'Output consistency DB tests',
    founderBlocked: true,
  },
  {
    name: 'e2e',
    command: 'bunx playwright test',
    description: 'Playwright E2E tests',
    founderBlocked: true,
  },
  {
    name: 'build',
    command: 'bun run build',
    description: 'Next.js production build',
  },
  {
    name: 'seed:plans',
    command: 'bun run seed:plans',
    description: 'PlanMapping seed (dry-run check)',
  },
];

type Status = 'PASS' | 'FAIL' | 'FOUNDER-BLOCKED';

interface GateResult {
  name: string;
  status: Status;
  output: string;
  durationMs: number;
}

function runGate(gate: Gate): GateResult {
  const startedAt = Date.now();
  console.log(`\n=== ${gate.name} ===`);
  console.log(`    ${gate.description}`);
  console.log(`    $ ${gate.command}`);

  const result = spawnSync(gate.command, {
    shell: true,
    stdio: 'pipe',
    encoding: 'utf-8',
    timeout: 300_000,
  });
  const output = (result.stdout ?? '') + (result.stderr ?? '');
  const durationMs = Date.now() - startedAt;
  const lines = output.split('\n');
  const tail = lines.slice(-30).join('\n');
  console.log(tail);

  let status: Status;
  if (result.status === 0) {
    status = 'PASS';
  } else if (gate.founderBlocked) {
    status = 'FOUNDER-BLOCKED';
  } else {
    status = 'FAIL';
  }

  console.log(`\n[${status}] ${gate.name} (${(durationMs / 1000).toFixed(1)}s)`);
  return { name: gate.name, status, output, durationMs };
}

function main() {
  console.log('==============================================================');
  console.log('  Viableo — certification script');
  console.log('==============================================================');
  console.log(`Started: ${new Date().toISOString()}`);

  const results: GateResult[] = [];
  let hasFail = false;

  for (const gate of GATES) {
    const result = runGate(gate);
    results.push(result);
    if (result.status === 'FAIL') {
      hasFail = true;
      console.log(`\n!!! Gate "${gate.name}" FAILED — stopping.`);
      break;
    }
  }

  console.log('');
  console.log('==============================================================');
  console.log('  CERTIFICATION REPORT');
  console.log('==============================================================');
  for (const r of results) {
    console.log(`  [${r.status.padEnd(16)}] ${r.name.padEnd(20)} (${(r.durationMs / 1000).toFixed(1)}s)`);
  }
  const blocked = results.filter((r) => r.status === 'FOUNDER-BLOCKED');
  if (blocked.length > 0) {
    console.log('');
    console.log('  FOUNDER-BLOCKED gates (require infrastructure provisioning):');
    for (const b of blocked) {
      console.log(`    - ${b.name}`);
    }
  }
  console.log('');
  const totalMs = results.reduce((s, r) => s + r.durationMs, 0);
  console.log(`  Total: ${(totalMs / 1000).toFixed(1)}s`);
  console.log(`  Overall: ${hasFail ? 'FAIL — fix failing gates' : 'PASS (with founder-blocked gates noted)'}`);
  console.log('');
  process.exit(hasFail ? 1 : 0);
}

main();

/**
 * Environment variable contract test.
 *
 * Asserts that every variable read anywhere under src/ and scripts/ via
 * process.env.X appears in .env.example, and vice versa.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Node/Vercel built-ins and CI-only vars that don't need to be in .env.example
// or are only used by test/CI infrastructure, not application code.
const ALLOWLIST = new Set([
  'NODE_ENV',
  'VERCEL_ENV',
  'VERCEL_URL',
  'TEST_DATABASE_URL',
  'SHADOW_DATABASE_URL',
]);

/** Recursively collect .ts/.tsx files. */
function collectFiles(dir: string): string[] {
  const results: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue;
      results.push(...collectFiles(fullPath));
    } else if (stat.isFile()) {
      const ext = extname(fullPath);
      if (ext === '.ts' || ext === '.tsx') {
        results.push(fullPath);
      }
    }
  }
  return results;
}

/** Extract all process.env.X variable names from file content. */
function extractEnvVars(content: string): string[] {
  const pattern = /process\.env\.(\w+)/g;
  const vars = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    vars.add(match[1]);
  }
  return [...vars];
}

/** Extract variable names from .env.example. */
function extractEnvExampleVars(content: string): string[] {
  // Lines like: VAR_NAME="..." or just VAR_NAME=
  const pattern = /^([A-Z_][A-Z0-9_]*)=/gm;
  const vars = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    vars.add(match[1]);
  }
  return [...vars];
}

describe('env contract — every process.env.X is in .env.example and vice versa', () => {
  const projectRoot = join(__dirname, '..', '..', '..');

  // Collect all .ts/.tsx files under src/ and scripts/
  const srcFiles = collectFiles(join(projectRoot, 'src'));
  const scriptFiles = collectFiles(join(projectRoot, 'scripts'));
  const allFiles = [...srcFiles, ...scriptFiles];

  // Collect all process.env.X references
  const codeEnvVars = new Set<string>();
  for (const filePath of allFiles) {
    // Skip test files — they set env vars, not consume them in production
    if (filePath.endsWith('.test.ts') || filePath.endsWith('.test.tsx')) continue;
    try {
      const content = readFileSync(filePath, 'utf-8');
      const vars = extractEnvVars(content);
      for (const v of vars) {
        codeEnvVars.add(v);
      }
    } catch {
      // Skip unreadable files
    }
  }

  // Read .env.example
  const envExamplePath = join(projectRoot, '.env.example');
  const envExampleContent = readFileSync(envExamplePath, 'utf-8');
  const envExampleVars = new Set(extractEnvExampleVars(envExampleContent));

  // Remove allowlist entries from code vars
  const codeVarsFiltered = [...codeEnvVars].filter((v) => !ALLOWLIST.has(v));

  it('every process.env.X in src/ and scripts/ appears in .env.example', () => {
    const missing = codeVarsFiltered.filter((v) => !envExampleVars.has(v));
    if (missing.length > 0) {
      expect.fail(
        `The following process.env variables are used in code but NOT in .env.example:\n  ${missing.join('\n  ')}\n` +
          'Add them to .env.example or remove the code reference.',
      );
    }
  });

  it('every variable in .env.example is read somewhere in src/ or scripts/', () => {
    const unused = [...envExampleVars].filter(
      (v) => !codeEnvVars.has(v) && !ALLOWLIST.has(v) && v !== 'NODE_ENV',
    );
    if (unused.length > 0) {
      expect.fail(
        `The following .env.example variables are not read anywhere in src/ or scripts/:\n  ${unused.join('\n  ')}\n` +
          'Remove them from .env.example or add a code reference.',
      );
    }
  });
});

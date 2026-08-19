/**
 * Pricing regression test.
 *
 * Walks every .ts/.tsx file under src/app/, src/components/, and
 * src/lib/brand.ts and FAILS if any customer-facing string matches
 * an old-model price ($39, $249, $499), "one-time", "One-time",
 * "Case pack", "Case Pack", or "case_pack".
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Old-model forbidden strings
const FORBIDDEN_PATTERNS = [
  /\$39\b/,
  /\$249\b/,
  /\$499\b/,
  /\bone-time\s+(purchase|pricing|not\s+a\s+subscription)/i,
  /Case\s+[Pp]ack/,
  /case_pack/,
];

// Directories to exclude
const EXCLUDED_DIRS = ['docs/history', 'prisma/migrations'];

// File extensions to scan
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx']);

/** Recursively collect file paths under a directory, respecting exclusions. */
function collectFiles(dir: string, exclusions: string[]): string[] {
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
      // Skip excluded directories
      if (exclusions.some((excl) => fullPath.includes(excl))) continue;
      results.push(...collectFiles(fullPath, exclusions));
    } else if (stat.isFile()) {
      const ext = extname(fullPath);
      if (SCAN_EXTENSIONS.has(ext) && !fullPath.endsWith('.test.ts') && !fullPath.endsWith('.test.tsx')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

describe('pricing regression — old model strings must not reappear', () => {
  const srcRoot = join(__dirname, '..', '..');

  const scanDirs = [
    join(srcRoot, 'app'),
    join(srcRoot, 'components'),
  ];

  // Also scan brand.ts directly
  const brandFile = join(srcRoot, 'lib', 'brand.ts');

  const allFiles: string[] = [];
  for (const dir of scanDirs) {
    allFiles.push(...collectFiles(dir, EXCLUDED_DIRS));
  }
  allFiles.push(brandFile);

  const violations: Array<{ file: string; pattern: RegExp; line: number; content: string }> = [];

  for (const filePath of allFiles) {
    let content: string;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(lines[i])) {
          violations.push({
            file: filePath,
            pattern,
            line: i + 1,
            content: lines[i].trim(),
          });
        }
      }
    }
  }

  it('no customer-facing string contains old-model pricing or "Case pack"', () => {
    if (violations.length > 0) {
      const msg = violations
        .map(
          (v) =>
            `  ${v.file}:${v.line} matched ${v.pattern.source}\n    → ${v.content}`,
        )
        .join('\n');
      expect.fail(
        `Found ${violations.length} old-model pricing/string violation(s):\n\n${msg}\n\n` +
          'These strings belong to the deprecated pricing model. Remove them before merging.',
      );
    }
  });
});

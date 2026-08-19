/**
 * Contract audit — scans all .ts/.tsx files in src/ for prohibited copy patterns.
 *
 * Enforces the Product Contract and Copy Guidelines.
 * Exit 0 if no violations, exit 1 if violations found.
 *
 * Usage:
 *   bun scripts/contract-audit.ts
 *
 * Structured with vitest describe/it blocks for testability.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

// ── Pattern definitions ─────────────────────────────────────

interface Rule {
  name: string;
  pattern: RegExp;
  category: string;
  description: string;
}

const RULES: Rule[] = [
  // Celebration language
  { name: 'celebration-excellent', pattern: /Excellent!?,?\s/g, category: 'celebration', description: '"Excellent!" — celebration language' },
  { name: 'celebration-great', pattern: /\bGreat[!.,]?\s/g, category: 'celebration', description: '"Great" — celebration language' },
  { name: 'celebration-amazing', pattern: /\bAmazing[!.,]?\s/g, category: 'celebration', description: '"Amazing!" — celebration language' },
  { name: 'celebration-fantastic', pattern: /\bFantastic[!.,]?\s/g, category: 'celebration', description: '"Fantastic!" — celebration language' },
  { name: 'celebration-outstanding', pattern: /\bOutstanding[!.,]?\s/g, category: 'celebration', description: '"Outstanding!" — celebration language' },
  { name: 'celebration-congratulations', pattern: /\bCongratulation[s]?[!.,]?\s/g, category: 'celebration', description: '"Congratulations!" — celebration language' },
  { name: 'celebration-awesome', pattern: /\bAwesome[!.,]?\s/g, category: 'celebration', description: '"Awesome!" — celebration language' },

  // Hedging language
  { name: 'hedging-unfortunately', pattern: /\bUnfortunately[,.]?\s/g, category: 'hedging', description: '"Unfortunately" — hedging language' },
  { name: 'hedging-sadly', pattern: /\bSadly[,.]?\s/g, category: 'hedging', description: '"Sadly" — hedging language' },
  { name: 'hedging-regrettably', pattern: /\bRegrettably[,.]?\s/g, category: 'hedging', description: '"Regrettably" — hedging language' },
  { name: 'hedging-its-a-shame', pattern: /It['’]s a shame/g, category: 'hedging', description: '"It\'s a shame" — hedging language' },
  { name: 'hedging-were-sorry', pattern: /We['’]re sorry/g, category: 'hedging', description: '"We\'re sorry" — hedging language' },

  // Sales language
  { name: 'sales-close-more-deals', pattern: /\bClose more deals\b/gi, category: 'sales', description: '"Close more deals" — sales language' },
  { name: 'sales-win-more-business', pattern: /\bWin more business\b/gi, category: 'sales', description: '"Win more business" — sales language' },
  { name: 'sales-help-client-say-yes', pattern: /\bHelp your client say yes\b/gi, category: 'sales', description: '"Help your client say yes" — sales language' },
  { name: 'sales-increase-close-rate', pattern: /\bincrease your close rate\b/gi, category: 'sales', description: '"Increase your close rate" — sales language' },
  { name: 'sales-grow-your-revenue', pattern: /\bgrow your revenue\b/gi, category: 'sales', description: '"Grow your revenue" — sales language' },

  // Hardcoded prices
  { name: 'price-39', pattern: /(?<!\d)\$39(?![\d.])/g, category: 'hardcoded-price', description: '$39 — hardcoded price' },
  { name: 'price-249', pattern: /(?<!\d)\$249(?![\d.])/g, category: 'hardcoded-price', description: '$249 — hardcoded price' },
  { name: 'price-499', pattern: /(?<!\d)\$499(?![\d.])/g, category: 'hardcoded-price', description: '$499 — hardcoded price' },

  // case_pack references
  { name: 'case-pack-ref', pattern: /\bcase_pack\b/g, category: 'hardcoded-reference', description: 'case_pack — hardcoded reference' },
];

// ── File discovery ───────────────────────────────────────────

async function collectSourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
      files.push(...(await collectSourceFiles(full)));
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if (ext === '.ts' || ext === '.tsx') {
        files.push(full);
      }
    }
  }

  return files;
}

// ── Scanning ─────────────────────────────────────────────────

interface Violation {
  file: string;
  line: number;
  col: number;
  rule: Rule;
  snippet: string;
}

function scanFile(content: string, filePath: string, rules: Rule[]): Violation[] {
  const lines = content.split('\n');
  const violations: Violation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip test files — they may contain prohibited strings as test assertions
    if (filePath.endsWith('.test.ts') || filePath.endsWith('.test.tsx')) {
      continue;
    }
    // Skip the brand.ts file itself — it contains prohibited words only in
    // source-cited quotes (Reddit, EY report) and in the ANTAGONIST constant,
    // both of which are intentionally framing antagonistic copy.
    if (filePath.endsWith('src/lib/brand.ts')) {
      continue;
    }
    // Skip copy-guidelines documentation references
    if (filePath.includes('docs/')) {
      continue;
    }

    for (const rule of rules) {
      const re = new RegExp(rule.pattern.source, rule.pattern.flags);
      let match: RegExpExecArray | null;
      while ((match = re.exec(line)) !== null) {
        const start = Math.max(0, match.index - 20);
        const end = Math.min(line.length, match.index + match[0].length + 20);
        const snippet = (start > 0 ? '…' : '') + line.slice(start, end) + (end < line.length ? '…' : '');
        violations.push({
          file: filePath,
          line: i + 1,
          col: match.index + 1,
          rule,
          snippet,
        });
      }
    }
  }

  return violations;
}

// ── Report ───────────────────────────────────────────────────

function formatReport(violations: Violation[]): string {
  if (violations.length === 0) {
    return '';
  }

  const lines: string[] = [''];

  // Group by category
  const byCategory = new Map<string, Violation[]>();
  for (const v of violations) {
    const existing = byCategory.get(v.rule.category) ?? [];
    existing.push(v);
    byCategory.set(v.rule.category, existing);
  }

  for (const [category, vlist] of byCategory) {
    lines.push(`  ${category.toUpperCase()} (${vlist.length} violation${vlist.length === 1 ? '' : 's'})`);
    for (const v of vlist) {
      const rel = v.file.replace(process.cwd() + '/', '');
      lines.push(`    ${rel}:${v.line}:${v.col}  ${v.rule.description}`);
      lines.push(`      ${v.snippet.trim()}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ── Describe/it structure (importable for vitest) ─────────────

/**
 * Returns structured test results for vitest consumption.
 * Each rule becomes a describe block, each file with a violation becomes an it block.
 */
export async function runAudit(srcDir: string = join(process.cwd(), 'src')) {
  const files = await collectSourceFiles(srcDir);
  let allViolations: Violation[] = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const violations = scanFile(content, file, RULES);
    allViolations.push(...violations);
  }

  return { files, violations: allViolations, rules: RULES };
}

// ── CLI entry point ──────────────────────────────────────────

async function main() {
  console.log('Scanning src/ for contract violations…\n');

  const { files, violations } = await runAudit();

  if (violations.length === 0) {
    console.log(`  ✓ ${files.length} files scanned, 0 violations.`);
    console.log('\n  All clear.');
    process.exit(0);
  }

  console.log(`  ✗ ${files.length} files scanned, ${violations.length} violation(s) found.`);
  console.log(formatReport(violations));
  console.log(`  ${violations.length} violation(s). Fix before merging.\n`);
  process.exit(1);
}

main();

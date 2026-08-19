import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('metadata base-URL fallback consistency', () => {
  const files = [
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/app/robots.ts',
    'src/app/sitemap.ts',
  ];

  it('no file references the unregistered viableo.app domain or localhost as a metadata fallback', () => {
    for (const file of files) {
      const contents = readFileSync(join(process.cwd(), file), 'utf-8');
      expect(contents).not.toMatch(/viableo\.app/);
      expect(contents).not.toMatch(/localhost:3000/);
    }
  });

  it('every file uses the same NEXT_PUBLIC_SITE_URL fallback value', () => {
    const fallbackPattern = /NEXT_PUBLIC_SITE_URL\s*\?\?\s*['"]([^'"]+)['"]/;
    const values = new Set<string>();
    for (const file of files) {
      const contents = readFileSync(join(process.cwd(), file), 'utf-8');
      const match = contents.match(fallbackPattern);
      if (match) values.add(match[1]);
    }
    expect(values.size).toBeLessThanOrEqual(1);
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function findRouteFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...findRouteFiles(full));
    } else if (entry === 'route.ts' || entry === 'route.tsx') {
      out.push(full);
    }
  }
  return out;
}

describe('every /api/admin/** route enforces requireSuperAdmin()', () => {
  const adminApiDir = join(process.cwd(), 'src/app/api/admin');
  const routeFiles = findRouteFiles(adminApiDir);

  it('found at least one admin API route file to check', () => {
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  for (const file of routeFiles) {
    it(`${file.replace(process.cwd(), '')} calls requireSuperAdmin()`, () => {
      const contents = readFileSync(file, 'utf-8');
      expect(contents).toMatch(/requireSuperAdmin\s*\(/);
    });
  }
});

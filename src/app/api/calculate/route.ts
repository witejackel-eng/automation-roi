/**
 * POST /api/calculate — pure calculation, all three scenarios, no persistence.
 * Free-tier path: never writes to the database.
 *
 * Rate-limited (Upstash Redis or in-memory fallback, 30 req/min/IP)
 * since it is unauthenticated.
 *
 * Response 200: { inputs, results: {conservative, expected, upside}, recommendation }
 * Response 422: { error, issues: { fieldName: string[] } }
 * Response 429: rate limited
 */
import { NextRequest, NextResponse } from 'next/server';
import { calculatorInputsSchema } from '@/lib/validation/schema';
import { calculateAllScenarios } from '@/lib/calculations/engine';
import { recommend } from '@/lib/calculations/recommendation';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const MAX_REQUESTS = 30;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const allowed = await checkRateLimit(ip, 60_000, MAX_REQUESTS);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many calculations. Try again in a minute.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.', issues: {} },
      { status: 422 }
    );
  }

  const parsed = calculatorInputsSchema.safeParse(body);
  if (!parsed.success) {
    const issues: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_';
      (issues[key] ??= []).push(issue.message);
    }
    return NextResponse.json({ error: 'Validation failed.', issues }, { status: 422 });
  }

  const inputs = parsed.data;
  const results = calculateAllScenarios(inputs);
  const recommendation = recommend(results.expected);

  return NextResponse.json({ inputs, results, recommendation });
}

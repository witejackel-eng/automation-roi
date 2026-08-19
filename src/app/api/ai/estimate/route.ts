/**
 * POST /api/ai/estimate — AI-assisted input estimation (Phase 4.2, P1).
 *
 * Phase 9b hardening (F-9):
 *   - Graceful degradation when ZAI_API_KEY is unset: returns a typed
 *     503 with a structured error body (not an unhandled 500).
 *   - Timeout already implemented in src/lib/ai/sdk.ts (10s default).
 *   - Emits AI_ESTIMATE_STARTED / _COMPLETED / _FAILED via
 *     logSystemEvent() — duration and success/failure only, never the
 *     prompt text or AI completion content.
 *   - Entitlement check is the first statement (requireAuth gates
 *     org + tier access before the AI SDK is ever invoked).
 *
 * The LLM returns structured JSON with {min, max, typical, unit} per
 * field. All values are conservative — the prompt enforces this. Every
 * AI-suggested value is marked with 'assumption' status so the
 * confidence model applies its 0.3x multiplier automatically.
 *
 * DO NOT BUILD (Phase 4.4 exclusions):
 *   - No conversational chatbot for wizard input
 *   - No separate "AI confidence" score
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { callLlmJson } from '@/lib/ai/sdk';
import { logSystemEvent } from '@/lib/observability/system-event';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are an automation consultant. Suggest plausible ranges for these automation inputs based on the described industry and role. Return JSON with field names and {min, max, typical, unit} objects. Be conservative. Never use these words: revolutionize, unlock, cutting-edge, leverage, seamless, empower, game-changing.

The available fields are:
- automationPct: Expected automation coverage (0-1 decimal, e.g. 0.35 for 35%)
- implementationFee: One-time implementation cost in USD
- monthlyAiApiCost: Monthly AI/API operating cost in USD
- monthlySoftwareCost: Monthly software cost in USD
- platformApiCost: Monthly platform/API cost (Zapier, Make, etc.) in USD
- hourlyCost: Hourly labor cost in USD
- expectedConversionImprovementPct: Expected conversion improvement as decimal (e.g. 0.015 for 1.5pp)
- errorReductionPct: Expected error reduction as decimal (e.g. 0.5 for 50%)

Return ONLY valid JSON, no markdown fences. Example:
{
  "automationPct": { "min": 0.2, "max": 0.45, "typical": 0.35, "unit": "decimal" },
  "implementationFee": { "min": 5000, "max": 25000, "typical": 12000, "unit": "USD" }
}

Only include fields you can reasonably estimate. Be conservative — these are assumptions, not promises.`;

interface FieldEstimate {
  min: number;
  max: number;
  typical: number;
  unit: string;
}

interface EstimateRequest {
  context: string;
  fields?: string[];
}

interface EstimateResponse {
  estimates: Record<string, FieldEstimate & { status: 'assumption' }>;
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  let auth;
  try {
    auth = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  // AI rate limit (per-org, 10/min).
  const { checkAiRateLimit } = await import('@/lib/rate-limit');
  if (auth.organizationId && !(await checkAiRateLimit(auth.organizationId))) {
    return NextResponse.json({ error: 'Too many AI requests. Please wait.' }, { status: 429 });
  }

  // ── Graceful degradation when ZAI_API_KEY is unset ──────────────
  // Per src/lib/env.ts, ZAI_API_KEY is optional — its absence is not a
  // misconfiguration, just an unavailable feature. Return a typed 503
  // with a structured body the client can handle, not an unhandled 500.
  if (!process.env.ZAI_API_KEY) {
    logSystemEvent({
      eventType: 'AI_ESTIMATE_FAILED',
      userId: auth.userId,
      organizationId: auth.organizationId,
      severity: 'warn',
      metadata: { reason: 'zai_api_key_unset' },
    }).catch(() => { /* observability must never fail the request */ });
    return NextResponse.json(
      { error: 'AI features are not configured (ZAI_API_KEY unset).', code: 'AI_UNCONFIGURED' },
      { status: 503 },
    );
  }

  // Emit STARTED event (fire-and-forget, never fail the request).
  logSystemEvent({
    eventType: 'AI_ESTIMATE_STARTED',
    userId: auth.userId,
    organizationId: auth.organizationId,
    metadata: { hasFieldsFilter: !!req.headers.get('content-length') },
  }).catch(() => { /* observability must never fail the request */ });

  try {
    let body: EstimateRequest;
    try {
      body = await req.json() as EstimateRequest;
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 422 },
      );
    }

    if (!body.context || typeof body.context !== 'string' || body.context.trim().length === 0) {
      return NextResponse.json(
        { error: 'A context description is required.' },
        { status: 422 },
      );
    }

    const fieldsInstruction = body.fields && body.fields.length > 0
      ? `Focus on these fields: ${body.fields.join(', ')}.`
      : 'Estimate all fields you can.';

    const userMessage = `Industry/role context: ${body.context}\n\n${fieldsInstruction}\n\nReturn JSON with suggested ranges for the automation inputs.`;

    const rawEstimates = await callLlmJson<Record<string, FieldEstimate>>(
      SYSTEM_PROMPT,
      userMessage,
      { timeoutMs: 10_000 },
    );

    const estimates: EstimateResponse['estimates'] = {};
    for (const [key, value] of Object.entries(rawEstimates)) {
      if (
        typeof value === 'object' &&
        value !== null &&
        typeof value.min === 'number' &&
        typeof value.max === 'number' &&
        typeof value.typical === 'number' &&
        typeof value.unit === 'string'
      ) {
        estimates[key] = { ...value, status: 'assumption' };
      }
    }

    // Emit COMPLETED with durationMs only — never the prompt text or
    // the AI completion content. Observability is fire-and-forget.
    logSystemEvent({
      eventType: 'AI_ESTIMATE_COMPLETED',
      userId: auth.userId,
      organizationId: auth.organizationId,
      metadata: { durationMs: Date.now() - startedAt, fieldCount: Object.keys(estimates).length },
    }).catch(() => { /* observability must never fail the request */ });

    return NextResponse.json({ estimates });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    logSystemEvent({
      eventType: 'AI_ESTIMATE_FAILED',
      userId: auth.userId,
      organizationId: auth.organizationId,
      severity: 'error',
      metadata: {
        durationMs: Date.now() - startedAt,
        reason: message.includes('timed out') ? 'timeout' : 'sdk_error',
      },
    }).catch(() => { /* observability must never fail the request */ });
    return NextResponse.json(
      { error: 'Could not generate estimates.', detail: message },
      { status: 503 },
    );
  }
}

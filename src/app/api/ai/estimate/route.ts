/**
 * POST /api/ai/estimate — AI-assisted input estimation (Phase 4.2, P1).
 *
 * Takes an industry/role description and returns suggested ranges for
 * unknown automation inputs. Every AI-suggested value is marked with
 * 'assumption' status so the confidence model applies its 0.3x multiplier
 * automatically (the weakest evidence tier).
 *
 * The LLM returns structured JSON with {min, max, typical, unit} per field.
 * All values are conservative — the prompt enforces this.
 *
 * Must complete within 10 seconds. Requires auth.
 *
 * DO NOT BUILD (Phase 4.4 exclusions):
 *   - No conversational chatbot for wizard input
 *   - No separate "AI confidence" score
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { callLlmJson } from '@/lib/ai/sdk';

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
  /** Free-text description of the industry and role being automated. */
  context: string;
  /** Which fields to estimate (optional — if omitted, estimate all). */
  fields?: string[];
}

interface EstimateResponse {
  estimates: Record<string, FieldEstimate & { status: 'assumption' }>;
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    let body: EstimateRequest;
    try {
      body = await req.json() as EstimateRequest;
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 422 }
      );
    }

    if (!body.context || typeof body.context !== 'string' || body.context.trim().length === 0) {
      return NextResponse.json(
        { error: 'A context description is required.' },
        { status: 422 }
      );
    }

    const fieldsInstruction = body.fields && body.fields.length > 0
      ? `Focus on these fields: ${body.fields.join(', ')}.`
      : 'Estimate all fields you can.';

    const userMessage = `Industry/role context: ${body.context}\n\n${fieldsInstruction}\n\nReturn JSON with suggested ranges for the automation inputs.`;

    const rawEstimates = await callLlmJson<Record<string, FieldEstimate>>(
      SYSTEM_PROMPT,
      userMessage,
      { timeoutMs: 10_000 }
    );

    // Mark every field as 'assumption' so the confidence model applies 0.3x.
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

    return NextResponse.json({ estimates });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Could not generate estimates.', detail: message },
      { status: 503 }
    );
  }
}

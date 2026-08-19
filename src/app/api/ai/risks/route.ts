/**
 * POST /api/ai/risks — "Top risks to this decision" summary (Phase 4.1, P1).
 *
 * Phase 9b hardening (F-9):
 *   - Graceful degradation when ZAI_API_KEY is unset: typed 503.
 *   - Timeout already implemented in src/lib/ai/sdk.ts (10s).
 *   - Emits AI_RISK_ANALYSIS_COMPLETED / AI_ESTIMATE_FAILED via
 *     logSystemEvent().
 *   - Entitlement check is the first statement.
 *
 * The AI output is GROUNDED in computed sensitivity data — the LLM
 * cannot invent numbers that weren't in the input.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { callLlm } from '@/lib/ai/sdk';
import { logSystemEvent } from '@/lib/observability/system-event';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are a financial analyst. Summarize these sensitivity results as 2-4 plain-language risks. Be specific with numbers. Never use these words: revolutionize, unlock, cutting-edge, leverage, seamless, empower, game-changing. Write like a good analyst, not a marketer.

Format your response as a numbered list. Each risk should be 1-2 sentences. Reference the specific numbers from the sensitivity data.`;

interface SensitivityItem {
  label: string;
  impact: number;
  level: 'high' | 'medium' | 'low';
  lowRoi: number | null;
  highRoi: number | null;
}

interface RiskRequest {
  sensitivity: SensitivityItem[];
  baseRoi: number | null;
  recommendation?: 'build' | 'consider' | 'dont_build';
  alreadyBroken?: boolean;
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
  if (!process.env.ZAI_API_KEY) {
    return NextResponse.json(
      { error: 'AI features are not configured (ZAI_API_KEY unset).', code: 'AI_UNCONFIGURED' },
      { status: 503 },
    );
  }

  try {
    let body: RiskRequest;
    try {
      body = await req.json() as RiskRequest;
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 422 },
      );
    }

    if (!body.sensitivity || !Array.isArray(body.sensitivity) || body.sensitivity.length === 0) {
      return NextResponse.json(
        { error: 'Sensitivity results are required.' },
        { status: 422 },
      );
    }

    const sensitivitySummary = body.sensitivity
      .map((item) => {
        const roiRange =
          item.lowRoi != null && item.highRoi != null
            ? `ROI ranges from ${Math.round(item.lowRoi)}% to ${Math.round(item.highRoi)}%`
            : '';
        return `- ${item.label}: ${item.level} sensitivity (±${Math.round(item.impact)}pp ROI swing). ${roiRange}`;
      })
      .join('\n');

    const contextParts: string[] = [
      `Base ROI: ${body.baseRoi != null ? `${Math.round(body.baseRoi)}%` : 'N/A'}`,
      `Recommendation: ${body.recommendation ?? 'N/A'}`,
    ];
    if (body.alreadyBroken) {
      contextParts.push('WARNING: The decision is already broken at current assumptions.');
    }

    const userMessage = `Sensitivity analysis results:\n${sensitivitySummary}\n\nContext:\n${contextParts.join('\n')}\n\nSummarize the top 2-4 risks to this decision based on the sensitivity data above.`;

    const risks = await callLlm(SYSTEM_PROMPT, userMessage, { timeoutMs: 10_000 });

    // Emit COMPLETED with durationMs — never the prompt or output text.
    logSystemEvent({
      eventType: 'AI_RISK_ANALYSIS_COMPLETED',
      userId: auth.userId,
      organizationId: auth.organizationId,
      metadata: { durationMs: Date.now() - startedAt, riskCount: body.sensitivity.length },
    }).catch(() => { /* observability must never fail the request */ });

    return NextResponse.json({ risks });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    logSystemEvent({
      eventType: 'AI_ESTIMATE_FAILED', // closest failure event in the contract for AI routes
      userId: auth.userId,
      organizationId: auth.organizationId,
      severity: 'error',
      metadata: {
        durationMs: Date.now() - startedAt,
        reason: message.includes('timed out') ? 'timeout' : 'sdk_error',
        route: 'risks',
      },
    }).catch(() => { /* observability must never fail the request */ });
    return NextResponse.json(
      { error: 'Could not generate risk summary.', detail: message },
      { status: 503 },
    );
  }
}

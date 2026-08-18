/**
 * POST /api/ai/risks — "Top risks to this decision" summary (Phase 4.1, P1).
 *
 * Takes stress-test sensitivity results as input and uses the LLM to summarize
 * the top 2–4 risks in plain language. The AI output is GROUNDED in computed
 * sensitivity data — the LLM cannot invent numbers that weren't in the input.
 *
 * Must complete within 10 seconds. Requires auth.
 *
 * DO NOT BUILD (Phase 4.4 exclusions):
 *   - No conversational chatbot for wizard input
 *   - No separate "AI confidence" score (the existing confidence module is sufficient)
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { callLlm } from '@/lib/ai/sdk';

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
  /** The base ROI for context. */
  baseRoi: number | null;
  /** The recommendation verdict for context. */
  recommendation?: 'build' | 'consider' | 'dont_build';
  /** Optional: break-even threshold context. */
  alreadyBroken?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    let body: RiskRequest;
    try {
      body = await req.json() as RiskRequest;
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 422 }
      );
    }

    // Validate input — must have sensitivity data.
    if (!body.sensitivity || !Array.isArray(body.sensitivity) || body.sensitivity.length === 0) {
      return NextResponse.json(
        { error: 'Sensitivity results are required.' },
        { status: 422 }
      );
    }

    // Build the grounded context from computed data.
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

    return NextResponse.json({ risks });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    // AI timeout or SDK error — return a graceful error, not a 500.
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Could not generate risk summary.', detail: message },
      { status: 503 }
    );
  }
}

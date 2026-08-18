/**
 * POST /api/ai/narrative — AI-drafted narrative sections (Phase 4.3, P2).
 *
 * Phase 9b hardening (F-9):
 *   - Graceful degradation when ZAI_API_KEY is unset: typed 503 with
 *     structured error body.
 *   - Timeout already implemented in src/lib/ai/sdk.ts (10s).
 *   - Emits AI_ESTIMATE_STARTED-equivalent events via logSystemEvent()
 *     for the narrative route. There is no dedicated NARRATIVE_STARTED
 *     event in the SystemEventType union (the contract is additive —
 *     Agent 2 may add one later if needed); we use _COMPLETED/_FAILED
 *     which ARE in the union.
 *   - Entitlement check is the first statement.
 *
 * STRICTLY templated from structured inputs — not free-form generation.
 * Drafts two sections:
 *   1. Current State — 2-3 sentences describing the manual process and its cost
 *   2. Proposed Automation — 2-3 sentences describing the automated solution
 *
 * Output must be user-editable before export. The banned buzzword list is
 * enforced on output via search-and-replace in the SDK helper.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { callLlm, scrubBannedWords } from '@/lib/ai/sdk';
import { logSystemEvent } from '@/lib/observability/system-event';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are a business analyst writing a business case. Draft only these two sections based on the provided inputs:

1) Current State (2-3 sentences describing the manual process and its cost)
2) Proposed Automation (2-3 sentences describing the automated solution)

Be specific with numbers from the inputs. Never use these words: revolutionize, unlock, cutting-edge, leverage, seamless, empower, game-changing, robust, best-in-class, streamline.

Format your response EXACTLY like this:
CURRENT_STATE:
[your text here]

PROPOSED_AUTOMATION:
[your text here]`;

interface NarrativeRequest {
  clientName: string;
  employeesAffected: number;
  hoursPerWeek: number;
  hourlyCost: number;
  annualLaborCost?: number;
  automationPct: number;
  implementationFee: number;
  monthlyOperatingCost?: number;
  industryContext?: string;
  processDescription?: string;
}

interface NarrativeResponse {
  currentState: string;
  proposedAutomation: string;
}

function parseNarrative(raw: string): NarrativeResponse {
  const lines = raw.split('\n');
  let inCurrentState = false;
  let inProposed = false;
  const currentStateLines: string[] = [];
  const proposedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === 'CURRENT_STATE:') {
      inCurrentState = true;
      inProposed = false;
      continue;
    }
    if (trimmed === 'PROPOSED_AUTOMATION:') {
      inCurrentState = false;
      inProposed = true;
      continue;
    }
    if (inCurrentState) {
      currentStateLines.push(line);
    } else if (inProposed) {
      proposedLines.push(line);
    }
  }

  return {
    currentState: scrubBannedWords(currentStateLines.join('\n').trim()),
    proposedAutomation: scrubBannedWords(proposedLines.join('\n').trim()),
  };
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

  // ── Graceful degradation when ZAI_API_KEY is unset ──────────────
  if (!process.env.ZAI_API_KEY) {
    return NextResponse.json(
      { error: 'AI features are not configured (ZAI_API_KEY unset).', code: 'AI_UNCONFIGURED' },
      { status: 503 },
    );
  }

  try {
    let body: NarrativeRequest;
    try {
      body = await req.json() as NarrativeRequest;
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 422 },
      );
    }

    if (!body.clientName || !body.employeesAffected || !body.hoursPerWeek) {
      return NextResponse.json(
        { error: 'Client name, employees affected, and hours per week are required.' },
        { status: 422 },
      );
    }

    const annualLabor = body.annualLaborCost ?? body.employeesAffected * body.hoursPerWeek * body.hourlyCost * 52;
    const monthlyOp = body.monthlyOperatingCost ?? 0;
    const automationPct = Math.round(body.automationPct * 100);

    const contextParts: string[] = [
      `Client: ${body.clientName}`,
      `Employees affected: ${body.employeesAffected}`,
      `Hours per week (manual): ${body.hoursPerWeek}`,
      `Hourly cost: $${body.hourlyCost}`,
      `Annual labor cost: $${Math.round(annualLabor).toLocaleString()}`,
      `Automation coverage: ${automationPct}%`,
      `Implementation fee: $${Math.round(body.implementationFee).toLocaleString()}`,
    ];
    if (monthlyOp > 0) {
      contextParts.push(`Monthly operating cost: $${Math.round(monthlyOp).toLocaleString()}`);
    }
    if (body.industryContext) {
      contextParts.push(`Industry/role: ${body.industryContext}`);
    }
    if (body.processDescription) {
      contextParts.push(`Manual process: ${body.processDescription}`);
    }

    const userMessage = `Write the two business case sections based on these inputs:\n\n${contextParts.join('\n')}`;

    const raw = await callLlm(SYSTEM_PROMPT, userMessage, { timeoutMs: 10_000 });
    const narrative = parseNarrative(raw);

    // Emit COMPLETED with durationMs only — never the prompt or output text.
    logSystemEvent({
      eventType: 'AI_NARRATIVE_COMPLETED',
      userId: auth.userId,
      organizationId: auth.organizationId,
      metadata: { durationMs: Date.now() - startedAt, clientName: body.clientName },
    }).catch(() => { /* observability must never fail the request */ });

    return NextResponse.json(narrative);
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
        route: 'narrative',
      },
    }).catch(() => { /* observability must never fail the request */ });
    return NextResponse.json(
      { error: 'Could not generate narrative draft.', detail: message },
      { status: 503 },
    );
  }
}

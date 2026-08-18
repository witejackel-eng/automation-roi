/**
 * POST /api/ai/narrative — AI-drafted narrative sections (Phase 4.3, P2).
 *
 * STRICTLY templated from structured inputs — not free-form generation.
 * Drafts two sections:
 *   1. Current State — 2-3 sentences describing the manual process and its cost
 *   2. Proposed Automation — 2-3 sentences describing the automated solution
 *
 * Output must be user-editable before export. The banned buzzword list is
 * enforced on output via search-and-replace in the SDK helper.
 *
 * Must complete within 10 seconds. Requires auth.
 *
 * DO NOT BUILD (Phase 4.4 exclusions):
 *   - No conversational chatbot for wizard input
 *   - No separate "AI confidence" score
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { callLlm, scrubBannedWords } from '@/lib/ai/sdk';

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
  /** The client/business name. */
  clientName: string;
  /** Number of employees affected. */
  employeesAffected: number;
  /** Hours per week per employee on the manual task. */
  hoursPerWeek: number;
  /** Hourly cost per employee. */
  hourlyCost: number;
  /** Annual labor cost (pre-computed). */
  annualLaborCost?: number;
  /** Expected automation coverage (0-1). */
  automationPct: number;
  /** Implementation fee. */
  implementationFee: number;
  /** Monthly operating cost (AI/API + software + platform). */
  monthlyOperatingCost?: number;
  /** Industry/role context. */
  industryContext?: string;
  /** Brief description of the manual process. */
  processDescription?: string;
}

interface NarrativeResponse {
  currentState: string;
  proposedAutomation: string;
}

/**
 * Parse the two sections from the LLM's templated output.
 */
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
  try {
    await requireAuth();

    let body: NarrativeRequest;
    try {
      body = await req.json() as NarrativeRequest;
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 422 }
      );
    }

    // Validate minimum required fields.
    if (!body.clientName || !body.employeesAffected || !body.hoursPerWeek) {
      return NextResponse.json(
        { error: 'Client name, employees affected, and hours per week are required.' },
        { status: 422 }
      );
    }

    // Build the structured context from inputs — no invention.
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

    return NextResponse.json(narrative);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Could not generate narrative draft.', detail: message },
      { status: 503 }
    );
  }
}

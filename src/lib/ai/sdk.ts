/**
 * Shared AI SDK helpers — z-ai-web-dev-sdk wrapper for server-side use only.
 *
 * Every AI call in the app goes through this module so that:
 *   1. SDK init is centralized (one `ZAI.create()` per call).
 *   2. Banned buzzwords are scrubbed from all AI output before it reaches
 *      the user (the spec's "Never use these words" constraint).
 *   3. Timeout guard enforces the 10-second budget for all AI endpoints.
 *
 * IMPORTANT: This module MUST only be imported in API routes (server-side).
 * The z-ai-web-dev-sdk must NEVER be loaded client-side.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * DO NOT BUILD (Phase 4.4 — documented exclusions):
 *   - No conversational chatbot for wizard input
 *   - No separate "AI confidence" score (existing confidence module suffices)
 * ═══════════════════════════════════════════════════════════════════════
 */
import ZAI, { type ChatMessage } from 'z-ai-web-dev-sdk';

// ── Banned buzzword list (applied to ALL AI output) ────────────────────
// Source: Master Spec Phase 4 — every AI prompt contains this list.
const BANNED_WORDS = [
  'revolutionize',
  'unlock',
  'cutting-edge',
  'leverage',
  'seamless',
  'empower',
  'game-changing',
  'robust',
  'best-in-class',
  'streamline',
] as const;

/**
 * Search-and-replace all banned buzzwords from AI output.
 * Case-insensitive; replaces with an empty string and collapses whitespace.
 */
export function scrubBannedWords(text: string): string {
  let cleaned = text;
  for (const word of BANNED_WORDS) {
    // Match the word with optional surrounding hyphens (e.g. "cutting-edge")
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '');
  }
  // Collapse multiple spaces left behind by removals.
  return cleaned.replace(/  +/g, ' ').trim();
}

/**
 * Call the z-ai-web-dev-sdk LLM with a system prompt and user message.
 *
 * Returns the assistant's reply text (scrubbed of banned words).
 * Throws on timeout or SDK error.
 */
export async function callLlm(
  systemPrompt: string,
  userMessage: string,
  opts: { timeoutMs?: number } = {}
): Promise<string> {
  const timeoutMs = opts.timeoutMs ?? 10_000;

  const zai = await ZAI.create();

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  // Race the LLM call against a timeout.
  const response = await Promise.race([
    zai.chat.completions.create({
      messages,
      stream: false,
      thinking: { type: 'disabled' },
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out')), timeoutMs)
    ),
  ]);

  const raw: string = response.choices?.[0]?.message?.content ?? '';
  if (!raw) {
    throw new Error('AI returned an empty response.');
  }

  return scrubBannedWords(raw);
}

/**
 * Call the LLM expecting a JSON response. Parses the JSON from the reply.
 * If parsing fails, throws.
 */
export async function callLlmJson<T>(
  systemPrompt: string,
  userMessage: string,
  opts: { timeoutMs?: number } = {}
): Promise<T> {
  const raw = await callLlm(systemPrompt, userMessage, opts);
  // Extract JSON from markdown code fences if present.
  const jsonMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : raw;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    throw new Error('AI returned invalid JSON.');
  }
}

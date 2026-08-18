/**
 * Phase 4 — AI Features Module.
 *
 * This module provides shared infrastructure for all AI-powered features:
 *   4.1 "Top risks to this decision" summary (P1)
 *   4.2 AI-assisted input estimation (P1)
 *   4.3 AI-drafted narrative sections (P2)
 *
 * All AI calls use z-ai-web-dev-sdk, server-side only.
 * All AI output is editable by the user before export.
 * All AI output is grounded in computed data.
 * All AI output is scrubbed of banned buzzwords.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * DO NOT BUILD (Phase 4.4 — documented exclusions):
 *
 * 1. No conversational chatbot for wizard input.
 *    Rationale: A chatbot adds interaction complexity and latency without
 *    grounding guarantees. The estimate endpoint (4.2) provides structured
 *    suggestions with clear provenance — a chatbot would undermine that.
 *
 * 2. No separate "AI confidence" score.
 *    Rationale: The existing confidence module (@/lib/calculations/confidence)
 *    already provides a weighted 0–100 score with per-input breakdown and
 *    plain-language labels. Adding an "AI confidence" score would create
 *    a confusing second score that doesn't integrate with the existing
 *    confidence tagging UI (Section 6.4) or the recommendation engine.
 * ═══════════════════════════════════════════════════════════════════════
 */
export { callLlm, callLlmJson, scrubBannedWords } from './sdk';

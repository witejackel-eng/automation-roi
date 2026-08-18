# Phase 4 — AI Features Implementation

## Summary

Implemented all three AI feature tiers using z-ai-web-dev-sdk (server-side only), plus documented exclusions.

## Files Created

### Shared AI Infrastructure
- `src/lib/ai/sdk.ts` — ZAI SDK wrapper with:
  - `callLlm()` — timeout-guarded LLM call with banned-word scrubbing
  - `callLlmJson()` — JSON-response variant with markdown fence extraction
  - `scrubBannedWords()` — search-and-replace for 10 banned buzzwords
  - DO NOT BUILD exclusion comments
- `src/lib/ai/index.ts` — barrel export with Phase 4 documentation

### 4.1 "Top risks to this decision" summary (P1)
- `src/app/api/ai/risks/route.ts` — POST handler:
  - Takes stress-test sensitivity results as input
  - Grounded in computed data — LLM summarizes, does not invent
  - 10-second timeout, requires auth
  - Graceful 503 on AI failure (not 500)
- `src/components/viableo/ai-risks-summary.tsx` — Client component:
  - Idle → Loading skeleton → Numbered risk list
  - "Summarize risks" / "Regenerate" buttons
  - Error: "Could not generate risk summary. Your analysis is safe."

### 4.2 AI-assisted input estimation (P1)
- `src/app/api/ai/estimate/route.ts` — POST handler:
  - Takes industry/role context + optional field list
  - Returns structured {min, max, typical, unit} per field
  - Every value auto-tagged as 'assumption' (0.3x confidence multiplier)
  - 10-second timeout, requires auth
- `src/components/viableo/ai-input-estimator.tsx` — Client component:
  - "Get AI suggestion" button when field is empty
  - Shows range with typical value + ConfidenceTag(assumption)
  - "Use typical value" button → onAccept(value, 'assumption')

### 4.3 AI-drafted narrative sections (P2)
- `src/app/api/ai/narrative/route.ts` — POST handler:
  - STRICTLY templated — Current State + Proposed Automation only
  - Structured input → constrained 2-3 sentence output
  - Double-pass banned word scrubbing (SDK + route-level)
  - 10-second timeout, requires auth
- `src/components/viableo/ai-narrative-draft.tsx` — Client component:
  - "Generate draft" → editable textareas → "Accept" to save
  - Each section labeled "AI-drafted — editable"
  - Regenerate button available after initial generation

### Barrel Export Updated
- `src/components/viableo/index.ts` — Added exports for all three components

## 4.4 DO NOT BUILD Exclusions
Documented in code comments across all AI files:
1. **No conversational chatbot for wizard input** — structured endpoints with clear provenance are superior
2. **No separate "AI confidence" score** — existing confidence module (@/lib/calculations/confidence) already provides weighted 0-100 score with per-input breakdown

## Design Decisions
- All AI output goes through `scrubBannedWords()` — defense in depth
- All AI endpoints return 503 (not 500) on failure — graceful degradation
- Auth required on all endpoints via `requireAuth()`
- 10-second timeout enforced via Promise.race
- JSON extraction handles markdown code fences (LLMs sometimes wrap JSON)
- Estimate values auto-tagged as 'assumption' — confidence model applies 0.3x automatically

## Lint
Passed with zero errors.

# Viableo PR Checklist

Every pull request must pass this checklist before merge. The checklist enforces the [Product Contract](./PRODUCT_CONTRACT.md) and the [Copy Guidelines](./COPY_GUIDELINES.md).

## Pre-Merge Checklist

### 1. Contract Alignment

- [ ] **Verdict integrity:** Does this change make any verdict (BUILD, CONSIDER, DON'T BUILD) more or less accurate? If less accurate, reject.
- [ ] **Assumption transparency:** Does this change hide, obscure, or remove any assumption from the user? If yes, reject.
- [ ] **Breaking point clarity:** Does this change reduce the user's ability to see what would flip the verdict? If yes, reject.
- [ ] **Defensibility:** Does this change make the output harder to defend to a skeptical client? If yes, reject.
- [ ] **DON'T BUILD as outcome:** Does this change treat DON'T BUILD as a failure state, an error, or something to apologize for? If yes, reject.

### 2. Copy Audit

- [ ] **No celebration language:** Run `bun scripts/contract-audit.ts`. Must exit 0.
- [ ] **No hedging language:** Same audit. Must exit 0.
- [ ] **No sales language:** Same audit. Must exit 0.
- [ ] **No hardcoded prices:** Same audit. Must exit 0.
- [ ] **No unverified claims:** Every external statistic or research claim includes a verifiable source link.
- [ ] **Voice consistency:** New copy follows the [Copy Guidelines](./COPY_GUIDELINES.md) — short sentences, second person, active voice, no marketing adjectives.

### 3. Verdict Copy

If the PR touches any verdict-related UI (DecisionBadge, verdict-reveal, ai-narrative-draft, stress-test, confidence-sidebar):

- [ ] **BUILD verdict:** Neutral confidence, not celebration. No exclamation marks.
- [ ] **CONSIDER verdict:** Honest about the uncertainty gap. No false optimism.
- [ ] **DON'T BUILD verdict:** Direct, respectful, no apology. Not framed as a problem.

### 4. Numerical Integrity

- [ ] **No hardcoded implementation fees:** The model determines breaking points. Do not suggest or assume a fee.
- [ ] **No cherry-picked scenarios:** If scenarios are shown, conservative case must be prominent.
- [ ] **No hidden multipliers:** Every factor in the calculation must be visible and labelled.

### 5. Visual Design

- [ ] **Verdict colors are semantic, not decorative:** BUILD = emerald, CONSIDER = amber, DON'T BUILD = crimson. No changes to this mapping.
- [ ] **No urgency framing:** No countdown timers, "limited time" messaging, or pressure tactics.
- [ ] **Equal visual weight for all verdicts:** DON'T BUILD gets the same design care as BUILD.

### 6. Technical

- [ ] **`bun run lint` passes:** No warnings or errors.
- [ ] **No new dependencies without justification:** Every new package must be motivated by a contract-positive signal.
- [ ] **Copy lives in `src/lib/brand.ts`:** All user-facing strings should be centralized. Exceptions allowed only for computed/dynamic text.

## Decision Rule

If **any** item in sections 1–4 fails, the PR **does not merge**. Rewrite or reject.

Sections 5–6 are blocking but may be resolved with targeted follow-up commits.

## Running the Audit

```bash
bun scripts/contract-audit.ts
```

Exit code 0 = clean. Exit code 1 = violations found (do not merge until fixed).

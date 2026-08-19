# Viableo Copy Guidelines

## Voice and Tone

Viableo speaks to automation professionals who sell, scope, and build automations for clients. These people are technically literate, time-poor, and skeptical of marketing language. They have been burned by optimistic estimates before.

The voice is **direct, calm, and specific**. It does not sell. It demonstrates.

## Core Principles

### 1. Benefit before feature
Name the pain before the fix. The reader should recognize their problem before they see the tool.

**Do:** "Deciding whether it's worth building — and defending that decision to a client who is benchmarking your quote against two other bids — is where automation projects go wrong."

**Don't:** "Viableo is an all-in-one ROI platform that empowers agencies to unlock automation value."

### 2. Short, plain sentences
Target 10–15 words. Fragments are allowed when they land harder.

**Do:** "One scope in. Four answers out. Every figure traced to an input you can see."

**Don't:** "Viableo provides a comprehensive end-to-end solution that enables automation agencies to deliver data-driven ROI analyses to their clients."

### 3. Second person, active voice, present tense
Address the reader directly. No passive constructions that dilute accountability.

**Do:** "You scope it by feel. You quote it by feel."

**Don't:** "Automation projects are often scoped without rigorous analysis."

### 4. One headline per screen
Everything else supports the headline. Never compete with yourself.

## Prohibited Language

### Celebration language
Words that celebrate an outcome before the user has earned it:
- "Excellent!", "Great!", "Amazing!", "Fantastic!", "Outstanding!"
- "Congratulations!", "Awesome!"
- Any exclamation-mark-only affirmation

**Why:** Viableo may tell the user not to build. Celebrating the process undermines the verdict's credibility.

### Hedging language
Words that soften bad news into vague comfort:
- "Unfortunately", "Sadly", "Regrettably"
- "It's a shame that", "We're sorry to say"
- Any adverb that apologizes for a correct answer

**Why:** A DON'T BUILD verdict is a good outcome. Hedging treats it as failure.

### Sales language
Phrases that frame the tool as a revenue accelerator rather than a decision tool:
- "Close more deals", "Win more business", "Increase your close rate"
- "Help your client say yes", "Get to yes faster"
- "Grow your revenue", "Scale your agency"

**Why:** Viableo helps you decide whether something is worth building. It does not help you sell things that aren't.

### Marketing adjectives
Vague superlatives that cannot be falsified:
- "Industry-leading", "Cutting-edge", "Revolutionary", "Game-changing"
- "Powerful", "Robust", "Comprehensive", "Seamless"
- "All-in-one", "End-to-end", "Best-in-class"

**Why:** These words signal a $5 calculator, not a $3,000 determination tool.

### Fake social proof
Testimonials, logos, or metrics we cannot verify:
- "Trusted by 500+ agencies"
- "Used by top n8n partners"
- Any metric without a verifiable source

**Why:** We do not have customers to cite. Fabricating trust destroys it.

## How to Write Verdict Copy

### BUILD
Neutral confidence, not celebration.
- **Do:** "The numbers hold up — even in the worst case."
- **Don't:** "Excellent! This project is a winner!"

### CONSIDER
Honest about the gap between economics and certainty.
- **Do:** "The math works. The timeline might not."
- **Don't:** "Great potential here, just needs a bit more work!"

### DON'T BUILD
Direct, respectful, no apology.
- **Do:** "The numbers don't support it. Better to know now than after the invoice."
- **Don't:** "Unfortunately, this project doesn't quite meet the threshold."

## How to Write Error Copy

State what happened and what is safe. No emotional framing.

- **Do:** "We couldn't generate the business case. Your analysis is safe."
- **Don't:** "Oops! Something went wrong. Don't worry, we'll fix it!"

## How to Write Loading Copy

Describe what the system is doing, step by step.

- **Do:** "Calculating your opportunity…", "Testing conservative assumptions…"
- **Don't:** "Hang tight!", "Almost there!"

## Numerical Claims

### Never hardcode prices in copy
Prices come from `PRICING_TIERS` in `src/lib/brand.ts`. If you need to reference a price in UI text, derive it from the constant.

### Never hardcode implementation fee assumptions
The model determines what fee flips the verdict. Do not assume or suggest a number.

### Source everything
Every external claim (industry statistic, research finding) must include a verifiable source link. If you cannot link to the original, do not include the claim.

## Style Notes

- Use em dashes (—) for parenthetical statements, not parentheses or commas
- Use curly apostrophes in prose copy (’), not straight apostrophes (')
- Use "Don't" not "Do not" in marketing copy; use "do not" in technical documentation
- Periods go inside quotation marks when they are part of the quoted material
- Oxford comma: yes
- Serial comma in lists of three or more items

## Enforcement

The contract audit script (`scripts/contract-audit.ts`) scans all `.ts`/`.tsx` files in `src/` for prohibited patterns. PRs that introduce violations should not merge. See `docs/PR_CHECKLIST.md` for the full review process.
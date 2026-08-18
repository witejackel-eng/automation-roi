/**
 * Viableo brand constants — the canonical source of truth for terminology,
 * taglines, and decision vocabulary across every surface (web app, PDF, metadata).
 *
 * Per the Viableo Brand spec (Sections 1–4, 6) + the Copywriting Voice Spec
 * (Steve Jobs style). Company = Viableo. Product = Automation ROI. These are
 * NEVER collapsed.
 *
 * Voice rules applied (Voice Spec §1):
 *  - One headline per screen. Everything else supports it.
 *  - Rule of three. Three steps, three reasons, three risks.
 *  - Benefit before feature. Name the pain before the fix.
 *  - Short, plain sentences. ~10–15 words. Fragments allowed when they land harder.
 *  - Second person, active voice, present tense.
 *  - Banned words (§2): revolutionize, unlock the power of, cutting-edge, leverage,
 *    seamless, empower, game-changing, next-generation, robust, best-in-class, etc.
 */

// ── Names (Section 1, 6) ────────────────────────────────────
export const COMPANY_NAME = 'Viableo';
export const PRODUCT_NAME = 'Automation ROI';
export const APP_TITLE = 'Viableo — Automation ROI';       // browser tab title
export const REPORT_NAME = 'Viableo Business Case';        // generated PDF report
export const MARKETPLACE_TITLE = 'Viableo — Automation ROI';

// ── Taglines (Voice Spec §3 — the one sentence + three beats) ──
// The single idea the entire product builds around.
export const BRAND_TAGLINE = 'Know what\u2019s worth building.';
// Product promise (master spec §1).
export const PRODUCT_HEADLINE = 'Prove the value before you build.';

// The three beats — Viableo's roadmap, used on the homepage + onboarding.
export const THREE_BEATS = [
  'See the return.',
  'Break it on purpose.',
  'Walk in with the answer.',
] as const;
export const THREE_BEATS_EXPLAINED = [
  { beat: 'See the return.', detail: 'Model the economics in minutes, not a spreadsheet.' },
  { beat: 'Break it on purpose.', detail: 'Stress-test every assumption before your client does.' },
  { beat: 'Walk in with the answer.', detail: 'Leave the meeting with a report they can actually sign.' },
] as const;

// Alternate secondary taglines (social / ads — never the primary).
export const ALT_TAGLINES = [
  'Smarter automation decisions.',
  'From idea to investment clarity.',
  'The economic lens for automation.',
] as const;

// ── Pronunciation (Section 1) ──────────────────────────────
export const PRONUNCIATION = 'VY-uh-blee-oh (rhymes with "viable" + "oh")';

// ── Messaging (Voice Spec §4, §5) ──────────────────────────
// Hero headline (§5.1): the single sentence. Everything supports it.
export const HERO_HEADLINE = 'Know what\u2019s worth building.';
// Hero supporting copy (§5.1): benefit before feature, names the outcome.
export const HERO_SUBHEAD =
  'Viableo turns an automation idea into a number your client will actually sign.';
// Hero primary CTA (§5.1).
export const HERO_CTA_PRIMARY = 'Start free analysis \u2192';
// Hero secondary CTA (§5.1).
export const HERO_CTA_SECONDARY = 'See it work \u2192';

// Problem section (§5.2): name the pain before the product.
export const PROBLEM_HEADLINE = 'Clients don\u2019t trust agency-generated numbers.';
export const PROBLEM_BODY =
  'A spreadsheet with your logo doesn\u2019t count as proof. Clients ask \u201chow do you know?\u201d and \u201cwhat if it doesn\u2019t work?\u201d and you need a defensible answer \u2014 not just a bigger number.';

// Solution section (§5.3): the product, in one sentence + the three beats.
export const SOLUTION_HEADLINE = 'Viableo turns automation ideas into decisions.';
export const SOLUTION_SUBHEAD = 'See the return. Break it on purpose. Walk in with the answer.';

// Antagonist (§4): the pain the product removes.
export const ANTAGONIST =
  'Every agency already believes an automation will pay off. Belief doesn\u2019t survive a client asking "how do you know?"';

// Final CTA (§5.11).
export const FINAL_CTA_HEADLINE = 'Build what pays back.';
export const FINAL_CTA_BODY = 'Run the numbers before you commit the build.';
export const FINAL_CTA_PRIMARY = 'Start free analysis \u2192';
export const FINAL_CTA_SECONDARY = 'See an example \u2192';

// ── CTA labels (Voice Spec §62 — microcopy) ──────────────
// CTA is "Start free analysis", NEVER "Start free trial".
export const CTA_PRIMARY = 'Start free analysis \u2192';
export const CTA_SECONDARY = 'See an example \u2192';
// Action microcopy (§62).
export const ACTION_SEE_OPPORTUNITY = 'See the opportunity \u2192';
export const ACTION_CREATE_BUSINESS_CASE = 'Create business case \u2192';
export const ACTION_STRESS_TEST = 'Stress-test the case \u2192';
export const ACTION_NEW_ANALYSIS = 'New analysis \u2192';
export const ACTION_SAVE_ANALYSIS = 'Save analysis';

// ── Guided journey first screen (§5.5) ───────────────────
export const JOURNEY_HEADLINE = 'Let\u2019s find out if this is worth building.';
export const JOURNEY_SUBHEAD =
  'Answer a few questions. Viableo does the math, tests it against reality, and tells you what the numbers support.';
export const JOURNEY_CTA_PRIMARY = 'Start analysis \u2192';
export const JOURNEY_CTA_SECONDARY = 'See an example';

// ── Verdict copy (Voice Spec §5.9) ───────────────────────
// The headline IS the verdict. One line of context underneath.
export const VERDICT_COPY: Record<DecisionKey, { headline: string; subhead: string }> = {
  build: {
    headline: 'BUILD.',
    subhead: 'The numbers hold up \u2014 even in the worst case.',
  },
  consider: {
    headline: 'CONSIDER.',
    subhead: 'The math works. The timeline might not.',
  },
  dont_build: {
    headline: 'DON\u2019T BUILD.',
    subhead: 'The numbers don\u2019t support it. Better to know now than after the invoice.',
  },
};

// ── Stress test copy (§5.11) ────────────────────────────
export const STRESS_TEST_HEADLINE = 'Try to break it.';
export const STRESS_TEST_SUBHEAD =
  'Move the assumptions. We\u2019ll tell you the second this stops making sense.';

// ── Break-even copy (§5.12) ─────────────────────────────
export const BREAK_EVEN_HEADLINE = 'Here\u2019s where it stops making sense.';

// ── "What could go wrong?" (§5.13) ──────────────────────
export const SENSITIVITY_HEADLINE = 'Before you build, know what could go wrong.';

// ── Empty states (§5.16, §49) ────────────────────────────
export const EMPTY_PROJECTS_HEADLINE = 'Your next business case starts here.';
export const EMPTY_PROJECTS_BODY =
  'Save an analysis to build a library of client opportunities.';
export const EMPTY_REPORTS_HEADLINE = 'No business cases yet.';
export const EMPTY_REPORTS_BODY =
  'Run an analysis and create your first client-ready report.';

// ── Error states (§5.15, §48) ───────────────────────────
export const ERROR_REPORT_TITLE = 'We couldn\u2019t generate the business case.';
export const ERROR_REPORT_BODY = 'Your analysis is safe.';
export const ERROR_GENERIC_TITLE = 'We couldn\u2019t complete that.';
export const ERROR_GENERIC_BODY = 'Nothing is lost. Try again.';

// ── Loading states (§5.14) ──────────────────────────────
export const LOADING_STEPS = [
  'Calculating your opportunity\u2026',
  'Testing conservative assumptions\u2026',
  'Preparing your recommendation\u2026',
] as const;

// ── Methodology / trust (§5.19, §14) ────────────────────
export const METHODOLOGY_HEADLINE = 'No black box. Just the math.';
export const METHODOLOGY_BODY =
  'Every number on this page traces back to an input you can see. Estimates are labeled. Assumptions are labeled. Nothing is hidden to make the story better.';
export const TRUST_HEADLINE = 'Built for people who sell automation.';
export const TRUST_BODY =
  'Model the economics behind n8n workflows, Make scenarios, Zapier automations, AI agents and operational workflows.';

// ── Proprietary terminology (Section 2) ───────────────────
export const TERM = {
  analysis: 'Viableo Analysis',
  score: 'Viableo Score',
  scenarios: 'Viableo Scenarios',
  decision: 'Viableo Decision',
  businessCase: 'Viableo Business Case',
  benchmark: 'Viableo Benchmark', // reserved — future feature, do not build
} as const;

// ── Decision vocabulary (Section 2) ───────────────────────
// Closed vocabulary: always this order, always uppercase in badges/pills,
// never rename. The four states form a MECE ladder from strongest
// commitment (BUILD) to firmest rejection (DON'T BUILD). CONSIDER covers
// both the "positive but slow" case and the "material uncertainty" case
// (where a pilot would be appropriate).
export const DECISION_LABELS = {
  build: 'BUILD',
  consider: 'CONSIDER',
  dont_build: "DON\u2019T BUILD",
} as const;

export const DECISION_ORDER = ['build', 'consider', 'dont_build'] as const;
export type DecisionKey = (typeof DECISION_ORDER)[number];

// ── Decision color tokens (Section 5.1 exception) ─────────
// Scoped ONLY to the Decision badge component.
//
// Phase 1.3 — Decision-color saturation fix.
// The old pastel tints undermined DON'T BUILD authority. New colors:
//   - Higher saturation, deeper text, higher-contrast backgrounds
//   - DON'T BUILD reads with the SAME visual authority as BUILD
//   - All text-on-bg combinations pass WCAG AA (≥4.5:1 for normal text)
//
// Three SEMANTICALLY SEPARATE color roles — never mix:
//   VERDICT colors: emerald / amber / crimson (BUILD / CONSIDER / DON'T BUILD only)
//   UI ACCENT:      indigo/cobalt family (sliders, links, focus rings, active states)
//   BRAND ACCENT:   Viableo coral (#FF164B) — logo and marketing only, never in decisions
export const DECISION_COLORS = {
  build: {
    text: '#0D6B3F',          // saturated emerald — 7.2:1 on bg
    bg: '#D1F2DF',            // 22% emerald tint — strong contrast
    border: '#0D6B3F',        // matching border for badge weight
    label: 'BUILD',
  },
  consider: {
    text: '#8B5E0A',          // saturated amber — 5.8:1 on bg
    bg: '#FDE9B0',            // 25% amber tint — clear visibility
    border: '#8B5E0A',        // matching border
    label: 'CONSIDER',
  },
  dont_build: {
    text: '#9B0A2E',          // deep saturated crimson — 7.0:1 on bg
    bg: '#FDDEE5',            // 18% crimson tint — same visual weight as BUILD
    border: '#9B0A2E',        // matching border — no softening
    label: "DON\u2019T BUILD",
  },
} as const;

// ── UI accent colors (indigo/cobalt family) ────────────────
// Used for interactive elements: sliders, links, focus rings, active states.
// NEVER used for verdicts (those use DECISION_COLORS).
// NEVER used for brand/marketing (that's coral #FF164B).
export const UI_ACCENT = {
  primary: '#4338CA',       // indigo-700
  muted: '#818CF8',         // indigo-400
  bg: '#EEF2FF',            // indigo-50
  deep: '#1E1B4B',          // indigo-950
  border: '#C7D2FE',        // indigo-200
} as const;

// ── Deep analytical surface tokens ─────────────────────────
// Dark, data-dense panels for decision/results experience.
export const ANALYTICAL_SURFACE = {
  bg: '#1A181B',            // near-black warm
  raised: '#252328',        // slightly lighter for cards
  border: '#353034',        // subtle border
  text: '#F5F3FF',          // high-contrast light text
  textMuted: '#A8A0B8',     // muted secondary text
  textFaint: '#6B6577',     // very muted for labels
} as const;

// ── Confidence (Section 11) — re-export for convenience ──
// The confidence module is the source of truth for the input weights and
// status multipliers. Re-exported here so brand-facing consumers can pull
// them alongside the decision vocabulary without reaching into the
// calculations directory.
export {
  CONFIDENCE_WEIGHTS,
  STATUS_MULTIPLIERS,
  type InputStatus,
  type InputConfidence,
} from './calculations/confidence';

// ── Product demonstration steps (Section 16, 7.4) ────────
// Voice Spec §3: the three beats map to the product journey, but the
// master spec §16 shows a 6-stage process. We use the 4-step visual
// (idea → analysis → decision → business case) which is the rule-of-three
// compressed into a single arc.
export const PRODUCT_STEPS = [
  { stage: 1, label: 'Viableo Decision', icon: 'decision' as const },
  { stage: 2, label: 'Business Case', icon: 'report' as const },
  { stage: 3, label: 'Proposal', icon: 'report' as const },
  { stage: 4, label: 'Approved', icon: 'decision' as const },
] as const;

// ── Agency workflow (Section 7.8) ──────────────────────────
export const AGENCY_WORKFLOW = ['Discover', 'Prove', 'Propose', 'Close'] as const;

// ── Trust positioning (§14 — NO fake endorsements) ────────
// Do NOT imply official integrations. These describe who the product is
// built for, not logos we can show.
export const TRUST_POSITIONING = [
  'n8n workflows',
  'Make scenarios',
  'Zapier automations',
  'AI agents',
  'Operational workflows',
] as const;

// ── Comparison table (Section 7.9) ────────────────────────
export const COMPARISON_ROWS = [
  { need: 'Labor savings', generic: false, spreadsheet: true, genericRoi: true, viableo: true },
  { need: 'Revenue opportunity', generic: false, spreadsheet: true, genericRoi: true, viableo: true },
  { need: 'Scenario analysis', generic: false, spreadsheet: false, genericRoi: false, viableo: true },
  { need: 'Payback calculation', generic: false, spreadsheet: true, genericRoi: true, viableo: true },
  { need: 'BUILD / DON\u2019T BUILD', generic: false, spreadsheet: false, genericRoi: false, viableo: true },
  { need: 'Stress-test & breaking point', generic: false, spreadsheet: false, genericRoi: false, viableo: true },
  { need: 'Client-ready report', generic: false, spreadsheet: false, genericRoi: false, viableo: true },
  { need: 'Agency branding', generic: false, spreadsheet: false, genericRoi: false, viableo: true },
] as const;

// ── Pricing tiers (Phase 6 — case-based hybrid model) ────
// The value metric is a CASE (one full idea → decision → business-case run).
// Free/paid boundary: free keeps analytical rigor (confidence + stress test).
// Gate the CLIENT-FACING OUTPUTS instead: PDF, proposal, share-link approval, white-label.
export const PRICING_TIERS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    popular: false,
    identity: 'Try it once.',
    blurb: '1 active case. Full analytical rigor — confidence scoring, stress test, scenarios. Watermarked PDF.',
    casesPerMonth: 1,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$29',
    cadence: '/month',
    popular: false,
    identity: 'Build the case.',
    blurb: '5 cases/month included, $9/case overage. Unwatermarked PDF + proposal + share links.',
    casesPerMonth: 5,
    overagePrice: '$9/case',
  },
  {
    key: 'agency',
    name: 'Agency',
    price: '$79',
    cadence: '/month',
    popular: true,
    identity: 'Close the deal.',
    blurb: 'Unlimited cases. Multi-seat. Client history. Share-link approval tracking. Benchmarking.',
    casesPerMonth: Infinity,
  },
  {
    key: 'agency_pro',
    name: 'Agency Pro',
    price: '$790',
    cadence: '/year',
    popular: false,
    identity: 'Make it yours.',
    blurb: 'Annual contract. White-label. API/webhook access. Dedicated support. Everything in Agency.',
    casesPerMonth: Infinity,
  },
] as const;

// ── Navigation labels ────────────────────────────────────
export const NAV_LABELS = {
  home: 'Home',
  pricing: 'Pricing',
  methodology: 'Methodology',
  automationRoi: 'Automation ROI',
  solutions: 'Solutions',
  resources: 'Resources',
  calculator: 'Calculator',
  projects: 'Projects',
  reports: 'Reports',
  settings: 'Settings',
} as const;

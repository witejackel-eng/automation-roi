/**
 * Viableo brand constants — the canonical source of truth for terminology,
 * taglines, and decision vocabulary across every surface (web app, PDF, metadata).
 *
 * Company = Viableo. Product = Automation ROI. These are NEVER collapsed.
 *
 * Voice rules:
 *  - One headline per screen. Everything else supports it.
 *  - Rule of three. Three steps, three reasons, three risks.
 *  - Benefit before feature. Name the pain before the fix.
 *  - Short, plain sentences. ~10–15 words. Fragments allowed when they land harder.
 *  - Second person, active voice, present tense.
 *  - Banned words: see the Voice spec §2 for the full list. The homepage copy
 *    is clean of them (verified by grep). Do not reintroduce marketing adjectives
 *    that signal a $5 calculator framing rather than a $3,000 determination.
 *
 * Per the Viableo Final Research, Strategy, and ZAI Implementation Prompt
 * (Part 5 §F — Exact Copy). Every string the homepage ships is sourced here.
 */

// ── Names ───────────────────────────────────────────────────
export const COMPANY_NAME = 'Viableo';
export const PRODUCT_NAME = 'Automation ROI';
export const APP_TITLE = 'Viableo — Automation ROI';
export const REPORT_NAME = 'Viableo Business Case';
export const MARKETPLACE_TITLE = 'Viableo — Automation ROI';

// ── Taglines ────────────────────────────────────────────────
export const BRAND_TAGLINE = 'Know what\u2019s worth building.';
export const PRODUCT_HEADLINE = 'Prove the value before you build.';

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

export const ALT_TAGLINES = [
  'Smarter automation decisions.',
  'From idea to investment clarity.',
  'The economic lens for automation.',
] as const;

export const PRONUNCIATION = 'VY-uh-blee-oh (rhymes with "viable" + "oh")';

// ── Hero (Section F — Hero) ─────────────────────────────────
export const HERO_EYEBROW = 'For agencies who sell automation';
export const HERO_HEADLINE = 'Know what\u2019s worth building \u2014 before you quote it.';
export const HERO_SUBHEAD =
  'Get a BUILD / CONSIDER / DON\u2019T BUILD verdict, the point where the case breaks, and a client document that holds up when they push on price.';
export const HERO_CTA_PRIMARY = 'Run a free case in 5 minutes';
export const HERO_CTA_SECONDARY = 'See a completed example';
// Stat labels for the hero (E1 visual).
export const HERO_STAT_LABELS = {
  net: 'Expected first-year net',
  payback: 'Payback',
  holdsUntil: 'Answer holds until',
} as const;

// ── CTAs (microcopy) ─────────────────────────────────────────
// Primary CTA label, used by marketing-primitives PrimaryCTA + homepage hero/close.
export const CTA_PRIMARY = 'Run your first case \u2014 free';
export const CTA_SECONDARY = 'See a completed case';
export const ACTION_SEE_OPPORTUNITY = 'See the opportunity \u2192';
export const ACTION_CREATE_BUSINESS_CASE = 'Create business case \u2192';
export const ACTION_STRESS_TEST = 'Stress-test the case \u2192';
export const ACTION_NEW_ANALYSIS = 'New analysis \u2192';
export const ACTION_SAVE_ANALYSIS = 'Save analysis';

// ── Problem (Section F — Problem, E2) ────────────────────────
export const PROBLEM_HEADLINE = 'Building it is the easy part.';
export const PROBLEM_SUBHEAD =
  'Deciding whether it\u2019s worth building \u2014 and defending that decision to a client who is benchmarking your quote against two other bids \u2014 is where automation projects go wrong.';
export const PROBLEM_PARAS = [
  'You scope it by feel. You quote it by feel. Then the client asks why it costs what it costs, and whether they should just hire someone instead.',
  'You do not have a number you can stand behind, because you built the number the same afternoon you built the quote.',
  'And the part you always underestimate \u2014 keeping it running after handover \u2014 never makes it into the figure at all.',
] as const;
export const PROBLEM_BODY = PROBLEM_PARAS[0]; // back-compat for any consumer expecting a single string

// ── Consequence (Section F — Consequence, E3) ───────────────
export const CONSEQUENCE_HEADLINE = 'The cost of guessing lands on you.';
export const CONSEQUENCE_SUBHEAD =
  'Not on the client. On your margin, your weekends, and your renewal rate.';
export const CONSEQUENCE_ITEMS = [
  {
    heading: 'Your estimates are wrong and you know it.',
    body: 'One agency measured itself \u201Cmissing 95% of our internal estimates,\u201D improving to \u201Capproximately 60%.\u201D',
    source: { label: 'r/agency', href: 'https://www.reddit.com/r/agency/comments/1ivaew8/is_there_a_better_way_to_create_proposals/' },
  },
  {
    heading: 'Upkeep runs several times what you quoted.',
    body: 'Practitioners report actual maintenance of \u201C7 to 9 hours per month\u201D against a 2-hour estimate, and call the common 2\u20133 hour expectation \u201Coverly optimistic.\u201D',
    source: { label: 'r/n8n', href: 'https://www.reddit.com/r/n8n/comments/1tot6ou/how_do_you_actually_charge_clients_for_n8n_upkeep/' },
  },
  {
    heading: 'Half of what you build stops being used.',
    body: 'One builder found that of 50 automations delivered in a year, \u201Conly about half were being used consistently,\u201D with clients still paying hosting on systems untouched for weeks.',
    source: { label: 'r/n8n', href: 'https://www.reddit.com/r/n8n/comments/1pe314d/i_built_50_automations_that_clients_never_used/' },
  },
] as const;
export const CONSEQUENCE_CLOSING =
  'In its own delivery experience, EY reported seeing \u201Cas many as 30 to 50% of initial RPA projects fail\u201D \u2014 and named the absence of a business case as a leading cause.';
export const CONSEQUENCE_CLOSING_SOURCE = {
  label: 'EY, Get ready for robots, 2016',
  href: 'https://www.eyfinancialservicesthoughtgallery.ie/wp-content/uploads/2016/11/ey-get-ready-for-robots.pdf',
};

// ── What Viableo does (Section F, E4) ───────────────────────
export const WHAT_HEADLINE = 'Four questions, answered before you quote.';
export const WHAT_SUBHEAD =
  'One scope in. Four answers out. Every figure traced to an input you can see.';
export const WHAT_ITEMS = [
  { q: 'Is it worth building?', a: 'A verdict: BUILD, CONSIDER, or DON\u2019T BUILD.' },
  { q: 'Where does that stop being true?', a: 'The implementation fee at which the answer flips.' },
  { q: 'How much should you trust it?', a: 'A confidence score, driven by how much of your input is measured rather than assumed.' },
  { q: 'What do you hand the client?', a: 'A document with every number traced to a labelled input.' },
] as const;
export const WHAT_LINK = 'See how the math works';
export const WHAT_LINK_HREF = '/methodology';

// ── Verdict (Section F, E5) ──────────────────────────────────
export const VERDICT_HEADLINE = 'It will tell you not to build.';
export const VERDICT_SUBHEAD =
  'The rules are published, they are applied the same way every time, and they will return a no.';
export const VERDICT_GATE_INTRO = 'BUILD requires all three:';
export const VERDICT_GATES = [
  'Conservative-case ROI above 50%.',
  'Conservative-case payback within 12 months.',
  'A confidence score of at least 60.',
] as const;
export const VERDICT_GATE_NOTE =
  'A confidence score between 40 and 59 returns CONSIDER regardless of how good the economics look.';
export const VERDICT_CLOSING =
  'That last rule is the one most tools would leave out. A model that cannot say \u201Cyour inputs are too soft to justify this yet\u201D is not giving you a decision. It is agreeing with you.';
export const VERDICT_BAND_LABELS = [
  { range: '80 and above', label: 'High' },
  { range: '60 to 79', label: 'Moderate' },
  { range: '40 to 59', label: 'Material uncertainty' },
  { range: 'Below 40', label: 'Low' },
] as const;

// ── Break it on purpose (Section F, E6) ─────────────────────
export const BREAK_HEADLINE = 'Try to break it.';
// Subhead interpolates PERMUTATION_COUNT (64) at render time — do not hardcode.
export const BREAK_SUBHEAD_TEMPLATE =
  'Viableo varies every material assumption across {PERMUTATION_COUNT} permutations and reports the point where the answer changes.';
export const BREAK_THREE_POINT_LABEL = 'Conservative \u00B7 Expected \u00B7 Upside';
export const BREAK_BREAKING_POINT_LABEL = 'The answer holds until the implementation fee passes';
export const BREAK_SENSITIVITY_HEADING = 'What moves the answer most';
export const BREAK_SENSITIVITY_UNIT_LABEL = 'percentage points of ROI swing at \u00B120%';
export const BREAK_LINK = 'Run this on your own case';
export const BREAK_LINK_HREF = '/start?start=1';

// ── Client report (Section F, E7) ───────────────────────────
export const CLIENT_REPORT_HEADLINE = 'What your client actually receives.';
export const CLIENT_REPORT_SUBHEAD =
  'Every figure traced to an input, and every input labelled by how you got it \u2014 measured, estimated, or assumed. So a sceptical client can check your work instead of taking your word.';
export const CLIENT_REPORT_WEIGHTING_LINE =
  'Measured inputs count in full. Estimated inputs count at 0.6. Assumptions count at 0.3.';
export const CLIENT_REPORT_CONSEQUENCE_LINE =
  'Guess more, and the confidence score falls. That is deliberate.';
export const CLIENT_REPORT_CTA = 'See a completed case';
export const CLIENT_REPORT_CTA_HREF = '/start?start=1&example=apex';

// ── Proof (Section F, E8) ───────────────────────────────────
export const PROOF_HEADLINE = 'No black box. Open the math.';
export const PROOF_SUBHEAD =
  'One worked case, computed live from published inputs. The same inputs return the same answer, every time, for anyone who runs it.';
export const PROOF_PARAS = [
  'Every figure on this page is computed when the page is built, from the reference case inputs published on the methodology page. Nothing here is typed in by hand. If the model changes, these numbers change with it.',
  'That matters because the obvious alternative does not offer it. Research on language models found that at temperature zero, one thousand completions of the same prompt produced eighty different outputs, and separate work measured raw-output repeatability at zero percent across ten repeated runs of the same mathematical questions. A number you cannot reproduce is a number you cannot defend.',
] as const;
export const PROOF_SOURCES = [
  { label: 'Thinking Machines Lab', href: 'https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/' },
  { label: 'Atil et al.', href: 'https://arxiv.org/html/2408.04667v5' },
] as const;
export const PROOF_CTA = 'Read the methodology';
export const PROOF_CTA_HREF = '/methodology';

// ── Where it fits (Section F, E9) ───────────────────────────
export const WHERE_HEADLINE = 'Where it sits in your process.';
export const WHERE_SUBHEAD =
  'Between the discovery call and the quote. One pass, before you commit a number to writing.';

// ── Comparison (Section F, E10) ─────────────────────────────
export const COMPARISON_HEADLINE = 'Why not a spreadsheet or a chat model?';
export const COMPARISON_SUBHEAD =
  'Both will give you a number. Neither will give you the same number twice, or tell you when to walk away.';
// Scarce-only rows. ROI math, payback, PDF export, share links, white-labelling,
// report generation speed are all free elsewhere (mandate §2.9) and are NOT
// claimed as differentiation. ComparisonTable reads this constant.
export const COMPARISON_ROWS = [
  { need: 'A verdict that can be no', generic: false, spreadsheet: false, genericRoi: false, viableo: true },
  { need: 'A stated breaking point', generic: false, spreadsheet: false, genericRoi: false, viableo: true },
  { need: 'A confidence score on the recommendation', generic: false, spreadsheet: false, genericRoi: false, viableo: true },
  { need: 'Reproducible \u2014 same inputs, same answer', generic: false, spreadsheet: true, genericRoi: false, viableo: true },
  { need: 'Maintenance-adjusted costs', generic: false, spreadsheet: false, genericRoi: false, viableo: true },
] as const;

// ── Pricing (Section F + K, E11) ──────────────
export const PRICING_HEADLINE = 'Simple plans. Full rigor on every tier.';
export const PRICING_SUBHEAD = 'Free includes the real decision engine. Paid unlocks clean client artifacts and workflow.';
export const PRICING_FOOTNOTE = 'Monthly and annual subscriptions. Cancel any time.';
export const DATA_HANDLING_LINE =
  'Viableo needs no client-identifying data to return a verdict. Hours, rates, volumes, and a fee are enough.';
export const PRICING_TIERS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    popular: false,
    identity: 'Try it once.',
    blurb: 'One case per month. Full analytical rigor — confidence scoring, stress test, scenarios. Watermarked document.',
    casesPerMonth: 1,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$29',
    cadence: 'per month',
    popular: true,
    identity: 'Full documents.',
    blurb: 'Five cases per month. Unwatermarked PDFs, saved projects, share links.',
    casesPerMonth: 5,
  },
  {
    key: 'agency',
    name: 'Agency',
    price: '$79',
    cadence: 'per month',
    popular: false,
    identity: 'Unlimited cases.',
    blurb: 'Unlimited cases. Your branding on every document. Client history.',
    casesPerMonth: Infinity,
  },
  {
    key: 'agency_pro',
    name: 'Agency Pro',
    price: '$790',
    cadence: 'per year',
    popular: false,
    identity: 'Make it yours.',
    blurb: 'Unlimited cases, branding, client history, team seats, and API access.',
    casesPerMonth: Infinity,
  },
] as const;

// ── Close (Section F, E12) ──────────────────────────────────
export const FINAL_CTA_HEADLINE = 'Quote the build after the case survives the stress test.';
export const FINAL_CTA_BODY =
  'Run one case. If the answer is don\u2019t build, you have saved yourself a project.';
export const FINAL_CTA_PRIMARY = 'Run your first case free';
export const FINAL_CTA_PRIMARY_HREF = '/start?start=1';
export const FINAL_CTA_SECONDARY = ''; // E12: one CTA only. Kept for back-compat, intentionally empty.
export const FINAL_CTA_SECONDARY_HREF = '';

// ── Guided journey (calculator wizard — unchanged) ─────────
export const JOURNEY_HEADLINE = 'Let\u2019s find out if this is worth building.';
export const JOURNEY_SUBHEAD =
  'Answer a few questions. Viableo does the math, tests it against reality, and tells you what the numbers support.';
export const JOURNEY_CTA_PRIMARY = 'Start analysis \u2192';
export const JOURNEY_CTA_SECONDARY = 'See an example';

// ── Verdict copy (per-verdict headline + subhead, used by DecisionBadge) ─
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

// ── Stress test copy (legacy constants kept for calculator view) ─
export const STRESS_TEST_HEADLINE = 'Try to break it.';
export const STRESS_TEST_SUBHEAD =
  'Move the assumptions. We\u2019ll tell you the second this stops making sense.';
export const BREAK_EVEN_HEADLINE = 'Here\u2019s where it stops making sense.';
export const SENSITIVITY_HEADLINE = 'Before you build, know what could go wrong.';

// ── Empty states (calculator views — unchanged) ─────────────
export const EMPTY_PROJECTS_HEADLINE = 'Your next business case starts here.';
export const EMPTY_PROJECTS_BODY =
  'Save an analysis to build a library of client opportunities.';
export const EMPTY_REPORTS_HEADLINE = 'No business cases yet.';
export const EMPTY_REPORTS_BODY =
  'Run an analysis and create your first client-ready report.';

// ── Error states (unchanged) ────────────────────────────────
export const ERROR_REPORT_TITLE = 'We couldn\u2019t generate the business case.';
export const ERROR_REPORT_BODY = 'Your analysis is safe.';
export const ERROR_GENERIC_TITLE = 'We couldn\u2019t complete that.';
export const ERROR_GENERIC_BODY = 'Nothing is lost. Try again.';

// ── Loading states (unchanged) ──────────────────────────────
export const LOADING_STEPS = [
  'Calculating your opportunity\u2026',
  'Testing conservative assumptions\u2026',
  'Preparing your recommendation\u2026',
] as const;

// ── Methodology / trust ─────────────────────────────────────
export const METHODOLOGY_HEADLINE = 'No black box. Open the math.';
export const METHODOLOGY_BODY =
  'Every number on this page traces back to an input you can see. Estimates are labeled. Assumptions are labeled. Nothing is hidden to make the story better.';
export const TRUST_HEADLINE = 'Built for people who sell automation.';
export const TRUST_BODY =
  'Model the economics behind n8n workflows, Make scenarios, Zapier automations, AI agents and operational workflows.';

// ── Antagonist (internal — used in sales decks, not the homepage) ─
export const ANTAGONIST =
  'Every agency already believes an automation will pay off. Belief doesn\u2019t survive a client asking "how do you know?"';

// ── Solution (legacy — kept for /start LandingView fallback; superseded on / by WHAT_*) ─
export const SOLUTION_HEADLINE = 'Viableo turns automation ideas into decisions.';
export const SOLUTION_SUBHEAD = 'See the return. Break it on purpose. Walk in with the answer.';

// ── Proprietary terminology ────────────────────────────────
export const TERM = {
  analysis: 'Viableo Analysis',
  score: 'Viableo Score',
  scenarios: 'Viableo Scenarios',
  decision: 'Viableo Decision',
  businessCase: 'Viableo Business Case',
  benchmark: 'Viableo Benchmark',
} as const;

// ── Decision vocabulary ─────────────────────────────────────
export const DECISION_LABELS = {
  build: 'BUILD',
  consider: 'CONSIDER',
  dont_build: "DON\u2019T BUILD",
} as const;

export const DECISION_ORDER = ['build', 'consider', 'dont_build'] as const;
export type DecisionKey = (typeof DECISION_ORDER)[number];

// ── Decision color tokens ───────────────────────────────────
// Scoped ONLY to DecisionBadge + verdict surfaces. Three SEMANTICALLY SEPARATE
// color roles — never mix:
//   VERDICT colors: emerald / amber / crimson (BUILD / CONSIDER / DON'T BUILD)
//   UI ACCENT:      indigo/cobalt family (sliders, links, focus rings, active states)
//   BRAND ACCENT:   Viableo coral (#FF164B) — logo + large display type only
//
// Measured contrast ratios (computed against the bg hex below, per mandate §4.4):
//   build    #0D6B3F on #D1F2DF = 5.48 (was claimed 7.2 — corrected)
//   consider #8B5E0A on #FDE9B0 = 4.71 (was claimed 5.8 — corrected)
//   dont_build #9B0A2E on #FDDEE5 = 6.61 (was claimed 7.0 — corrected)
// All pass WCAG AA (≥4.5:1 for normal text). globals.css verdict vars are
// re-pointed to these same hexes so there is exactly ONE verdict palette.
export const DECISION_COLORS = {
  build: {
    text: '#0D6B3F',
    bg: '#D1F2DF',
    border: '#0D6B3F',
    label: 'BUILD',
  },
  consider: {
    text: '#8B5E0A',
    bg: '#FDE9B0',
    border: '#8B5E0A',
    label: 'CONSIDER',
  },
  dont_build: {
    text: '#9B0A2E',
    bg: '#FDDEE5',
    border: '#9B0A2E',
    label: "DON\u2019T BUILD",
  },
} as const;

// Dark-surface verdict tints (mandate §4.4 — new, measured on #1A181B):
//   build #34D399 = 9.18 · consider #FBBF24 = 10.57 · dont_build #F87171 = 6.38
export const DECISION_COLORS_DARK = {
  build: '#34D399',
  consider: '#FBBF24',
  dont_build: '#F87171',
} as const;

// ── UI accent colors (indigo/cobalt family) ─────────────────
// NEVER used for verdicts. NEVER used for brand/marketing.
// On light surfaces use `primary` #4338CA (7.57 on canvas). `muted` #818CF8
// (2.86 on canvas, 5.91 on #1A181B) is light-surface FORBIDDEN; dark-surface ONLY.
export const UI_ACCENT = {
  primary: '#4338CA',
  muted: '#818CF8',
  bg: '#EEF2FF',
  deep: '#1E1B4B',
  border: '#C7D2FE',
} as const;

// ── Deep analytical surface tokens ──────────────────────────
// textMuted corrected from #A8A0B8 to #9B96A5 (6.13 on #1A181B per mandate §4.4).
export const ANALYTICAL_SURFACE = {
  bg: '#1A181B',
  raised: '#252328',
  border: '#353034',
  text: '#F5F3FF',
  textMuted: '#9B96A5',
  textFaint: '#6B6577',
} as const;

// ── Confidence re-exports (Section 11) ──────────────────────
export {
  CONFIDENCE_WEIGHTS,
  STATUS_MULTIPLIERS,
  type InputStatus,
  type InputConfidence,
} from './calculations/confidence';

// ── Product demonstration steps (legacy) ────────────────────
export const PRODUCT_STEPS = [
  { stage: 1, label: 'Viableo Decision', icon: 'decision' as const },
  { stage: 2, label: 'Business Case', icon: 'report' as const },
  { stage: 3, label: 'Proposal', icon: 'report' as const },
  { stage: 4, label: 'Approved', icon: 'decision' as const },
] as const;

// ── Agency workflow (Section 7.8 — used by E9 Stepper) ──────
export const AGENCY_WORKFLOW = ['Discover', 'Prove', 'Propose', 'Close'] as const;

// ── Trust positioning (§14 — NO fake endorsements) ─────────
// These describe WHO the product is built for, not logos we can show.
// TrustBar on the old LandingView used this; the new homepage E1 does NOT
// render a TrustBar (no customers to cite — mandate §3.8 / §L).
export const TRUST_POSITIONING = [
  'n8n workflows',
  'Make scenarios',
  'Zapier automations',
  'AI agents',
  'Operational workflows',
] as const;

// ── Navigation labels ────────────────────────────────────────
// Trimmed per mandate P1-10: calculator/projects/reports/settings were stale
// labels for an app shell the marketing site cannot reach. The app lives at
// /start now; "Calculator" nav points there.
export const NAV_LABELS = {
  home: 'Home',
  pricing: 'Pricing',
  methodology: 'Methodology',
  automationRoi: 'Automation ROI',
  solutions: 'Solutions',
  resources: 'Resources',
} as const;

// ===========================================================================
// Founder Control Plane — canonical commercial model + capability labels
// Appended for the admin display layer. Per the founder dashboard spec:
// do NOT reintroduce legacy $29/$39/$79/$790 pricing in the admin surface.
// CUSTOM covers agency + agency_pro (custom pricing, verified manually).
// ===========================================================================
import type { Tier, Capability } from '@/lib/entitlement'
export type { Tier, Capability }
// Re-export so pages importing from '@/lib/brand' resolve correctly.
export { TIER_LABEL } from '@/lib/entitlement'

export type CanonicalPlan = 'FREE' | 'PRO' | 'CUSTOM'

export const TIER_TO_CANONICAL: Record<Tier, CanonicalPlan> = {
  free: 'FREE',
  pro: 'PRO',
  agency: 'CUSTOM',
  agency_pro: 'CUSTOM',
}

export const CANONICAL_PLAN_PRICE: Record<CanonicalPlan, string> = {
  FREE: '$0',
  PRO: '$49/mo',
  CUSTOM: 'Custom',
}

export const CAPABILITY_LABEL: Record<Capability, string> = {
  calculate: 'Calculate ROI',
  stress_test: 'Stress test',
  scenario_analysis: 'Scenario analysis',
  confidence_scoring: 'Confidence scoring',
  save_project: 'Save projects',
  client_report: 'Client report',
  proposal: 'Proposal PDF',
  share_links: 'Share links',
  share_approval: 'Share approval',
  agency_branding: 'Agency branding',
  client_history: 'Client history',
  multi_seat: 'Multi-seat',
  api_access: 'API access',
}

/**
 * Zod validation schemas, shared between client form validation and the
 * /api/calculate route (Section 4). Empty strings are normalized to undefined
 * so optional numeric fields validate cleanly on both client and server.
 */
import { z } from 'zod';

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

/** Required numeric field. Empty / null => required error (never silently 0). */
function reqNumber(min: number, max: number, label: string, opts?: { int?: boolean }) {
  return z
    .preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : v),
      z
        .coerce.number({ message: `${label} is required.` })
        .refine((v) => v !== undefined && !Number.isNaN(v), {
          message: `${label} is required.`,
        })
        .refine((v) => !(opts?.int && !Number.isInteger(v)), {
          message: `${label} must be a whole number.`,
        })
        .min(min, { message: `${label} must be at least ${min.toLocaleString()}.` })
        .max(max, { message: `${label} must not exceed ${max.toLocaleString()}.` })
    );
}

/** Required currency field ($-prefixed in the UI). */
function reqCurrency(min: number, max: number, label: string) {
  const n = reqNumber(min, max, label);
  return n.transform((v) => v as number);
}

/** Optional numeric field. Empty => undefined (omitted). */
function optNumber(min: number, max: number, label: string) {
  return z
    .preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : v),
      z
        .coerce.number({ message: `${label} must be a number.` })
        .refine((v) => v === undefined || !Number.isNaN(v), {
          message: `${label} must be a number.`,
        })
        .min(min, { message: `${label} must be at least ${min}.` })
        .max(max, { message: `${label} must not exceed ${max}.` })
        .optional()
    );
}

export const calculatorInputsSchema = z.object({
  // Step 1 — Business
  clientName: z
    .string()
    .trim()
    .min(1, { message: 'Client / company name is required.' })
    .max(120, { message: 'Client name must be 120 characters or fewer.' }),
  employeesAffected: reqNumber(1, 500, 'Employees affected', { int: true }),
  hoursPerWeek: reqNumber(0.5, 80, 'Hours per week'),
  hourlyCost: reqCurrency(1, 500, 'Hourly labor cost'),
  monthlyWorkload: optNumber(0, 1_000_000, 'Monthly workload'),
  currentErrorRate: optNumber(0, 1, 'Current error rate'),

  // Step 2 — Revenue
  leadsPerMonth: reqNumber(0, 1_000_000, 'Leads per month'),
  currentConversionRate: optNumber(0, 1, 'Current conversion rate'),
  averageCustomerValue: reqCurrency(1, 10_000_000, 'Average customer value'),
  grossMarginPct: optNumber(0, 1, 'Gross margin %'),

  // Step 3 — Proposed Automation
  expectedAutomationPct: reqNumber(0.01, 1, 'Expected automation %'),
  expectedErrorReductionPct: optNumber(0, 1, 'Expected error reduction %'),
  expectedConversionImprovementPct: reqNumber(0, 0.5, 'Expected conversion improvement'),
  implementationFee: reqCurrency(0, 1_000_000, 'Implementation fee'),
  monthlyAiApiCost: reqCurrency(0, 100_000, 'Monthly AI/API cost'),
  monthlySoftwareCost: reqCurrency(0, 100_000, 'Monthly software/tool cost'),
  platformApiCost: reqCurrency(0, 100_000, 'Ongoing platform/API cost'),
  otherAnnualCost: reqCurrency(0, 1_000_000, 'Other annual cost'),
});

export type CalculatorInputsSchema = z.infer<typeof calculatorInputsSchema>;

export const organizationSchema = z.object({
  name: z.string().trim().min(1, { message: 'Agency name is required.' }).max(120),
  website: z
    .string()
    .trim()
    .max(200)
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/i.test(v), {
      message: 'Website must be a valid URL (include https://).',
    }),
  contactEmail: z
    .string()
    .trim()
    .max(120)
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: 'Contact email must be a valid email address.',
    }),
  phone: z.string().trim().max(40).optional(),
  logoUrl: z
    .string()
    .max(3_500_000, { message: 'Logo file is too large (max 2MB).' })
    .optional()
    .refine(
      (v) =>
        !v ||
        /^https?:\/\/.+/i.test(v) ||
        /^data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,/i.test(v),
      { message: 'Logo must be an image URL or uploaded file.' }
    ),
  brandColorHex: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || HEX_COLOR_RE.test(v), {
      message: 'Brand color must be a valid #RRGGBB hex.',
    }),
});

export type OrganizationSchema = z.infer<typeof organizationSchema>;

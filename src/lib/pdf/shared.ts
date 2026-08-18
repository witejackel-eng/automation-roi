/**
 * Shared PDF primitives + formatting for the deterministic @react-pdf/renderer
 * pipeline (Section 4). No LLM in the loop. Same numbers as the live UI.
 *
 * NOTE: @react-pdf/renderer does NOT understand Tailwind or CSS variables —
 * styles are plain objects. We rebuild the Viableo Section-5.1 token palette
 * here so the PDF's Viableo Coral (#FF164B) matches --color-brand and the
 * decision colors stay scoped. If the agency sets a brand color (Section 16),
 * brandColorHex replaces the coral ONLY in the PDF, never in the live app UI.
 * The report is titled "Viableo Business Case" per Section 1/6.
 */
import type { Style, Styles } from '@react-pdf/renderer';
import type { Tier } from '@/lib/entitlement';

export interface Branding {
  name: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  logoUrl?: string; // data: URL or https URL
  brandColorHex?: string; // #RRGGBB; falls back to ledger blue if invalid/unset
}

export interface TierContext {
  tier: Tier;
  /** Whether agency branding is allowed for the current tier (agency+). */
  canBrand: boolean;
}

// Viableo palette (Section 5.1). Coral brand, charcoal ink, decision colors
// scoped to the verdict stamp only.
export const PDF_COLORS = {
  canvas: '#FFFFFF',
  surface: '#F7F6F7',          // --off-white
  surfaceRaised: '#FFFFFF',
  border: '#E9E7E8',          // --light-gray
  borderStrong: '#C9C6CA',
  ink: '#171516',              // --charcoal
  inkMuted: '#727076',         // --mid-gray
  inkFaint: '#A8A5AA',
  brand: '#FF164B',            // --viableo-coral
  brandSubtle: '#FFF1F4',      // ~12% coral tint
  crimson: '#B70F38',          // --deep-crimson (hover/gradient)
  build: '#1F8A5A',            // muted emerald
  buildBg: '#E7F4ED',
  consider: '#C98A1B',         // muted amber
  considerBg: '#FBF1E0',
  dontBuild: '#B70F38',        // reuses deep crimson
  dontBuildBg: '#FBE9EE',
};

export function brandColor(branding?: Branding | null): string {
  if (branding?.brandColorHex && /^#[0-9A-Fa-f]{6}$/.test(branding.brandColorHex)) {
    return branding.brandColorHex;
  }
  return PDF_COLORS.brand;
}

/** Font families for the PDF. @react-pdf/renderer's built-in base-14 fonts
 * (Helvetica, Courier) are used so the renderer never depends on external font
 * files or fontkit subsetting quirks. The live web app uses Inter / IBM Plex
 * via next/font; the PDF uses these PDF-native equivalents which are visually
 * close enough for a financial document and embed with zero risk. */
export const PDF_MONO = 'Courier';
export const PDF_SANS = 'Helvetica';
export const PDF_DISPLAY = 'Helvetica';

// @react-pdf/renderer registers fonts lazily; rely on the document's
// `registerFont` calls in the document files.

export function pdfCurrency(n: number | null | undefined, opts: { compact?: boolean } = {}): string {
  if (n == null || !Number.isFinite(n)) return '—';
  if (opts.compact && Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${m.toFixed(m >= 10 ? 1 : 2).replace(/\.0+$/, '')}M`;
  }
  const underTen = Math.abs(n) < 10;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: underTen ? 2 : 0,
    maximumFractionDigits: underTen ? 2 : 0,
  }).format(n);
}

export function pdfPercent(n: number | null | undefined, decimals = 0): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${n.toFixed(decimals)}%`;
}

export function pdfRatioAsPercent(n: number | null | undefined, decimals = 0): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(decimals)}%`;
}

export function pdfPp(n: number | null | undefined, decimals = 1): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(decimals)}pp`;
}

export function pdfPayback(months: number | null | undefined): string {
  if (months == null || !Number.isFinite(months)) return 'Never';
  if (months === 0) return 'Immediate';
  return `${months.toFixed(months >= 10 ? 0 : 1)} months`;
}

export function pdfRoi(roiPct: number | null | undefined): string {
  if (roiPct == null || !Number.isFinite(roiPct)) return 'N/A';
  return `${Math.round(roiPct)}%`;
}

export function pdfCount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function verdictWord(v: 'build' | 'consider' | 'dont_build'): string {
  // Per Section 2: closed vocabulary, always uppercase, in this order.
  return v === 'build' ? 'BUILD' : v === 'consider' ? 'CONSIDER' : "DON\u2019T BUILD";
}

export function verdictColor(v: 'build' | 'consider' | 'dont_build'): string {
  return v === 'build'
    ? PDF_COLORS.build
    : v === 'consider'
      ? PDF_COLORS.consider
      : PDF_COLORS.dontBuild;
}

export function verdictBg(v: 'build' | 'consider' | 'dont_build'): string {
  return v === 'build'
    ? PDF_COLORS.buildBg
    : v === 'consider'
      ? PDF_COLORS.considerBg
      : PDF_COLORS.dontBuildBg;
}

// Reusable style fragments.
export const PDF_STYLES: Styles = {
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingHorizontal: 54,
    fontFamily: PDF_SANS,
    fontSize: 10.5,
    color: PDF_COLORS.ink,
    backgroundColor: PDF_COLORS.canvas,
  } as Style,
  pageNumber: {
    position: 'absolute',
    bottom: 28,
    left: 54,
    right: 54,
    fontSize: 8,
    color: PDF_COLORS.inkFaint,
    fontFamily: PDF_SANS,
    textAlign: 'center',
    borderTopWidth: 0.5,
    borderTopColor: PDF_COLORS.border,
    paddingTop: 6,
  } as Style,
  brandRule: {
    height: 4,
    width: '100%',
    marginBottom: 18,
  } as Style,
  heading: {
    fontFamily: PDF_DISPLAY,
    fontWeight: 700,
    fontSize: 22,
    color: PDF_COLORS.ink,
    marginBottom: 6,
  } as Style,
  subheading: {
    fontFamily: PDF_DISPLAY,
    fontWeight: 600,
    fontSize: 13,
    color: PDF_COLORS.ink,
    marginBottom: 6,
  } as Style,
  exhibitTitle: {
    fontFamily: PDF_DISPLAY,
    fontWeight: 600,
    fontSize: 13,
    color: PDF_COLORS.ink,
    marginBottom: 4,
  } as Style,
  caption: {
    fontFamily: PDF_SANS,
    fontSize: 8.5,
    color: PDF_COLORS.inkMuted,
    marginBottom: 12,
  } as Style,
  body: {
    fontFamily: PDF_SANS,
    fontSize: 10.5,
    color: PDF_COLORS.ink,
    lineHeight: 1.55,
  } as Style,
  label: {
    fontFamily: PDF_SANS,
    fontSize: 8.5,
    color: PDF_COLORS.inkMuted,
    marginBottom: 2,
  } as Style,
  mono: {
    fontFamily: PDF_MONO,
    fontSize: 10.5,
    color: PDF_COLORS.ink,
  } as Style,
  tableHeader: {
    fontFamily: PDF_SANS,
    fontSize: 8.5,
    color: PDF_COLORS.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as Style,
  tableCell: {
    fontFamily: PDF_SANS,
    fontSize: 10,
    color: PDF_COLORS.ink,
    paddingTop: 4,
    paddingBottom: 4,
  } as Style,
  tableCellMono: {
    fontFamily: PDF_MONO,
    fontSize: 10,
    color: PDF_COLORS.ink,
    paddingTop: 4,
    paddingBottom: 4,
    textAlign: 'right',
  } as Style,
  divider: {
    height: 0.5,
    width: '100%',
    backgroundColor: PDF_COLORS.border,
    marginVertical: 8,
  } as Style,
  bullet: {
    fontFamily: PDF_SANS,
    fontSize: 10.5,
    color: PDF_COLORS.ink,
    marginBottom: 4,
    marginLeft: 10,
  } as Style,
  disclaimer: {
    fontFamily: PDF_SANS,
    fontSize: 8.5,
    color: PDF_COLORS.inkMuted,
    marginTop: 14,
    lineHeight: 1.45,
  } as Style,
};

export const PAGE_MARGIN = 54; // 0.75in @ 72dpi

/**
 * Watermark overlay for Starter-tier PDFs.
 *
 * Per the canonical two-tier model:
 *   Starter ($0) → watermarked client PDFs ("for evaluation")
 *   Pro ($49)    → clean, unwatermarked client PDFs
 *
 * The watermark is rendered as a fixed, rotated, semi-transparent text layer
 * on every page of the PDF document. It must NOT obscure the verdict or key
 * numbers — it sits behind the content at low opacity.
 *
 * Used by ClientReport + Proposal when the generating tier is 'free'.
 */
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDF_COLORS, PDF_SANS } from './shared';

export interface WatermarkProps {
  /** Default text shown across the page. */
  label?: string;
}

const styles = StyleSheet.create({
  watermarkWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Center the rotated text block on the page.
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 0,
  },
  watermarkText: {
    fontFamily: PDF_SANS,
    fontSize: 48,
    fontWeight: 'bold',
    color: PDF_COLORS.brand,
    opacity: 0.06,
    transform: 'rotate(-30deg)',
    textAlign: 'center',
    letterSpacing: 2,
  },
  watermarkSub: {
    fontFamily: PDF_SANS,
    fontSize: 14,
    color: PDF_COLORS.brand,
    opacity: 0.08,
    marginTop: 8,
    textAlign: 'center',
  },
});

/**
 * Render the Starter-tier watermark overlay. Place inside a <Page> with
 * `wrap={false}` so it does not repeat per content row.
 */
export function PdfWatermark({ label = 'VIABLEO STARTER' }: WatermarkProps) {
  return (
    <View style={styles.watermarkWrap} fixed>
      <Text style={styles.watermarkText}>{label}</Text>
      <Text style={styles.watermarkSub}>For evaluation — upgrade to Pro for the unwatermarked client document.</Text>
    </View>
  );
}

/**
 * Decide whether a PDF should be watermarked based on the generating tier.
 * Starter (free) → watermark. Pro (and legacy agency*) → no watermark.
 */
export function shouldWatermark(tier: string): boolean {
  return tier === 'free';
}

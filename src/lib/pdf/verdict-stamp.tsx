/**
 * PDF Verdict Stamp — parity with the in-app VerdictStamp (Section 2).
 *
 * Same double-rule border, heavy tracked verdict word, payback + net annual
 * benefit in tabular mono. Built with @react-pdf primitives so it renders
 * identically inside the client report and the proposal.
 */
import { Text, View } from '@react-pdf/renderer';
import type { Branding } from './shared';
import {
  PDF_MONO,
  PDF_DISPLAY,
  PDF_SANS,
  PDF_COLORS,
  pdfCurrency,
  pdfPayback,
  verdictWord,
  verdictColor,
} from './shared';

interface PdfVerdictStampProps {
  recommendation: 'build' | 'consider' | 'dont_build';
  paybackMonths: number | null;
  netAnnualBenefit: number;
  /** Optional brand color override (agency branding — Section 16). */
  brandHex?: string;
  size?: 'lg' | 'md';
}

export function PdfVerdictStamp({
  recommendation,
  paybackMonths,
  netAnnualBenefit,
  size = 'lg',
}: PdfVerdictStampProps) {
  const color = verdictColor(recommendation);
  const padY = size === 'lg' ? 22 : 14;
  const padX = size === 'lg' ? 28 : 18;
  const wordSize = size === 'lg' ? 32 : 20;
  const paybackSize = size === 'lg' ? 22 : 16;
  const netSize = size === 'lg' ? 22 : 14;

  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: color,
        borderRadius: 4,
        paddingVertical: padY,
        paddingHorizontal: padX,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Inner rule — produces the double-rule border look */}
      <View
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          right: 4,
          bottom: 4,
          borderWidth: 0.5,
          borderColor: color,
          borderRadius: 2,
        }}
      />
      <Text
        style={{
          fontFamily: PDF_DISPLAY,
          fontWeight: 700,
          fontSize: wordSize,
          color,
          letterSpacing: 2.4,
        }}
      >
        {verdictWord(recommendation)}
      </Text>
      <View style={{ width: 1, height: size === 'lg' ? 40 : 28, backgroundColor: PDF_COLORS.borderStrong, marginHorizontal: size === 'lg' ? 22 : 14 }} />
      <View style={{ flexDirection: 'column' }}>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 8, color: PDF_COLORS.inkMuted, letterSpacing: 1, marginBottom: 2 }}>PAYBACK</Text>
        <Text style={{ fontFamily: PDF_MONO, fontSize: paybackSize, color: PDF_COLORS.ink }}>
          {pdfPayback(paybackMonths)}
        </Text>
      </View>
      <View style={{ width: 1, height: size === 'lg' ? 40 : 28, backgroundColor: PDF_COLORS.borderStrong, marginHorizontal: size === 'lg' ? 22 : 14 }} />
      <View style={{ flexDirection: 'column' }}>
        <Text style={{ fontFamily: PDF_SANS, fontSize: 8, color: PDF_COLORS.inkMuted, letterSpacing: 1, marginBottom: 2 }}>NET ANNUAL BENEFIT</Text>
        <Text style={{ fontFamily: PDF_MONO, fontSize: netSize, color: PDF_COLORS.ink }}>
          {pdfCurrency(netAnnualBenefit, { compact: true })}
        </Text>
      </View>
    </View>
  );
}

// PDF_SANS is imported from ./shared (Helvetica, the @react-pdf built-in).

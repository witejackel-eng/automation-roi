/**
 * PDF simple-bar chart — a lightweight vertical bar chart built with
 * @react-pdf primitives (recharts cannot render to PDF). Used for both
 * exhibits: the ROI Bridge (waterfall) and the Scenario Comparison.
 *
 * We deliberately do NOT render a true floating waterfall in the PDF — instead
 * each exhibit shows a clean stepped bar chart with value labels, which reads
 * the same way on paper as it does on screen. The numbers above every bar are
 * identical to the live UI.
 */
import { Text, View } from '@react-pdf/renderer';
import type { Branding } from './shared';
import { PDF_COLORS, PDF_MONO, PDF_SANS } from './shared';

export interface PdfBar {
  label: string;
  value: number; // signed; negative bars render below the baseline
  color: string;
  /** Optional sub-label beneath the value (e.g. "1.6 mo payback"). */
  sublabel?: string;
  /** If true, this bar is the "total" anchor and starts from 0. */
  isTotal?: boolean;
}

interface PdfBarChartProps {
  bars: PdfBar[];
  brandHex?: string;
  height?: number;
}

export function PdfBarChart({ bars, height = 140 }: PdfBarChartProps) {
  const maxAbs = Math.max(1, ...bars.map((b) => Math.abs(b.value)));
  const chartHeight = height;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartHeight + 36, marginTop: 8, marginBottom: 8 }}>
      {bars.map((b, i) => {
        const h = Math.max(2, (Math.abs(b.value) / maxAbs) * chartHeight);
        const isNeg = b.value < 0;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', marginHorizontal: 4, height: '100%', justifyContent: 'flex-end' }}>
            {/* value label above */}
            <Text style={{ fontFamily: PDF_MONO, fontSize: 8, color: PDF_COLORS.ink, marginBottom: 2 }}>
              {formatLabel(b.value)}
            </Text>
            {/* bar */}
            <View
              style={{
                width: '70%',
                minHeight: h,
                height: h,
                backgroundColor: b.color,
                borderRadius: 1,
                opacity: b.value === 0 ? 0.25 : 1,
              }}
            />
            {/* baseline */}
            <View style={{ width: '100%', height: 0.5, backgroundColor: PDF_COLORS.border }} />
            {/* label below */}
            <Text style={{ fontFamily: PDF_SANS, fontSize: 7.5, color: PDF_COLORS.inkMuted, marginTop: 3, textAlign: 'center' }}>
              {b.label}
            </Text>
            {b.sublabel ? (
              <Text style={{ fontFamily: PDF_SANS, fontSize: 7, color: PDF_COLORS.inkFaint, textAlign: 'center' }}>
                {b.sublabel}
              </Text>
            ) : null}
            {isNeg ? (
              <Text style={{ fontFamily: PDF_SANS, fontSize: 7, color: PDF_COLORS.dontBuild, textAlign: 'center' }}>
                below baseline
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function formatLabel(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

/**
 * PDF font setup (Section 4).
 *
 * The PDF uses @react-pdf/renderer's built-in base-14 fonts (Helvetica for
 * sans/display, Courier for mono numerals) so the renderer never depends on
 * external font files or fontkit subsetting quirks. The live web app uses
 * Inter / IBM Plex via next/font; the PDF uses these PDF-native equivalents.
 *
 * Idempotent: safe to call before every render.
 */
import { Font } from '@react-pdf/renderer';

let initialized = false;

export function registerFonts(): void {
  if (initialized) return;
  try {
    // Don't auto-hyphenate — financial figures must not break across lines.
    Font.registerHyphenationCallback((word: string) => [word]);
    initialized = true;
  } catch {
    // Best-effort; the renderer has sensible defaults if this fails.
  }
}

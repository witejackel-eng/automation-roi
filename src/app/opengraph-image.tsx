/**
 * Dynamic OpenGraph image (Master Spec §8, §9).
 *
 * Generated at the edge via next/og ImageResponse. Shows the Viableo
 * V/check mark + the tagline "Know what's worth building." on a charcoal
 * tile with the coral accent — the brand signature on every share.
 */
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Viableo — Know what\u2019s worth building.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#171516',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top rule — the brand signature thin coral line */}
        <div style={{ display: 'flex', height: '4px', width: '120px', background: '#FF164B' }} />

        {/* Center — the V/check mark + wordmark */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* The V/check mark — simplified for the OG canvas */}
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <path
                d="M8 12 L30 56 L44 24"
                stroke="#FF164B"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M30 56 L52 20"
                stroke="#F7F6F7"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="30" cy="56" r="5" fill="#FF164B" />
            </svg>
            <div style={{ display: 'flex', fontSize: '44px', fontWeight: 700, color: '#F7F6F7', letterSpacing: '-0.02em' }}>
              Viableo
            </div>
          </div>
        </div>

        {/* Bottom — the tagline (the one sentence) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '64px',
              fontWeight: 800,
              color: '#F7F6F7',
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
            }}
          >
            Know what{"\u2019"}s worth building.
          </div>
          <div style={{ display: 'flex', fontSize: '24px', color: '#727076', fontWeight: 400 }}>
            Automation Investment Intelligence
          </div>
        </div>
      </div>
    ),
    size,
  );
}

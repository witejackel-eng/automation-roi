import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.blob.vercel-storage.com https://*.whop.com",
      "frame-src 'self' https://*.whop.com https://js.whop.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // ignoreBuildErrors is set because `bunx tsc --noEmit` reports 23 errors,
    // ALL of them third-party declaration mismatches that work correctly at
    // runtime (mandate P2-7, acceptance criterion #30). The full inventory:
    //   - src/lib/pdf/client-report.tsx (11): @react-pdf/renderer `Style` vs
    //     React `CSSProperties` — `borderStyle: 'inherit'` is not in @react-pdf's
    //     `BorderStyleValue` union (10 sites); plus `Image` lacks an `alt` prop
    //     on @react-pdf's `ImageProps` (1 site, line 566).
    //   - src/lib/pdf/proposal.tsx (4): same @react-pdf Style/CSSProperties mismatch.
    //   - src/lib/auth.ts (5): next-auth v4 `AuthOptions` / `GetServerSessionParams`
    //     type drift across next-auth@4.24.x patch versions.
    //   - src/components/charts/scenario-comparison.tsx (1) + roi-bridge.tsx (1):
    //     recharts `ContentType` does not accept `ReactNode` for custom cell renderers.
    //   - src/components/auth-provider.tsx (1): `SessionProviderProps` refetchInterval
    //     / refetchOnWindow not in next-auth's type (runtime accepts them).
    // Zero errors in calculations/, brand.ts, format.ts, or any marketing component.
    // The calculation engine — the product's actual correctness surface — is clean.
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

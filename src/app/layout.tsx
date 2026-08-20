import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { MotionProvider } from "@/components/motion-provider";
import {
  COMPANY_NAME,
  PRODUCT_NAME,
  BRAND_TAGLINE,
} from "@/lib/brand";
import { siteUrl } from "@/lib/site-url";

const SITE_URL = siteUrl();

// Inter is the primary body family (Section 5.2).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// IBM Plex Sans for display headings — strong, geometric character.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// IBM Plex Mono for tabular numerals on all financial figures.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${COMPANY_NAME} — ${PRODUCT_NAME} | Know what\u2019s worth building.`,
    template: `%s | ${COMPANY_NAME}`,
  },
  description:
    "Viableo takes an automation scope and returns a verdict — build it or don’t — the fee where that verdict flips, and a document your client can check line by line.",
  keywords: [
    "Viableo",
    "Automation ROI",
    "AI automation ROI",
    "automation calculator",
    "business case",
    "n8n ROI",
    "Make automation",
    "Zapier ROI",
    "AI implementation",
    "automation payback",
  ],
  authors: [{ name: COMPANY_NAME }],
  creator: COMPANY_NAME,
  publisher: COMPANY_NAME,
  applicationName: `${COMPANY_NAME} — ${PRODUCT_NAME}`,
  category: "Business Software",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: `${COMPANY_NAME} — ${PRODUCT_NAME}`,
    title: `${COMPANY_NAME} — Know what\u2019s worth building.`,
    description:
      "Viableo takes an automation scope and returns a verdict — build it or don’t — the fee where that verdict flips, and a document your client can check line by line.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${COMPANY_NAME} — ${BRAND_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY_NAME} — Know what\u2019s worth building.`,
    description:
      "Turn an automation idea into a number your client will actually sign.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

/**
 * JSON-LD structured data (Master Spec §9).
 * Organization + WebSite + SoftwareApplication.
 * Only factual attributes — no invented ratings/reviews/awards (§13).
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: COMPANY_NAME,
      url: SITE_URL,
      description:
        "Viableo turns automation ideas into decisions. Model the economics, stress-test the assumptions, generate a client-ready business case.",
      slogan: BRAND_TAGLINE,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: `${COMPANY_NAME} — ${PRODUCT_NAME}`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: PRODUCT_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
        { "@type": "Offer", price: "29", priceCurrency: "USD", name: "Pro", description: "per month" },
        { "@type": "Offer", price: "79", priceCurrency: "USD", name: "Agency", description: "per month" },
        { "@type": "Offer", price: "790", priceCurrency: "USD", name: "Agency Pro", description: "per year" },
      ],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${plexSans.variable} ${plexMono.variable} antialiased bg-canvas text-ink overflow-x-hidden`}
      >
        {/* Accessibility: first focusable element is a skip link (WCAG 2.4.1). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-canvas focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand"
        >
          Skip to content
        </a>
        <AuthProvider>
          <MotionProvider>{children}</MotionProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

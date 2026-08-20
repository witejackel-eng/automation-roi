import Link from "next/link";
import { Logo } from "@/components/viableo";
import {
  COMPANY_NAME,
  BRAND_TAGLINE,
  DATA_HANDLING_LINE,
} from "@/lib/brand";

/**
 * Skydda-transplanted Footer.
 * Structure ported from Skydda `footer.tsx`: zinc-900 bg, border-t, compact
 * single-row layout (logo left · links right). Expanded to carry Automation
 * ROI's real route set (Product / Solutions / Resources / Company / Legal)
 * while preserving the Skydda minimal aesthetic.
 */

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/start?start=1", label: "Run a case" },
      { href: "/pricing", label: "Pricing" },
      { href: "/start?start=1&example=apex", label: "See an example" },
      { href: "/methodology", label: "Methodology" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/solutions/automation-agencies", label: "Automation agencies" },
      { href: "/solutions/n8n-agencies", label: "n8n agencies" },
      { href: "/solutions/make-agencies", label: "Make agencies" },
      { href: "/solutions/zapier-agencies", label: "Zapier agencies" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources/automation-roi", label: "Automation ROI" },
      { href: "/resources/automation-payback", label: "Automation payback" },
      { href: "/resources/automation-cost", label: "Automation cost" },
      { href: "/resources/automation-business-case", label: "Business case" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SkyddaFooter() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-6">
          {/* Brand column */}
          <div className="col-span-2">
            <Logo variant="reverse" />
            <p className="mt-5 max-w-[260px] text-sm leading-relaxed text-zinc-400">
              {BRAND_TAGLINE}
            </p>
            <p className="mt-3 max-w-[260px] text-xs leading-relaxed text-zinc-400">
              {DATA_HANDLING_LINE}
            </p>
          </div>
          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-400 transition-colors hover:text-zinc-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Bottom: copyright + disclaimer */}
        <div className="flex flex-col gap-3 border-t border-zinc-200 py-6 text-xs text-zinc-400 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span>{COMPANY_NAME}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-zinc-600" />
            <span>{new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span>Figures are estimates, not financial advice.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

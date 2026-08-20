import Link from "next/link";

/**
 * ComputeFooter — the ONE shared footer.
 *
 * Ported from the COMPUTE template `components/landing/footer-section.tsx`:
 * black bg, brand column + grouped link columns, bottom bar with status
 * microcopy. Every link points to a real Automation ROI route.
 */
const FOOTER_LINKS: Record<string, { name: string; href: string; badge?: string }[]> = {
  Product: [
    { name: "Run a case", href: "/start?start=1" },
    { name: "See an example", href: "/start?start=1&example=apex" },
    { name: "Pricing", href: "/pricing" },
    { name: "Methodology", href: "/methodology" },
  ],
  Solutions: [
    { name: "Automation agencies", href: "/solutions/automation-agencies" },
    { name: "n8n agencies", href: "/solutions/n8n-agencies" },
    { name: "Make agencies", href: "/solutions/make-agencies" },
    { name: "Zapier agencies", href: "/solutions/zapier-agencies" },
  ],
  Resources: [
    { name: "Automation ROI", href: "/resources/automation-roi" },
    { name: "Automation payback", href: "/resources/automation-payback" },
    { name: "Automation cost", href: "/resources/automation-cost" },
    { name: "Business case", href: "/resources/automation-business-case" },
  ],
  Legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
};

export function ComputeFooter() {
  return (
    <footer className="relative bg-black">
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-6 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <Link href="/" className="mb-6 inline-flex items-center gap-2">
                <span className="font-display text-2xl text-ink">Viableo</span>
                <span className="font-mono text-xs text-ink-muted">TM</span>
              </Link>
              <p className="mb-8 max-w-xs text-sm leading-relaxed text-ink-muted">
                Know what&apos;s worth building. Viableo takes an automation scope
                and returns a verdict — build it or don&apos;t — the fee where that
                verdict flips, and a document your client can check line by line.
              </p>
            </div>
            {/* Link Columns */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-6 text-sm font-medium text-ink">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
                      >
                        {link.name}
                        {link.badge ? (
                          <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-canvas">
                            {link.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-ink/10 py-8 md:flex-row">
          <p className="text-sm text-ink-faint">
            &copy; {new Date().getFullYear()} Viableo. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-ink-faint">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#34D399]" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

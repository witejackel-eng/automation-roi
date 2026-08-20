/**
 * Skydda-transplanted Trust / Logo strip.
 *
 * Automation ROI MUST NOT fabricate customer logos. Instead this adapts the
 * Skydda logo-section structure into a methodology/trust strip using only
 * real, repository-supported claims. Same visual layout (centered heading
 * + grid of items, zinc-900 surface, border-b).
 */
const TRUST_SIGNALS = [
  "Built for automation agencies",
  "Deterministic calculation",
  "Published methodology",
  "Stress-tested scenarios",
  "Client-ready business cases",
  "Transparent assumptions",
] as const;

export function SkyddaLogoSection() {
  return (
    <section className="relative w-full border-b border-zinc-200 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <h2 className="mb-12 text-center text-4xl font-normal tracking-tight text-zinc-900 md:text-5xl">
          Built for serious automation work
        </h2>

        <div className="grid grid-cols-2 gap-px overflow-hidden border border-zinc-200 bg-zinc-200 md:grid-cols-3 lg:grid-cols-6">
          {TRUST_SIGNALS.map((signal) => (
            <div
              key={signal}
              className="flex items-center justify-center bg-white px-4 py-6 text-center"
            >
              <span className="text-sm font-medium tracking-wide text-zinc-400">
                {signal}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

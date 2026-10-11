import { business } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Business() {
  return (
    <section id="business" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading eyebrow="Business" title={business.title} description={business.intro} />
      </Reveal>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Reveal>
          <div className="flex flex-wrap gap-2">
            {business.points.map((point) => (
              <span key={point} className="rounded-full border border-border bg-surface px-4 py-2 text-sm">
                {point}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-muted">{business.brand.text}</p>
        </Reveal>
        <Reveal delay={80}>
          <div className="rounded-3xl border border-border bg-linear-to-br from-accent/15 via-transparent to-accent-2/15 p-8">
            <p className="text-[11px] tracking-[0.22em] text-muted uppercase">Differentiator</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{business.differentiator}</p>
            <p className="mt-3 text-sm text-muted">
              Brand: {business.brand.name}. Practical commercial context alongside product engineering — without invented metrics.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

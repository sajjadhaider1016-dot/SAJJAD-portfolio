import { testimonials } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading
          eyebrow="Testimonials"
          title="Recommendations, when they exist."
          description="These slots stay empty until real clients, founders, or collaborators write them. No invented quotes."
        />
      </Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {testimonials.map((item, i) => (
          <Reveal key={item.role} delay={i * 60}>
            <article className="flex h-full min-h-[180px] flex-col justify-between rounded-3xl border border-dashed border-border bg-surface p-6">
              <p className="text-sm leading-6 text-muted">{item.note}</p>
              <p className="mt-6 text-xs tracking-[0.16em] text-accent uppercase">{item.role}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

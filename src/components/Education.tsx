import { education } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Education() {
  return (
    <section id="education" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Education"
          title="Academic path."
          description="A focused AI degree, built on a strong pre-university academic record."
        />
      </Reveal>
      <div className="education-timeline relative mt-12 space-y-4 border-l border-border pl-6">
        {education.map((item, i) => (
          <Reveal key={item.program} delay={i * 80}>
            <article className="education-entry relative py-1">
              <span className="absolute -left-[29px] mt-2 h-3 w-3 rounded-full border border-accent bg-bg" />
              <div className="education-entry-content">
                <p className="text-[11px] tracking-[0.18em] text-accent uppercase">{item.status}</p>
                <h3 className="mt-2 font-display text-xl font-semibold">{item.program}</h3>
                <p className="mt-1 text-sm text-muted">{item.school}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{item.detail}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

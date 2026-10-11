import { exploring } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Exploring() {
  return (
    <section id="exploring" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Currently Exploring"
          title="Where the next layer of the stack is going."
        />
      </Reveal>
      <div className="mt-10 flex flex-wrap gap-3">
        {exploring.map((item, i) => (
          <Reveal key={item} delay={i * 40}>
            <span className="inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm text-text">
              {item}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

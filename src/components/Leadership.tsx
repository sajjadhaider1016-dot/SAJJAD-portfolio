import { HandHeart, Sparkles, Users } from "lucide-react";
import { leadership } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const icons = [HandHeart, Users, Sparkles];

export function Leadership() {
  return (
    <section id="leadership" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Leadership & Community"
          title="Work that goes beyond the editor."
        />
      </Reveal>
      <div className="leadership-list mt-12 grid gap-x-12 md:grid-cols-3">
        {leadership.map((item, i) => {
          const Icon = icons[i] ?? Sparkles;
          return (
            <Reveal key={item.title} delay={i * 70}>
              <article className="leadership-row h-full border-t border-border py-6">
                <div className="flex items-center justify-end"><Icon className="h-4 w-4 text-accent" /></div>
                <h3 className="mt-7 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

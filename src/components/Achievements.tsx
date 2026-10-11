import { Award, GraduationCap, HeartHandshake, Laptop, Medal, Trophy } from "lucide-react";
import { achievements } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const icons = [Laptop, Medal, GraduationCap, Award, Trophy, HeartHandshake];

export function Achievements() {
  return (
    <section id="achievements" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Achievements"
          title="Recognition, discipline, and community."
        />
      </Reveal>
      <div className="achievement-list mt-12 grid grid-cols-1 gap-x-12 sm:grid-cols-2">
        {achievements.map((item, i) => {
          const Icon = icons[i] ?? Award;
          return (
            <Reveal key={item.title} delay={i * 50}>
              <article className="achievement-row group flex gap-4 border-b border-border py-6 sm:py-7">
                <Icon className="mt-1 h-4 w-4 shrink-0 text-accent transition-transform duration-300 group-hover:rotate-[-8deg]" />
                <div><h3 className="font-display text-base font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p></div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

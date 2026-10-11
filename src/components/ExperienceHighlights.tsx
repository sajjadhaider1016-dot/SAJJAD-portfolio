import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, Sparkles } from "lucide-react";
import { experiences } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

type ExperienceHighlightsProps = { detailed?: boolean };

export function ExperienceHighlights({ detailed = false }: ExperienceHighlightsProps) {
  return (
    <section id="experience" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Experience"
            title={detailed ? "The work behind the projects." : "Experience, with the work behind it."}
            description="A mix of hands-on product building, entrepreneurship, and applied AI learning."
          />
          {!detailed && (
            <Link href="/portfolio/experience" className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium transition hover:border-accent/30 hover:text-accent">
              Full experience <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </Reveal>

      <div className="experience-timeline relative mt-12">
        {experiences.map((item, i) => (
          <Reveal key={`${item.organization}-${item.role}`} delay={i * 110}>
            <article className="experience-card group relative grid gap-4 border-b border-border py-7 sm:grid-cols-[minmax(10rem,.34fr)_1fr] sm:gap-10 sm:py-10">
              <div className="experience-date flex items-start gap-3 sm:pt-2">
                <span className="experience-marker mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent ring-4 ring-accent/10 transition-transform duration-500 group-hover:scale-125" />
                <div>
                  <p className="font-mono text-xs font-medium tracking-wide text-accent">{item.period}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted"><span className="experience-status-dot h-1.5 w-1.5 rounded-full bg-accent" />{item.status}</span>
                </div>
              </div>
              <div className="min-w-0">
                <div className="experience-role-icon mb-3 grid h-9 w-9 place-items-center text-accent transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
                {i === 0 ? <Sparkles className="h-5 w-5" /> : <BriefcaseBusiness className="h-5 w-5" />}
              </div>
                <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{item.role}</h3>
                <p className="mt-1 text-sm font-medium text-muted">{item.organization}</p>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base sm:leading-8">{item.detail}</p>
                <ul className={`mt-4 grid gap-2 ${detailed ? "sm:grid-cols-2" : ""}`}>
                  {(detailed ? item.highlights : item.highlights.slice(0, 2)).map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 text-sm leading-6 text-text/85"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />{highlight}</li>
                  ))}
                </ul>
                {detailed && <div className="mt-5 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-full border border-border bg-bg/70 px-3 py-1.5 text-xs font-medium text-muted">{tag}</span>)}</div>}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

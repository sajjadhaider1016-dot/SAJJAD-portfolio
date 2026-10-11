import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { services } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Services() {
  return (
    <section id="services" className="services-section mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <Reveal>
        <SectionHeading
          eyebrow="Services"
          title="What I can build with you."
          description="From full-stack applications to AI systems and reliable backend architecture."
        />
      </Reveal>
      <div className="service-list mt-12 border-t border-border">
        {services.map((service, i) => (
          <Reveal key={service.title} delay={i * 45}>
            <article className="service-row group grid gap-3 border-b border-border py-6 sm:grid-cols-[.9fr_1.1fr_auto] sm:items-center sm:gap-8 sm:py-8">
              <h3 className="font-display text-xl font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-1 sm:text-2xl">{service.title}</h3>
              <p className="max-w-xl text-sm leading-7 text-muted sm:text-[.95rem]">{service.description}</p>
              <Link href="/portfolio/contact" aria-label={`Discuss ${service.title}`} className="service-action inline-flex w-fit items-center gap-2 border-b border-border pb-1 text-xs font-semibold transition-colors duration-300 group-hover:border-accent group-hover:text-accent sm:justify-self-end"><span>Discuss a project</span><ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { whatIBuild } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function WhatIBuild() {
  return (
    <section id="what-i-build" className="what-build-section mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <Reveal>
        <div className="grid gap-8 border-b border-border pb-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
          <SectionHeading eyebrow="What I Build" title="A few recurring ideas." />
          <p className="max-w-xl text-sm leading-7 text-muted lg:justify-self-end">Product types that connect software, intelligent systems, and the everyday work people need to get done.</p>
        </div>
      </Reveal>
      <div className="what-build-list grid grid-cols-1 gap-x-10 sm:grid-cols-2">
        {whatIBuild.map((item, i) => (
          <Reveal key={item} delay={i * 45}>
            <div className="what-build-item group flex items-center justify-between border-b border-border py-5 sm:py-7">
              <h3 className="font-display text-xl font-medium tracking-tight sm:text-2xl">{item}</h3>
              <Link href="/portfolio/projects" aria-label={`Explore projects related to ${item}`} className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-[#10110f]"><ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

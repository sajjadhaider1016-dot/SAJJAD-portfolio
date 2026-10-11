import { about } from "@/data/content";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function About({ showMoreLink = true }: { showMoreLink?: boolean }) {
  return (
    <section id="about" className="about-section mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="about-editorial mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div className="about-editorial-heading">
          <Reveal><p className="section-kicker">{about.eyebrow}</p></Reveal>
          <Reveal><h2 className="about-title font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">Intelligent products.<br /><span className="text-accent">Practical engineering.</span></h2></Reveal>
        </div>
        <div className="about-editorial-copy lg:pt-12">
          <div className="max-w-2xl space-y-4">
            {about.body.map((paragraph, i) => (
              <Reveal key={paragraph} delay={i * 90}><p className="text-base leading-7 text-muted sm:text-lg sm:leading-8">{paragraph}</p></Reveal>
            ))}
          </div>
          {showMoreLink && <Reveal delay={240}>
            <Link href="/portfolio/about" className="about-link group mt-8 inline-flex items-center gap-3 border-b border-accent/35 pb-2 text-sm font-semibold">More about me <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
          </Reveal>}
        </div>
      </div>
    </section>
  );
}

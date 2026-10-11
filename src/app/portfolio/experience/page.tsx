import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, BriefcaseBusiness, Sparkles } from "lucide-react";
import { ExperienceHighlights } from "@/components/ExperienceHighlights";
import { PortfolioFrame } from "@/components/PortfolioFrame";
import { Reveal } from "@/components/Reveal";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Experience",
  description: "Professional experience, product work, and applied AI learning by Sajjad Haider.",
};

export default function ExperiencePage() {
  return (
    <PortfolioFrame>
      <section className="experience-hero relative isolate overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 -z-10 grid-overlay opacity-50" />
        <div className="experience-hero-orb pointer-events-none absolute -right-24 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-accent/15 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
          <Reveal>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-surface/80 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-accent uppercase"><Sparkles className="h-4 w-4" /> Beyond the résumé</p>
            <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">Experience built through <span className="text-accent">doing.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">From building and shipping digital products to growing a brand and preparing for an AI internship, here’s how I put my skills into practice.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#experience" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:-translate-y-0.5">Explore experience <ArrowDown className="h-4 w-4" /></a>
              <Link href="/portfolio/projects" className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:border-accent/30 hover:text-accent">See selected projects <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div className="experience-summary-card max-w-sm border-l-2 border-accent pl-6 sm:mb-2">
              <div className="flex items-center gap-3 text-accent"><BriefcaseBusiness className="h-5 w-5" /><span className="text-xs font-semibold tracking-[.16em] uppercase">Professional focus</span></div>
              <p className="mt-4 font-display text-xl font-semibold leading-snug">Product development, applied AI, and thoughtful digital experiences.</p>
              <p className="mt-3 text-sm leading-6 text-muted">Experience across remote studio work, independent products, and entrepreneurship.</p>
            </div>
          </Reveal>
        </div>
      </section>
      <ExperienceHighlights detailed />
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-3xl border border-border bg-surface p-7 sm:flex sm:items-center sm:justify-between sm:p-9">
            <div><p className="text-sm font-semibold">Want to work together?</p><p className="mt-1 text-sm text-muted">I’m open to internships, freelance work, and product collaborations.</p></div>
            <Link href="/portfolio/contact" className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 sm:mt-0">Contact {site.name}<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </Reveal>
      </div>
    </PortfolioFrame>
  );
}

"use client";

import { projects } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Projects({
  limit,
  featuredSlug,
  excludeSlugs = [],
}: {
  limit?: number;
  featuredSlug?: string;
  excludeSlugs?: string[];
}) {
  const featured = projects.find((project) => project.slug === "docedit");
  const prominent = projects.filter((project) => project.prominent && project.slug !== "docedit");
  const rest = projects.filter((project) => !project.prominent);
  const allProjects = [...(featured ? [featured] : []), ...prominent, ...rest];
  const availableProjects = allProjects.filter((project) => !excludeSlugs.includes(project.slug));
  const orderedProjects = featuredSlug
    ? [
        ...availableProjects.filter((project) => project.slug === featuredSlug),
        ...availableProjects.filter((project) => project.slug !== featuredSlug),
      ]
    : availableProjects;
  const visibleProjects = typeof limit === "number" ? orderedProjects.slice(0, limit) : orderedProjects;

  return (
    <section id="projects" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Portfolio"
          title="Projects"
          description="A collection of web products, AI tools, and software I’ve built."
        />
      </Reveal>

      <div className="project-list mt-12 grid gap-7 lg:gap-12">
        {visibleProjects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            layout={project.slug === (featuredSlug ?? featured?.slug) ? "featured" : "default"}
          />
        ))}
      </div>
      {visibleProjects.length < allProjects.length && (
        <div className="mt-9 flex justify-end">
          <Link href="/portfolio/projects" className="inline-flex items-center gap-2 border-b border-accent/40 pb-2 text-sm font-semibold transition-colors hover:text-accent">
            Explore all {allProjects.length} projects <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

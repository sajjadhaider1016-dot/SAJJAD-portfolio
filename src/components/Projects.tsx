"use client";

import { projects } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Projects() {
  const featured = projects.find((project) => project.slug === "docedit");
  const prominent = projects.filter((project) => project.prominent && project.slug !== "docedit");
  const rest = projects.filter((project) => !project.prominent);
  const allProjects = [...(featured ? [featured] : []), ...prominent, ...rest];

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
        {allProjects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            layout={project.slug === featured?.slug ? "featured" : "default"}
          />
        ))}
      </div>
    </section>
  );
}

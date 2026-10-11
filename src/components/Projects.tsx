"use client";

import { projects } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Projects() {
  // DocEdit is presented in the featured carousel above this list.
  // Keep the list focused on the remaining projects so it appears only once.
  const remainingProjects = projects.filter((project) => project.slug !== "docedit");
  const prominent = remainingProjects.filter((project) => project.prominent);
  const rest = remainingProjects.filter((project) => !project.prominent);

  return (
    <section id="projects" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="More projects"
          title="Built to solve real problems."
          description="Explore the full range of web products, AI tools, and software I’ve worked on."
        />
      </Reveal>

      <div className="project-list mt-12 grid gap-7 lg:gap-12">
        {[...prominent, ...rest].map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

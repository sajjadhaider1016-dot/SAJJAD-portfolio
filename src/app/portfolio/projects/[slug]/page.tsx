import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Play } from "lucide-react";
import { Button } from "@/components/Button";
import { IconGithub } from "@/components/Icons";
import { PortfolioFrame } from "@/components/PortfolioFrame";
import { ProjectVisual } from "@/components/ProjectVisual";
import { ajaia } from "@/data/content";
import { getProject, projects } from "@/data/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} | Sajjad Haider`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <PortfolioFrame>
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/portfolio/projects" className="text-sm text-muted hover:text-text">
        ← Back to work
      </Link>
      <p className="mt-6 text-[11px] tracking-[0.2em] text-accent uppercase">
        {project.badge ?? project.category}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">{project.title}</h1>
      {project.subtitle ? <p className="mt-2 text-lg text-muted">{project.subtitle}</p> : null}
      <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{project.description}</p>
      {project.buildFocus ? (
        <section className="mt-8 max-w-4xl border-l-2 border-accent/50 pl-5">
          <h2 className="font-display text-lg font-semibold">Build scope</h2>
          <p className="mt-2 text-sm leading-7 text-muted">{project.buildFocus}</p>
        </section>
      ) : null}

      {slug === "docedit" ? (
        <p className="mt-4 rounded-2xl border border-accent/25 bg-accent-soft px-4 py-3 text-sm">
          {ajaia.label}
        </p>
      ) : null}

      <div className="mt-8">
        <ProjectVisual kind={project.image} />
      </div>

      {project.features.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Key features</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {project.features.map((feature) => (
              <li key={feature} className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                {feature}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {project.technologies.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Stack</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span key={tech} className="rounded-full border border-border px-3 py-1.5 text-xs">
                {tech}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {project.testingNotes ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Quality</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {project.testingNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {project.placeholderNote ? (
        <p className="mt-8 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted">
          {project.placeholderNote}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        {project.github ? (
          <Button href={project.github} variant="secondary">
            <IconGithub className="h-4 w-4" />
            GitHub
          </Button>
        ) : null}
        {project.liveDemo ? <Button href={project.liveDemo}>Live Demo</Button> : null}
        {project.video ? (
          <Button href={project.video} variant="secondary">
            <Play className="h-4 w-4" />
            Walkthrough
          </Button>
        ) : null}
        {project.links.find((link) => link.kind === "download") ? (
          <Button
            href={project.links.find((link) => link.kind === "download")!.href}
            download="University-Course-Registration-System.exe"
          >
            <Download className="h-4 w-4" />
            Download for Windows
          </Button>
        ) : null}
      </div>
    </div>
    </PortfolioFrame>
  );
}

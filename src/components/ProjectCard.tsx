"use client";

import Link from "next/link";
import { Download, ExternalLink, Play, ArrowUpRight } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { Project } from "@/data/types";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { ProjectVisual } from "./ProjectVisual";
import { Reveal } from "./Reveal";
import { IconGithub } from "./Icons";

function LinkIcon({ kind }: { kind: string }) {
  if (kind === "github") return <IconGithub className="h-3.5 w-3.5" />;
  if (kind === "video") return <Play className="h-3.5 w-3.5" />;
  if (kind === "download") return <Download className="h-3.5 w-3.5" />;
  return <ExternalLink className="h-3.5 w-3.5" />;
}

export function ProjectCard({
  project,
  index,
  layout = "default",
}: {
  project: Project;
  index: number;
  layout?: "featured" | "large" | "default";
}) {
  const reduce = useReducedMotion();
  const pointerXValue = useMotionValue(0);
  const pointerYValue = useMotionValue(0);
  const pointerX = useSpring(pointerXValue, { stiffness: 140, damping: 22, mass: 0.4 });
  const pointerY = useSpring(pointerYValue, { stiffness: 140, damping: 22, mass: 0.4 });
  const glareXValue = useMotionValue(50);
  const glareYValue = useMotionValue(50);
  const glareX = useSpring(glareXValue, { stiffness: 180, damping: 26 });
  const glareY = useSpring(glareYValue, { stiffness: 180, damping: 26 });
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / .2), transparent 38%)`;

  function movePreview(event: React.PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    pointerXValue.set((x - 0.5) * 5);
    pointerYValue.set((y - 0.5) * -5);
    glareXValue.set(x * 100);
    glareYValue.set(y * 100);
  }

  return (
    <Reveal
      id={`project-${project.slug}`}
      className={cn(
        "project-showcase group overflow-hidden border border-border bg-surface transition duration-500 hover:border-accent/40",
        layout === "featured" && "project-showcase-featured",
      )}
    >
      <article className={cn("grid lg:min-h-[410px] lg:grid-cols-[1fr_0.9fr]", layout === "featured" && "lg:grid-cols-[1.1fr_0.9fr]", index % 2 === 0 && layout !== "featured" && "lg:grid-cols-[0.9fr_1fr]")}>
        <div
          className={cn("project-visual-panel relative flex min-h-[270px] items-center p-4 sm:min-h-[360px] sm:p-7", index % 2 === 0 && layout !== "featured" && "lg:order-2")}
          onPointerMove={movePreview}
          onPointerLeave={() => { pointerXValue.set(0); pointerYValue.set(0); glareXValue.set(50); glareYValue.set(50); }}
        >
          <motion.div
            className="project-visual-reveal w-full"
            initial={reduce ? false : { opacity: .78, scale: .985 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: .2, margin: "0px 0px -4% 0px" }}
            transition={{ duration: reduce ? 0 : .95, delay: reduce ? 0 : Math.min(index * .07, .28), ease: [.76, 0, .24, 1] }}
          >
            <motion.div className="project-visual-stage w-full" style={{ rotateX: pointerY, rotateY: pointerX, transformPerspective: 1100 }}>
              <Link href={`/portfolio/projects/${project.slug}`} className="project-preview-link group/preview relative block" aria-label={`Open ${project.title} project details`}>
                <ProjectVisual kind={project.image} />
                <motion.span className="project-preview-glare" aria-hidden="true" style={{ background: glare }} />
                <span className="project-preview-hint absolute bottom-3 right-3 inline-flex items-center gap-2 bg-[#c6d47e] px-3 py-2 text-[10px] font-semibold tracking-[0.1em] text-[#11130d] uppercase">
                  Project details <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/preview:translate-x-0.5 group-hover/preview:-translate-y-0.5" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        <div className={cn("project-content flex flex-col justify-center p-6 sm:p-9 lg:p-12", index % 2 === 0 && layout !== "featured" && "lg:order-1")}>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted">
            {project.status ? (
              <span className="live-badge inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                <span className="live-dot h-1.5 w-1.5 rounded-full" />
                {project.status}
              </span>
            ) : null}
            <span className="project-category">{project.category}</span>
            {project.year ? <span className="text-[11px]">{project.year}</span> : null}
          </div>
          <h3 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}<span className="project-title-mark text-accent">.</span></h3>
          {project.subtitle ? <p className="mt-1 text-sm text-accent">{project.subtitle}</p> : null}
          <p className="mt-3 text-sm leading-6 text-muted">{project.description}</p>
          {project.buildFocus ? (
            <p className="mt-3 max-w-xl border-l-2 border-accent/35 pl-3 text-sm leading-6 text-text/80">
              <span className="mr-2 text-[10px] font-semibold tracking-[0.12em] text-accent uppercase">Build scope</span>
              {project.buildFocus}
            </p>
          ) : null}

          {project.technologies.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="project-tech rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-[11px] text-muted"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 ? (
                <span className="project-tech rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-[11px] text-muted">
                  +{project.technologies.length - 4}
                </span>
              ) : null}
            </div>
          ) : null}
          {project.links.length === 0 ? (
            <div className="mt-auto pt-5">
              <Button href={`/portfolio/projects/${project.slug}`} variant="secondary" className="!px-3.5 !py-2 text-xs">
                Project overview
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : null}

          {project.links.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {project.links.map((link) => (
                <Button
                  key={link.label}
                  href={link.href}
                  download={link.kind === "download" ? "University-Course-Registration-System.exe" : undefined}
                  variant={link.kind === "live" || link.kind === "caseStudy" ? "primary" : "secondary"}
                  className="!px-3.5 !py-2 text-xs"
                >
                  <LinkIcon kind={link.kind} />
                  {link.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </Reveal>
  );
}

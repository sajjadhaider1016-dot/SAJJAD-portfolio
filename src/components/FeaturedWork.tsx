"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { projects } from "@/data/projects";
import { ProjectVisual } from "./ProjectVisual";

const featuredSlugs = ["docedit", "bzu-ai-assistant", "study-buddy", "recoveriest"];
const featuredProjects = featuredSlugs.map((slug) => projects.find((project) => project.slug === slug)).filter((project) => project !== undefined);
const slideMotion = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 72 : -72, clipPath: direction > 0 ? "inset(0 0 0 18%)" : "inset(0 18% 0 0)" }),
  center: { opacity: 1, x: 0, clipPath: "inset(0 0 0 0)" },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -48 : 48, clipPath: direction > 0 ? "inset(0 18% 0 0)" : "inset(0 0 0 18%)" }),
};

export function FeaturedWork() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const project = featuredProjects[activeIndex];
  const liveLink = project.links.find((link) => link.kind === "live");

  function goTo(nextIndex: number) {
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveIndex((nextIndex + featuredProjects.length) % featuredProjects.length);
  }

  return (
    <section id="featured-work" className="featured-work mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
      <div className="featured-work-heading">
        <p className="featured-work-kicker">Projects</p>
        <h2 className="font-display">Selected projects.</h2>
        <p>Explore the products and tools I’ve built.</p>
      </div>

      <div className="featured-work-stage">
        <div className="featured-work-visual" aria-live="polite">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={project.slug}
              custom={direction}
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={.16}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) goTo(activeIndex + 1);
                else if (info.offset.x > 70) goTo(activeIndex - 1);
              }}
              variants={slideMotion}
              initial={reduce ? false : "enter"}
              animate="center"
              exit={reduce ? undefined : "exit"}
              transition={{ duration: reduce ? 0 : .78, ease: [.76, 0, .24, 1] }}
              className="featured-work-slide"
            >
              <ProjectVisual kind={project.image} />
            </motion.div>
          </AnimatePresence>
          <div className="featured-work-controls" aria-label="Project carousel controls">
            <button type="button" onClick={() => goTo(activeIndex - 1)} aria-label="Previous project"><ArrowLeft size={18} /></button>
            <div className="featured-work-progress" role="group" aria-label="Choose a project">
              {featuredProjects.map((item, index) => (
                <button key={item.slug} type="button" aria-label={`Show ${item.title}`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => goTo(index)}>
                  <span style={{ transform: index === activeIndex ? "scaleX(1)" : "scaleX(.3)" }} />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => goTo(activeIndex + 1)} aria-label="Next project"><ArrowRight size={18} /></button>
          </div>
        </div>

        <div className="featured-work-copy" aria-live="polite">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={`${project.slug}-copy`}
              custom={direction}
              initial={reduce ? false : { opacity: 0, y: 20, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? undefined : { opacity: 0, y: -14, filter: "blur(4px)" }}
              transition={{ duration: reduce ? 0 : .58, ease: [.22, 1, .36, 1] }}
            >
              <p className="featured-work-category">{project.category}</p>
              <h3>{project.title}<span>.</span></h3>
              {project.subtitle && <p className="featured-work-subtitle">{project.subtitle}</p>}
              <p className="featured-work-description">{project.description}</p>
              <div className="featured-work-tech">
                {project.technologies.slice(0, 4).map((technology) => <span key={technology}>{technology}</span>)}
              </div>
              <div className="featured-work-links">
                {liveLink && <a href={liveLink.href} target="_blank" rel="noreferrer">Open live project <ArrowUpRight size={16} /></a>}
                <Link href={`/portfolio/projects/${project.slug}`}>Project details <ArrowUpRight size={16} /></Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

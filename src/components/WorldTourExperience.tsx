"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, Compass, SkipForward, BookOpen, ExternalLink, GitBranch, Mail, Download, Layers3 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { projects } from "@/data/projects";
import { achievements, education, experiences, exploring, leadership, services, whatIBuild } from "@/data/content";
import { certifications } from "@/data/certifications";
import { skillGroups } from "@/data/skills";
import { IconLinkedin } from "./Icons";

type TourStop = { id: string; label: string; heading: string; summary: string; progress: number; x: number; y: number; z: number; kind: "section" | "project" };
const Scene = dynamic(() => import("./portfolio/TourScene").then((module) => module.TourScene), { ssr: false, loading: () => null });

const labels: Record<string, string> = {
  home: "Entrance", about: "About", projects: "Project gallery", experience: "Experience",
  skills: "Technical skills", certifications: "Certifications", services: "Services", "what-i-build": "What I build",
  education: "Education", achievements: "Achievements", leadership: "Community & leadership",
  github: "GitHub", exploring: "Currently exploring", contact: "Contact",
};
const majorDestinations = ["home", "about", "projects", "experience", "skills", "certifications", "education", "achievements", "services", "what-i-build", "leadership", "github", "exploring", "contact"];
const destinationCopy: Record<string, { heading: string; summary: string }> = {
  experience: { heading: "Professional experience", summary: "Current remote studio work, independent product development, entrepreneurship, and applied AI learning." },
  skills: { heading: "Technical skills", summary: "A practical toolkit across frontend, backend, databases, AI, automation, and delivery." },
  certifications: { heading: "Certifications", summary: "Completed courses with their issuers, issue dates, and credential IDs." },
  education: { heading: "Education", summary: "Current AI studies at Bahauddin Zakariya University and earlier academic qualifications." },
  achievements: { heading: "Achievements & recognition", summary: "Academic distinctions, scholarships, sports, and community contributions." },
  services: { heading: "Services", summary: "Full-stack product development, AI chatbots, agent workflows, APIs, and database design." },
  "what-i-build": { heading: "What I build", summary: "AI applications, full-stack platforms, automation, chatbots, and education tools." },
  leadership: { heading: "Community & leadership", summary: "Volunteer service, sports, teamwork, and continued professional growth." },
  github: { heading: "GitHub & public work", summary: "Public repositories, contribution activity, and recent engineering work." },
  exploring: { heading: "Current learning", summary: "Topics Sajjad is actively exploring across AI, agents, automation, and software architecture." },
  contact: { heading: "Contact", summary: "A direct route for recruiters, clients, and collaborators to get in touch." },
};
const subscribeToMount = () => () => {};
const getMountSnapshot = () => true;
const getServerMountSnapshot = () => false;

function goTo(id: string, navigate: (href: string) => void) {
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  else if (id === "contact") navigate("/portfolio/contact");
}

export function WorldTourExperience() {
  const [stops, setStops] = useState<TourStop[]>([]);
  const [activeId, setActiveId] = useState("home");
  const [destinations, setDestinations] = useState<string[]>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [worldOpen, setWorldOpen] = useState(true);
  const mounted = useSyncExternalStore(subscribeToMount, getMountSnapshot, getServerMountSnapshot);
  const [webgl, setWebgl] = useState(false);
  const [reduced, setReduced] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const projectLandmarks = useMemo(() => projects.map(({ slug, title, description, technologies, category, year, buildFocus, featured, live }) => ({ id: `project-${slug}`, label: title, summary: description, detail: [category, year, technologies.join(" · ")].filter(Boolean).join("  /  "), category, year, technologies, buildFocus, featured, live })), []);

  const immersive = pathname !== "/portfolio/contact" && worldOpen;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canvas = document.createElement("canvas");
    let available = false;
    try { available = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")); } catch { available = false; }
    const syncMotion = () => { setReduced(query.matches); setWebgl(available); };
    syncMotion();
    query.addEventListener("change", syncMotion);

    const root = document.querySelector<HTMLElement>(".portfolio-site main");
    if (!root) return () => query.removeEventListener("change", syncMotion);
    const pageSections = majorDestinations.filter((id) => root.querySelector(`#${CSS.escape(id)}`));
    const pageProjects = projectLandmarks.filter((project) => root.querySelector(`#${CSS.escape(project.id)}`));
    const availableStops: string[] = [];
    for (const sectionId of pageSections) {
      availableStops.push(sectionId);
      if (sectionId === "projects") availableStops.push(...pageProjects.map((project) => project.id));
    }
    requestAnimationFrame(() => setDestinations(availableStops));
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const elements = Array.from(root.querySelectorAll<HTMLElement>("section[id], [id^='project-']"))
          .filter((el) => el.id && !el.closest(".portfolio-navbar"))
          .sort((a, b) => a.getBoundingClientRect().top + window.scrollY - (b.getBoundingClientRect().top + window.scrollY));
        const unique = elements.filter((el, index) => elements.findIndex((candidate) => candidate.id === el.id) === index);
        const projectRows = Math.max(1, Math.ceil(pageProjects.length / 3));
        const sectionZ = new Map<string, number>();
        let nextZoneZ = 0;
        for (const sectionId of pageSections) {
          sectionZ.set(sectionId, nextZoneZ);
          nextZoneZ -= sectionId === "projects" ? projectRows * 5.5 + 15 : 16;
        }
        let projectOrder = 0;
        setStops(unique.map((element, index) => {
          const id = element.id;
          const top = element.getBoundingClientRect().top + window.scrollY;
          const isProject = id.startsWith("project-");
          const sectionId = element.closest("section[id]")?.id ?? id;
          const sectionIndex = Math.max(0, unique.findIndex((entry) => entry.id === sectionId));
          const project = projectLandmarks.find((item) => item.id === id);
          const titleElement = element.querySelector<HTMLElement>("h1, h2, h3");
          const heading = project?.label ?? destinationCopy[id]?.heading ?? titleElement?.getAttribute("aria-label")?.trim() ?? titleElement?.textContent?.replace(/\s+/g, " ").trim() ?? labels[id] ?? id;
          const summary = project?.summary ?? destinationCopy[id]?.summary ?? Array.from(element.querySelectorAll("p"), (paragraph) => paragraph.textContent?.trim() ?? "").find((text) => text.length > 35) ?? "Explore this part of Sajjad’s work and professional practice.";
          const projectIndex = isProject ? projectOrder++ : -1;
          const projectColumn = projectIndex % 3;
          const projectRow = Math.floor(projectIndex / 3);
          const galleryX = [-5.4, 0, 5.4][projectColumn] ?? 0;
          const x = isProject ? galleryX : Math.sin(sectionIndex * .7) * 3.1;
          const z = isProject ? (sectionZ.get("projects") ?? 0) - 5 - projectRow * 6 : sectionZ.get(id) ?? -index * 16;
          return { id, label: isProject ? project?.label ?? "Project" : labels[id] ?? id, heading, summary, progress: Math.max(0, Math.min(1, top / maxScroll)), x, y: 1.45 + Math.cos(sectionIndex * .9) * .32, z, kind: isProject ? "project" : "section" };
        }));
      });
    };
    const updateActive = () => {
      const visible = Array.from(root.querySelectorAll<HTMLElement>("section[id], [id^='project-']"))
        .map((element) => ({ id: element.id, top: element.getBoundingClientRect().top }))
        .filter((item) => item.top <= window.innerHeight * .42)
        .sort((a, b) => a.top - b.top);
      const current = visible.at(-1)?.id ?? "home";
      setActiveId(current);
    };
    measure(); updateActive();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(root);
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => { query.removeEventListener("change", syncMotion); resizeObserver.disconnect(); window.removeEventListener("resize", measure); window.removeEventListener("scroll", updateActive); cancelAnimationFrame(raf); };
  }, [projectLandmarks, pathname]);

  const activeIndex = Math.max(0, destinations.indexOf(activeId));
  const visibleProjectItems = projectLandmarks.filter((project) => destinations.includes(project.id));
  const destinationGroups = [
    { title: "Introduction", ids: ["home", "about"] },
    { title: "Projects", ids: ["projects", ...visibleProjectItems.map((project) => project.id)] },
    { title: "Professional", ids: ["experience", "skills", "certifications", "services", "what-i-build"] },
    { title: "Education & recognition", ids: ["education", "achievements"] },
    { title: "Community & activity", ids: ["leadership", "github", "exploring"] },
    { title: "Contact", ids: ["contact"] },
  ].map((group) => ({ ...group, ids: group.ids.filter((id) => destinations.includes(id)) })).filter((group) => group.ids.length > 0);
  const showFullSection = (id: string) => {
    setWorldOpen(false);
    requestAnimationFrame(() => goTo(id, router.push));
  };

  const overlay = (
    <div className="world-tour" data-page={pathname === "/portfolio/contact" ? "contact" : "portfolio"} data-active-id={activeId} data-webgl={webgl && !reduced ? "true" : "false"} data-immersive={immersive ? "true" : "false"}>
      {webgl && !reduced ? <Scene stops={stops} projectStops={projectLandmarks} /> : <div className="world-tour-fallback" aria-hidden="true"><span className="world-fallback-path" /><span className="world-fallback-gate" /></div>}
      <section className="tour-story-panel" aria-live="polite" aria-label="Current portfolio destination">
        <p className="tour-story-kicker">{labels[activeId] ?? projectLandmarks.find((item) => item.id === activeId)?.label ?? "Portfolio"} <span>·</span> World tour</p>
        <h1>{stops.find((stop) => stop.id === activeId)?.heading ?? labels[activeId] ?? "Sajjad Haider"}</h1>
        <p className="tour-story-summary">{stops.find((stop) => stop.id === activeId)?.summary ?? "AI & Full-Stack Developer building useful AI products and thoughtful web experiences."}</p>
        {(() => {
          const slug = activeId.startsWith("project-") ? activeId.slice("project-".length) : null;
          const project = slug ? projects.find((item) => item.slug === slug) : null;
          if (project) return <div className="tour-recruiter-card">
            <p className="tour-card-meta"><Layers3 size={13} /> {project.category}{project.year ? ` · ${project.year}` : ""}</p>
            {project.buildFocus && <p className="tour-card-focus">{project.buildFocus}</p>}
            {project.technologies.length > 0 && <div className="tour-card-tech">{project.technologies.slice(0, 5).map((technology) => <span key={technology}>{technology}</span>)}</div>}
            <div className="tour-story-actions">
              {project.liveDemo && <a className="tour-action-primary" href={project.liveDemo} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Live project</a>}
              {project.github && <a href={project.github} target="_blank" rel="noreferrer"><GitBranch size={14} /> Source code</a>}
              <a href={`/portfolio/projects/${project.slug}`}><BookOpen size={14} /> Case study</a>
            </div>
          </div>;
          if (activeId === "projects") return <div className="tour-project-index" aria-label="Browse projects">
            <p>Project gallery <span>{visibleProjectItems.length} projects</span></p>
            {visibleProjectItems.map((item) => <button key={item.id} type="button" onClick={() => goTo(item.id, router.push)}><span>{item.label}</span><small>{item.featured ? "Featured" : item.category}{item.live ? " · Live" : ""}</small></button>)}
            <Link className="tour-project-browse" href="/portfolio/projects">Browse full project details <ExternalLink size={13} /></Link>
          </div>;
          if (activeId === "contact") return <div className="tour-story-actions">
            <a className="tour-action-primary" href="/portfolio/contact" onClick={(event) => { event.preventDefault(); setWorldOpen(false); requestAnimationFrame(() => goTo("contact", router.push)); }}><Mail size={14} /> Contact about an opportunity</a>
            <a href="mailto:sajjadhaider1016@gmail.com"><Mail size={14} /> Email</a>
            <a href="https://www.linkedin.com/in/sajjadhaider56/" target="_blank" rel="noreferrer"><IconLinkedin className="h-[14px] w-[14px]" /> LinkedIn</a>
            <a href="/CV.pdf" download><Download size={14} /> Resume</a>
          </div>;
          if (activeId === "experience") return <div className="tour-structured-list">
            {experiences.map((item) => <article key={`${item.organization}-${item.role}`}><div><h2>{item.role}</h2><p>{item.organization} <span>·</span> {item.period}</p></div><span className="tour-record-status">{item.status}</span></article>)}
            <button type="button" onClick={() => showFullSection("experience")}>Read experience details <ExternalLink size={13} /></button>
          </div>;
          if (activeId === "skills") return <div className="tour-structured-list tour-skill-overview">
            {skillGroups.map((group) => <article key={group.id}><div><h2>{group.title}</h2><p>{group.skills.slice(0, 5).join(" · ")}</p></div></article>)}
            <button type="button" onClick={() => showFullSection("skills")}>View all skills <ExternalLink size={13} /></button>
          </div>;
          if (activeId === "certifications") return <div className="tour-structured-list">
            {certifications.slice(0, 5).map((item) => <article key={item.credentialId}><div><h2>{item.name}</h2><p>{item.issuer} <span>·</span> {item.issued}</p></div></article>)}
            <button type="button" onClick={() => showFullSection("certifications")}>View all {certifications.length} credentials <ExternalLink size={13} /></button>
          </div>;
          if (activeId === "education") return <div className="tour-structured-list">
            {education.map((item) => <article key={item.program}><div><h2>{item.program}</h2><p>{item.school} <span>·</span> {item.status}</p><p>{item.detail}</p></div></article>)}
            <button type="button" onClick={() => showFullSection("education")}>Open education section <ExternalLink size={13} /></button>
          </div>;
          if (activeId === "achievements") return <div className="tour-structured-list">
            {achievements.map((item) => <article key={item.title}><div><h2>{item.title}</h2><p>{item.detail}</p></div></article>)}
            <button type="button" onClick={() => showFullSection("achievements")}>Read achievements <ExternalLink size={13} /></button>
          </div>;
          if (activeId === "services") return <div className="tour-structured-list tour-compact-list">
            {services.map((item) => <article key={item.title}><div><h2>{item.title}</h2><p>{item.description}</p></div></article>)}
            <button type="button" onClick={() => showFullSection("services")}>Explore services <ExternalLink size={13} /></button>
          </div>;
          if (activeId === "what-i-build") return <div className="tour-topic-list">{whatIBuild.map((item) => <span key={item}>{item}</span>)}<button type="button" onClick={() => showFullSection("what-i-build")}>Explore product areas <ExternalLink size={13} /></button></div>;
          if (activeId === "leadership") return <div className="tour-structured-list">
            {leadership.map((item) => <article key={item.title}><div><h2>{item.title}</h2><p>{item.detail}</p></div></article>)}
            <button type="button" onClick={() => showFullSection("leadership")}>Read community experience <ExternalLink size={13} /></button>
          </div>;
          if (activeId === "exploring") return <div className="tour-topic-list">{exploring.map((item) => <span key={item}>{item}</span>)}</div>;
          return null;
        })()}
      </section>
      <div className="world-tour-controls" aria-label="Portfolio tour navigation" style={activeId === "contact" ? { top: "clamp(4.5rem, 10vh, 5.15rem)", right: "clamp(.65rem, 2vw, 1.5rem)", bottom: "auto", left: "auto", width: "min(13rem, calc(100vw - 1.5rem))", padding: ".6rem", gap: ".4rem" } : undefined}>
        <div className="tour-location"><Compass size={15} aria-hidden="true" /><span>{labels[activeId] ?? projectLandmarks.find((item) => item.id === activeId)?.label ?? "Portfolio"}</span><span className="tour-position">{String(activeIndex + 1).padStart(2, "0")} / {String(destinations.length).padStart(2, "0")}</span></div>
        <div className="tour-progress" aria-hidden="true"><span style={{ transform: `scaleX(${destinations.length > 1 ? activeIndex / (destinations.length - 1) : 0})` }} /></div>
        <nav id="tour-destination-list" className="tour-destinations" aria-label="Jump to destination" hidden={!mapOpen}>
          {destinationGroups.map((group) => <div key={group.title} className="tour-destination-group"><p>{group.title}</p><div>{group.ids.map((id) => <button key={id} type="button" aria-current={activeId === id ? "location" : undefined} onClick={() => goTo(id, router.push)}>{labels[id] ?? projectLandmarks.find((project) => project.id === id)?.label ?? id}</button>)}</div></div>)}
        </nav>
        <div className="tour-step-controls">
          <button type="button" aria-label="Previous destination" disabled={activeIndex <= 0} onClick={() => goTo(destinations[Math.max(0, activeIndex - 1)], router.push)}><ArrowUp size={15} /></button>
          <button type="button" aria-label="Next destination" onClick={() => goTo(destinations[Math.min(destinations.length - 1, activeIndex + 1)], router.push)}><ArrowDown size={15} /></button>
          <button type="button" aria-expanded={mapOpen} aria-controls="tour-destination-list" onClick={() => setMapOpen((open) => !open)}><Compass size={14} /><span>{mapOpen ? "Close map" : "Destinations"}</span></button>
          <button type="button" className="tour-content-toggle" aria-pressed={!immersive} onClick={() => { if (pathname === "/portfolio/contact") { setWorldOpen(true); router.push("/"); } else setWorldOpen((value) => !value); }}><BookOpen size={14} /><span>{pathname === "/portfolio/contact" ? "Back to world" : immersive ? "Full content" : "Return to world"}</span></button>
          <button type="button" className="tour-skip" onClick={() => { setWorldOpen(false); requestAnimationFrame(() => goTo("contact", router.push)); }}><SkipForward size={14} /><span>Skip to contact</span></button>
        </div>
      </div>
      {!webgl && !reduced && <p className="world-tour-note">WebGL is unavailable here; the portfolio remains navigable.</p>}
      {reduced && <p className="world-tour-note">Reduced motion is enabled; use the destination controls to navigate.</p>}
    </div>
  );
  return mounted ? createPortal(overlay, document.body) : null;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import {
  achievements,
  certifications,
  education,
  experience,
  links,
  projects,
  services,
  skillGroups,
  type SectionId,
} from "@/data/portfolio";

type Props = { section: SectionId; enter: () => void; navigate: (section: SectionId) => void; allSections?: boolean };

function Home({ enter, navigate }: Pick<Props, "enter" | "navigate">) {
  return (
    <>
      <div className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">AI engineer / full-stack developer</p>
          <h1>I build intelligent<br /><em>software that solves</em><br />real problems.</h1>
          <p className="hero-role">Sajjad Haider</p>
          <p className="lead">AI applications, intelligent agents, business automation, and modern web products — turning complex ideas into practical digital solutions.</p>
          <p className="availability"><span className="availability-dot" />Available for remote opportunities</p>
          <div className="hero-actions">
            <button type="button" className="button button-dark" onClick={() => navigate("projects")}>Explore my work <span aria-hidden="true">↗</span></button>
            <button type="button" className="button button-paper" onClick={() => navigate("contact")}>Let’s connect</button>
            <a className="text-button resume-request" href="/CV.pdf" download>Download résumé <span aria-hidden="true">↗</span></a>
          </div>
          <nav className="hero-social-links" aria-label="Profile links"><a href={links.githubProfile} target="_blank" rel="noreferrer">GitHub</a><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={`mailto:${links.email}`}>Email</a></nav>
          <p className="tour-invite"><span>Prefer to explore?</span> <button type="button" onClick={enter}>Enter the illustrated 3D world ↗</button></p>
        </div>
        <div className="hero-visual">
          <div className="hero-frame"><Image src="/identity/sajjad-haider.jpg" alt="Portrait of Sajjad Haider" width={720} height={1200} priority sizes="(max-width: 760px) 78vw, 38vw" className="hero-photo" /></div>
        </div>
      </div>
      <div className="capability-strip" aria-label="Areas of work">{["AI & full-stack development", "AI automation", "Web applications", "Product development"].map((item) => <span key={item}>{item}</span>)}</div>
    </>
  );
}

function About() {
  return (
    <>
      <p className="eyebrow">About me</p>
      <h2>About Sajjad.</h2>
      <div className="profile-row">
        <div><p className="lead">I study Artificial Intelligence at Bahauddin Zakariya University and build full-stack software alongside my studies.</p><p>My work includes web applications, AI assistants, document tools, and automation. I handle the interface, application logic, data, and model integrations needed to make each product work.</p></div>
      </div>
      <div className="copy-block">
        <h3>Areas I work in</h3>
        <p>I work with language model integrations, document workflows, and automation, as well as the web interfaces and backend systems around them. Recent projects include a university assistant, a collaborative document editor, and a property-listing monitor.</p>
      </div>
      <div className="copy-block about-followup">
        <h3>How I work</h3>
        <p>I begin with the task a product needs to support, then build and refine the workflow around it. I aim for clear interfaces, reliable data handling, and AI features tied to a specific use.</p>
        <p>Independent development and co-founding China Vibes have also given me experience with product decisions, daily operations, and customer experience. I plan to keep developing as an AI product engineer.</p>
      </div>
    </>
  );
}

function ProjectPreview({ index, title, screenshot, previewUrl, previewSteps }: { index: number; title: string; screenshot: string; previewUrl?: string; previewSteps?: string[] }) {
  return (
    <div className={`project-preview preview-${index % 4}`}>
      {previewUrl ? <>
        <div className="project-preview-toolbar"><small>LIVE WEBSITE PREVIEW</small><a href={previewUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>Visit live website <span aria-hidden="true">↗</span></a></div>
        <iframe src={previewUrl} title={`${title} live website preview`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
      </> : screenshot ? <Image src={screenshot} alt={`${title} project interface`} fill sizes="(max-width: 760px) 100vw, (max-width: 1080px) 90vw, (max-width: 1440px) 42vw, 30vw" className="project-screenshot" /> : previewSteps?.length ? <div className="project-flow-preview" aria-label={`${title} workflow`}>{previewSteps.map((step, stepIndex) => <span key={step}><small>0{stepIndex + 1}</small><strong>{step}</strong>{stepIndex < previewSteps.length - 1 && <i aria-hidden="true">→</i>}</span>)}</div> : <>
    <div className="project-cover"><small>PROJECT DETAILS</small><strong>{title}</strong><span>{projectPreviewMessage(title)}</span></div>
      </>}
      {screenshot && !previewUrl && <small>Project screenshot</small>}
    </div>
  );
}

function projectPreviewMessage(title: string) {
  if (title === "China Vibes") return "Co-founder contribution · source repository linked below";
  if (title === "Customer Support AI Copilot" || title === "ContentPilot AI") return "No public live demo or screenshot is listed";
  return "No public screenshot is listed · see verified links below";
}

function Projects() {
  const [projectFilter, setProjectFilter] = useState("All");
  const projectCategories = Array.from(new Set(projects.map((project) => project.category)));
  const featuredOrder = ["bzu-ai-assistant", "customer-support-ai-copilot", "contentpilot-ai", "property-monitoring-agent", "docedit", "china-vibes", "studio-bdtla"];
  const featured = featuredOrder.map((id) => projects.find((project) => project.id === id)).filter((project): project is (typeof projects)[number] => Boolean(project));
  const featuredIds = new Set(featured.map((project) => project.id));
  const secondary = projects.filter((project) => !featuredIds.has(project.id));
  const visible = projectFilter === "All" ? featured : projects.filter((project) => project.category === projectFilter);
  const groups = [
    { title: projectFilter === "All" ? "Featured work" : projectFilter, entries: visible },
    ...(projectFilter === "All" && secondary.length ? [{ title: "More projects", entries: secondary }] : []),
  ];
  return (
    <>
      <p className="eyebrow">Projects · {String(projects.length).padStart(2, "0")}</p>
      <h2>Selected projects.</h2>
      <p className="lead">Web applications, AI tools, client work, and software experiments.</p>
      <div className="project-filters" role="group" aria-label="Filter projects by category">
        {["All", ...projectCategories].map((category) => <button type="button" key={category} aria-pressed={projectFilter === category} className={projectFilter === category ? "is-selected" : ""} onClick={() => setProjectFilter(category)}>{category}</button>)}
      </div>
      <div className="project-collection">
        {groups.map((group) => <section className="project-group" key={group.title} aria-label={group.title} hidden={projectFilter !== "All" && projectFilter !== group.title}>
          <div className="project-group-heading"><h3>{group.title}</h3><small>{String(group.entries.length).padStart(2, "0")} projects</small></div>
          <div className="project-list">
        {group.entries.map((project, index) => (
          <details className={`project-card${featuredIds.has(project.id) ? " is-featured" : ""}`} key={project.id} id={`project-${project.id}`}>
            <summary>
              <ProjectPreview index={index} title={project.title} screenshot={project.screenshot} previewUrl={project.previewUrl} previewSteps={project.previewSteps} />
              <span className="project-summary"><small>{project.category} · {project.eyebrow}</small><strong>{project.title}</strong><span className="project-blurb">{project.description}</span><span className="project-card-meta">{project.projectType ? `${project.projectType} · ` : ""}{project.tech.slice(0, 4).join(" · ") || (project.id === "course-registration" ? "Windows download" : project.live ? "Live preview available" : project.github ? "Source code available" : "Project details")}</span><i aria-hidden="true">＋</i></span>
            </summary>
            <div className="project-detail">
              <p className="project-overview"><strong>Overview</strong><br />{project.description}</p>
              {project.showcase && <div className="project-showcase-details">
                <article className="project-showcase-block"><p className="eyebrow">01 / Website</p><h3>{project.showcase.website.title}</h3><p>{project.showcase.website.description}</p><ul>{project.showcase.website.points.map((point) => <li key={point}>{point}</li>)}</ul><a className="project-showcase-link" href={project.live} target="_blank" rel="noreferrer">Visit live website <span aria-hidden="true">↗</span></a></article>
                <article className="project-showcase-block agent-showcase"><p className="eyebrow">02 / AI engineering</p><h3>{project.showcase.agent.title}</h3><p>{project.showcase.agent.description}</p><ol className="agent-workflow" aria-label="Property monitoring workflow">{project.showcase.agent.workflow.map((step, stepIndex) => <li key={step}><span>{String(stepIndex + 1).padStart(2, "0")}</span><strong>{step}</strong>{stepIndex < (project.showcase?.agent.workflow.length ?? 0) - 1 && <i aria-hidden="true">→</i>}</li>)}</ol></article>
              </div>}
              {project.features.length > 0 && <><h3>Features</h3><ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></>}
              {project.contribution && <><h3>My contribution</h3><p>{project.contribution}</p></>}
              {project.tech.length > 0 && <div className="tag-list">{project.tech.map((tech) => <span className="tag" key={tech}>{tech}</span>)}</div>}
              <div className="project-links">
                {project.github && <a href={project.github} target="_blank" rel="noreferrer">Source code ↗</a>}
                {project.live && <a href={project.live} target="_blank" rel="noreferrer">{project.id === "course-registration" ? "Download Windows build ↗" : project.id === "studio-bdtla" ? "Visit live website ↗" : "Open live preview ↗"}</a>}
              </div>
            </div>
          </details>
        ))}
          </div>
        </section>)}
      </div>
    </>
  );
}

function Experience() {
  return (
    <>
      <p className="eyebrow">Experience</p><h2>The work behind<br /><em>the projects.</em></h2>
      <p className="lead">Roles across web development, applied AI, independent software, and business operations.</p>
      <div className="timeline">
        {experience.map((job) => <article className="timeline-item" key={job.role}>
          <span className="timeline-dot" /><p className="eyebrow">{job.date}</p><h3>{job.role}</h3><p className="org">{job.org} <span className="experience-status">{job.status}</span></p><p>{job.description}</p>
          <ul>{job.points.map((point) => <li key={point}>{point}</li>)}</ul><div className="tag-list">{job.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
        </article>)}
      </div>
    </>
  );
}

function Education() {
  return <>
    <p className="eyebrow">Education</p><h2>A focused AI degree.<br /><em>A strong foundation.</em></h2>
    <p className="lead">Artificial Intelligence at Bahauddin Zakariya University, preceded by Intermediate and secondary education.</p>
    <div className="education-stack">{education.map((item, index) => <article className="education-card" key={item.title}>
      <span className="education-number">0{index + 1}</span><small>{item.status}</small><h3>{item.title}</h3><p className="org">{item.place}</p><p>{item.detail}</p>
    </article>)}</div>
  </>;
}

function Skills() {
  return <>
    <p className="eyebrow">Technical skills</p><h2>Full-stack &amp; AI development.</h2>
    <p className="lead">Tools and technologies I use across interfaces, backend systems, data, AI, and deployment.</p>
    <div className="skills-grid">{skillGroups.map((group) => <article className="skill-group" key={group.title}>
      <span className="small-rule" /><h3>{group.title}</h3><p>{group.detail}</p><div className="tag-list">{group.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
    </article>)}</div>
  </>;
}

function Services({ navigate }: Pick<Props, "navigate">) {
  return <>
    <p className="eyebrow">Services</p><h2>Development services.</h2><p className="lead">Web applications, AI integrations, workflow automation, APIs, and database design.</p>
    <div className="service-list">{services.map((service, index) => <article className="service-row" key={service.title}>
      <span className="service-index">0{index + 1}</span><div><h3>{service.title}</h3><p>{service.description}</p><p className="service-outcome"><strong>Deliverable</strong> {service.outcome}</p><p className="service-usecase"><strong>Useful for</strong> {service.useCase}</p><p className="service-related"><strong>Related work</strong> {service.relatedProjects.map((title, projectIndex) => { const project = projects.find((item) => item.title === title); return project ? <a key={title} href={`#project-${project.id}`}>{title}{projectIndex < service.relatedProjects.length - 1 ? ", " : ""}</a> : title; })}</p><div className="tag-list">{service.technologies.map((tech) => <span className="tag" key={tech}>{tech}</span>)}</div></div><button type="button" aria-label={`Ask about ${service.title}`} onClick={() => navigate("contact")}>↗</button>
    </article>)}</div>
  </>;
}

function Certifications() {
  return <>
    <p className="eyebrow">Certifications</p><h2>Courses &amp; credentials.</h2><p className="lead">Certificates from Google, UniAthena, and Udemy.</p>
    <div className="certificate-list">{certifications.map(([issuer, title, date, id]) => <article className="certificate" key={id}>
      <span className="certificate-seal" aria-hidden="true">{issuer.slice(0, 1)}</span><div><small>{issuer} · {date}</small><h3>{title}</h3><p>Credential ID: {id}</p></div>
    </article>)}</div>
  </>;
}

function Achievements() {
  return <>
    <p className="eyebrow">Achievements</p><h2>Recognition,<br /><em>discipline, community.</em></h2>
    <div className="achievement-list">{achievements.map((item, index) => <article className="achievement" key={item.title}>
      <span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div>
    </article>)}</div>
  </>;
}

function Contact() {
  return <>
    <p className="eyebrow">Contact</p><h2>Tell me about your project.</h2>
    <p className="lead">For web development, AI features, workflow automation, or API work, send a short description of what you need.</p>
    <div className="contact-layout"><ContactForm />
      <aside className="contact-links"><p className="eyebrow">For recruiters &amp; collaborators</p><p>Available for internships, freelance, and product work.</p>
        <a href={`mailto:${links.email}`}>Email <span>{links.email}</span></a>
        <a href={links.whatsapp} target="_blank" rel="noreferrer">WhatsApp <span>Open conversation ↗</span></a>
        <a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn <span>View profile ↗</span></a>
        <a href={links.github} target="_blank" rel="noreferrer">GitHub <span>sajjadhaider1016-dot ↗</span></a>
      </aside>
    </div>
  </>;
}

type GithubRepo = { name: string; html_url: string; description: string | null; language: string | null; stargazers_count: number };
function GithubShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let controller: AbortController | undefined;
    const load = () => {
      if (controller) return;
      controller = new AbortController();
      Promise.all([
        fetch("https://api.github.com/users/sajjadhaider1016-dot", { signal: controller.signal }).then((res) => { if (!res.ok) throw new Error("profile"); return res.json(); }),
        fetch("https://api.github.com/users/sajjadhaider1016-dot/repos?sort=updated&per_page=5", { signal: controller.signal }).then((res) => { if (!res.ok) throw new Error("repos"); return res.json(); }),
      ]).then(([profile, repositoryList]) => {
        if (controller?.signal.aborted) return;
        setCount(Number(profile.public_repos));
        setRepos(Array.isArray(repositoryList) ? repositoryList : []);
      }).catch(() => { if (!controller?.signal.aborted) setError(true); });
    };
    if (!("IntersectionObserver" in window)) {
      load();
    } else {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          load();
        }
      }, { rootMargin: "320px 0px" });
      observer.observe(root);
      return () => { observer.disconnect(); controller?.abort(); };
    }
    return () => controller?.abort();
  }, []);
  return <div className="github-showcase" ref={rootRef}>
    <p className="eyebrow">Public work, in the open</p><h3>Sajjad Haider <small>@ sajjadhaider1016-dot</small></h3>
    <p>Recent public repositories from my GitHub account.</p>
    <p className="github-count">{count === null ? "Repository data loads as you reach this section" : `${count} public repositories`}</p>
    {error ? <p>GitHub is unavailable right now. Browse the public profile instead.</p> : <div className="repo-list">{repos.map((repo) => <a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer"><strong>{repo.name}</strong><span>{repo.description || "Public repository"}</span><small>{repo.language || "Repository"} · {repo.stargazers_count} stars</small></a>)}</div>}
    <a className="inline-link" href={links.github} target="_blank" rel="noreferrer">Open GitHub profile ↗</a>
  </div>;
}

function SectionContent({ section, enter, navigate }: Props) {
  return <>
    {section === "about" ? <About /> : section === "projects" ? <Projects /> : section === "experience" ? <Experience /> : section === "education" ? <Education /> : section === "skills" ? <Skills /> : section === "services" ? <Services navigate={navigate} /> : section === "certifications" ? <Certifications /> : section === "achievements" ? <Achievements /> : section === "contact" ? <Contact /> : <Home enter={enter} navigate={navigate} />}
    {section === "home" && <GithubShowcase />}
  </>;
}

export default function SectionPanel({ section, enter, navigate, allSections = false }: Props) {
  const reducedMotion = useReducedMotion();
  const visibleSections: SectionId[] = allSections ? ["home", "about", "projects", "experience", "education", "skills", "services", "certifications", "achievements", "contact"] : [section];
  useEffect(() => {
    if (!allSections || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".portfolio-sections:not(.single-section) .section-card"));
    const revealItems = new Set<HTMLElement>();
    const targets = cards.flatMap((card) => {
      card.classList.add("reveal-ready");
      const items = Array.from(new Set(card.querySelectorAll<HTMLElement>(
        ".section-scroll > *, .project-card, .timeline-item, .skill-group, .service-row, .certificate, .achievement, .education-card, .copy-block, .contact-form > *"
      )));
      items.forEach((item, index) => {
        item.classList.add("reveal-item");
        item.classList.add("reveal-pending");
        item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 45}ms`);
        revealItems.add(item);
      });
      return [card, ...items];
    });
    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => { target.classList.add("is-visible"); target.classList.remove("reveal-pending"); });
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          entry.target.classList.remove("reveal-pending");
          // Reveal once, then keep content visible. Re-hiding on scroll-out made pages look blank
          // when users scrolled back or a tall section crossed the observer threshold.
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px 280px 0px", threshold: 0.01 });
    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      cards.forEach((card) => card.classList.remove("reveal-ready", "is-visible"));
      revealItems.forEach((item) => {
        item.classList.remove("reveal-item", "reveal-pending", "is-visible");
        item.style.removeProperty("--reveal-delay");
      });
    };
  }, [allSections]);
  return <div className={allSections ? "portfolio-sections" : "portfolio-sections single-section"}>
    {visibleSections.map((current) => <motion.section
      id={`section-${current}`}
      className={`section-card section-${current}`}
      aria-label={`${current} portfolio section`}
      key={current}
      initial={reducedMotion ? false : { opacity: .86, y: 30, scale: .99 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: .14 }}
      transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 145, damping: 25, mass: .85 }}
    >
      <span className="panel-corner" aria-hidden="true" />
      <div className="section-scroll">
        <SectionContent section={current} enter={enter} navigate={navigate} />
      </div>
      <span className="panel-page" aria-hidden="true">SAJJAD HAIDER &nbsp; / &nbsp; {current.toUpperCase()}</span>
    </motion.section>)}
  </div>;
}

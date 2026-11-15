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

export type RoomDetailEntry = { title: string; detail?: string; meta?: string };
export type RoomDetails = { title: string; subtitle: string; entries: RoomDetailEntry[]; columns?: 1 | 2 };

export function roomDetailsFor(sectionId: SectionId): RoomDetails {
  if (sectionId === "home") return {
    title: "Sajjad Haider",
    subtitle: "AI & Full-Stack Developer",
    entries: [
      { title: "What I build", detail: "AI-powered applications, intelligent automation, and complete digital products." },
      { title: "How I work", detail: "Turning practical ideas into polished, useful experiences across interface, backend, and deployment." },
      { title: "Current focus", detail: "Applied AI, automation systems, and dependable full-stack products." },
      { title: "Availability", detail: "Available for remote opportunities." },
    ],
  };
  if (sectionId === "about") return {
    title: "About me",
    subtitle: "Intelligent products. Practical engineering.",
    entries: [
      { title: "Background", detail: "AI student at Bahauddin Zakariya University, building practical software alongside my studies." },
      { title: "Technical interests", detail: "AI applications, language model integrations, document workflows, and automation." },
      { title: "Development approach", detail: "Start with the problem, keep the experience understandable, and choose technology for the job." },
      { title: "Direction", detail: "Growing as an AI product engineer, connecting modern web systems with useful applied intelligence." },
    ],
  };
  if (sectionId === "projects") return {
    title: "Selected projects",
    subtitle: "Products, experiments, and solutions",
    columns: 2,
    entries: projects.map((project) => ({ title: project.title, detail: project.description, meta: project.tech.slice(0, 3).join(" · ") || project.category })),
  };
  if (sectionId === "experience") return {
    title: "Professional experience",
    subtitle: "Selected roles and ongoing work",
    entries: experience.map((item) => ({ title: item.role, detail: item.description, meta: `${item.org} · ${item.date}` })),
  };
  if (sectionId === "education") return {
    title: "Education",
    subtitle: "Academic background",
    entries: education.map((item) => ({ title: item.title, detail: item.detail, meta: `${item.place} · ${item.status}` })),
  };
  if (sectionId === "skills") return {
    title: "Technical skills",
    subtitle: "A practical full-stack and AI toolkit",
    columns: 2,
    entries: skillGroups.map((group) => ({ title: group.title, detail: group.skills.join(" · ") })),
  };
  if (sectionId === "services") return {
    title: "Services",
    subtitle: "Practical software for real product needs",
    entries: services.map((service) => ({ title: service.title, detail: service.description, meta: service.technologies.join(" · ") })),
  };
  if (sectionId === "certifications") return {
    title: "Certifications",
    subtitle: "Credentials and continuing study",
    columns: 2,
    entries: certifications.map(([issuer, name, date, id]) => ({ title: name, detail: `${issuer} · ${date}`, meta: `Credential ID: ${id}` })),
  };
  if (sectionId === "achievements") return {
    title: "Achievements",
    subtitle: "Academic, sports, and community recognition",
    columns: 2,
    entries: achievements.map((item) => ({ title: item.title, detail: item.detail })),
  };
  return {
    title: "Contact",
    subtitle: "For recruiters and collaborators",
    entries: [
      { title: "Email", detail: links.email },
      { title: "GitHub", detail: "@sajjadhaider1016-dot", meta: links.githubProfile },
      { title: "LinkedIn", detail: "Professional profile", meta: links.linkedin },
      { title: "WhatsApp", detail: "Open a conversation", meta: links.whatsapp },
    ],
  };
}

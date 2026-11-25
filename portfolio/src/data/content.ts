// The one place the site reads its content from. Edit the .json files next to this one.
import profileData from './profile.json';
import projectData from './projects.json';
import experience from './experience.json';
import education from './education.json';
import skills from './skills.json';
import services from './services.json';
import certifications from './certifications.json';
import achievements from './achievements.json';
import headings from './headings.json';

export const profile = profileData;
export { experience, education, skills, services, certifications, achievements, headings };

export type ProjectLink = { label: string; url: string };
export type Showcase = { label: string; title: string; text: string; points: string[]; steps: string[]; features: string[]; contribution: string; link: ProjectLink | null };
export type Project = {
  slug: string; title: string; group: string; category: string; kind: string; description: string; cardMeta: string;
  image: string | null; coverNote: string; features: string[]; contribution: string; tags: string[]; links: ProjectLink[]; flow: string[]; showcase: Showcase[];
};
export const projects = projectData as Project[];
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const CATEGORIES = ['All', 'AI & Machine Learning', 'Web Development', 'Product & Business', 'Real Estate & Property Management', 'Software & Applications', 'Experiments'];
export const inCategory = (p: Project, category: string) => category === 'All' || p.category === category;
export const GROUPS = ['Featured work', 'More projects'];

// Presentation only: the accent colour each project uses in the artwork, tapes and cases.
const HUES = ['#2E54D1', '#0F8B8D', '#C2410C', '#3B57C4', '#2563A8', '#E4572E', '#1F7A5A', '#7A5CFF', '#B4457A', '#2F7BFF', '#8A6D1D', '#B02A37'];
export const hueOf = (p: Project) => HUES[projects.indexOf(p) % HUES.length];

/** The home page's sections, in order. Used by the section menu, the chat and the terminal. */
export const SECTIONS: [id: string, label: string][] = [
  ['work', 'Projects'], ['about', 'About'], ['experience', 'Experience'], ['education', 'Education'], ['skills', 'Skills'],
  ['services', 'Services'], ['certifications', 'Certifications'], ['achievements', 'Achievements'], ['contact', 'Contact'],
];

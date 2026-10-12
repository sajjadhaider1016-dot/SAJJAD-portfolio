export type ProjectLinkKind = "github" | "live" | "video" | "caseStudy" | "view" | "download";

export type ProjectLink = {
  kind: ProjectLinkKind;
  label: string;
  href: string;
  placeholder?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  productType?: string;
  description: string;
  buildFocus?: string;
  features: string[];
  technologies: string[];
  image: string;
  github?: string;
  liveDemo?: string;
  video?: string;
  featured: boolean;
  prominent?: boolean;
  live?: boolean;
  status?: "LIVE";
  year?: string;
  badge?: string;
  links: ProjectLink[];
  testingNotes?: string[];
  placeholderNote?: string;
};

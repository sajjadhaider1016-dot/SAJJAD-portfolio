import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://sajjadhaider.dev", lastModified: new Date() },
    ...projects.map((project) => ({
      url: `https://sajjadhaider.dev/portfolio/projects/${project.slug}`,
      lastModified: new Date(),
    })),
  ];
}

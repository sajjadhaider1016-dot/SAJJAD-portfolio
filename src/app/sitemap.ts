import type { MetadataRoute } from "next";
import { navItems, site } from "@/data/site";
import { projects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...navItems.map((item) => ({
      url: new URL(item.href, site.url).toString(),
      lastModified,
    })),
    ...projects.map((project) => ({
      url: `${site.url}/portfolio/projects/${project.slug}`,
      lastModified,
    })),
  ];
}

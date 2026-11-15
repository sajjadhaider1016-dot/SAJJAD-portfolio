import type { MetadataRoute } from "next";

const siteUrl = "https://sajjad-haider-portfolio.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 }];
}

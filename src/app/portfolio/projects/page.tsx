import type { Metadata } from "next";
import { PortfolioFrame } from "@/components/PortfolioFrame";
import { Projects } from "@/components/Projects";
import { FeaturedWork } from "@/components/FeaturedWork";

export const metadata: Metadata = { title: "Projects", description: "Selected software, AI, and full-stack projects by Sajjad Haider." };

export default function ProjectsPage() {
  return <PortfolioFrame><FeaturedWork /><Projects /></PortfolioFrame>;
}

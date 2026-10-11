import type { Metadata } from "next";
import { Exploring } from "@/components/Exploring";
import { GitHubShowcase } from "@/components/GitHubShowcase";
import { PortfolioFrame } from "@/components/PortfolioFrame";

export const metadata: Metadata = { title: "GitHub", description: "Open-source work and developer activity by Sajjad Haider." };

export default function GitHubPage() {
  return <PortfolioFrame><GitHubShowcase /><Exploring /></PortfolioFrame>;
}

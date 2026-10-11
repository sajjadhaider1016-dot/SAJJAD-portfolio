import type { Metadata } from "next";
import { PortfolioFrame } from "@/components/PortfolioFrame";
import { Skills } from "@/components/Skills";

export const metadata: Metadata = { title: "Skills & Certifications", description: "Technical skills and certifications of Sajjad Haider." };

export default function SkillsPage() {
  return <PortfolioFrame><Skills /></PortfolioFrame>;
}

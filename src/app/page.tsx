import { About } from "@/components/About";
import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { PortfolioFrame } from "@/components/PortfolioFrame";
import { Projects } from "@/components/Projects";
import { ExperienceHighlights } from "@/components/ExperienceHighlights";

export const metadata: Metadata = {
  title: "Sajjad Haider | AI & Full-Stack Developer",
  description:
    "Meet Sajjad Haider, an AI and full-stack developer building practical software products.",
};

export default function Home() {
  return (
    <PortfolioFrame>
      <Hero />
      <About />
      <Projects limit={3} />
      <ExperienceHighlights limit={1} />
    </PortfolioFrame>
  );
}

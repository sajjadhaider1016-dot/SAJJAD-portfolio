import { About } from "@/components/About";
import { Achievements } from "@/components/Achievements";
import { Contact } from "@/components/Contact";
import { Education } from "@/components/Education";
import { ExperienceHighlights } from "@/components/ExperienceHighlights";
import { Exploring } from "@/components/Exploring";
import { GitHubShowcase } from "@/components/GitHubShowcase";
import type { Metadata } from "next";
import { Leadership } from "@/components/Leadership";
import { Hero } from "@/components/Hero";
import { PortfolioFrame } from "@/components/PortfolioFrame";
import { Projects } from "@/components/Projects";
import { Services } from "@/components/Services";
import { Skills } from "@/components/Skills";
import { WhatIBuild } from "@/components/WhatIBuild";

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
      <Projects />
      <Education />
      <Achievements />
      <Leadership />
      <Skills />
      <Services />
      <WhatIBuild />
      <ExperienceHighlights />
      <GitHubShowcase />
      <Exploring />
      <Contact />
    </PortfolioFrame>
  );
}

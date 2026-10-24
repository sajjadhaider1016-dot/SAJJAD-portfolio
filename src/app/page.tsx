import { About } from "@/components/About";
import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { PortfolioFrame } from "@/components/PortfolioFrame";
import { Projects } from "@/components/Projects";
import { ExperienceHighlights } from "@/components/ExperienceHighlights";
import { Services } from "@/components/Services";
import { Certifications, Skills } from "@/components/Skills";
import { Education } from "@/components/Education";
import { Achievements } from "@/components/Achievements";
import { Leadership } from "@/components/Leadership";
import { Contact } from "@/components/Contact";
import { WhatIBuild } from "@/components/WhatIBuild";
import { GitHubShowcase } from "@/components/GitHubShowcase";
import { Exploring } from "@/components/Exploring";

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
      <Projects featuredSlug="study-buddy" />
      <ExperienceHighlights detailed />
      <Skills />
      <Certifications />
      <Education />
      <Achievements />
      <Services />
      <WhatIBuild />
      <Leadership />
      <GitHubShowcase />
      <Exploring />
      <Contact />
    </PortfolioFrame>
  );
}

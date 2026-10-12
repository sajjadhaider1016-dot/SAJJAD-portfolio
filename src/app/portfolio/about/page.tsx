import type { Metadata } from "next";
import { About } from "@/components/About";
import { Achievements } from "@/components/Achievements";
import { Education } from "@/components/Education";
import { Leadership } from "@/components/Leadership";
import { PortfolioFrame } from "@/components/PortfolioFrame";

export const metadata: Metadata = { title: "About Sajjad", description: "Background, education, and experience of Sajjad Haider." };

export default function AboutPage() {
  return <PortfolioFrame><About showMoreLink={false} /><Education /><Achievements /><Leadership /></PortfolioFrame>;
}

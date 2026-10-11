import type { Metadata } from "next";
import { PortfolioFrame } from "@/components/PortfolioFrame";
import { Services } from "@/components/Services";
import { WhatIBuild } from "@/components/WhatIBuild";

export const metadata: Metadata = { title: "Services", description: "AI, automation, and full-stack development services by Sajjad Haider." };

export default function ServicesPage() {
  return <PortfolioFrame><Services /><WhatIBuild /></PortfolioFrame>;
}

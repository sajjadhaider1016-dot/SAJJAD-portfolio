import type { Metadata } from "next";
import { Contact } from "@/components/Contact";
import { PortfolioFrame } from "@/components/PortfolioFrame";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with Sajjad Haider about opportunities and projects." };

export default function ContactPage() {
  return <PortfolioFrame><Contact /></PortfolioFrame>;
}

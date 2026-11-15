import PortfolioExperience from "@/components/PortfolioExperience";
import { sections, type SectionId } from "@/data/portfolio";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.map(({ id }) => ({ destination: id }));
}

export default async function DestinationPage({ params }: PageProps<"/[destination]">) {
  const { destination } = await params;
  const section = sections.find(({ id }) => id === destination);

  if (!section) notFound();

  return <PortfolioExperience initialSection={section.id as SectionId} />;
}

import PortfolioExperience from "@/components/PortfolioExperience";
import { links, projects } from "@/data/portfolio";

export default function HomePage() {
  const bzuAssistant = projects.find((project) => project.id === "bzu-ai-assistant");
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Sajjad Haider",
      url: "https://sajjad-haider-portfolio.vercel.app/",
      image: "https://sajjad-haider-portfolio.vercel.app/identity/sajjad-haider.jpg",
      jobTitle: "AI Engineer and Full-Stack Developer",
      email: `mailto:${links.email}`,
      sameAs: [links.githubProfile, links.linkedin],
      knowsAbout: ["Artificial intelligence", "Full-stack development", "AI applications", "Workflow automation"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Sajjad Haider Portfolio",
      url: "https://sajjad-haider-portfolio.vercel.app/",
      description: "Portfolio of Sajjad Haider, AI Engineer and Full-Stack Developer.",
      author: { "@type": "Person", name: "Sajjad Haider" },
    },
    ...(bzuAssistant ? [{
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: bzuAssistant.title,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description: bzuAssistant.description,
      url: bzuAssistant.live,
      codeRepository: bzuAssistant.github,
      author: { "@type": "Person", name: "Sajjad Haider" },
    }] : []),
  ];

  return <>
    {jsonLd.map((item) => <script key={item["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }} />)}
    <PortfolioExperience />
  </>;
}

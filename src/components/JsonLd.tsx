import { site } from "@/data/site";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.title,
    description: site.seoDescription,
    url: site.url,
    email: site.email,
    image: `${site.url}${site.profileImage}`,
    sameAs: [site.github, site.linkedin],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Bahauddin Zakariya University",
    },
    knowsAbout: [
      "Artificial Intelligence",
      "Full-Stack Development",
      "Machine Learning",
      "Python",
      "AI Agents",
      "Automation",
      "Prompt Engineering",
      "Digital Marketing",
      "Next.js",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

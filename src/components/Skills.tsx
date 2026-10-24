import { skillGroups } from "@/data/skills";
import { certifications } from "@/data/certifications";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Skills"
          title="A practical full-stack and AI toolkit."
          description="Organized by how products actually ship — frontend, backend, data, intelligence, and delivery."
        />
      </Reveal>
      <div className="skill-groups mt-12 border-t border-border">
        {skillGroups.map((group, i) => (
          <Reveal key={group.id} delay={i * 60}>
            <article className="skill-group-row grid gap-4 border-b border-border py-6 sm:grid-cols-[0.65fr_1.35fr] sm:gap-8 sm:py-8">
              <div><h3 className="font-display text-lg font-semibold">{group.title}</h3><p className="mt-1 max-w-sm text-sm text-muted">{group.description}</p></div>
              <div className="flex flex-wrap content-center gap-x-4 gap-y-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="skill-word py-1 text-xs text-muted transition-colors hover:text-accent sm:text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Certifications() {
  return (
      <section id="certifications" className="mx-auto mt-8 max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Certifications"
            title="Credentials and continued learning."
            description="A dated, issuer-labeled record of completed courses and certificates."
          />
        </Reveal>
        <div className="certification-list mt-10 border-t border-border">
          {certifications.map((certification, i) => (
            <Reveal key={certification.credentialId} delay={i * 35}>
              <article className="certification-row grid gap-2 border-b border-border py-5 sm:grid-cols-[0.4fr_1fr_0.6fr] sm:items-center sm:gap-6">
                <p className="text-[10px] font-semibold tracking-wide text-accent uppercase">{certification.issuer}</p>
                <h3 className="font-display text-sm font-semibold leading-6 sm:text-base">{certification.name}</h3>
                <p className="text-xs text-muted sm:text-right">{certification.issued} <span className="hidden sm:inline">· {certification.credentialId}</span></p>
                <p className="break-all text-[10px] text-muted sm:hidden">Credential ID: {certification.credentialId}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
  );
}

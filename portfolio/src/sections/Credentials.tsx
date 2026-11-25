// The sections between About and the playable portfolio. Each is a heading on the sky over a glass sheet.
import type { ReactNode } from 'react';
import { AchievementList, EducationList, ExperienceList } from '../components/Records';
import { Kinetic } from '../components/Kinetic';
import { TLink, useTransitionNavigate } from '../components/TransitionLink';
import { certifications, headings, projectBySlug, services, skills } from '../data/content';

type HeadingKey = keyof typeof headings;
function Section({ id, name, children }: { id: HeadingKey; name: string; children: ReactNode }) {
  const h = headings[id];
  const lead = h.soft ? h.title.replace(h.soft, '').trim() : h.title;
  return (
    <section className="container band" id={id} data-nav={id}>
      <p className="caption band__eyebrow on-sky-2" data-rv="">{name}</p>
      <Kinetic className="display-l band__title on-sky" text={lead} soft={h.soft} />
      <div className="sheet glass" data-sheet="">
        {h.lead && <p className="body-l sheet__lead">{h.lead}</p>}
        {children}
      </div>
    </section>
  );
}

export const Experience = () => <Section id="experience" name="Experience"><ExperienceList /></Section>;
export const Education = () => <Section id="education" name="Education"><EducationList /></Section>;
export const Achievements = () => <Section id="achievements" name="Achievements"><AchievementList /></Section>;

export function Skills() {
  return (
    <Section id="skills" name="Technical skills">
      <ul className="tiles tiles--2">
        {skills.map((g) => (
          <li key={g.name} data-rv="">
            <h3>{g.name}</h3>
            <p>{g.description}</p>
            <ul className="chips chips--small">{g.items.map((s) => <li key={s}>{s}</li>)}</ul>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Services() {
  const go = useTransitionNavigate();
  // "Ask about …" fills in the contact form's subject and takes you to it
  const ask = (name: string) => { dispatchEvent(new CustomEvent('contact:subject', { detail: name })); go('/#contact'); };
  return (
    <Section id="services" name="Services">
      <ol className="services">
        {services.map((s, i) => (
          <li key={s.name} data-rv="">
            <span className="tiles__index">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="xp__role">{s.name}</h3>
              <p>{s.description}</p>
              <dl className="facts">
                <div><dt>Deliverable</dt><dd>{s.deliverable}</dd></div>
                <div><dt>Useful for</dt><dd>{s.usefulFor}</dd></div>
                <div><dt>Related work</dt><dd>{s.related.map((slug, k) => <span key={slug}>{k > 0 && ', '}<TLink to={`/projects/${slug}`}>{projectBySlug(slug)?.title}</TLink></span>)}</dd></div>
              </dl>
              <ul className="chips chips--small">{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              <button className="btn btn--ink services__ask" type="button" onClick={() => ask(s.name)}>{s.enquiry} →</button>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Certifications() {
  const providers = [...new Set(certifications.map((c) => c.provider))];
  return (
    <Section id="certifications" name="Certifications">
      {providers.map((provider) => (
        <div className="block" key={provider}>
          <p className="caption">{provider}</p>
          <ul className="tiles tiles--2">
            {certifications.filter((c) => c.provider === provider).map((c) => (
              <li key={c.credentialId} data-rv="" className="cert">
                <span className="cert__seal" aria-hidden="true">{provider[0]}</span>
                <div>
                  <p className="caption">{c.provider} · {c.date}</p>
                  <h3>{c.title}</h3>
                  {c.credentialId && <p className="cert__id">Credential ID: {c.credentialId}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  );
}

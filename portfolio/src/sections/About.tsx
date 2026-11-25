import { GitHubShowcase } from '../components/GitHubShowcase';
import { Kinetic } from '../components/Kinetic';
import { TLink } from '../components/TransitionLink';
import { profile } from '../data/content';

export function Portrait() {
  return <div className="portrait"><img src={profile.portrait} alt={`Portrait of ${profile.name}`} width={720} height={1280} loading="lazy" /></div>;
}

export function SocialLinks({ className = 'plinks' }: { className?: string }) {
  return (
    <ul className={className}>
      <li><a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a></li>
      <li><a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
      <li><a href={`mailto:${profile.email}`}>Email</a></li>
      <li><a href={profile.links.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></li>
    </ul>
  );
}

export function AboutText() {
  return (
    <>
      <p className="body-l about__lead" data-rv="">{profile.about.lead}</p>
      <p className="about__p" data-rv="">{profile.about.body}</p>
      {profile.about.sections.map((s) => (
        <div className="block" data-rv="" key={s.title}>
          <h3 className="xp__role">{s.title}</h3>
          {s.paragraphs.map((t) => <p className="about__p" key={t}>{t}</p>)}
        </div>
      ))}
    </>
  );
}

export function About() {
  return (
    <section className="container band" id="about" data-nav="about">
      <Kinetic className="display-l band__title on-sky" text="About me" />
      <div className="sheet glass about" data-sheet="">
        <div className="about__photo" data-rv=""><Portrait /></div>
        <div>
          <p className="body-l about__lead" data-rv="">{profile.intro}</p>
          <div className="block" data-rv="">
            <p className="caption">{profile.role} · {profile.location}</p>
            <p className="availability"><i aria-hidden="true" />{profile.availability}</p>
            <ul className="chips">{profile.capabilities.map((c) => <li key={c}>{c}</li>)}</ul>
            <SocialLinks />
          </div>
          <div className="block"><AboutText /></div>
          <GitHubShowcase />
          <div data-rv=""><TLink className="btn btn--ink about__more" to="/about-me">More about me</TLink></div>
        </div>
      </div>
    </section>
  );
}

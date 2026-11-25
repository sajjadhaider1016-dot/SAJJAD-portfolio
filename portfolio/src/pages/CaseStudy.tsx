import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Kinetic } from '../components/Kinetic';
import { ProjectArt, ProjectLinks } from '../components/ProjectArt';
import { TLink } from '../components/TransitionLink';
import { projects, type Showcase } from '../data/content';
import { Contact } from '../sections/Contact';
import { NotFound } from './NotFound';

function Part({ tag, title, children }: { tag: string; title: string; children?: ReactNode }) {
  return (
    <section className="container cs-sec">
      <p className="caption" data-rv="">{tag}</p>
      <Kinetic className="display-m" text={title} />
      {children}
    </section>
  );
}
const List = ({ items }: { items: string[] }) => <ol className="cs-list" data-rv="">{items.map((t) => <li key={t}>{t}</li>)}</ol>;

function ShowcasePart({ s }: { s: Showcase }) {
  return (
    <Part tag={s.label} title={s.title}>
      <p data-rv="">{s.text}</p>
      {s.points.length > 0 && <List items={s.points} />}
      {s.steps.length > 0 && <><p className="caption" data-rv="">Workflow</p><List items={s.steps} /></>}
      {s.features.length > 0 && <><h3 className="xp__role" data-rv="">Features</h3><ul className="bullets" data-rv="">{s.features.map((t) => <li key={t}>{t}</li>)}</ul></>}
      {s.contribution && <><h3 className="xp__role" data-rv="">My contribution</h3><p data-rv="">{s.contribution}</p></>}
      {s.link && <p data-rv=""><a className="btn btn--ink" href={s.link.url} target="_blank" rel="noopener noreferrer">{s.link.label} ↗</a></p>}
    </Part>
  );
}

export function CaseStudy() {
  const { slug } = useParams();
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) return <NotFound />;
  const p = projects[i], next = projects[(i + 1) % projects.length];
  const live = p.showcase.find((s) => s.link)?.link?.url;
  return (
    <>
      <main id="main" className="cs">
        <header className="container cs-hero">
          <TLink className="cs-back" to="/#work" data-rv="">← Back to Work</TLink>
          <div className="cs-hero__grid">
            <div>
              <p className="caption" data-rv="">{p.category} · {p.kind}</p>
              <Kinetic as="h1" className="display-l" text={p.title} />
            </div>
            <div data-rv="">
              <p className="caption">{p.cardMeta}</p>
              {p.tags.length > 0 && <ul className="chips chips--small">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>}
              <ProjectLinks project={p} className="plinks plinks--buttons" />
            </div>
          </div>
          <figure data-rv="">
            <div className="panel">{p.image ? <img src={p.image} alt={`${p.title} project interface`} /> : <ProjectArt project={p} />}</div>
            <figcaption className="caption">{p.image ? 'Project screenshot' : p.coverNote || 'Artwork built from the project’s listed details, not a screenshot.'}</figcaption>
          </figure>
        </header>

        <Part tag="Overview" title="About the project"><p className="body-l" data-rv="">{p.description}</p></Part>

        {live && (
          <Part tag="Live website preview" title="See it live">
            <div className="panel panel--frame" data-rv=""><iframe src={live} title={`${p.title} live website`} loading="lazy" sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" /></div>
            <p className="caption" data-rv="">If the preview stays blank, <a href={live} target="_blank" rel="noopener noreferrer">visit the live website ↗</a></p>
          </Part>
        )}
        {p.showcase.map((s) => <ShowcasePart key={s.label} s={s} />)}
        {p.flow.length > 0 && <Part tag="Workflow" title="How it flows"><List items={p.flow} /></Part>}
        {p.features.length > 0 && <Part tag="Features" title="What it includes"><List items={p.features} /></Part>}
        {p.contribution && <Part tag="Role" title="My contribution"><p className="body-l" data-rv="">{p.contribution}</p></Part>}

        <section className="container cs-sec">
          <TLink className="cs-next" to={`/projects/${next.slug}`} data-rv=""><span className="caption">Next project</span><b className="display-m">{next.title} →</b></TLink>
        </section>
      </main>
      <Contact />
    </>
  );
}

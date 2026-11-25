import { useEffect, useRef, useState } from 'react';
import { botSvg } from '../animations/pixelBot';
import { Kinetic } from '../components/Kinetic';
import { ProjectArt, ProjectLinks } from '../components/ProjectArt';
import { TLink } from '../components/TransitionLink';
import { CATEGORIES, GROUPS, headings, inCategory, projects, type Project } from '../data/content';

function Card({ p, dock, fresh }: { p: Project; dock?: number; fresh: boolean }) {
  return (
    // cards that appear after a filter change skip the scroll reveal, which has already run
    <article className="card" id={`project-${p.slug}`} {...(fresh ? { className: 'card card--fresh' } : { 'data-rv': '' })}>
      <TLink className="card__link" to={`/projects/${p.slug}`} data-tip="View project details">
        <div className="card__media" data-dock-target={dock}>
          <ProjectArt project={p} />
          <p className="card__over" aria-hidden="true">{p.description}</p>
        </div>
        <div className="card__text">
          <h4 className="card__title">{p.title}</h4>
          <p className="caption">{p.category} · {p.kind}</p>
          <p className="card__desc">{p.description}</p>
        </div>
      </TLink>
      {p.tags.length > 0 && <ul className="chips chips--small">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>}
      {p.coverNote && <p className="caption card__note">{p.coverNote}</p>}
      <ProjectLinks project={p} />
    </article>
  );
}

export function Work() {
  const [filter, setFilter] = useState('All');
  const [touched, setTouched] = useState(false);
  const filterRef = useRef(filter); filterRef.current = filter;
  // back at the top of the page the full list returns, so the hero deck has its slots again
  useEffect(() => {
    const onScroll = () => { if (filterRef.current !== 'All' && scrollY < innerHeight * 0.3) setFilter('All'); };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { window.__lenis?.resize(); }, [filter]);
  const shown = projects.filter((p) => inCategory(p, filter));
  const choose = (c: string) => { setTouched(true); setFilter(c); };

  return (
    <section className="container band band--first" id="work" data-nav="work">
      <Kinetic className="display-l band__title on-sky" text="My work" />
      <div className="sheet glass" data-sheet="">
        <img className="sheet__peek" src={botSvg(11)} alt="" />
        <div className="work__head">
          <p className="caption">Projects · {projects.length}</p>
          <p className="body-l">{headings.projects.title} {headings.projects.lead}</p>
          <div className="filter-row" role="group" aria-label="Filter projects by category">
            {CATEGORIES.map((c) => <button key={c} type="button" aria-pressed={filter === c} onClick={() => choose(c)}>{c}</button>)}
          </div>
          <p className="caption" role="status">Showing {shown.length} of {projects.length} projects</p>
        </div>
        {GROUPS.map((group) => {
          const list = shown.filter((p) => p.group === group);
          if (!list.length) return null;
          return (
            <div className="work__group" key={group}>
              <h3 className="work__grouptitle">{group}<small>{String(list.length).padStart(2, '0')} {list.length === 1 ? 'project' : 'projects'}</small></h3>
              <div className="grid-2">
                {list.map((p) => {
                  const i = projects.indexOf(p);
                  return <Card key={p.slug} p={p} fresh={touched} dock={filter === 'All' && i < 4 ? i : undefined} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

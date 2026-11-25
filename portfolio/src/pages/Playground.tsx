import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Kinetic } from '../components/Kinetic';
import { ProjectArt, ProjectLinks } from '../components/ProjectArt';
import { TLink } from '../components/TransitionLink';
import { CATEGORIES, hueOf, inCategory, projects, type Project } from '../data/content';

const STEP = 62;

/** An endless row of tape spines. The one in the middle turns to show its cover; picking it opens the case. */
export function Playground() {
  const [filter, setFilter] = useState('All');
  const list = projects.filter((p) => inCategory(p, filter));
  const [pos, setPos] = useState(0);
  const [openTape, setOpen] = useState<Project | null>(null);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  const wheel = useRef(0), shelf = useRef<HTMLDivElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const n = list.length, centre = ((Math.round(pos) % n) + n) % n;
  const move = useCallback((d: number) => setPos((p) => Math.round(p) + d), []);

  useEffect(() => {
    const el = shelf.current!;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) && !e.shiftKey) return; // vertical wheel keeps scrolling the page
      e.preventDefault(); wheel.current += e.deltaX || e.deltaY;
      if (Math.abs(wheel.current) > 50) { move(Math.sign(wheel.current)); wheel.current = 0; }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [move]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (openTape || (e.target as HTMLElement).closest('input, textarea')) return;
      if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1);
    };
    addEventListener('keydown', key); return () => removeEventListener('keydown', key);
  }, [move, openTape]);
  useEffect(() => { const d = dialog.current!; if (openTape && !d.open) d.showModal(); if (!openTape && d.open) d.close(); }, [openTape]);

  const down = (e: RPointerEvent) => { drag.current = { x: e.clientX, start: pos, moved: false }; };
  const drift = (e: RPointerEvent) => {
    const d = drag.current; if (!d || !e.buttons) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6 && !d.moved) { d.moved = true; shelf.current!.setPointerCapture(e.pointerId); }
    if (d.moved) setPos(d.start - dx / STEP);
  };
  const release = () => { if (drag.current?.moved) setPos((p) => Math.round(p)); setTimeout(() => (drag.current = null), 0); };

  // enough copies to fill any width, each placed relative to the middle
  const visible = Array.from({ length: 31 }, (_, i) => { const at = Math.round(pos) + i - 15; return { at, tape: list[((at % n) + n) % n] }; });

  return (
    <main id="main" className="play-page">
      <div className="container play-page__head">
        <p className="caption on-sky-2" data-rv="">Playground</p>
        <Kinetic as="h1" className="display-l on-sky" text="Projects, experiments and the things I build." soft="Pick a tape." />
        <div data-rv=""><TLink className="btn btn--ink" to="/play">Play Signal Isles</TLink></div>
        <div className="filters" role="group" aria-label="Filter tapes" data-rv="">
          {CATEGORIES.map((f) => <button key={f} type="button" className="float" aria-pressed={filter === f} onClick={() => { setFilter(f); setPos(0); }}>{f}</button>)}
        </div>
      </div>
      <div className="shelf" ref={shelf} onPointerDown={down} onPointerMove={drift} onPointerUp={release} onPointerCancel={release}>
        {visible.map(({ at, tape }) => {
          const off = at - pos, mid = at === Math.round(pos);
          const x = off * STEP + Math.sign(off) * Math.min(1, Math.abs(off)) * 74;
          return (
            <button key={`${filter}-${at}`} type="button" className={`tape${mid ? ' is-center' : ''}`} tabIndex={mid ? 0 : -1} aria-hidden={!mid}
              style={{ transform: `translateX(${x}px)`, ['--hue' as string]: hueOf(tape) }} aria-label={`${tape.title}, ${tape.category}`}
              onClick={() => { if (drag.current?.moved) return; if (mid) setOpen(tape); else setPos(at); }}>
              <span className="tape__spine"><i /><b>{tape.title}</b><small>{String(projects.indexOf(tape) + 1).padStart(2, '0')}</small></span>
              <span className="tape__cover"><small>SH VIDEO</small><span className="tape__art" /><b>{tape.title}</b><em>{tape.category}</em></span>
            </button>
          );
        })}
      </div>
      <div className="shelf__nav">
        <button type="button" className="float" onClick={() => move(-1)} aria-label="Previous tape">←</button>
        <p className="float" aria-live="polite">{list[centre].title}</p>
        <button type="button" className="float" onClick={() => move(1)} aria-label="Next tape">→</button>
      </div>

      <dialog ref={dialog} className="tapeview" onClose={() => setOpen(null)} onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }} style={{ ['--hue' as string]: openTape ? hueOf(openTape) : undefined }} data-lenis-prevent="">
        {openTape && (
          <div className="tapeview__in">
            <div className="tapeview__text">
              <p className="caption">{openTape.category} · {openTape.kind}</p>
              <h2 className="display-m">{openTape.title}</h2>
              <p>{openTape.description}</p>
              <ProjectLinks project={openTape} />
              <div>
                <TLink className="btn btn--ink" to={`/projects/${openTape.slug}`}>Open project</TLink>
                <button className="btn tapeview__close" type="button" onClick={() => setOpen(null)}>Close</button>
              </div>
            </div>
            <div className="clam">
              <div className="clam__tray">
                <div className="cassette"><span className="reel" /><span className="reel" /><b>{openTape.title}</b></div>
              </div>
              <div className="clam__lid"><ProjectArt key={openTape.slug} project={openTape} /></div>
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}

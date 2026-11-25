import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { clamp, reducedMotion } from '../animations/util';
import { profile, SECTIONS } from '../data/content';
import { RadioControl } from './RadioControl';
import { TLink } from './TransitionLink';

/** Which tab should be lit: from the route, or on the home page from the section in the middle of the screen. */
function useActiveKey() {
  const { pathname } = useLocation();
  const [section, setSection] = useState('home');
  useEffect(() => {
    if (pathname !== '/') return;
    const update = () => {
      let key = scrollY < innerHeight * 0.5 ? 'home' : '';
      document.querySelectorAll<HTMLElement>('[data-nav]').forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top < innerHeight / 2 && r.bottom > innerHeight / 2) key = s.dataset.nav!;
      });
      setSection(key);
    };
    update(); addEventListener('scroll', update, { passive: true });
    return () => removeEventListener('scroll', update);
  }, [pathname]);
  if (pathname === '/') return section;
  if (pathname.startsWith('/projects')) return 'work';
  if (pathname === '/playground') return 'playground';
  return pathname === '/about-me' ? 'about' : '';
}

export function Dock() {
  const active = useActiveKey();
  const [hover, setHover] = useState<string | null>(null);
  const nav = useRef<HTMLElement>(null), pill = useRef<HTMLSpanElement>(null), edges = useRef<[number, number] | null>(null), raf = useRef(0);
  const [menu, setMenu] = useState(false);
  const menuBox = useRef<HTMLDivElement>(null);
  const { pathname, hash } = useLocation();
  useEffect(() => setMenu(false), [pathname, hash]);
  useEffect(() => {
    const outside = (e: PointerEvent) => { if (!menuBox.current?.contains(e.target as Node) && !(e.target as Element).closest('[data-key="more"]')) setMenu(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    addEventListener('pointerdown', outside); addEventListener('keydown', esc);
    return () => { removeEventListener('pointerdown', outside); removeEventListener('keydown', esc); };
  }, []);
  // sections without a tab of their own light up "More"
  const tab = ['', 'home', 'work', 'playground', 'about'].includes(active) ? active : 'more';
  const lit = hover ?? tab;

  // The pill moves by its two edges: the leading one first, the trailing one after with overshoot, on a 4px grid.
  useLayoutEffect(() => {
    const el = pill.current!, item = nav.current!.querySelector<HTMLElement>(`[data-key="${lit}"]`);
    cancelAnimationFrame(raf.current);
    if (!item) { el.style.opacity = '0'; return; }
    el.style.opacity = '1';
    const L = item.offsetLeft, R = L + item.offsetWidth;
    const draw = (l: number, r: number) => {
      edges.current = [l, r];
      const snap = (v: number) => Math.round(v / 4) * 4;
      el.style.left = `${snap(l)}px`; el.style.width = `${Math.max(4, snap(r) - snap(l))}px`;
    };
    if (!edges.current || reducedMotion()) { draw(L, R); return; }
    const [l0, r0] = edges.current, right = L > l0, t0 = performance.now();
    let lastStep = -1;
    const frame = (now: number) => {
      const t = now - t0, step = Math.floor(t / 60);
      const lead = 1 - Math.pow(1 - clamp(t / 260), 3);
      const u = clamp((t - 110) / 520) - 1, trail = t < 110 ? 0 : 1 + 2.6 * u * u * u + 1.6 * u * u;
      if (step !== lastStep) {
        lastStep = step;
        const l = l0 + (L - l0) * (right ? trail : lead), r = r0 + (R - r0) * (right ? lead : trail);
        draw(Math.min(l, r - 4), r);
      }
      if (t < 630) raf.current = requestAnimationFrame(frame); else draw(L, R);
    };
    raf.current = requestAnimationFrame(frame);
  }, [lit]);

  const props = (key: string) => ({ 'data-key': key, className: `nav__item${lit === key ? ' is-lit' : ''}`, onPointerEnter: () => setHover(key), 'aria-current': active === key ? ('page' as const) : undefined });
  const toTop = () => { if (location.pathname === '/') window.__lenis ? window.__lenis.scrollTo(0) : scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="dock">
      <nav className="nav float" aria-label="Primary" ref={nav} onPointerLeave={() => setHover(null)}>
        <span className="nav__pill" ref={pill} aria-hidden="true" />
        <TLink to="/" {...props('home')} className={`nav__item nav__home${lit === 'home' ? ' is-lit' : ''}`} onClick={toTop} aria-label={`${profile.name}, home`}><span className="nav__mark">{profile.initials}</span></TLink>
        <TLink to="/#work" {...props('work')}>Work</TLink>
        <TLink to="/playground" {...props('playground')}>Play<span className="nav__long">ground</span></TLink>
        <TLink to="/about-me" {...props('about')}>About</TLink>
        <button type="button" {...props('resume')} onClick={() => dispatchEvent(new Event('cv:open'))}>Resume</button>
        <button type="button" {...props('more')} aria-expanded={menu} aria-controls="section-menu" onClick={() => setMenu(!menu)}>More</button>
      </nav>
      <div className={`sections-menu${menu ? ' is-open' : ''}`} id="section-menu" ref={menuBox}>
        <ul>
          {SECTIONS.map(([id, label]) => <li key={id}><TLink to={`/#${id}`} aria-current={active === id ? 'true' : undefined} onClick={() => setMenu(false)}>{label}</TLink></li>)}
          <li><TLink to="/playground" onClick={() => setMenu(false)}>Playground</TLink></li>
          <li><TLink to="/play" onClick={() => setMenu(false)}>3D world</TLink></li>
        </ul>
      </div>
      <RadioControl />
    </div>
  );
}

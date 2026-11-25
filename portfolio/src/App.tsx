import Lenis from 'lenis';
import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { mountSky } from './animations/sky';
import { reducedMotion } from './animations/util';
import { Buddy } from './components/Buddy';
import { CursorTip } from './components/CursorTip';
import { CvDrawer } from './components/CvDrawer';
import { Dock } from './components/Dock';
import { radio } from './audio/radio';
import { profile, projects } from './data/content';
import { useReveal } from './hooks/useReveal';
import { AboutPage } from './pages/AboutPage';
import { CaseStudy } from './pages/CaseStudy';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Playground } from './pages/Playground';

const Play = lazy(() => import('./pages/Play').then((m) => ({ default: m.Play })));

declare global { interface Window { __lenis?: Lenis | null; __radio?: typeof radio } }

export function App() {
  const { pathname, hash, key } = useLocation();
  const canvas = useRef<HTMLCanvasElement>(null);
  const page = useRef({ start: 0, halftone: false });
  page.current = { start: pathname === '/playground' ? 0.22 : 0, halftone: pathname === '/playground' };
  const isCase = pathname.startsWith('/projects'), isGame = pathname === '/play';

  useEffect(() => mountSky(canvas.current!, () => page.current), []);
  useEffect(() => { if (import.meta.env.DEV) window.__radio = radio; }, []);
  // Smooth scrolling everywhere except the reading pages and the game.
  useEffect(() => {
    if (isCase || isGame || reducedMotion()) return;
    const lenis = new Lenis({ autoRaf: true, allowNestedScroll: true });
    window.__lenis = lenis;
    return () => { lenis.destroy(); window.__lenis = null; };
  }, [isCase, isGame]);
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('cs-page', isCase);
    if (isCase) document.documentElement.classList.remove('is-dark');
  });
  useLayoutEffect(() => {
    if (!hash) { window.__lenis?.scrollTo(0, { immediate: true, force: true }); scrollTo(0, 0); }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      // links shared from the previous site used #section-… and #project-… anchors
      const old: Record<string, string> = { 'section-projects': 'work', 'section-home': 'main' };
      const el = document.getElementById(old[hash.slice(1)] ?? hash.slice(1).replace(/^section-/, ''));
      if (!el) return;
      if (window.__lenis) { window.__lenis.resize(); window.__lenis.scrollTo(el); } else el.scrollIntoView();
    }, 60);
    return () => clearTimeout(t);
  }, [hash, key]);
  useEffect(() => {
    const p = projects.find((x) => pathname === `/projects/${x.slug}`);
    const name = p?.title ?? ({ '/about-me': 'About', '/playground': 'Playground', '/play': 'Signal Isles' } as Record<string, string>)[pathname];
    document.title = name ? `${name} — ${profile.name}` : `${profile.name} — ${profile.role}`;
  }, [pathname]);
  useReveal(pathname);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <canvas className="sky" ref={canvas} aria-hidden="true" />
      <Routes key={pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about-me" element={<AboutPage />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/projects/:slug" element={<CaseStudy />} />
        <Route path="/play" element={<Suspense fallback={<main className="notfound">Loading Signal Isles…</main>}><Play /></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isGame && <><Dock /><CvDrawer /><Buddy /></>}
      <CursorTip />
    </>
  );
}

import { useEffect, useRef } from 'react';
import { ART_H, ART_W, drawProject, loadImage, START_TIME } from '../animations/projectArt';
import { reducedMotion } from '../animations/util';
import type { Project } from '../data/content';

/** A project's preview. Artwork animates only while on screen, and waits on the start frame while the hero deck flies. */
export function ProjectArt({ project, label }: { project: Project; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!, g = cv.getContext('2d')!;
    let raf = 0, t = START_TIME, last = 0;
    const draw = () => drawProject(g, project, t);
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      if (cv.closest('[data-dock-target]') && document.documentElement.classList.contains('deck-flying')) t = START_TIME; else t += dt;
      draw(); raf = requestAnimationFrame(tick);
    };
    draw(); document.fonts.ready.then(draw);
    if (project.image) { loadImage(project.image, draw); return; }
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf); last = 0;
      if (e.isIntersecting && !reducedMotion()) raf = requestAnimationFrame(tick);
    }, { threshold: 0.1 });
    io.observe(cv);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [project]);
  return <canvas ref={ref} className="media" width={ART_W} height={ART_H} role="img" aria-label={label ?? (project.image ? `${project.title} project interface` : `${project.title}: illustration`)} />;
}

export function ProjectLinks({ project, className = 'plinks' }: { project: Project; className?: string }) {
  if (!project.links.length) return null;
  return (
    <ul className={className}>
      {project.links.map((l) => (
        <li key={l.url}>
          {l.url.startsWith('/')
            ? <a href={l.url} download>{l.label} ↓</a>
            : <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>}
        </li>
      ))}
    </ul>
  );
}

import { useEffect, useRef } from 'react';
import { reducedMotion } from '../animations/util';

/** Over anything with data-tip, a short line trails the pointer and types itself out. Mouse only. */
export function CursorTip() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const tip = ref.current!;
    let x = 0, y = 0, tx = 0, ty = 0, lx = 0, ly = 0, raf = 0, typing = 0, current: Element | null = null;
    const aim = () => { tx = Math.min(lx + 16, innerWidth - tip.offsetWidth - 12); ty = Math.min(ly + 20, innerHeight - tip.offsetHeight - 12); };
    const loop = () => {
      x += (tx - x) * 0.25; y += (ty - y) * 0.25; tip.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const hide = () => { current = null; clearInterval(typing); tip.classList.remove('is-on', 'is-typing'); };
    const type = (s: string) => {
      clearInterval(typing);
      if (reducedMotion()) { tip.textContent = s; return; }
      let i = 0; tip.textContent = ''; tip.classList.add('is-typing');
      typing = window.setInterval(() => { tip.textContent = s.slice(0, ++i); aim(); kick(); if (i >= s.length) { clearInterval(typing); tip.classList.remove('is-typing'); } }, 32);
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as Element).closest?.('[data-tip]') ?? null;
      if (el === current) return;
      if (!el) { hide(); return; }
      const fresh = !current; current = el; lx = e.clientX; ly = e.clientY;
      type((el as HTMLElement).dataset.tip!); aim();
      if (fresh) { x = tx; y = ty; }
      tip.classList.add('is-on'); kick();
    };
    const move = (e: PointerEvent) => { if (current) { lx = e.clientX; ly = e.clientY; aim(); kick(); } };
    const scroll = () => { if (current && !current.matches(':hover')) hide(); };
    document.addEventListener('pointerover', over); document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('click', hide, true); addEventListener('scroll', scroll, { passive: true });
    return () => { hide(); cancelAnimationFrame(raf); document.removeEventListener('pointerover', over); document.removeEventListener('pointermove', move); document.removeEventListener('click', hide, true); removeEventListener('scroll', scroll); };
  }, []);
  return <div className="tip" ref={ref} aria-hidden="true" />;
}

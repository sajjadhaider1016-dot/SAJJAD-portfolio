import { useEffect } from 'react';

// Masks for the seven dither steps that headings resolve through.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
for (let k = 1; k <= 7; k++) {
  let rects = '';
  BAYER.forEach((m, i) => { if (m < k * 2) rects += `<rect x="${(i % 4) * 3}" y="${((i / 4) | 0) * 3}" width="3" height="3"/>`; });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" shape-rendering="crispEdges">${rects}</svg>`;
  document.documentElement.style.setProperty(`--dz${k}`, `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
}

/** Reveals [data-rv], [data-sheet] and [data-kin] as they arrive, staggered 90ms in reading order. */
export function useReveal(key: string) {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, n) => {
        const el = e.target as HTMLElement;
        el.style.setProperty('--rd', String(Math.min(5, n) * 90 + (el.closest('.hero') ? 700 : 0)));
        el.classList.add('in'); io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-rv], [data-kin], [data-sheet]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
}

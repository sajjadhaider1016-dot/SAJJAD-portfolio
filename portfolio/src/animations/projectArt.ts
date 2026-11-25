// Project media, drawn on an 800x600 canvas so cards, the hero deck and the tape cases share one source.
// Projects with a screenshot show it. The others get animated artwork built only from their own listed details.
import { hueOf, type Project } from '../data/content';

type Ctx = CanvasRenderingContext2D;
export const ART_W = 800, ART_H = 600;
/** The frame the hero deck and a freshly landed card both start from. */
export const START_TIME = 3.1;

const images = new Map<string, HTMLImageElement>();
export function loadImage(src: string, done?: () => void) {
  let im = images.get(src);
  if (!im) { im = new Image(); im.src = src; images.set(src, im); }
  if (done) { if (im.complete && im.naturalWidth) done(); else im.addEventListener('load', done, { once: true }); }
  return im;
}

function box(g: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  if (w <= 0) return;
  g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill();
}
function label(g: Ctx, s: string, x: number, y: number, size: number, color: string, weight = 500, align: CanvasTextAlign = 'left') {
  g.fillStyle = color; g.font = `${weight} ${size}px Geist, system-ui, sans-serif`; g.textAlign = align; g.fillText(s, x, y);
}
/** Draws text on as many lines as it needs and returns the baseline of the last one. */
function wrap(g: Ctx, s: string, x: number, y: number, max: number, size: number, color: string, weight = 500) {
  g.font = `${weight} ${size}px Geist, system-ui, sans-serif`;
  let line = '', at = y;
  for (const word of s.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width > max && line) { label(g, line, x, at, size, color, weight); line = word; at += size * 1.12; } else line = next;
  }
  label(g, line, x, at, size, color, weight);
  return at;
}

/** A title card over a dithered ground, with the project's steps or features lighting up in turn. */
function cover(g: Ctx, p: Project, t: number) {
  const hue = hueOf(p);
  g.fillStyle = hue; g.fillRect(0, 0, ART_W, ART_H);
  const shade = g.createLinearGradient(0, 0, ART_W, ART_H); shade.addColorStop(0, 'rgba(255,255,255,.18)'); shade.addColorStop(1, 'rgba(8,10,28,.55)');
  g.fillStyle = shade; g.fillRect(0, 0, ART_W, ART_H);
  g.fillStyle = 'rgba(255,255,255,.14)';
  for (let y = 0; y < ART_H; y += 14) for (let x = (y / 14) % 2 ? 7 : 0; x < ART_W; x += 14) {
    const wave = Math.sin(x / 120 + y / 90 + t * 0.9);
    if (wave > 0) g.fillRect(x, y, 2 + Math.round(wave * 4), 2 + Math.round(wave * 4));
  }
  label(g, p.category, 56, 76, 20, 'rgba(255,255,255,.82)', 400);
  const end = wrap(g, p.title, 56, 140, 690, 54, '#fff', 500);
  const rows = p.flow.length ? p.flow : p.features.slice(0, 4);
  const on = Math.floor((t % (rows.length * 1.4 || 1)) / 1.4);
  const top = Math.max(end + 56, 600 - 40 - rows.length * 74);
  rows.forEach((s, i) => {
    const y = top + i * 74, lit = i === on;
    box(g, 56 - (lit ? 6 : 0), y, 688 + (lit ? 12 : 0), 60, 16, lit ? '#fff' : 'rgba(255,255,255,.16)');
    label(g, String(i + 1).padStart(2, '0'), 82, y + 38, 18, lit ? hue : 'rgba(255,255,255,.7)', 400);
    label(g, s, 134, y + 39, 23, lit ? '#141413' : '#fff', lit ? 500 : 400);
  });
}

export function drawProject(g: Ctx, p: Project, t: number) {
  g.save(); g.textBaseline = 'alphabetic';
  if (p.image) {
    const im = loadImage(p.image);
    g.fillStyle = '#E8EEFC'; g.fillRect(0, 0, ART_W, ART_H);
    if (im.complete && im.naturalWidth) {
      // fill the 4:3 frame, keeping the top of the interface in view
      const s = Math.max(ART_W / im.naturalWidth, ART_H / im.naturalHeight);
      g.drawImage(im, (ART_W - im.naturalWidth * s) / 2, 0, im.naturalWidth * s, im.naturalHeight * s);
    }
  } else cover(g, p, t);
  g.restore();
}

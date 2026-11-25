// Draws a source canvas as Bayer-dithered blocks; as p goes 0 -> 1 the cells halve, then the sharp art opens from the centre.
import { bayer, clamp, easeIO, hexRgb } from './util';

const PAL = ['#4F70D0', '#86A0E4', '#B9C9F0', '#F4F5F8'].map((h) => hexRgb(h).map((v) => Math.round(v * 255)));
const small = document.createElement('canvas');

export function pixelMorph(src: HTMLCanvasElement, out: HTMLCanvasElement, w: number, h: number, p: number, maxCell = 14) {
  if (p >= 0.999 || !w || !src.width) { out.style.visibility = 'hidden'; return; }
  out.style.visibility = '';
  const cell = p < 0.3 ? maxCell : Math.round(maxCell / 2);
  const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  small.width = cols; small.height = rows;
  const s = small.getContext('2d', { willReadFrequently: true })!;
  s.drawImage(src, 0, 0, cols, rows);
  const d = s.getImageData(0, 0, cols, rows).data;
  const lum = (i: number) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  let lo = 255, hi = 0;
  for (let i = 0; i < d.length; i += 4) { const l = lum(i); lo = Math.min(lo, l); hi = Math.max(hi, l); }
  if (out.width !== cols || out.height !== rows) { out.width = cols; out.height = rows; }
  const g = out.getContext('2d')!, img = g.createImageData(cols, rows);
  const wipe = easeIO(clamp((p - 0.45) / 0.55)) * 1.2, far = Math.hypot(cols / 2, rows / 2);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = (y * cols + x) * 4, b = bayer(x, y);
    if (Math.hypot(x + 0.5 - cols / 2, y + 0.5 - rows / 2) / far + b * 0.2 < wipe) continue;
    const v = clamp((lum(i) - lo) / Math.max(1, hi - lo)) * 3;
    const c = PAL[Math.min(3, Math.floor(v) + (v % 1 > b ? 1 : 0))];
    img.data.set([c[0], c[1], c[2], 255], i);
  }
  g.putImageData(img, 0, 0);
}

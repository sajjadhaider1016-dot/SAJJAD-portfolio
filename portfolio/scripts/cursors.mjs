// Draws the pixel cursors. Run: node scripts/cursors.mjs
import { writeFileSync } from 'node:fs';
const art = {
  arrow: ['X','XX','XoX','XooX','XoooX','XooooX','XoooooX','XooooooX','XooooXXXX','XooXX','XoX XX','XX  XoX','X    XX'],
  pointer: ['    XX','   XooX','   XooX','   XooX','   XooXXX','   XooXooXX','XXXXooooooXoX','XoXXooooooooX','XooXoooooooX',' XoooooooooX','  XooooooooX','  XoooooooX','   XooooooX','   XXXXXXXX'],
  text: ['XXX XXX','   X','   X','   X','   X','   X','   X','   X','   X','   X','XXX XXX'],
};
for (const [name, rows] of Object.entries(art)) {
  const w = Math.max(...rows.map((r) => r.length)); let rects = '';
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== ' ') rects += `<rect x="${x * 2}" y="${y * 2}" width="2" height="2" fill="${c === 'X' ? '#141413' : '#EEF2FC'}"/>`; }));
  writeFileSync(`public/cursors/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2}" height="${rows.length * 2}" shape-rendering="crispEdges">${rects}</svg>`);
}

// "Pip", an original pixel robot used by the chat button and peeking over the glass panels.
const BODY = [
  '.......aa.......', '.......kk.......', '...kkkkkkkkkk...', '..kbbbbbbbbbbk..', '.kbbbbbbbbbbbbk.', 'kkbssssssssssbkk', 'kdbsEEssssEEsbdk', 'kdbsEEssssEEsbdk',
  'kkbsssmmmmsssbkk', '.kbssssssssssbk.', '..kbbbbbbbbbbk..', '...kkkkkkkkkk...', '....kdbbbbdk....', '...kdkbaabkdk...', '....kkkkkkkk....', '.....kk..kk.....',
];
const COL: Record<string, string> = { k: '#141a3a', b: '#4f6fe0', d: '#2E54D1', s: '#111530', E: '#8ff0ff', m: '#8ff0ff', a: '#7df0c0' };
export function botSvg(rows = BODY.length, blink = false) {
  let r = '';
  BODY.slice(0, rows).forEach((line, y) => [...line].forEach((c, x) => {
    if (c !== '.') r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${blink && c === 'E' && y === 6 ? COL.s : COL[c]}"/>`;
  }));
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 ${rows}" shape-rendering="crispEdges">${r}</svg>`)}`;
}

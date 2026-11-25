// A single day drawn behind the page: noise clouds, sun, moon and stars, ordered-dithered into four tones on a 3px grid.
import { clamp, easeIO, hexRgb, lerp, reducedMotion } from './util';

const CELL = 3, MAX_DIM = 8;
type Key = [number, string[], number, number, number, number];
const RAW: Key[] = [
  // time, deep -> light, base, horizon gradient, cloud, stars
  [0, ['#93A8E0', '#BDCBEF', '#E0E6F5', '#FFFFFF'], 1.95, 0.55, 0.95, 0],
  [0.3, ['#4F70D0', '#86A0E4', '#B9C9F0', '#F4F5F8'], 1.6, 0.75, 1.2, 0],
  [0.56, ['#5868B4', '#98A3D6', '#E2D2C4', '#F8EADB'], 1.7, 1.0, 1.05, 0],
  [0.76, ['#1D2150', '#5A4886', '#C47A76', '#F3B98C'], 1.05, 1.6, 0.95, 0.2],
  [0.9, ['#0B0D14', '#141A2C', '#243259', '#4B61A6'], 0.72, 0.4, 1.2, 1],
  [1, ['#0B0D14', '#141A2C', '#243259', '#4B61A6'], 0.72, 0.4, 1.2, 1],
];
const KEYS = RAW.map(([t, c, base, grad, cloud, star]) => ({ t, rgb: c.map(hexRgb), base, grad, cloud, star }));

export function toneAt(t: number) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1], f = easeIO(clamp((t - a.t) / (b.t - a.t)));
  return {
    rgb: a.rgb.map((c, j) => c.map((v, k) => lerp(v, b.rgb[j][k], f))),
    base: lerp(a.base, b.base, f), grad: lerp(a.grad, b.grad, f), cloud: lerp(a.cloud, b.cloud, f), star: lerp(a.star, b.star, f),
  };
}
/** Shared with the globe, the dock and the chat so they follow the same time of day. */
export const skyState = { tod: 0, tone: toneAt(0), dark: false };

const FRAG = `precision highp float;
uniform vec2 res, scroll, pointer; uniform float time, light, reveal, count, halftone;
uniform vec4 dims[${MAX_DIM}]; uniform vec3 c0,c1,c2,c3; uniform vec4 shape, sun, moon;
float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1.,0.)),f.x), mix(h(i+vec2(0.,1.)),h(i+1.),f.x), f.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<5;i++){ s+=a*vn(p); p=p*2.02+vec2(9.2,5.7); a*=.5; } return s; }
float b2(vec2 a){ a=floor(a); return fract(a.x/2.+a.y*a.y*.75); }
float b4(vec2 a){ return b2(.5*a)*.25+b2(a); }
void main(){
  vec2 c = gl_FragCoord.xy; vec2 uv = c/res.y;
  vec2 q = uv*1.6 + vec2(time*.01, -scroll.x);
  vec2 warp = vec2(fbm(q*.7+vec2(0.,time*.017)), fbm(q*.7+vec2(3.1,-time*.013)));
  float n = fbm(q+1.3*warp), above = fbm(q+1.3*warp+vec2(0.,.05));
  float cl = smoothstep(.45,.77,n), rim = clamp((n-above)*8.,-1.,1.);
  float haze = smoothstep(.48,.86,fbm(uv+vec2(time*.005,-scroll.y)));
  float base = shape.x - shape.y*(c.y/res.y - .35);
  float sd = length(c-sun.xy)/sun.z;
  float s = sun.w*(step(sd,1.)*2.2 + 1.1*exp(-(sd-1.)*.55)*step(1.,sd));
  float md = length(c-moon.xy)/moon.z, bite = length(c-moon.xy-moon.z*vec2(.42,.18))/moon.z;
  float v = base + haze*.4 + s*(1.-cl*.8) + cl*shape.z + rim*cl*.65;
  float pd = length(c-pointer)/(res.y*.3); v += light*.6*exp(-pd*pd*2.4);
  float dim = 0.;
  for(int i=0;i<${MAX_DIM};i++){ if(float(i)>=count) break; vec4 r=dims[i]; vec2 o=max(max(r.xy-c, c-r.zw),0.); dim=max(dim, 1.-smoothstep(0.,46.,length(o))); }
  v = mix(v, base+haze*.15, dim*.8);
  float k = h(floor(c)+17.);
  v = max(v, step(.9962,k)*(1.-cl)*(1.-dim)*shape.w*(.55+.45*sin(time*1.7+k*80.))*3.4);
  v = max(v, moon.w*step(md,1.)*step(1.,bite)*3.*(1.-cl*.35));
  v = mix(v, 3.3, smoothstep(reveal-40., reveal, length(c-res*vec2(.5,.45))));
  float thr = b4(c);
  if(halftone>.5){ vec2 g = mat2(.7071,-.7071,.7071,.7071)*c/4.; float d=length(fract(g)-.5); thr = mix(clamp(d*d*4.,0.,1.), thr, smoothstep(.15,.7,dim)); }
  v = clamp(v,0.,3.);
  float lv = min(floor(v)+step(thr,fract(v)),3.);
  vec3 col = lv<.5?c0 : lv<1.5?c1 : lv<2.5?c2 : c3;
  if(halftone>.5){ float lo=min(floor(v),2.); vec3 soft = mix(lo<.5?c0:lo<1.5?c1:c2, lo<.5?c1:lo<1.5?c2:c3, v-lo); col = mix(col, soft, .6); }
  gl_FragColor = vec4(col,1.);
}`;

export function createProgram(gl: WebGLRenderingContext, frag: string) {
  const prog = gl.createProgram()!;
  const sources: [number, string][] = [[gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'], [gl.FRAGMENT_SHADER, frag]];
  for (const [type, src] of sources) {
    const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    gl.attachShader(prog, s);
  }
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const cache = new Map<string, WebGLUniformLocation | null>();
  return (name: string) => { if (!cache.has(name)) cache.set(name, gl.getUniformLocation(prog, name)); return cache.get(name)!; };
}

// Day and night values for text and glass, blended as the sky darkens.
const TOKENS: Record<string, [number[], number[]]> = {
  '--on-sky': [[20, 20, 19, 1], [242, 241, 236, 1]], '--on-sky-2': [[87, 86, 79, 1], [169, 173, 190, 1]],
  '--g-bg': [[248, 249, 252, 0.52], [13, 16, 30, 0.5]], '--g-ink': [[20, 20, 19, 1], [242, 241, 236, 1]],
  '--g-ink-2': [[61, 62, 70, 1], [196, 199, 212, 1]], '--g-ink-3': [[92, 94, 105, 1], [172, 178, 198, 1]],
  '--g-rule': [[20, 20, 19, 0.12], [242, 241, 236, 0.14]], '--g-surface': [[255, 255, 255, 0.4], [255, 255, 255, 0.07]],
  '--g-edge': [[255, 255, 255, 0.6], [255, 255, 255, 0.12]], '--g-ink-inv': [[255, 255, 255, 1], [20, 20, 19, 1]],
};

export function mountSky(canvas: HTMLCanvasElement, getPage: () => { start: number; halftone: boolean }) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  const rm = reducedMotion(), root = document.documentElement;
  const u = gl ? createProgram(gl, FRAG) : null;
  let cols = 1, rows = 1, raf = 0, lastF = -1, px = -1e4, py = -1e4, tx = -1e4, ty = -1e4, light = 0, tLight = 0;
  const t0 = performance.now(), dimBuf = new Float32Array(MAX_DIM * 4);
  const resize = () => {
    cols = Math.ceil(innerWidth / CELL); rows = Math.ceil(innerHeight / CELL);
    canvas.width = cols; canvas.height = rows; canvas.style.width = `${cols * CELL}px`; canvas.style.height = `${rows * CELL}px`;
    gl?.viewport(0, 0, cols, rows);
  };
  const move = (e: PointerEvent) => {
    tx = e.clientX / CELL; ty = (innerHeight - e.clientY) / CELL; tLight = 1;
    if (px < -1e3) { px = tx; py = ty; }
  };
  const leave = () => (tLight = 0);
  function frame(now: number) {
    const page = getPage(), vh = innerHeight, district = document.querySelector<HTMLElement>('[data-district]');
    // Scroll sets the time of day; night arrives with the playable section, or at the end of any other page.
    const nightAt = Math.max(1, district ? district.offsetTop - vh * 0.35 : root.scrollHeight - vh);
    const tail = Math.max(1, root.scrollHeight - vh - nightAt);
    skyState.tod = scrollY <= nightAt ? page.start + (0.9 - page.start) * (scrollY / nightAt) : 0.9 + 0.1 * clamp((scrollY - nightAt) / tail);
    const k = (skyState.tone = toneAt(skyState.tod));
    const c = k.rgb[Math.min(3, Math.max(0, Math.round(k.base - 0.2)))];
    const f = Number(clamp((0.6 - (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2])) / 0.05).toFixed(2));
    if (f !== lastF) {
      lastF = f;
      for (const [name, [day, night]] of Object.entries(TOKENS)) {
        const m = day.map((v, i) => lerp(v, night[i], f));
        root.style.setProperty(name, `rgba(${m.slice(0, 3).map(Math.round).join(',')},${m[3].toFixed(3)})`);
      }
      skyState.dark = f > 0.5; root.classList.toggle('is-dark', skyState.dark);
    }
    if (gl && u) {
      px += (tx - px) * 0.07; py += (ty - py) * 0.07; light += (tLight - light) * 0.05;
      let n = 0;
      document.querySelectorAll('[data-dim]').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (n >= MAX_DIM || b.bottom < 0 || b.top > vh || !b.width) return;
        dimBuf.set([b.left / CELL, (vh - b.bottom) / CELL, b.right / CELL, (vh - b.top) / CELL], n++ * 4);
      });
      const age = (now - t0) / 1000;
      gl.uniform2f(u('res'), cols, rows);
      gl.uniform1f(u('time'), rm ? 30 : age + 30);
      gl.uniform2f(u('scroll'), (scrollY / vh) * 0.46, (scrollY / vh) * 0.13);
      gl.uniform2f(u('pointer'), px, py); gl.uniform1f(u('light'), light);
      gl.uniform1f(u('reveal'), rm || age > 1.8 ? 1e6 : (Math.hypot(cols, rows) + 60) * easeIO(clamp(age / 1.8)));
      gl.uniform4fv(u('dims[0]'), dimBuf); gl.uniform1f(u('count'), n);
      k.rgb.forEach((col, i) => gl.uniform3fv(u(`c${i}`), col));
      gl.uniform4f(u('shape'), k.base, k.grad, k.cloud, k.star);
      const s = clamp(skyState.tod / 0.8);
      gl.uniform4f(u('sun'), cols * (0.8 - 0.5 * s), rows * (-0.2 + 1.05 * Math.sin(Math.PI * (0.32 + 0.68 * s))), rows * 0.055, clamp((0.84 - skyState.tod) / 0.06));
      const m = clamp((skyState.tod - 0.8) / 0.15);
      gl.uniform4f(u('moon'), cols * 0.8, rows * (0.55 + 0.25 * easeIO(m)), rows * 0.04, m);
      gl.uniform1f(u('halftone'), page.halftone ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    raf = requestAnimationFrame(frame);
  }
  resize(); addEventListener('resize', resize); addEventListener('pointermove', move, { passive: true }); root.addEventListener('pointerleave', leave);
  raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointermove', move); root.removeEventListener('pointerleave', leave); };
}

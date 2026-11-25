import { useEffect, useRef } from 'react';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { createProgram, skyState } from '../animations/sky';
import { clamp, easeIO, reducedMotion } from '../animations/util';
import { botSvg } from '../animations/pixelBot';
import { education, profile } from '../data/content';

const CELL = 3;
type V = [number, number, number];
const vec = (lat: number, lon: number): V => { const a = (lat * Math.PI) / 180, o = (lon * Math.PI) / 180; return [Math.cos(a) * Math.sin(o), Math.sin(a), Math.cos(a) * Math.cos(o)]; };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function slerp(a: V, b: V, t: number): V {
  const om = Math.acos(clamp(dot(a, b), -1, 1)), s = Math.sin(om) || 1, ka = Math.sin((1 - t) * om) / s, kb = Math.sin(t * om) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
}
/** Column-major rotation that brings the point `c` to the middle of the view. */
function rotTo(c: V) {
  const lat = Math.asin(clamp(c[1], -1, 1)), lon = Math.atan2(c[0], c[2]);
  const cl = Math.cos(lat), sl = Math.sin(lat), co = Math.cos(lon), so = Math.sin(lon);
  return [co, 0, -so, -so * sl, cl, -co * sl, so * cl, sl, co * cl];
}

const MULTAN = vec(30.16, 71.52), AWAY = vec(22, 22);

const FRAG = `precision highp float;
uniform vec2 res, center; uniform float radius, flatness, alpha; uniform mat3 rot; uniform sampler2D land; uniform vec3 c0,c1,c2,c3;
float b2(vec2 a){ a=floor(a); return fract(a.x/2.+a.y*a.y*.75); }
float b4(vec2 a){ return b2(.5*a)*.25+b2(a); }
float L(vec3 p){ return texture2D(land, vec2(atan(p.x,p.z)/6.2831853+.5, .5-asin(clamp(p.y,-1.,1.))/3.1415927)).r; }
void main(){
  vec2 c=gl_FragCoord.xy, d=(c-center)/radius; float r2=dot(d,d);
  if(r2>1. || b4(c+2.)>=alpha){ gl_FragColor=vec4(0.); return; }
  float z=sqrt(1.-r2); vec3 n=vec3(d,z), p=rot*n;
  vec3 tx=normalize(cross(p,vec3(0.,1.,0.))+1e-4), ty=cross(tx,p);
  float near=(L(normalize(p+tx*.03))+L(normalize(p-tx*.03))+L(normalize(p+ty*.03))+L(normalize(p-ty*.03)))*.25;
  float light=dot(n, normalize(vec3(-.4,.5,.78)));
  float v=mix(.72+.5*light+.6*smoothstep(.02,.5,near), 2.7+.4*light, smoothstep(.2,.8,L(p)));
  v=clamp(v-(1.-z)*1.15*(1.-flatness),0.,3.);
  float lv=min(floor(v)+step(b4(c),fract(v)),3.);
  gl_FragColor=vec4(lv<.5?c0:lv<1.5?c1:lv<2.5?c2:c3,1.);
}`;

async function landTexture() {
  const topo = (await import('world-atlas/land-50m.json')).default as unknown as Topology<{ land: GeometryCollection }>;
  const geo = feature(topo, topo.objects.land);
  const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 1024;
  const g = cv.getContext('2d')!; g.fillStyle = '#000'; g.fillRect(0, 0, 2048, 1024); g.fillStyle = '#fff';
  for (const f of geo.features) {
    const geom = f.geometry;
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
    for (const poly of polys) {
      g.beginPath();
      // draw three copies side by side, so a shape that crosses the date line is complete on both edges of the map
      for (const offset of [-2048, 0, 2048]) for (const ring of poly) {
        let prev = ring[0][0], shift = 0;
        ring.forEach(([lon, lat], i) => {
          if (lon - prev > 180) shift -= 360; else if (prev - lon > 180) shift += 360;
          prev = lon;
          const x = ((lon + shift + 180) / 360) * 2048 + offset, y = ((90 - lat) / 180) * 1024;
          if (i) g.lineTo(x, y); else g.moveTo(x, y);
        });
        // a ring that wraps all the way round (Antarctica) is closed along the bottom of the map
        if (shift) { g.lineTo(((ring[ring.length - 1][0] + shift + 180) / 360) * 2048 + offset, 1024); g.lineTo(((ring[0][0] + 180) / 360) * 2048 + offset, 1024); }
        g.closePath();
      }
      g.fill('evenodd');
    }
  }
  return cv;
}

export function Journey() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!, pin = el.querySelector<HTMLElement>('.journey__pin')!;
    const cv = el.querySelector<HTMLCanvasElement>('.journey__globe')!, ov = el.querySelector<HTMLCanvasElement>('.journey__routes')!;
    const me = el.querySelector<HTMLElement>('.journey__me')!, text = el.querySelector<HTMLElement>('.journey__text')!;
    const tags = [...el.querySelectorAll<HTMLElement>('.journey__tag')];
    const gl = cv.getContext('webgl', { antialias: false, alpha: true });
    const g2 = ov.getContext('2d')!;
    if (!gl) { text.style.opacity = '1'; return; }
    const u = createProgram(gl, FRAG), rm = reducedMotion();
    let raf = 0, ready = false, dead = false, smooth: number | null = null, last = 0, W = 1, H = 1, cols = 1, rows = 1;
    const resize = () => {
      W = pin.clientWidth; H = pin.clientHeight; cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL);
      cv.width = cols; cv.height = rows; gl.viewport(0, 0, cols, rows);
      const dpr = Math.min(devicePixelRatio, 2); ov.width = W * dpr; ov.height = H * dpr; g2.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); addEventListener('resize', resize);
    landTexture().then((img) => {
      if (dead) return;
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true;
    });
    const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
    const gentle = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const r = el.getBoundingClientRect();
      if (!ready || r.bottom < -100 || r.top > innerHeight + 100) { smooth = null; return; }
      const target = clamp(-r.top / Math.max(1, r.height - H)), dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016; last = now;
      smooth = smooth === null || rm ? target : smooth + (target - smooth) * Math.min(1, dt * 4.5);
      const p = smooth;
      // horizon -> flat map -> globe -> a slow turn along the route -> words
      const rise = gentle(seg(p, 0, 0.24)), zoom = gentle(seg(p, 0.26, 0.52)), turn = easeIO(seg(p, 0.52, 0.74)), words = easeIO(seg(p, 0.73, 0.8));
      const Rg = Math.min(cols, rows) * (W < 720 ? 0.44 : 0.36), R0 = W < 720 ? 0.85 * cols : 0.62 * Math.max(cols, rows * 1.1);
      const R = rise < 1 ? R0 * Math.pow((Rg * 7) / R0, rise) : Rg * Math.exp(Math.log(7) * (1 - zoom)) * (1 - 0.16 * words);
      const fromTop = rise < 1 ? (0.42 * rows + R0) * (1 - rise) + 0.5 * rows * rise : rows * (0.5 - (W < 720 ? 0.2 : 0.14) * words);
      const cx = cols / 2, cy = rows - fromTop;
      const centre = slerp(MULTAN, AWAY, turn * 0.55);
      const M = rotTo(centre), alpha = 1 - seg(p, 0.96, 1);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u('res'), cols, rows); gl.uniform2f(u('center'), cx, cy); gl.uniform1f(u('radius'), R);
      gl.uniform1f(u('flatness'), clamp((R / Rg - 1.6) / 5)); gl.uniform1f(u('alpha'), alpha); gl.uniformMatrix3fv(u('rot'), false, M);
      skyState.tone.rgb.forEach((c, i) => gl.uniform3fv(u(`c${i}`), c));
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      const screen = (w: V) => {
        const x = M[0] * w[0] + M[1] * w[1] + M[2] * w[2], y = M[3] * w[0] + M[4] * w[1] + M[5] * w[2], z = M[6] * w[0] + M[7] * w[1] + M[8] * w[2];
        return { x: (cx + x * R) * CELL, y: H - (cy + y * R) * CELL, z };
      };
      g2.clearRect(0, 0, W, H); g2.globalAlpha = alpha;
      // a signal line from Multan outward, lifted off the surface
      const trip = seg(p, 0.55, 0.72);
      if (trip > 0) {
        g2.beginPath(); let pen = false;
        for (let i = 0; i <= 80 * trip; i++) {
          const k = i / 80, s = slerp(MULTAN, AWAY, k), lift = 1 + 0.08 * Math.sin(Math.PI * k);
          const q = screen([s[0] * lift, s[1] * lift, s[2] * lift]);
          if (q.z <= 0) { pen = false; continue; }
          if (pen) g2.lineTo(q.x, q.y); else g2.moveTo(q.x, q.y);
          pen = true;
        }
        g2.lineCap = 'round'; g2.strokeStyle = '#2E54D1'; g2.lineWidth = 6.5; g2.stroke(); g2.strokeStyle = '#fff'; g2.lineWidth = 3; g2.stroke();
      }
      const home = screen(MULTAN);
      me.style.transform = `translate3d(${home.x}px, ${home.y}px, 0)`;
      me.style.opacity = home.z > 0 ? String(Math.min(alpha, seg(rise, 0.8, 1))) : '0';
      const put = (tag: HTMLElement, show: boolean, dy: number) => {
        const w = tag.offsetWidth;
        let x = home.x + 40, y = home.y + dy;
        if (x + w > W - 12) { x = home.x - 40 - w; if (x < 12) { x = clamp(home.x - w / 2, 12, Math.max(12, W - 12 - w)); y += dy < 10 ? -56 : 24; } }
        tag.style.transform = `translate3d(${x}px, ${y}px, 0) translateY(-50%)`;
        tag.style.opacity = show && home.z > 0 && alpha > 0.6 ? '1' : '0';
      };
      put(tags[0], rise > 0.9, 0); put(tags[1], zoom > 0.8, 58);
      text.style.opacity = String(Math.min(words, alpha)); text.style.transform = `translateY(${(1 - words) * 24}px)`;
    };
    raf = requestAnimationFrame(frame);
    return () => { dead = true; cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);

  return (
    <section className="journey" ref={ref} aria-label={`A globe journey that starts in ${profile.location}`}>
      <div className="journey__pin">
        <canvas className="journey__globe" aria-hidden="true" />
        <canvas className="journey__routes" aria-hidden="true" />
        <span className="journey__me" aria-hidden="true"><img src={botSvg(12)} alt="" /></span>
        <p className="journey__tag"><i className="journey__flag" /><span><strong>{profile.location}</strong><small>{profile.availability}</small></span></p>
        <p className="journey__tag"><i className="journey__flag" /><span><strong>Bahauddin Zakariya University</strong><small>{education[0].degree.replace('Bachelor of Science in', 'BS')}</small></span></p>
        <div className="container journey__text">
          <div className="journey__card">
            <h2 className="display-m">From Multan <em>to the web</em></h2>
            <p className="body-l">{profile.about.lead}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

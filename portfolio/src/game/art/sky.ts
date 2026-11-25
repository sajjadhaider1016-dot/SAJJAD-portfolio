// The horizon: a golden-hour sky dome, a sea of clouds below the isles, far silhouettes and drifting motes.
import * as THREE from 'three';
import { createBatch, PALETTE, rnd, type Disposer, type Kit } from './kit';

export const SUN_DIR = new THREE.Vector3(-0.08, 0.07, -1).normalize();
const col = (c: string) => ({ value: new THREE.Color(c) });

/** A tiling value-noise texture, so the cloud shaders stay cheap. */
function noiseTexture(bin: Disposer) {
  const N = 256, data = new Uint8Array(N * N * 4);
  const lattice = (period: number) => {
    const v = Array.from({ length: period * period }, () => rnd());
    return (x: number, y: number) => {
      const fx = (x / N) * period, fy = (y / N) * period, ix = Math.floor(fx), iy = Math.floor(fy);
      const tx = fx - ix, ty = fy - iy, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const at = (a: number, b: number) => v[((b % period) * period) + (a % period)];
      return THREE.MathUtils.lerp(THREE.MathUtils.lerp(at(ix, iy), at(ix + 1, iy), sx), THREE.MathUtils.lerp(at(ix, iy + 1), at(ix + 1, iy + 1), sx), sy);
    };
  };
  const octaves = [8, 16, 32, 64].map(lattice);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const n = octaves.reduce((s, o, i) => s + o(x, y) * [0.53, 0.27, 0.13, 0.07][i], 0);
    data.set([n * 255, n * 255, n * 255, 255], (y * N + x) * 4);
  }
  const t = bin.add(new THREE.DataTexture(data, N, N));
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true;
  return t;
}

const SKY_FRAG = `
uniform vec3 zenith, high, mid, horizon, sunColor, sunDir; uniform float time;
varying vec3 vDir;
float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  vec3 c = mix(horizon, mid, smoothstep(-0.01, 0.13, h));
  c = mix(c, high, smoothstep(0.1, 0.36, h));
  c = mix(c, zenith, smoothstep(0.32, 0.8, h));
  c = mix(c, mid*0.55, smoothstep(0.0, -0.35, h));
  float s = max(dot(d, sunDir), 0.0);
  c += horizon * pow(s, 7.0) * 0.35 * (1.0 - smoothstep(0.0, 0.5, h));
  c += sunColor * (pow(s, 140.0) * 0.5 + pow(s, 1400.0) * 0.8);
  c += sunColor * smoothstep(0.99935, 0.99955, s) * 2.4;
  vec3 cell = floor(d * 240.0); float k = hash(cell);
  c += vec3(0.8,0.86,1.0) * step(0.9972, k) * smoothstep(0.22, 0.6, h) * (0.55 + 0.45*sin(time*1.3 + k*90.0));
  gl_FragColor = vec4(c, 1.0);
}`;

const SEA_FRAG = `
uniform sampler2D noise; uniform vec3 shade, body, lit, horizon, sunDir; uniform float time, scale, cover, opacity;
varying vec3 vWorld;
float field(vec2 p){
  float a = texture2D(noise, p*scale + vec2(time*0.0026, time*0.0009)).r;
  float b = texture2D(noise, p*scale*2.7 - vec2(time*0.0031, -time*0.0017)).r;
  return a*0.68 + b*0.32;
}
void main(){
  vec2 p = vWorld.xz;
  float n = field(p);
  float toward = field(p + sunDir.xz * 7.0);
  float billow = smoothstep(0.38, 0.7, n);
  float rim = clamp((n - toward) * 6.0, 0.0, 1.0);
  vec3 c = mix(shade, body, billow);
  c = mix(c, lit, rim * billow);
  vec3 view = normalize(vWorld - cameraPosition);
  float glint = pow(max(dot(normalize(vec3(view.x, 0.0, view.z)), normalize(vec3(sunDir.x, 0.0, sunDir.z))), 0.0), 9.0);
  c += lit * glint * 0.28 * billow;
  float dist = length(p - cameraPosition.xz);
  c = mix(c, horizon * (0.9 + 0.32 * pow(max(dot(normalize(vec3(view.x, 0.0, view.z)), normalize(vec3(sunDir.x, 0.0, sunDir.z))), 0.0), 7.0)), smoothstep(110.0, 470.0, dist));
  float a = opacity * mix(1.0, smoothstep(cover, cover + 0.2, n), step(0.001, cover)) * (1.0 - step(0.001, cover) * smoothstep(120.0, 300.0, dist));
  gl_FragColor = vec4(c, a);
}`;

const WORLD_VERT = `varying vec3 vWorld; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vWorld = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`;

export function buildSky(scene: THREE.Scene, bin: Disposer, kit: Kit, dot: THREE.Texture) {
  const noise = noiseTexture(bin);
  const time = { value: 0 };
  const dome = new THREE.Mesh(bin.add(new THREE.SphereGeometry(700, 40, 24)), bin.add(new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { zenith: col(PALETTE.zenith), high: col(PALETTE.high), mid: col(PALETTE.mid), horizon: col(PALETTE.horizon), sunColor: col(PALETTE.sun), sunDir: { value: SUN_DIR }, time },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: SKY_FRAG,
  })));
  dome.renderOrder = -2;
  scene.add(dome);

  const sea = (y: number, scale: number, cover: number, opacity: number, size: number) => {
    const mat = bin.add(new THREE.ShaderMaterial({
      transparent: opacity < 1 || cover > 0, depthWrite: !cover, fog: false,
      uniforms: { noise: { value: noise }, shade: col('#171d4e'), body: col('#4d4a88'), lit: col('#ee9c86'), horizon: col(PALETTE.horizon), sunDir: { value: SUN_DIR }, time, scale: { value: scale }, cover: { value: cover }, opacity: { value: opacity } },
      vertexShader: WORLD_VERT, fragmentShader: SEA_FRAG,
    }));
    const m = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(size, size)), mat);
    m.rotation.x = -Math.PI / 2; m.position.y = y; scene.add(m);
    return m;
  };
  sea(-30, 0.0046, 0, 1, 1500);
  const wisps = sea(-17, 0.0062, 0.54, 0.34, 640);
  wisps.renderOrder = 1;

  // far floating peaks: broken rock masses, small and distant, so the fog layers them into depth
  const far = createBatch(bin);
  const tones = [kit.std('#4d4585', { roughness: 1, flatShading: true }), kit.std('#665692', { roughness: 1, flatShading: true })];
  const crag = (radius: number, depth: number) => {
    const g = new THREE.IcosahedronGeometry(1, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    const wobble = (x: number, y: number, z: number) => 1 + Math.sin(x * 7.1 + y * 3.3) * 0.16 + Math.sin(z * 5.7 - y * 6.2) * 0.14;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = wobble(x, y, z), taper = y < 0 ? 1 + y * 0.55 : 1;
      p.setXYZ(i, x * k * radius * taper, y < 0 ? y * depth * k : y * radius * 0.34 * k, z * k * radius * taper);
    }
    g.computeVertexNormals();
    return g;
  };
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI * 1.1 + (i / 13) * Math.PI * 1.2 + rnd(-0.1, 0.1), d = rnd(190, 285);
    const x = Math.cos(a) * d, z = Math.sin(a) * d - 8, r = rnd(4, 10), y = rnd(-21, -6), tone = tones[i % 2];
    far.add(tone, crag(r, r * rnd(1.2, 2)), x, y, z, 0, rnd(0, 6));
    for (let k = 0; k < 3; k++) far.add(tone, crag(rnd(0.8, 2.4), rnd(1.2, 3.5)), x + rnd(-r, r) * 2, y - rnd(-4, 10), z + rnd(-r, r), 0, rnd(0, 6));
    for (let k = 0; k < 4; k++) far.add(tone, new THREE.ConeGeometry(rnd(0.5, 1.1), rnd(2.5, 5.5), 6), x + rnd(-r, r) * 0.6, y + r * 0.3 + 1.2, z + rnd(-r, r) * 0.5);
  }
  far.build(scene, false);

  // motes drifting through the evening light
  const count = 420, pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) pos.set([rnd(-58, 58), rnd(-6, 20), rnd(-62, 50)], i * 3);
  const geo = bin.add(new THREE.BufferGeometry()); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const motes = new THREE.Points(geo, bin.add(new THREE.PointsMaterial({ map: dot, color: '#ffd9bd', size: 0.34, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })));
  scene.add(motes);

  return {
    update(t: number) {
      time.value = t;
      motes.position.y = Math.sin(t * 0.22) * 0.9; motes.position.x = Math.sin(t * 0.07) * 2;
    },
  };
}

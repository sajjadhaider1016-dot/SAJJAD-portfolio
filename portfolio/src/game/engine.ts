// Signal Isles: rendering, camera direction and play. Used full screen on /play and as the live preview on the home page.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { createDisposer, createKit, dotTexture, reseed } from './art/kit';
import { buildLand } from './art/land';
import { buildLandmarks } from './art/landmarks';
import { buildPip } from './art/pip';
import { buildSignals } from './art/signals';
import { buildSky, SUN_DIR } from './art/sky';
import { BEACONS, constrain, REACH, RELAY, route, SHARDS, SPAWN, type Beacon } from './world';

export type Guide = { x: number; y: number; angle: number; off: boolean; distance: number; title: string } | null;
export type GameEvents = { onNear?: (b: Beacon | null) => void; onShard?: (count: number) => void; onGuide?: (g: Guide) => void; onAutopilot?: (on: boolean) => void };
/** 'title' circles the isles, 'play' follows Pip, 'complete' circles the relay. */
export type Screen = 'title' | 'play' | 'complete';
export type Quality = 'high' | 'low';
export type Game = ReturnType<typeof createGame>;
export type Options = { preview?: boolean; quality?: Quality; reducedMotion?: boolean };

const GRADE = {
  uniforms: { tDiffuse: { value: null }, texel: { value: new THREE.Vector2(1 / 1280, 1 / 720) }, time: { value: 0 }, strength: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  // one pass does it all: edge smoothing (much cheaper than multisampling on modest GPUs), a cool lift in the
  // shadows, a gentle vignette, and a whisper of dither to keep the sky free of banding
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 texel; uniform float time, strength; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    const vec3 W = vec3(0.299,0.587,0.114);
    vec3 smoothEdges(){
      vec3 m = texture2D(tDiffuse, vUv).rgb;
      float lm = dot(m,W);
      float nw = dot(texture2D(tDiffuse, vUv + texel*vec2(-1.0,-1.0)).rgb, W), ne = dot(texture2D(tDiffuse, vUv + texel*vec2(1.0,-1.0)).rgb, W);
      float sw = dot(texture2D(tDiffuse, vUv + texel*vec2(-1.0,1.0)).rgb, W), se = dot(texture2D(tDiffuse, vUv + texel*vec2(1.0,1.0)).rgb, W);
      float lo = min(lm, min(min(nw,ne), min(sw,se))), hi = max(lm, max(max(nw,ne), max(sw,se)));
      if (hi - lo < max(0.045, hi*0.12)) return m;
      vec2 dir = vec2(-((nw+ne)-(sw+se)), (nw+sw)-(ne+se));
      float shrink = max((nw+ne+sw+se)*0.03125, 0.0078125);
      dir = clamp(dir / (min(abs(dir.x), abs(dir.y)) + shrink), -6.0, 6.0) * texel;
      vec3 near = 0.5*(texture2D(tDiffuse, vUv - dir/6.0).rgb + texture2D(tDiffuse, vUv + dir/6.0).rgb);
      vec3 wide = near*0.5 + 0.25*(texture2D(tDiffuse, vUv - dir*0.5).rgb + texture2D(tDiffuse, vUv + dir*0.5).rgb);
      float lw = dot(wide,W);
      return (lw < lo || lw > hi) ? near : wide;
    }
    void main(){
      vec3 c = smoothEdges();
      float l = dot(c, W);
      c += vec3(0.002,0.006,0.028) * (1.0 - smoothstep(0.0, 0.45, l));
      c = mix(vec3(l), c, 1.1);
      c = mix(c, c*c*(3.0-2.0*c), 0.18);
      vec2 q = vUv - 0.5; q.x *= 0.82;
      c *= 1.0 - strength * 0.46 * smoothstep(0.22, 0.72, length(q));
      c += (h(gl_FragCoord.xy + fract(time)) - 0.5) / 255.0 * 1.6;
      gl_FragColor = vec4(c, 1.0);
    }`,
};

const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);
const smooth = (t: number) => t * t * (3 - 2 * t);

export function createGame(canvas: HTMLCanvasElement, options: Options = {}, events: GameEvents = {}) {
  const preview = !!options.preview;
  let motion = options.reducedMotion ? 0 : 1;
  const coarse = matchMedia('(pointer: coarse)').matches;
  let quality: Quality = options.quality ?? (coarse || innerWidth < 720 ? 'low' : 'high');

  // throws when WebGL is unavailable, so the page can show its fallback
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: preview ? 'default' : 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false; // the world doesn't move, so its shadows are rendered once
  renderer.info.autoReset = false;

  const bin = createDisposer();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#5c4d86', 92, 330);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.5, 1600);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTarget = bin.add(pmrem.fromScene(room, 0.05));
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.24;
  room.dispose(); pmrem.dispose();

  scene.add(new THREE.HemisphereLight('#8e9cf5', '#33233f', 0.95));
  const key = new THREE.DirectionalLight('#ffc794', 2.9);
  key.position.set(-46, 44, 26);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(quality === 'high' && !preview ? 3072 : 1536);
  Object.assign(key.shadow.camera, { left: -58, right: 58, top: 58, bottom: -58, near: 10, far: 150 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.035; key.shadow.radius = 2.4;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#ff8f7a', 1.5);
  rim.position.copy(SUN_DIR).multiplyScalar(60).setY(14);
  scene.add(rim);

  reseed(11);
  const dot = dotTexture(bin);
  const kit = createKit(bin);
  const sky = buildSky(scene, bin, kit, dot);
  buildLand(scene, bin, kit, dot);
  const refreshShadows = () => { renderer.shadowMap.needsUpdate = true; if (!running) render(); };
  let running = false;
  const landmarks = buildLandmarks(scene, bin, kit, () => { if (!disposed) refreshShadows(); });
  const signals = buildSignals(scene, bin, kit, dot);
  const pip = buildPip(scene, bin, kit, dot);

  // ── post: bloom for the lights, tone mapping, then the grade ──
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, target);
  const scenePass = new RenderPass(scene, camera);
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.36, 0.4, 1.02);
  const output = new OutputPass();
  const grade = new ShaderPass(GRADE);
  [scenePass, bloom, output, grade].forEach((p) => composer.addPass(p));

  // ── state ──
  const pos = new THREE.Vector2(SPAWN.x, SPAWN.z), vel = new THREE.Vector2();
  const input = { x: 0, y: 0, boost: false };
  let screen: Screen = 'title', heading = 0, near = -1, got = 0, paused = false, disposed = false;
  let raf = 0, last = 0, time = 0, frames = 0, since = 0;
  let yaw = 0, zoom = 1, intro = 1, focus = -1, focusBlend = 0, nearBlend = 0, framing = 0, ending = 0;
  let path: [number, number][] = [], stuck = 0;
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  const from = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  const wantPos = new THREE.Vector3(), wantLook = new THREE.Vector3();
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  const lead = new THREE.Vector2(), anchor = new THREE.Vector2(pos.x, pos.y);
  let width = 1, height = 1, ratio = 1, slow = 0, measured = 0, scaleDown = 1;

  const portrait = () => width / height < 0.85;
  function resize() {
    width = canvas.clientWidth || 1; height = canvas.clientHeight || 1;
    ratio = Math.min(devicePixelRatio || 1, preview ? 1 : quality === 'high' ? 1.35 : 1.15) * scaleDown;
    renderer.setPixelRatio(ratio); renderer.setSize(width, height, false);
    composer.setPixelRatio(ratio); composer.setSize(width, height);
    bloom.setSize(width * ratio * 0.6, height * ratio * 0.6);
    grade.uniforms.texel.value.set(1 / (width * ratio), 1 / (height * ratio));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(() => { resize(); if (!running) { direct(0); render(); } });
  observer.observe(canvas);

  /** Where the camera wants to be for the current screen. */
  function compose(out: THREE.Vector3, look: THREE.Vector3) {
    const tall = portrait();
    if (screen === 'title') {
      // a slow sway in front of the setting sun, with the relay as the focal point
      const angle = Math.sin(time * 0.075) * 0.15 * motion + 0.4, d = tall ? 100 : 74;
      out.set(Math.sin(angle) * d, tall ? 36 : 18.5 + Math.sin(time * 0.11) * 0.9 * motion, Math.cos(angle) * d - 6);
      look.set(0, preview ? (tall ? -3 : 0.2) : tall ? 1 : 4.6, -10);
    } else if (screen === 'complete') {
      const angle = time * 0.13 * motion + 0.4, d = tall ? 52 : 40;
      out.set(RELAY.x + Math.sin(angle) * d, 16, RELAY.z + Math.cos(angle) * d);
      look.set(RELAY.x, 5.4, RELAY.z);
    } else {
      const k = (tall ? 1.34 : 1) * zoom, back = 20.5 * k, up = 12.2 * k, sin = Math.sin(yaw), cos = Math.cos(yaw);
      look.set(anchor.x + lead.x, 2.1, anchor.y + lead.y - 1.6 * cos);
      out.set(anchor.x + lead.x * 0.6 + sin * back, up, anchor.y + lead.y * 0.6 + cos * back);
      // near a beacon the view opens up to take in its landmark
      if (nearBlend > 0.001 && near >= 0) {
        const m = BEACONS[near].view;
        const wide = tall ? 1.3 : 1;
        look.lerp(a.set((pos.x + m.x) / 2, 5.2, (pos.y + m.z) / 2), nearBlend * 0.85);
        out.lerp(b.set(m.x + sin * 29 * wide, 14.5 * wide, m.z + cos * 31 * wide), nearBlend * 0.8);
      }
      // with a card open, move in on the landmark
      if (focusBlend > 0.001 && focus >= 0) {
        const m = BEACONS[focus].view, d = tall ? 31 : focus === 4 ? 24 : 21;
        look.lerp(a.set(m.x, tall ? 0.5 : 4.2, m.z + (tall ? 3 : 0)), focusBlend);
        out.lerp(b.set(m.x + sin * d + cos * 5.5, tall ? 17 : 10.5, m.z + cos * d - sin * 5.5), focusBlend);
      }
    }
  }

  function direct(dt: number) {
    nearBlend += ((near >= 0 && screen === 'play' && vel.length() < 9 ? 1 : 0) - nearBlend) * damp(2.2, dt);
    focusBlend += ((focus >= 0 ? 1 : 0) - focusBlend) * damp(motion ? 3 : 60, dt);
    anchor.lerp(pos, damp(6.5, dt));
    lead.x += (vel.x * 0.24 * motion - lead.x) * damp(1.8, dt); lead.y += (vel.y * 0.24 * motion - lead.y) * damp(1.8, dt);
    compose(wantPos, wantLook);
    if (intro < 1) {
      // the opening move: one eased flight from the establishing shot down to Pip
      intro = Math.min(1, intro + dt / 2.6);
      const e = smooth(smooth(intro));
      camPos.lerpVectors(from.pos, wantPos, e); camPos.y += Math.sin(e * Math.PI) * 7;
      camLook.lerpVectors(from.look, wantLook, e);
    } else {
      const rate = !dt || !motion ? 1 : damp(screen === 'play' ? 5.5 : 2.4, dt);
      camPos.lerp(wantPos, rate); camLook.lerp(wantLook, rate);
    }
    camera.position.copy(camPos); camera.lookAt(camLook);

    // framing: shift the picture so panels never sit on top of the subject
    const tall = portrait();
    const wantFov = tall ? 50 : screen === 'title' ? 34 : 38 + Math.min(1, vel.length() / 18) * 3.5 * motion;
    camera.fov += (wantFov - camera.fov) * (dt ? damp(3, dt) : 1);
    const aim = preview ? 0 : screen === 'title' ? 1 : 0;
    framing += (aim - framing) * (dt ? damp(2.4, dt) : 1);
    const card = focusBlend * (screen === 'play' ? 1 : 0);
    const shiftX = tall ? 0 : -width * 0.19 * framing + width * 0.17 * card;
    // at the end the relay rides above the results panel
    ending += ((screen === 'complete' ? 1 : 0) - ending) * (dt ? damp(2, dt) : 1);
    const shiftY = (tall ? height * (0.17 * framing + 0.2 * card) : 0) + height * 0.25 * ending;
    if (Math.abs(shiftX) + Math.abs(shiftY) > 0.5) camera.setViewOffset(width, height, shiftX, shiftY, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }

  const setAutopilot = (next: [number, number][]) => {
    const was = path.length > 0; path = next; stuck = 0;
    if (was !== path.length > 0) events.onAutopilot?.(path.length > 0);
  };

  function simulate(dt: number) {
    const manual = Math.hypot(input.x, input.y) > 0.08;
    let wx = 0, wz = 0, top = input.boost ? 19 : 11.5;
    if (manual) {
      if (path.length) setAutopilot([]);
      // input is relative to the camera, so "up" is always away from you
      const len = Math.max(1, Math.hypot(input.x, input.y)), sin = Math.sin(yaw), cos = Math.cos(yaw);
      wx = (input.x * cos + input.y * sin) / len; wz = (-input.x * sin + input.y * cos) / len;
    } else if (path.length) {
      const [tx, tz] = path[0], dx = tx - pos.x, dz = tz - pos.y, d = Math.hypot(dx, dz);
      if (d < (path.length > 1 ? 2.2 : 0.7)) setAutopilot(path.slice(1));
      else { const ease = path.length > 1 ? 1 : Math.min(1, d / 5); wx = (dx / d) * ease; wz = (dz / d) * ease; top = 17; }
    }
    // quick to pick up, a little glide when you let go
    const pushing = wx !== 0 || wz !== 0, rate = damp(pushing ? 6.2 : 4.2, dt);
    vel.x += (wx * top - vel.x) * rate; vel.y += (wz * top - vel.y) * rate;
    if (!pushing && vel.length() < 0.05) vel.set(0, 0);
    const [nx, nz] = constrain(pos.x + vel.x * dt, pos.y + vel.y * dt);
    if (dt > 0) {
      // keep only the part of the velocity that actually happened, so edges slow you without sticking
      const ax = (nx - pos.x) / dt, az = (nz - pos.y) / dt;
      if (Math.abs(ax - vel.x) > 0.01 || Math.abs(az - vel.y) > 0.01) vel.set(ax, az);
    }
    pos.set(nx, nz);
    if (path.length) { stuck = vel.length() < 1 ? stuck + dt : 0; if (stuck > 1.2) setAutopilot(path.slice(1)); }
    if (vel.length() > 0.7) heading = Math.atan2(vel.x, vel.y);

    signals.shards.forEach((s, i) => {
      if (s.taken) return;
      const dx = pos.x - s.x, dz = pos.y - s.z, d = Math.hypot(dx, dz);
      if (d < 1.15) { signals.collect(i); got++; events.onShard?.(got); }
      else if (d < 3.1) { const pull = damp((3.1 - d) * 3.2, dt); s.x += dx * pull; s.z += dz * pull; } // drawn in when you pass close
    });
    const found = BEACONS.findIndex((s) => Math.hypot(s.x - pos.x, s.z - pos.y) < REACH);
    if (found !== near) { near = found; events.onNear?.(found < 0 ? null : BEACONS[found]); }
  }

  /** Points the way to the closest thing still to find, clamped to the edge of the screen when it's out of view. */
  function guide() {
    if (!events.onGuide) return;
    if (screen !== 'play' || paused) return events.onGuide(null);
    const targets: { x: number; z: number; y: number; title: string }[] = BEACONS.flatMap((s, i) => (signals.isScanned(i) ? [] : [{ x: s.x, z: s.z, y: 3.4, title: s.title }]));
    if (!targets.length) signals.shards.forEach((s) => { if (!s.taken) targets.push({ x: s.x, z: s.z, y: 2.6, title: 'Signal shard' }); });
    if (!targets.length) return events.onGuide(null);
    const distance = (t: { x: number; z: number }) => Math.hypot(t.x - pos.x, t.z - pos.y);
    const t = targets.reduce((n, c) => (distance(c) < distance(n) ? c : n));
    if (distance(t) < REACH + 1) return events.onGuide(null);
    camera.updateMatrixWorld();
    a.set(t.x, t.y, t.z).applyMatrix4(camera.matrixWorldInverse);
    const behind = a.z > 0;
    a.applyMatrix4(camera.projectionMatrix);
    let x = a.x, y = a.y;
    if (behind) { x = -x; y = -Math.abs(y) - 1; }
    const off = behind || Math.abs(x) > 0.84 || y > 0.66 || y < -0.66;
    if (off) { const k = Math.max(Math.abs(x) / 0.84, Math.abs(y) / 0.66, 1); x /= k; y /= k; }
    events.onGuide({ x: ((x + 1) / 2) * width, y: ((1 - y) / 2) * height, angle: Math.atan2(-y * height, x * width), off, distance: Math.round(distance(t)), title: t.title });
  }

  function render() {
    if (disposed) return;
    renderer.info.reset();
    grade.uniforms.time.value = time;
    composer.render();
    frames++;
  }
  function update(dt: number) {
    time += dt; since += dt;
    if (screen !== 'title' && !paused) simulate(dt);
    if (!paused || dt === 0) pip.update({ x: pos.x, z: pos.y, heading, vx: vel.x, vz: vel.y, boost: input.boost && vel.length() > 12, near: near >= 0 }, time, dt, motion);
    const still = motion ? time : 4;
    sky.update(still);
    landmarks.update(still, motion);
    signals.update(time, dt, motion, screen === 'play' ? near : -1, focusBlend);
    // name plates stay out of the way of the title and of whatever you're reading
    landmarks.plates.forEach((p, i) => {
      const hide = focus === i || screen === 'title';
      p.material.opacity += ((hide ? 0 : 1) - p.material.opacity) * (dt ? damp(5, dt) : 1);
    });
    direct(dt);
    guide();
  }
  /** If frames are consistently slow, lower the resolution first, then drop bloom. */
  function govern(ms: number) {
    if (preview || since < 3 || document.hidden || ms > 250) return;
    slow += ms; measured++;
    if (measured < 90) return;
    const average = slow / measured; slow = measured = 0;
    if (average > 27) {
      if (scaleDown > 0.72) { scaleDown -= 0.14; resize(); }
      else if (bloom.enabled) bloom.enabled = false;
      since = 1;
    }
  }
  function loop(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    // the home page preview is a background element: 30 frames a second is plenty
    if (preview && last && now - last < 31) return;
    const ms = last ? now - last : 16; last = now;
    govern(ms);
    update(Math.min(0.05, ms / 1000));
    render();
  }

  resize();
  compose(camPos, camLook);
  renderer.shadowMap.needsUpdate = true;
  update(0); render();

  return {
    input,
    quality: () => quality,
    setRunning(on: boolean) { if (on === running || disposed) return; running = on; last = 0; if (on) raf = requestAnimationFrame(loop); else cancelAnimationFrame(raf); },
    setPaused(on: boolean) { paused = on; if (on) { input.x = input.y = 0; input.boost = false; vel.set(0, 0); } },
    setScreen(next: Screen) {
      if (next === screen) return;
      if (screen === 'title' && next === 'play') { from.pos.copy(camPos); from.look.copy(camLook); intro = motion ? 0 : 1; anchor.copy(pos); }
      else intro = 1;
      screen = next; focus = -1;
      if (next !== 'play') { setAutopilot([]); vel.set(0, 0); }
    },
    setFocus(id: string | null) { focus = id ? BEACONS.findIndex((s) => s.id === id) : -1; },
    setMotion(on: boolean) { motion = on ? 1 : 0; if (!on) pip.clearTrail(); },
    setQuality(next: Quality) {
      quality = next; scaleDown = 1; slow = measured = since = 0; bloom.enabled = true;
      bloom.strength = next === 'high' ? 0.36 : 0.3;
      resize(); if (!running) render();
    },
    orbit(delta: number) { yaw = THREE.MathUtils.clamp(yaw + delta, -1.25, 1.25); },
    recenter() { yaw = 0; zoom = 1; },
    zoomBy(delta: number) { zoom = THREE.MathUtils.clamp(zoom + delta, 0.72, 1.4); },
    flyTo(id: string) { const i = BEACONS.findIndex((s) => s.id === id); if (i >= 0) { focus = -1; yaw = 0; setAutopilot(route(pos.x, pos.y, i)); } },
    scan(id: string) { signals.scan(BEACONS.findIndex((s) => s.id === id)); },
    getNear: () => (near < 0 ? null : BEACONS[near]),
    reset() {
      signals.reset(); pip.clearTrail(); setAutopilot([]);
      pos.set(SPAWN.x, SPAWN.z); vel.set(0, 0); lead.set(0, 0); anchor.copy(pos);
      heading = 0; got = 0; near = -1; yaw = 0; zoom = 1; focus = -1;
      events.onShard?.(0); events.onNear?.(null);
    },
    debug: () => ({ x: pos.x, z: pos.y, speed: vel.length(), shards: got, total: SHARDS.length, near: near < 0 ? null : BEACONS[near].id, frames, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, ratio, bloom: bloom.enabled, running, screen, autopilot: path.length, camera: camPos.toArray().map((n) => Math.round(n)) }),
    teleport(x: number, z: number) { [x, z] = constrain(x, z); pos.set(x, z); vel.set(0, 0); anchor.copy(pos); lead.set(0, 0); },
    /** Advances the simulation without waiting for animation frames. For tests. */
    step(seconds: number) { if (seconds <= 0) update(0); for (let t = 0; t < seconds - 1e-6; t += 1 / 60) update(1 / 60); render(); },
    dispose() {
      disposed = true; running = false; cancelAnimationFrame(raf); observer.disconnect();
      scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh || (o as THREE.Points).isPoints) { m.geometry.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose()); } });
      bin.run(); key.shadow.dispose(); bloom.dispose(); output.dispose(); grade.dispose(); composer.dispose(); target.dispose(); renderer.dispose();
    },
  };
}

// The things you play with: beacons, signal shards, pickup bursts and the relay at the centre of the hub.
import * as THREE from 'three';
import { BEACONS, RELAY, SHARDS } from '../world';
import { createBatch, cyl, torus, type Disposer, type Kit } from './kit';

/** A column of light that fades out towards the top. */
function shaft(bin: Disposer, color: string, top: number, bottom: number, height: number, strength: number) {
  const mat = bin.add(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { color: { value: new THREE.Color(color) }, power: { value: strength } },
    vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = uv.y; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 color; uniform float power; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float soft = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0001, 1.0), 1.6); gl_FragColor = vec4(color, pow(clamp(1.0-vY, 0.0, 1.0), 1.7)*soft*power); }',
  }));
  const m = new THREE.Mesh(bin.add(cyl(top, bottom, height, 28, true)), mat);
  m.position.y = height / 2;
  return { mesh: m, power: mat.uniforms.power, color: mat.uniforms.color };
}

export function buildSignals(scene: THREE.Scene, bin: Disposer, kit: Kit, dot: THREE.Texture) {
  const { mats } = kit;
  const sprite = (color: string, size: number, opacity: number) => {
    const s = new THREE.Sprite(bin.add(new THREE.SpriteMaterial({ map: dot, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending })));
    s.scale.setScalar(size); return s;
  };

  const plinths = createBatch(bin);
  const beacons = BEACONS.map((b) => {
    plinths.add(mats.metal, cyl(1.05, 1.25, 0.32, 8), b.x, 0.16, b.z);
    plinths.add(mats.pale, cyl(0.72, 0.9, 0.3, 8), b.x, 0.46, b.z);
    const g = new THREE.Group(); g.position.set(b.x, 0, b.z); scene.add(g);
    const core = new THREE.Mesh(bin.add(new THREE.OctahedronGeometry(0.55)), bin.add(new THREE.MeshStandardMaterial({ color: b.color, emissive: b.color, emissiveIntensity: 1.05, roughness: 0.15, metalness: 0.4, flatShading: true })));
    const cage = new THREE.Mesh(bin.add(torus(0.92, 0.028)), mats.pale);
    const halo = sprite(b.color, 3.4, 0.42);
    const light = shaft(bin, b.color, 0.5, 1.05, 11, 0.55);
    const ringMat = bin.add(new THREE.MeshBasicMaterial({ color: b.color, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
    const ring = new THREE.Mesh(bin.add(new THREE.RingGeometry(1.75, 1.84, 64).rotateX(-Math.PI / 2)), ringMat);
    const pulse = new THREE.Mesh(bin.add(new THREE.RingGeometry(1.72, 1.78, 64).rotateX(-Math.PI / 2)), bin.add(ringMat.clone()));
    ring.position.y = 0.07; pulse.position.y = 0.09;
    g.add(core, cage, halo, light.mesh, ring, pulse);
    return { core, cage, halo, light, ring, pulse, done: false, wake: 0 };
  });

  const shardMat = bin.add(new THREE.MeshStandardMaterial({ color: '#c9fbff', emissive: '#35d6ff', emissiveIntensity: 1.8, roughness: 0.1, metalness: 0.5, flatShading: true }));
  const shardGeo = bin.add(new THREE.OctahedronGeometry(0.34));
  const shards = SHARDS.map(([x, z]) => {
    const g = new THREE.Group(), gem = new THREE.Mesh(shardGeo, shardMat);
    gem.scale.y = 1.65;
    const orbit = new THREE.Mesh(bin.add(torus(0.58, 0.016)), mats.accent);
    g.add(gem, orbit, sprite('#5fe0ff', 2.2, 0.55)); g.position.set(x, 1.25, z); scene.add(g);
    return { g, gem, orbit, x, z, home: { x, z }, taken: false };
  });

  // bursts: one shared pool of sparks, thrown out when something is collected or scanned
  const N = 160, pos = new Float32Array(N * 3), colr = new Float32Array(N * 3), vel = new Float32Array(N * 3), life = new Float32Array(N), tone = new Float32Array(N * 3);
  const sparkGeo = bin.add(new THREE.BufferGeometry());
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); sparkGeo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
  const sparks = new THREE.Points(sparkGeo, bin.add(new THREE.PointsMaterial({ map: dot, size: 0.55, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  sparks.frustumCulled = false; scene.add(sparks);
  let cursor = 0;
  const burst = (x: number, y: number, z: number, color: string, count: number) => {
    const c = new THREE.Color(color);
    for (let k = 0; k < count; k++) {
      cursor = (cursor + 1) % N;
      const a = Math.random() * Math.PI * 2, up = Math.random(), s = 2 + Math.random() * 4.5;
      pos.set([x, y, z], cursor * 3); vel.set([Math.cos(a) * s * (1 - up * 0.5), up * 6, Math.sin(a) * s * (1 - up * 0.5)], cursor * 3); tone.set([c.r * 1.6, c.g * 1.6, c.b * 1.6], cursor * 3); life[cursor] = 1;
    }
  };

  // the relay: eight arcs, one lit for each shard recovered
  const monument = createBatch(bin);
  monument.add(mats.stoneDark, cyl(2.55, 2.85, 0.4, 48), RELAY.x, 0.2, RELAY.z);
  monument.add(mats.pale, cyl(1.9, 2.1, 0.4, 48), RELAY.x, 0.6, RELAY.z);
  monument.add(mats.metal, cyl(0.55, 0.95, 1.2, 12), RELAY.x, 1.4, RELAY.z);
  for (const s of [-1, 1]) {
    monument.add(mats.metal, cyl(0.1, 0.26, 3.6, 10), RELAY.x + s * 1.65, 2.5, RELAY.z, 0, 0, -s * 0.16);
    monument.add(mats.lamp, new THREE.OctahedronGeometry(0.2), RELAY.x + s * 1.95, 4.45, RELAY.z);
  }
  monument.build(scene);
  plinths.build(scene);
  const relay = new THREE.Group(); relay.position.set(RELAY.x, 5.2, RELAY.z); scene.add(relay);
  const outer = new THREE.Mesh(bin.add(torus(3.05, 0.1, Math.PI * 2, 120)), mats.pale);
  const track = new THREE.Mesh(bin.add(torus(2.62, 0.075, Math.PI * 2, 120)), mats.metal);
  relay.add(outer, track);
  const dim = kit.std('#39406f', { roughness: 0.4, metalness: 0.5 }), lit = kit.glow('#8fe9ff', 2.8);
  const arcGeo = bin.add(torus(2.62, 0.13, (Math.PI * 2) / SHARDS.length - 0.14, 20));
  const arcs = SHARDS.map((_, i) => {
    const m = new THREE.Mesh(arcGeo, dim); m.rotation.z = Math.PI / 2 - ((i + 1) / SHARDS.length) * Math.PI * 2 + 0.07; relay.add(m); return m;
  });
  const gyro = new THREE.Group(); relay.add(gyro);
  const inner = new THREE.Mesh(bin.add(torus(1.55, 0.06)), mats.accent);
  const inner2 = new THREE.Mesh(bin.add(torus(1.15, 0.045)), mats.pale);
  const heartMat = bin.add(new THREE.MeshStandardMaterial({ color: '#aebdff', emissive: '#4d6dff', emissiveIntensity: 0.9, roughness: 0.12, metalness: 0.6, flatShading: true }));
  const heart = new THREE.Mesh(bin.add(new THREE.IcosahedronGeometry(0.62, 0)), heartMat);
  const heartHalo = sprite('#6f8dff', 4.6, 0.35);
  gyro.add(inner, inner2, heart); relay.add(heartHalo);
  const column = shaft(bin, '#8fd8ff', 1.4, 0.9, 70, 0);
  column.mesh.position.set(RELAY.x, 40, RELAY.z); scene.add(column.mesh);
  let count = 0, online = 0;

  return {
    shards, burst,
    collect(i: number) {
      const s = shards[i]; s.taken = true; s.g.visible = false; count++;
      arcs[count - 1].material = lit;
      burst(s.x, 1.3, s.z, '#7fe6ff', 34);
    },
    scan(i: number) {
      const b = beacons[i]; if (b.done) return;
      b.done = true; burst(BEACONS[i].x, 2, BEACONS[i].z, BEACONS[i].color, 46);
    },
    isScanned: (i: number) => beacons[i].done,
    reset() {
      count = 0; online = 0; life.fill(0);
      shards.forEach((s) => { s.taken = false; s.g.visible = true; s.x = s.home.x; s.z = s.home.z; });
      arcs.forEach((a) => (a.material = dim));
      beacons.forEach((b) => (b.done = false));
    },
    update(t: number, dt: number, motion: number, near: number, reading = 0) {
      beacons.forEach((b, i) => {
        b.wake += ((near === i ? 1 : 0) - b.wake) * Math.min(1, dt * 6);
        const y = 1.75 + Math.sin(t * 1.5 + i) * 0.16 * motion + b.wake * 0.25;
        b.core.position.y = b.cage.position.y = b.halo.position.y = y;
        b.core.rotation.y = t * (0.7 + b.wake * 1.4) * motion;
        b.cage.rotation.set(Math.PI / 2 + Math.sin(t * 0.8 + i) * 0.5 * motion, t * 0.6 * motion, 0);
        b.core.scale.setScalar(1 + b.wake * 0.18);
        // once scanned, a beacon settles: its column dims and its ring stays as a quiet marker
        // while a card is open the columns step back, so they never cross what you're looking at
        b.light.power.value = (b.done ? 0.12 : 0.42) * (1 - b.wake * 0.62) * (1 - reading * 0.92);
        b.halo.material.opacity = (b.done ? 0.14 : 0.3) * (1 - b.wake * 0.35);
        b.ring.scale.setScalar(1 + b.wake * 0.08);
        const phase = motion ? (t * 0.7 + i * 0.3) % 1 : 0.4;
        b.pulse.scale.setScalar(1 + phase * (0.45 + b.wake * 0.35));
        (b.pulse.material as THREE.MeshBasicMaterial).opacity = (b.done && !b.wake ? 0 : (1 - phase) * 0.6);
      });
      shards.forEach((s, i) => {
        if (s.taken) return;
        s.g.position.set(s.x, 1.25 + Math.sin(t * 2 + i) * 0.22 * motion, s.z);
        s.gem.rotation.y = t * 1.6 * motion; s.orbit.rotation.set(Math.PI / 2 + Math.sin(t + i) * 0.45, t * 0.9 * motion, 0);
      });
      const complete = count === SHARDS.length;
      online += ((complete ? 1 : 0) - online) * Math.min(1, dt * 0.9);
      column.power.value = online * 0.5;
      column.mesh.visible = online > 0.01;
      relay.rotation.y = Math.sin(t * 0.22) * 0.22 * motion;
      gyro.rotation.y = t * (0.4 + online * 1.6) * motion;
      inner.rotation.x = t * (0.55 + online) * motion; inner2.rotation.set(t * -0.8 * motion, 0, t * 0.5 * motion);
      heart.rotation.set(t * 0.3 * motion, t * 0.5 * motion, 0);
      heartMat.emissiveIntensity = 0.9 + (count / SHARDS.length) * 0.9 + online * 1.2;
      heartHalo.material.opacity = 0.3 + (count / SHARDS.length) * 0.2 + online * 0.25;
      for (let i = 0; i < N; i++) {
        if (life[i] <= 0) { colr.set([0, 0, 0], i * 3); continue; }
        life[i] -= dt * 1.15; vel[i * 3 + 1] -= dt * 9;
        for (let k = 0; k < 3; k++) pos[i * 3 + k] += vel[i * 3 + k] * dt;
        const f = Math.max(0, life[i]);
        colr.set([tone[i * 3] * f, tone[i * 3 + 1] * f, tone[i * 3 + 2] * f], i * 3);
      }
      sparkGeo.attributes.position.needsUpdate = sparkGeo.attributes.color.needsUpdate = true;
    },
  };
}

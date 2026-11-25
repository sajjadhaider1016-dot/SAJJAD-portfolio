// Sculpted islands, bridges, planting and lamps.
import * as THREE from 'three';
import { BEACONS, BRIDGE_HALF, HUB, ISLES, OBSTACLES, SHARDS, type Isle } from '../world';
import { box, createBatch, cyl, PALETTE, reseed, rnd, torus, type Disposer, type Kit } from './kit';

const tint = (hex: string, jitter: number) => new THREE.Color(hex).offsetHSL(rnd(-0.008, 0.008), 0, rnd(-jitter, jitter));

/** A ring-built mesh: each ring is [radius, height, colour]; edges wander so nothing looks lathe-turned. */
function strata(sides: number, rings: [number, number, string][], wobble: (ring: number, side: number) => number, jitter = 0.03) {
  const pos: number[] = [], colors: number[] = [];
  const point = (ring: number, side: number) => {
    const [r, y] = rings[ring], s = side % sides, a = (s / sides) * Math.PI * 2, k = r + (r > 0.01 ? wobble(ring, s) : 0);
    return [Math.cos(a) * k, y, Math.sin(a) * k];
  };
  for (let ring = 0; ring < rings.length - 1; ring++) for (let s = 0; s < sides; s++) {
    const a = point(ring, s), b = point(ring, s + 1), c = point(ring + 1, s), d = point(ring + 1, s + 1);
    for (const tri of [[a, b, c], [b, d, c]]) {
      const colour = tint(rings[ring + 1][2], jitter);
      for (const v of tri) { pos.push(...v); colors.push(colour.r, colour.g, colour.b); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

/** The top of an island: a polar grid coloured vertex by vertex, so planting reads as soft patches. */
function surface(isle: Isle, sides: number, edge: number[]) {
  const R = isle.r;
  type Band = 'stone' | 'seam' | 'grass' | 'lip';
  const radii: [number, number, Band][] = [[0, 0, 'stone'], [2.1, 0, 'stone'], [2.35, 0, 'seam'], [4.4, 0, 'stone'], [4.7, 0, 'seam']];
  const inner = 4.7, outer = R - 0.95;
  for (let i = 1; i <= 7; i++) radii.push([inner + ((outer - inner) * i) / 7, 0, 'grass']);
  radii.push([R - 0.78, 0.035, 'seam'], [R - 0.12, 0.04, 'lip'], [R, -0.28, 'seam']);
  const grassA = new THREE.Color(PALETTE.grass), grassB = new THREE.Color(PALETTE.grassLight), grassC = new THREE.Color('#3a5272');
  const flat: Record<string, string> = { stone: '#8a86aa', seam: '#5b577e', lip: '#807ba2' };
  const pos: number[] = [], colours: number[] = [];
  const point = (ring: number, side: number): [number, number, number] => {
    const [r, y, band] = radii[ring], s = side % sides, ang = (s / sides) * Math.PI * 2;
    const k = r + (band === 'lip' || ring >= radii.length - 3 ? edge[s] : band === 'grass' && r < outer - 0.1 ? Math.sin(s * 2.3 + ring * 1.7) * 0.14 : 0);
    return [Math.cos(ang) * k, y, Math.sin(ang) * k];
  };
  const shade = (v: [number, number, number], band: Band, jitter: number) => {
    if (band !== 'grass') return tint(flat[band], jitter);
    const x = v[0] + isle.x, z = v[2] + isle.z;
    const light = 0.5 + 0.5 * Math.sin(x * 0.42 + Math.sin(z * 0.31) * 2.1) * Math.cos(z * 0.37 - x * 0.19);
    const cool = Math.max(0, Math.sin(x * 0.21 - 1.3) * Math.sin(z * 0.27 + 0.8));
    return grassA.clone().lerp(grassB, light * light).lerp(grassC, cool * 0.55);
  };
  for (let ring = 0; ring < radii.length - 1; ring++) for (let s = 0; s < sides; s++) {
    const a = point(ring, s), b = point(ring, s + 1), c = point(ring + 1, s), d = point(ring + 1, s + 1), band = radii[ring + 1][2];
    for (const tri of [[a, b, c], [b, d, c]]) {
      const lift = rnd(-0.012, 0.012);
      for (const v of tri) { const colour = shade(v, band, 0.012).offsetHSL(0, 0, lift); pos.push(...v); colours.push(colour.r, colour.g, colour.b); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  g.computeVertexNormals();
  return g;
}

export function buildLand(scene: THREE.Scene, bin: Disposer, kit: Kit, dot: THREE.Texture) {
  reseed(29);
  const { mats } = kit;
  const batch = createBatch(bin);
  const all: Isle[] = [HUB, ...ISLES];
  const crystalGlow = kit.glow('#7f9bff', 1.7);

  all.forEach((isle, n) => {
    const R = isle.r, sides = 56;
    const edge = Array.from({ length: sides }, (_, s) => Math.abs(Math.sin(s * 0.9 + n * 2)) * 0.35 + rnd(0, 0.3));
    // the surface: paving at the heart, planted ground around it, a pale stone lip at the edge
    batch.add(mats.ground, surface(isle, sides, edge), isle.x, 0, isle.z);
    // stone paths lead from the plaza to each bridge
    const links = n ? [HUB] : ISLES;
    links.forEach((other) => {
      const ang = Math.atan2(other.x - isle.x, other.z - isle.z);
      for (let d = 5.05; d < R - 0.7; d += 0.82) {
        for (const [off, w] of [[-0.74, 1.3], [0.74, 1.3]] as const) {
          const shift = (Math.round(d / 0.82) % 2 ? 0.12 : -0.12);
          batch.add(mats.stoneDark, box(w - 0.12, 0.05, 0.7), isle.x + Math.sin(ang) * d + Math.cos(ang) * (off + shift), 0.012, isle.z + Math.cos(ang) * d - Math.sin(ang) * (off + shift), 0, ang, 0);
        }
      }
    });
    // the underside: layered rock narrowing to a ragged point
    const deep = R * 1.35;
    const rough = Array.from({ length: 9 * sides }, () => rnd(-1, 1));
    batch.add(mats.rock, strata(22, [
      [R * 0.985, -0.28, PALETTE.stoneDark], [R * 0.93, -1.3, '#6a5c8e'], [R * 0.78, -2.1, PALETTE.rock], [R * 0.75, -3.8, '#40355f'],
      [R * 0.52, -deep * 0.42, PALETTE.rock], [R * 0.4, -deep * 0.62, '#342b55'], [R * 0.2, -deep * 0.8, PALETTE.rockDeep], [0, -deep, PALETTE.rockDeep],
    ], (ring, s) => (ring > 0 && ring < 7 ? rough[ring * 22 + s] * R * 0.07 : ring === 0 ? 0.12 : 0), 0.045), isle.x, 0, isle.z);
    // crystals growing out of the rock, catching the bloom
    for (let i = 0; i < 6; i++) {
      const a = rnd(0, Math.PI * 2), d = R * rnd(0.3, 0.66), y = -rnd(3.4, deep * 0.62), s = rnd(0.28, 0.7);
      batch.add(crystalGlow, new THREE.OctahedronGeometry(1), isle.x + Math.cos(a) * d, y, isle.z + Math.sin(a) * d, rnd(-0.5, 0.5), a, rnd(-0.5, 0.5), s * 0.34, s * 1.5, s * 0.34);
    }
    // inlaid rings of light around the plaza
    batch.add(mats.accent, torus(4.55, 0.035, Math.PI * 2, 96), isle.x, 0.025, isle.z, Math.PI / 2);
    batch.add(mats.pale, torus(2.22, 0.05, Math.PI * 2, 64), isle.x, 0.02, isle.z, Math.PI / 2);
    // loose stones drifting below the edge
    for (let i = 0; i < 4; i++) {
      const a = rnd(0, Math.PI * 2), d = R + rnd(1.5, 5);
      batch.add(mats.stoneDark, new THREE.DodecahedronGeometry(rnd(0.25, 0.9), 0), isle.x + Math.cos(a) * d, -rnd(2.5, 11), isle.z + Math.sin(a) * d, rnd(0, 3), rnd(0, 3));
    }
  });

  // bridges: floating slabs with a lit rail on each side
  const rail = kit.glow('#9db2ff', 1.35);
  ISLES.forEach((isle) => {
    const len = Math.hypot(isle.x, isle.z), ang = Math.atan2(isle.x, isle.z), sin = Math.sin(ang), cos = Math.cos(ang);
    const from = HUB.r - 0.35, to = len - isle.r + 0.35, span = to - from;
    const at = (d: number, side: number, y: number) => [sin * d + cos * side, y, cos * d - sin * side] as const;
    const slabs = Math.round(span / 1.25);
    for (let i = 0; i < slabs; i++) {
      const d = from + ((i + 0.5) / slabs) * span;
      batch.add(mats.stoneDark, box(BRIDGE_HALF * 2 - 0.35, 0.22, span / slabs - 0.16), ...at(d, 0, -0.12), 0, ang, 0);
      batch.add(mats.stone, box(BRIDGE_HALF * 2 - 1.25, 0.04, span / slabs - 0.34), ...at(d, 0, 0.005), 0, ang, 0);
    }
    for (const side of [-1, 1]) {
      batch.add(mats.metal, box(0.2, 0.34, span), ...at(from + span / 2, side * (BRIDGE_HALF - 0.06), -0.12), 0, ang, 0);
      batch.add(rail, box(0.06, 0.05, span), ...at(from + span / 2, side * (BRIDGE_HALF - 0.06), 0.08), 0, ang, 0);
      for (const d of [from + 0.25, to - 0.25]) {
        batch.add(mats.metal, box(0.42, 1.5, 0.42), ...at(d, side * (BRIDGE_HALF + 0.08), 0.6), 0, ang, 0);
        batch.add(mats.lamp, new THREE.OctahedronGeometry(0.22), ...at(d, side * (BRIDGE_HALF + 0.08), 1.62), 0, ang, 0);
      }
    }
    batch.add(mats.metal, box(0.7, 0.2, span - 1), ...at(from + span / 2, 0, -0.45), 0, ang, 0);
  });
  batch.build(scene);

  // planting: instanced, so a whole grove costs a handful of draw calls
  const spots: { x: number; z: number; s: number; kind: number }[] = [];
  const blocked = (x: number, z: number, pad: number) =>
    OBSTACLES.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + pad) || SHARDS.some(([a, b]) => Math.hypot(x - a, z - b) < 1.6) ||
    ISLES.some((i) => { const t = Math.max(0, Math.min(1, (x * i.x + z * i.z) / (i.x * i.x + i.z * i.z))); return Math.hypot(x - i.x * t, z - i.z * t) < BRIDGE_HALF + 1.5; });
  all.forEach((isle) => {
    let placed = 0;
    for (let tries = 0; tries < 140 && placed < isle.r * 1.7; tries++) {
      const a = rnd(0, Math.PI * 2), d = rnd(isle.r * 0.64, isle.r - 1.25), x = isle.x + Math.cos(a) * d, z = isle.z + Math.sin(a) * d;
      const front = z > isle.z + isle.r * 0.45; // keep the side facing the camera low and open
      if (blocked(x, z, 0.7) || spots.some((s) => Math.hypot(s.x - x, s.z - z) < 1.05)) continue;
      spots.push({ x, z, s: rnd(0.65, 1.2) * (front ? 0.55 : 1), kind: front ? 2 : rnd() > 0.72 ? 1 : 0 });
      placed++;
    }
  });
  const dummy = new THREE.Object3D();
  const instanced = (geo: THREE.BufferGeometry, mat: THREE.Material, list: typeof spots, place: (s: (typeof spots)[number], d: THREE.Object3D) => void, colours?: string[]) => {
    const mesh = new THREE.InstancedMesh(bin.add(geo), mat, list.length);
    list.forEach((s, i) => {
      dummy.position.set(s.x, 0, s.z); dummy.rotation.set(0, rnd(0, 6), 0); dummy.scale.setScalar(s.s);
      place(s, dummy); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
      if (colours) mesh.setColorAt(i, tint(colours[Math.floor(rnd(0, colours.length))], 0.03));
    });
    mesh.castShadow = mesh.receiveShadow = true; mesh.computeBoundingSphere(); scene.add(mesh);
    bin.add(mesh);
  };
  const cypress = spots.filter((s) => s.kind === 0), blossom = spots.filter((s) => s.kind === 1), shrubs = spots.filter((s) => s.kind === 2);
  instanced(cyl(0.09, 0.14, 0.9, 6), mats.trunk, [...cypress, ...blossom], (s, d) => { d.position.y = 0.4 * s.s; });
  [[0.72, 1.5, 1.35], [0.56, 1.35, 2.15], [0.36, 1.15, 2.9]].forEach(([r, h, y]) =>
    instanced(new THREE.ConeGeometry(r, h, 8), mats.leaf, cypress, (s, d) => { d.position.y = y * s.s; }, ['#2f6a66', '#3b7d72', '#2c5a64']));
  instanced(new THREE.IcosahedronGeometry(0.92, 1), mats.leaf, blossom, (s, d) => { d.position.y = 1.55 * s.s; d.scale.y = s.s * 0.85; }, ['#d98fb0', '#a98fd6', '#e8a99c']);
  instanced(new THREE.IcosahedronGeometry(0.62, 0), mats.leaf, shrubs, (s, d) => { d.position.y = 0.25 * s.s; d.scale.y = s.s * 0.7; }, ['#4b8a76', '#6a9a80', '#8f7fb5']);
  const tufts = Array.from({ length: 520 }, () => {
    const isle = all[Math.floor(rnd(0, all.length))], a = rnd(0, Math.PI * 2), d = rnd(5, isle.r - 0.95);
    return { x: isle.x + Math.cos(a) * d, z: isle.z + Math.sin(a) * d, s: rnd(0.5, 1.25), kind: 0 };
  });
  instanced(new THREE.ConeGeometry(0.11, 0.34, 4), mats.leaf, tufts, (s, d) => { d.position.y = 0.14 * s.s; }, ['#79b095', '#5f967f', '#9bbd97']);

  // path lamps, each with a soft pool of light painted on the ground
  const lamps: [number, number][] = [];
  all.forEach((isle, n) => {
    const count = n ? 5 : 8;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.45 + n, x = isle.x + Math.cos(a) * 5.4, z = isle.z + Math.sin(a) * 5.4;
      if (!blocked(x, z, 0.4) && !BEACONS.some((b) => Math.hypot(b.x - x, b.z - z) < 2.6)) lamps.push([x, z]);
    }
  });
  const posts = createBatch(bin);
  lamps.forEach(([x, z]) => {
    posts.add(mats.metal, cyl(0.05, 0.09, 1.25, 8), x, 0.62, z);
    posts.add(mats.lamp, cyl(0.13, 0.13, 0.2, 10), x, 1.34, z);
    posts.add(mats.metal, cyl(0.02, 0.2, 0.14, 10), x, 1.52, z);
  });
  posts.build(scene);
  const pools = new THREE.InstancedMesh(bin.add(new THREE.PlaneGeometry(3.6, 3.6).rotateX(-Math.PI / 2)),
    bin.add(new THREE.MeshBasicMaterial({ map: dot, color: '#ffb56b', transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending })), lamps.length);
  lamps.forEach(([x, z], i) => { dummy.position.set(x, 0.06, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); pools.setMatrixAt(i, dummy.matrix); });
  pools.computeBoundingSphere(); scene.add(pools); bin.add(pools);
}

// Shared tools for the game's art: palette, materials, seeded randomness, textures and geometry batching.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const PALETTE = {
  zenith: '#0a0f2c', high: '#1c2866', mid: '#51519a', horizon: '#ee9677', sun: '#ffdcae',
  grass: '#2f5a5e', grassLight: '#447a6d', stone: '#a29dc0', stoneDark: '#66628a',
  rock: '#554a78', rockDeep: '#1c1838', metal: '#1b2148', accent: '#6f8dff', amber: '#ffc977',
};

let seed = 11;
export const reseed = (s: number) => { seed = s; };
export const rnd = (a = 0, b = 1) => { seed = (seed * 16807) % 2147483647; return a + (seed / 2147483647) * (b - a); };

/** Collects everything the renderer must free. */
export function createDisposer() {
  const items = new Set<{ dispose: () => void }>();
  return { add<T extends { dispose: () => void }>(x: T) { items.add(x); return x; }, run() { items.forEach((x) => x.dispose()); items.clear(); } };
}
export type Disposer = ReturnType<typeof createDisposer>;

export function createKit(bin: Disposer) {
  const std = (color: THREE.ColorRepresentation, o: THREE.MeshStandardMaterialParameters = {}) => bin.add(new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.04, ...o }));
  const glow = (color: THREE.ColorRepresentation, strength = 2) => bin.add(new THREE.MeshStandardMaterial({ color: '#000000', emissive: color, emissiveIntensity: strength, roughness: 1 }));
  const mats = {
    ground: std('#ffffff', { vertexColors: true, roughness: 0.95, flatShading: true }),
    rock: std('#ffffff', { vertexColors: true, roughness: 0.9, flatShading: true }),
    stone: std(PALETTE.stone, { roughness: 0.7 }),
    stoneDark: std(PALETTE.stoneDark, { roughness: 0.75 }),
    pale: std('#e9e5f4', { roughness: 0.45, metalness: 0.08 }),
    metal: std(PALETTE.metal, { roughness: 0.38, metalness: 0.65 }),
    glass: std('#16204a', { roughness: 0.12, metalness: 0.8 }),
    trunk: std('#4a3a56'),
    leaf: std('#ffffff', { roughness: 0.9, flatShading: true }),
    lamp: glow('#ffc980', 3),
    accent: glow(PALETTE.accent, 2.2),
    window: glow('#ffd9a0', 1.5),
  };
  return { std, glow, mats };
}
export type Kit = ReturnType<typeof createKit>;

/** Merges many small pieces into one mesh per material, which keeps draw calls low. */
export function createBatch(bin: Disposer) {
  const groups = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  return {
    add(material: THREE.Material, geo: THREE.BufferGeometry, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
      const g = geo.index ? geo.toNonIndexed() : geo.clone();
      g.deleteAttribute('uv');
      if (!(material as THREE.MeshStandardMaterial).vertexColors) g.deleteAttribute('color');
      g.applyMatrix4(m.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), new THREE.Vector3(sx, sy, sz)));
      geo.dispose();
      let list = groups.get(material);
      if (!list) groups.set(material, (list = []));
      list.push(g);
    },
    build(parent: THREE.Object3D, cast = true) {
      groups.forEach((list, material) => {
        const merged = mergeGeometries(list, false);
        list.forEach((g) => g.dispose());
        if (!merged) return;
        const mesh = new THREE.Mesh(bin.add(merged), material);
        const emits = ((material as THREE.MeshStandardMaterial).emissiveIntensity ?? 0) > 1;
        mesh.castShadow = cast && !emits; mesh.receiveShadow = !emits;
        mesh.matrixAutoUpdate = false;
        parent.add(mesh);
      });
      groups.clear();
    },
  };
}
export type Batch = ReturnType<typeof createBatch>;

export const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
export const cyl = (top: number, bottom: number, h: number, sides = 24, open = false) => new THREE.CylinderGeometry(top, bottom, h, sides, 1, open);
export const torus = (r: number, tube: number, arc = Math.PI * 2, segments = 64) => new THREE.TorusGeometry(r, tube, 8, segments, arc);

export function canvasTexture(bin: Disposer, w: number, h: number, paint: (g: CanvasRenderingContext2D) => void) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  paint(cv.getContext('2d')!);
  const t = bin.add(new THREE.CanvasTexture(cv));
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
/** A soft round dot, for halos, particles and contact shadows. */
export function dotTexture(bin: Disposer) {
  return canvasTexture(bin, 128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  });
}

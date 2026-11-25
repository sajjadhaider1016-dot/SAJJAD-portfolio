// Pip, the little courier you fly: glossy shell, glass visor, floating hands, a hover ring and a light trail.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { torus, type Disposer, type Kit } from './kit';

export type PipPose = { x: number; z: number; heading: number; vx: number; vz: number; boost: boolean; near: boolean };

export function buildPip(scene: THREE.Scene, bin: Disposer, kit: Kit, dot: THREE.Texture) {
  const shell = bin.add(new THREE.MeshPhysicalMaterial({ color: '#4f6ff0', roughness: 0.32, metalness: 0.18, clearcoat: 1, clearcoatRoughness: 0.18 }));
  const white = bin.add(new THREE.MeshPhysicalMaterial({ color: '#eef0ff', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.25 }));
  const visor = bin.add(new THREE.MeshPhysicalMaterial({ color: '#070b1f', roughness: 0.08, metalness: 0.55, clearcoat: 1 }));
  const eye = kit.glow('#8ff3ff', 2.7), tip = kit.glow('#7df0c0', 2.6), jet = kit.glow('#9fc0ff', 3);

  const root = new THREE.Group(), body = new THREE.Group(), head = new THREE.Group();
  root.add(body); body.add(head);
  const part = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(bin.add(geo), mat); m.position.set(x, y, z); parent.add(m); return m;
  };
  head.position.y = 1.55;
  part(head, new RoundedBoxGeometry(1.46, 1.12, 1.14, 5, 0.42), shell);
  part(head, new RoundedBoxGeometry(1.17, 0.7, 0.2, 4, 0.1), visor, 0, -0.02, 0.52);
  const eyes = [-0.27, 0.27].map((x) => part(head, new THREE.CapsuleGeometry(0.075, 0.13, 4, 10), eye, x, 0.04, 0.635));
  part(head, torus(0.11, 0.022, Math.PI, 20), eye, 0, -0.17, 0.63).rotation.z = Math.PI;
  for (const s of [-1, 1]) {
    part(head, new THREE.CylinderGeometry(0.25, 0.25, 0.14, 24), white, s * 0.76, 0, 0).rotation.z = Math.PI / 2;
    part(head, torus(0.16, 0.03), eye, s * 0.84, 0, 0).rotation.y = Math.PI / 2;
  }
  part(head, new THREE.CylinderGeometry(0.025, 0.035, 0.36, 8), white, 0, 0.7, 0);
  const antenna = part(head, new THREE.SphereGeometry(0.11, 16, 12), tip, 0, 0.93, 0);
  part(body, new RoundedBoxGeometry(0.82, 0.56, 0.66, 4, 0.24), white, 0, 0.72, 0);
  part(body, new RoundedBoxGeometry(0.34, 0.2, 0.1, 3, 0.05), shell, 0, 0.74, 0.32);
  const hands = [-1, 1].map((s) => part(body, new THREE.CapsuleGeometry(0.13, 0.18, 4, 12), shell, s * 0.68, 0.72, 0.04));
  const halo = part(body, torus(0.5, 0.035), jet, 0, 0.28, 0); halo.rotation.x = Math.PI / 2;
  const flame = part(body, new THREE.ConeGeometry(0.22, 0.5, 20, 1, true), bin.add(new THREE.MeshBasicMaterial({ color: '#8fb4ff', transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })), 0, 0.06, 0);
  flame.rotation.x = Math.PI;
  root.scale.setScalar(1.08);
  scene.add(root);

  // the shadows are baked once, so Pip carries a soft contact shadow and a pool of light of its own
  const flat = (color: string, size: number, opacity: number, additive: boolean) => {
    const m = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2)), bin.add(new THREE.MeshBasicMaterial({ map: dot, color, transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending })));
    scene.add(m); return m;
  };
  const shadow = flat('#05061a', 2.6, 0.6, false), pool = flat('#6f9bff', 4.2, 0.32, true);

  // trail: a short ribbon of particles left behind while moving
  const N = 90, positions = new Float32Array(N * 3), colours = new Float32Array(N * 3), life = new Float32Array(N);
  const trailGeo = bin.add(new THREE.BufferGeometry());
  trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  trailGeo.setAttribute('color', new THREE.BufferAttribute(colours, 3));
  const trail = new THREE.Points(trailGeo, bin.add(new THREE.PointsMaterial({ map: dot, size: 0.62, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  trail.frustumCulled = false; scene.add(trail);
  let cursor = 0, owed = 0, turned = 0, bank = 0, blink = 3;

  return {
    object: root,
    clearTrail() { life.fill(0); colours.fill(0); trailGeo.attributes.color.needsUpdate = true; },
    update(p: PipPose, t: number, dt: number, motion: number) {
      const speed = Math.hypot(p.vx, p.vz), hover = Math.sin(t * 2.6) * 0.11 * motion;
      root.position.set(p.x, 0.22 + hover, p.z);
      const turn = Math.atan2(Math.sin(p.heading - turned), Math.cos(p.heading - turned));
      turned += turn * Math.min(1, dt * 11);
      root.rotation.y = turned;
      // lean into speed and bank into turns
      bank += (THREE.MathUtils.clamp(-turn * 0.5, -0.32, 0.32) - bank) * Math.min(1, dt * 6);
      body.rotation.x = Math.min(0.3, speed * 0.017);
      body.rotation.z = bank * Math.min(1, speed / 6);
      // at rest it looks around; near a beacon it looks up at it
      const idle = speed < 0.6 ? 1 : 0;
      head.rotation.y += (idle * Math.sin(t * 0.55) * 0.34 * motion - head.rotation.y) * Math.min(1, dt * 3);
      head.rotation.x += ((p.near && idle ? -0.16 : 0) - head.rotation.x) * Math.min(1, dt * 4);
      hands.forEach((h, i) => { h.position.y = 0.72 + Math.sin(t * 2.6 + 1.2 + i * Math.PI) * 0.06 * motion; h.rotation.x = -Math.min(0.9, speed * 0.06); });
      blink -= dt; if (blink < -0.13) blink = 2.4 + Math.random() * 3;
      eyes.forEach((e) => { e.scale.y = blink < 0 ? 0.12 : 1; });
      antenna.scale.setScalar(1 + Math.sin(t * 5) * 0.12 * motion);
      halo.scale.setScalar(1 + Math.sin(t * 6) * 0.05 * motion + speed * 0.008);
      flame.scale.set(1, 0.75 + speed * 0.055 + (p.boost ? 0.5 : 0) + Math.sin(t * 31) * 0.08 * motion, 1);
      flame.position.y = 0.2 - flame.scale.y * 0.24;
      shadow.position.set(p.x, 0.075, p.z); shadow.scale.setScalar(1 - hover * 0.5);
      pool.position.set(p.x, 0.085, p.z);

      owed += motion && speed > 1.5 ? dt * (p.boost ? 70 : 34) : 0;
      while (owed >= 1) {
        owed--; cursor = (cursor + 1) % N; life[cursor] = 1;
        positions.set([p.x - Math.sin(turned) * 0.55 + (Math.random() - 0.5) * 0.35, 0.5 + hover + (Math.random() - 0.5) * 0.25, p.z - Math.cos(turned) * 0.55 + (Math.random() - 0.5) * 0.35], cursor * 3);
      }
      for (let i = 0; i < N; i++) {
        life[i] = Math.max(0, life[i] - dt * 1.9);
        const k = life[i] * life[i];
        colours.set([0.36 * k, 0.55 * k, 1.1 * k], i * 3);
        positions[i * 3 + 1] -= dt * 0.35;
      }
      trailGeo.attributes.position.needsUpdate = trailGeo.attributes.color.needsUpdate = true;
    },
  };
}

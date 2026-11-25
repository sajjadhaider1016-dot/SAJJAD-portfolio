// One landmark per part of the portfolio, built from the real content: project screenshots, one monolith per role,
// one orbiting node per skill area, one plaque per certificate, and the portrait at home.
import * as THREE from 'three';
import { certifications, experience, profile, projects, skills } from '../../data/content';
import { BEACONS, PORTRAIT } from '../world';
import { box, canvasTexture, createBatch, cyl, PALETTE, torus, type Disposer, type Kit } from './kit';

type Tick = (t: number, motion: number) => void;

/** A floating name plate that always faces the camera. */
function plate(bin: Disposer, title: string, kicker: string, color: string) {
  const tex = canvasTexture(bin, 1024, 256, () => {});
  const paint = () => {
    const cv = tex.image as HTMLCanvasElement, g = cv.getContext('2d')!;
    g.clearRect(0, 0, 1024, 256); g.textAlign = 'center';
    g.font = '500 76px Geist, system-ui, sans-serif';
    const titleWidth = g.measureText(title).width;
    g.font = "400 40px 'Geist Mono', ui-monospace, monospace";
    const w = Math.min(1016, Math.max(titleWidth, g.measureText(kicker.toUpperCase()).width, 360) + 90);
    g.font = '500 76px Geist, system-ui, sans-serif';
    g.fillStyle = 'rgba(11,15,40,.74)'; g.beginPath(); g.roundRect(512 - w / 2, 22, w, 206, 40); g.fill();
    g.strokeStyle = 'rgba(210,220,255,.28)'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#ffffff'; g.fillText(title, 512, 126, 940);
    g.fillStyle = color; g.font = "400 40px 'Geist Mono', ui-monospace, monospace"; g.fillText(kicker.toUpperCase(), 512, 188, 920);
    tex.needsUpdate = true;
  };
  paint(); document.fonts.ready.then(paint);
  const sprite = new THREE.Sprite(bin.add(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, toneMapped: false })));
  sprite.scale.set(6.4, 1.6, 1);
  sprite.renderOrder = 3;
  return sprite;
}

export function buildLandmarks(scene: THREE.Scene, bin: Disposer, kit: Kit, onTexture: () => void) {
  const { mats } = kit;
  const ticks: Tick[] = [];
  const plates: THREE.Sprite[] = [];
  const loader = new THREE.TextureLoader();
  const picture = (src: string) => {
    const t = bin.add(loader.load(src, onTexture));
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
  };
  const screenMat = (map: THREE.Texture) => bin.add(new THREE.MeshBasicMaterial({ map, color: '#e8ebf5', toneMapped: false }));

  const groups = BEACONS.map((b, i) => {
    const g = new THREE.Group();
    g.position.set(b.mark.x, 0, b.mark.z);
    scene.add(g);
    const sign = plate(bin, b.title, b.kicker, b.color);
    sign.position.set(b.mark.x, [8.9, 8.6, 8.4, 8.7, 10.7][i], b.mark.z);
    scene.add(sign); plates.push(sign);
    return g;
  });
  const add = (g: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(bin.add(geo), mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m;
  };

  // ── Projects: a curved open-air gallery showing the real screenshots
  {
    const g = groups[0], b = createBatch(bin);
    b.add(mats.pale, cyl(4.1, 4.35, 0.36, 48), 0, 0.18, 0, 0, 0, 0, 1, 1, 0.62);
    b.add(mats.stoneDark, cyl(3.7, 3.7, 0.12, 48), 0, 0.42, 0, 0, 0, 0, 1, 1, 0.62);
    const shots = projects.filter((p) => p.image);
    const slots: [number, number, number, number, number][] = [[0, 3.65, -0.9, 0, 4.6], [-3.95, 2.9, 0.35, 0.5, 3.15], [3.95, 2.9, 0.35, -0.5, 3.15], [-2.55, 6.2, -1.1, 0.24, 2.55], [2.55, 6.2, -1.1, -0.24, 2.55]];
    shots.slice(0, slots.length).forEach((p, i) => {
      const [x, y, z, turn, w] = slots[i], h = w * 0.64;
      const panel = new THREE.Group(); panel.position.set(x, y, z); panel.rotation.y = turn; g.add(panel);
      add(panel, box(w + 0.18, h + 0.18, 0.12), mats.metal);
      const face = add(panel, new THREE.PlaneGeometry(w, h), screenMat(picture(p.image!)), 0, 0, 0.07);
      face.castShadow = false;
      add(panel, box(w * 0.62, 0.05, 0.05), mats.accent, 0, -h / 2 - 0.17, 0.05).castShadow = false;
      ticks.push((t, motion) => { panel.position.y = y + Math.sin(t * 0.9 + i * 1.4) * 0.13 * motion; });
    });
    for (const x of [-3.6, 3.6]) { b.add(mats.metal, box(0.22, 2, 0.22), x, 1.2, 0); b.add(mats.lamp, box(0.24, 0.12, 0.24), x, 2.26, 0); }
    b.build(g);
  }
  // ── Experience: a stair of monoliths, one for each role
  {
    const g = groups[1], b = createBatch(bin);
    b.add(mats.stoneDark, cyl(3.7, 4, 0.34, 8), 0, 0.17, 0);
    const warm = kit.glow('#ff9a6b', 2.4);
    experience.slice().reverse().forEach((role, i) => {
      const x = -2.55 + i * 1.7, h = 2.5 + i * 1.15, z = -Math.sin((i / 3) * Math.PI) * 0.8;
      b.add(mats.pale, box(1.12, h, 1.12), x, 0.34 + h / 2, z, 0, Math.PI / 12);
      b.add(mats.metal, box(1.24, 0.22, 1.24), x, 0.45 + h, z, 0, Math.PI / 12);
      b.add(warm, box(1.16, 0.07, 1.16), x, 0.34 + h - 0.36, z, 0, Math.PI / 12);
      for (let y = 0.9; y < h - 0.7; y += 0.62) b.add(mats.window, box(0.12, 0.3, 0.04), x + 0.15, y + 0.34, z + 0.56, 0, Math.PI / 12);
      const gem = add(g, new THREE.OctahedronGeometry(0.3), warm, x, h + 1.15, z);
      gem.userData.org = role.org; gem.castShadow = false;
      ticks.push((t, motion) => { gem.rotation.y = t * 0.9 + i; gem.position.y = h + 1.15 + Math.sin(t * 1.4 + i) * 0.14 * motion; });
    });
    b.build(g);
  }
  // ── Skills: an armillary with one orbiting node for each skill area
  {
    const g = groups[2], b = createBatch(bin);
    b.add(mats.stoneDark, cyl(3.2, 3.5, 0.34, 40), 0, 0.17, 0);
    b.add(mats.metal, cyl(0.5, 1.15, 1.5, 12), 0, 1.05, 0);
    b.add(mats.pale, torus(2.55, 0.07), 0, 0.42, 0, Math.PI / 2);
    b.build(g);
    const teal = kit.glow('#5fe0c0', 2.1);
    const core = add(g, new THREE.IcosahedronGeometry(0.85, 1), kit.std('#bff7ea', { emissive: '#2fbf9f', emissiveIntensity: 0.9, roughness: 0.2, metalness: 0.4, flatShading: true }), 0, 4.2, 0);
    const rings = [[2.0, 0.3, 0], [2.55, -0.55, 0.5], [3.05, 0.15, -0.75]].map(([r, tx, tz]) => {
      const ring = new THREE.Group(); ring.position.y = 4.2; ring.rotation.set(Math.PI / 2 + tx, tz, 0); g.add(ring);
      add(ring, torus(r, 0.055), mats.pale);
      return { ring, r };
    });
    const nodes = skills.map((_, i) => {
      const host = rings[i % 3], node = add(host.ring, new THREE.SphereGeometry(0.17, 12, 10), teal);
      node.castShadow = false;
      return { node, r: host.r, a: (i / skills.length) * Math.PI * 6, speed: 0.32 - (i % 3) * 0.06 };
    });
    ticks.push((t, motion) => {
      core.rotation.set(t * 0.25 * motion, t * 0.4 * motion, 0);
      rings.forEach(({ ring }, i) => { ring.rotation.z = (i - 1) * 0.5 + t * (0.09 + i * 0.05) * motion * (i % 2 ? -1 : 1); });
      nodes.forEach((n) => { const a = n.a + t * n.speed * motion; n.node.position.set(Math.cos(a) * n.r, Math.sin(a) * n.r, 0); });
    });
  }
  // ── Education: a domed pavilion circled by one plaque for each certificate
  {
    const g = groups[3], b = createBatch(bin);
    b.add(mats.stoneDark, cyl(3.75, 4, 0.3, 48), 0, 0.15, 0);
    b.add(mats.pale, cyl(3.25, 3.4, 0.28, 48), 0, 0.44, 0);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.PI / 10, x = Math.cos(a) * 2.65, z = Math.sin(a) * 2.65;
      b.add(mats.pale, cyl(0.19, 0.22, 3.3, 12), x, 2.22, z);
      b.add(mats.stone, box(0.52, 0.14, 0.52), x, 3.93, z, 0, -a);
      b.add(mats.stone, box(0.52, 0.14, 0.52), x, 0.64, z, 0, -a);
    }
    b.add(mats.pale, cyl(3.12, 3.12, 0.4, 48), 0, 4.2, 0);
    b.add(kit.glow('#b39bff', 1.8), torus(3.14, 0.045, Math.PI * 2, 96), 0, 4.02, 0, Math.PI / 2);
    b.add(kit.std('#5c58a8', { roughness: 0.3, metalness: 0.55 }), new THREE.SphereGeometry(2.8, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), 0, 4.4, 0, 0, 0, 0, 1, 0.66, 1);
    b.add(mats.metal, cyl(0.06, 0.2, 0.9, 10), 0, 6.65, 0);
    b.add(mats.lamp, new THREE.SphereGeometry(0.2, 12, 10), 0, 7.2, 0);
    b.add(mats.window, cyl(0.62, 0.62, 0.1, 24), 0, 0.64, 0);
    b.build(g);
    const orbit = new THREE.Group(); orbit.position.y = 5; g.add(orbit);
    const card = bin.add(box(0.46, 0.62, 0.05)), seal = bin.add(box(0.2, 0.2, 0.06));
    const lilac = kit.glow('#b39bff', 1.6);
    certifications.forEach((_, i) => {
      const a = (i / certifications.length) * Math.PI * 2, holder = new THREE.Group();
      holder.position.set(Math.cos(a) * 4.25, 0, Math.sin(a) * 4.25); holder.rotation.y = -a + Math.PI / 2;
      holder.add(new THREE.Mesh(card, mats.pale));
      const s = new THREE.Mesh(seal, lilac); s.position.y = 0.08; holder.add(s);
      orbit.add(holder);
    });
    ticks.push((t, motion) => { orbit.rotation.y = t * 0.12 * motion; orbit.position.y = 5 + Math.sin(t * 0.8) * 0.12 * motion; });
  }
  // ── Home: a lighthouse, with the portrait standing beside it
  {
    const g = groups[4], b = createBatch(bin);
    b.add(mats.stoneDark, cyl(2.15, 2.4, 0.42, 12), 0, 0.21, 0);
    for (let i = 0; i < 6; i++) {
      const r = 1.42 - i * 0.14;
      b.add(i % 2 ? kit.std(PALETTE.amber, { roughness: 0.55 }) : mats.pale, cyl(r - 0.14, r, 1.12, 24), 0, 0.98 + i * 1.12, 0);
    }
    b.add(mats.metal, cyl(1.02, 1.02, 0.16, 24), 0, 7.2, 0);
    b.add(mats.metal, torus(1.0, 0.045), 0, 7.62, 0, Math.PI / 2);
    b.add(kit.glow('#ffe0a8', 3.4), cyl(0.46, 0.46, 0.86, 18), 0, 7.72, 0);
    b.add(mats.metal, new THREE.ConeGeometry(0.82, 0.8, 18), 0, 8.55, 0);
    for (let i = 0; i < 4; i++) b.add(mats.window, box(0.22, 0.38, 0.08), 0, 1.5 + i * 1.5, 1.34 - i * 0.187);
    b.build(g);
    const beam = bin.add(new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.045, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    const sweep = new THREE.Group(); sweep.position.y = 7.72; g.add(sweep);
    for (const dir of [1, -1]) {
      const cone = new THREE.Mesh(bin.add(new THREE.ConeGeometry(1.1, 10, 20, 1, true).rotateZ(Math.PI / 2).translate(5.4, 0, 0)), beam);
      cone.rotation.y = dir > 0 ? 0 : Math.PI; sweep.add(cone);
    }
    ticks.push((t, motion) => { sweep.rotation.y = motion ? t * 0.35 : 0.7; });
    const frame = new THREE.Group(); frame.position.set(PORTRAIT.x - BEACONS[4].mark.x, 2.55, PORTRAIT.z - BEACONS[4].mark.z); frame.rotation.y = -0.3; g.add(frame);
    add(frame, box(2.2, 3.5, 0.16), mats.metal);
    add(frame, new THREE.PlaneGeometry(1.96, 3.26), screenMat((() => { const t = picture(profile.portrait); t.repeat.set(1, 0.935); t.offset.set(0, 0.065); return t; })()), 0, 0, 0.09).castShadow = false;
    add(frame, box(0.3, 1.1, 0.3), mats.metal, 0, -2.1, 0);
  }

  return {
    plates,
    update: (t: number, motion: number) => ticks.forEach((f) => f(t, motion)),
  };
}

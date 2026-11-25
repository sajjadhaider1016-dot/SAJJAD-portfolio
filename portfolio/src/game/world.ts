// Layout and rules for Signal Isles. Pure data and maths, no rendering.
import { certifications, education, experience, profile, projects, services, skills } from '../data/content';

export type Isle = { x: number; z: number; r: number };
export const HUB: Isle = { x: 0, z: 0, r: 13.5 };
export const ISLES: Isle[] = [
  { x: -35, z: -9, r: 11 }, { x: -16, z: -38, r: 11 }, { x: 18, z: -38, r: 11 }, { x: 36, z: -8, r: 11 },
  { x: 0, z: 32, r: 10 }, // the home isle: about me
];
export const BRIDGE_HALF = 2.2;
export const SPAWN = { x: 0, z: 6.5 };
export const RELAY = { x: 0, z: -3.5 };
export const REACH = 4.4;

export type Beacon = {
  id: string; x: number; z: number; mark: { x: number; z: number }; view: { x: number; z: number }; color: string;
  title: string; kicker: string; tags: string[]; desc: string; to: string;
};

const STOPS = [
  { id: 'projects', color: '#6f8dff', title: 'Projects', kicker: `${projects.length} builds`, tags: [...new Set(projects.map((p) => p.category))], desc: `${projects.map((p) => p.title).join(', ')}.`, to: '/#work' },
  { id: 'experience', color: '#ff9a6b', title: 'Experience', kicker: `${experience.length} roles`, tags: experience.map((x) => x.org), desc: `${experience.map((x) => `${x.role}, ${x.org} (${x.status})`).join('. ')}.`, to: '/#experience' },
  { id: 'skills', color: '#5fe0c0', title: 'Skills & services', kicker: `${skills.length} skill areas`, tags: skills.map((g) => g.name), desc: `Services: ${services.map((s) => s.name).join(', ')}.`, to: '/#skills' },
  { id: 'credentials', color: '#b39bff', title: 'Education & certificates', kicker: `${certifications.length} certificates`, tags: [...new Set(certifications.map((c) => c.provider))], desc: `${education[0].degree}, ${education[0].school}.`, to: '/#education' },
];

export const BEACONS: Beacon[] = [
  ...STOPS.map((s, i) => ({ ...s, x: ISLES[i].x, z: ISLES[i].z + 1.4, mark: { x: ISLES[i].x, z: ISLES[i].z - 4.2 }, view: { x: ISLES[i].x, z: ISLES[i].z - 4.2 } })),
  // the lighthouse and the portrait stand either side of their beacon, so neither blocks the view of Pip
  { id: 'about', x: ISLES[4].x, z: ISLES[4].z - 0.6, mark: { x: ISLES[4].x - 5.7, z: ISLES[4].z - 1.2 }, view: { x: ISLES[4].x, z: ISLES[4].z - 2.4 }, color: '#ffc977', title: `About ${profile.first}`, kicker: profile.role, tags: [profile.role, profile.location], desc: profile.about.lead, to: '/about-me' },
];

export const SHARDS: [number, number][] = [[-8, 5], [9, 5.5], [-21, -5.4], [-38, -4], [-9, -22], [22, -43], [28, -6.2], [-3.2, 37.6]];

type Circle = { x: number; z: number; r: number };
/** Where the portrait stands, on the other side of the home beacon from the lighthouse. */
export const PORTRAIT = { x: ISLES[4].x + 5.5, z: ISLES[4].z - 1.8 };
/** Solid things you fly around rather than through. */
export const OBSTACLES: Circle[] = [
  { ...RELAY, r: 2.7 },
  ...BEACONS.map((b) => ({ x: b.x, z: b.z, r: 1.25 })),
  ...BEACONS.map((b, i) => ({ ...b.mark, r: [3.4, 3.2, 3, 3.4, 2.2][i] })),
  { ...PORTRAIT, r: 1.3 },
];

const GROUND: Circle[] = [HUB, ...ISLES].map((i) => ({ x: i.x, z: i.z, r: i.r - 0.9 }));
const DECK = BRIDGE_HALF - 0.65;

/** The nearest point of the islands and bridges to (x, z); the point itself when already on them. */
function onGround(x: number, z: number): [number, number] {
  let best: [number, number] = [x, z], bestD = Infinity;
  const offer = (cx: number, cz: number, radius: number) => {
    const dx = x - cx, dz = z - cz, len = Math.hypot(dx, dz);
    if (len <= radius) { bestD = 0; best = [x, z]; return; }
    const d = len - radius;
    if (d < bestD) { bestD = d; best = [cx + (dx / len) * radius, cz + (dz / len) * radius]; }
  };
  for (const c of GROUND) { offer(c.x, c.z, c.r); if (!bestD) return best; }
  for (const i of ISLES) {
    const dx = i.x - HUB.x, dz = i.z - HUB.z, t = Math.min(1, Math.max(0, ((x - HUB.x) * dx + (z - HUB.z) * dz) / (dx * dx + dz * dz)));
    offer(HUB.x + dx * t, HUB.z + dz * t, DECK);
    if (!bestD) return best;
  }
  return best;
}

/** Keeps a position on solid ground and outside obstacles, so movement slides along edges and walls. */
export function constrain(x: number, z: number): [number, number] {
  let [px, pz] = onGround(x, z);
  for (let pass = 0; pass < 2; pass++) {
    for (const o of OBSTACLES) {
      const dx = px - o.x, dz = pz - o.z, len = Math.hypot(dx, dz);
      if (len < o.r) { const k = o.r / (len || 1); px = o.x + (len ? dx : 1) * k; pz = o.z + dz * k; }
    }
    [px, pz] = onGround(px, pz);
  }
  return [px, pz];
}
export const walkable = (x: number, z: number) => { const [a, b] = constrain(x, z); return Math.hypot(a - x, b - z) < 0.02; };

const isleAt = (x: number, z: number) => ISLES.findIndex((i) => Math.hypot(x - i.x, z - i.z) < i.r);
/** Waypoints from where you are to just in front of a beacon, going over the bridges. */
export function route(x: number, z: number, beacon: number): [number, number][] {
  const mouth = (i: number, d: number): [number, number] => {
    const len = Math.hypot(ISLES[i].x, ISLES[i].z);
    return [(ISLES[i].x / len) * d, (ISLES[i].z / len) * d];
  };
  const toIsle = (i: number) => { const len = Math.hypot(ISLES[i].x, ISLES[i].z); return len - ISLES[i].r + 2; };
  const b = BEACONS[beacon], path: [number, number][] = [];
  const from = isleAt(x, z);
  if (from !== beacon) {
    if (from >= 0) path.push(mouth(from, toIsle(from)), mouth(from, 10));
    else if (Math.hypot(x, z) > HUB.r - 2) path.push(mouth(ISLES.reduce((n, _, i) => (Math.hypot(x - mouth(i, 15)[0], z - mouth(i, 15)[1]) < Math.hypot(x - mouth(n, 15)[0], z - mouth(n, 15)[1]) ? i : n), 0), 10));
    path.push(mouth(beacon, 9.5), mouth(beacon, toIsle(beacon)));
  }
  path.push([b.x, b.z + (beacon === 4 ? -3 : 3)]);
  return path;
}

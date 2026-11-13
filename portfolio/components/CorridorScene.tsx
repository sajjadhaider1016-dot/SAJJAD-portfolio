"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { sections, projects, experience, education, skillGroups, services, certifications, achievements, links, type SectionId } from "@/data/portfolio";

type Props = {
  active: SectionId;
  movement: string[];
  onChoose: (id: SectionId) => void;
  onReady: () => void;
  onError: () => void;
};

function woodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ac7750";
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) {
    const hue = y % 128 === 0 ? "#b67f57" : "#9e6945";
    ctx.fillStyle = hue;
    ctx.fillRect(0, y + 1, 512, 61);
    ctx.strokeStyle = "rgba(53, 31, 22, .42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y + 1);
    ctx.lineTo(512, y + 1);
    ctx.stroke();
    for (let i = 0; i < 24; i++) {
      const yy = y + 5 + Math.random() * 53;
      ctx.strokeStyle = `rgba(246, 212, 169, ${0.035 + Math.random() * 0.08})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 42, yy);
      ctx.bezierCurveTo(150, yy - 5 + Math.random() * 10, 360, yy - 6 + Math.random() * 12, 512, yy + Math.random() * 2);
      ctx.stroke();
    }
    for (const x of [Math.random() * 140 + 40, Math.random() * 190 + 275]) {
      ctx.fillStyle = "rgba(58, 37, 27, .5)";
      ctx.beginPath();
      ctx.arc(x, y + 11, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 15);
  tex.anisotropy = 4;
  return tex;
}

function labelTexture(title: string, index: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f5f1e8";
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = "#6d5947";
  ctx.lineWidth = 4;
  ctx.strokeRect(9, 9, 494, 142);
  ctx.font = "600 20px Georgia";
  ctx.fillStyle = "#7c634b";
  ctx.fillText(`PORTFOLIO ROOM  /  ${index}`, 28, 45);
  ctx.font = "600 36px Georgia";
  ctx.fillStyle = "#302920";
  ctx.fillText(title.toUpperCase().slice(0, 22), 28, 103);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roomDetailsTexture(id: SectionId, title: string, index: string) {
  type Card = { label?: string; title: string; detail: string; extra?: string };
  const content: Record<SectionId, Card[]> = {
    home: [{ label: "PROFILE", title: "AI & Full-Stack Developer", detail: "Building intelligent digital experiences through AI, automation, and modern web technologies.", extra: "Available for remote opportunities" }],
    about: [{ label: "INTRODUCTION", title: "Sajjad Haider", detail: "I build AI applications, automation systems, and complete web products—from early ideas to useful, deployed software.", extra: "Focus: applied AI · full-stack products · useful automation" }, { label: "WORKING PHILOSOPHY", title: "Practical, thoughtful engineering", detail: "I care about carrying an idea all the way into software people can use, with considered interfaces and reliable implementation.", extra: "Direction: AI product development and modern full-stack engineering" }],
    projects: projects.map((p) => ({ label: p.eyebrow, title: p.title, detail: p.description, extra: `Built: ${p.contribution}  ·  ${p.tech.length ? p.tech.join(" · ") : "Technologies not listed"}` })),
    experience: experience.map((item) => ({ label: item.date, title: `${item.role} · ${item.org}`, detail: item.description, extra: item.points.slice(0, 2).join("  ·  ") })),
    education: education.map((item) => ({ label: item.status, title: item.title, detail: item.place, extra: item.detail })),
    skills: skillGroups.map((group) => ({ label: "CAPABILITIES", title: group.title, detail: group.detail, extra: group.skills.join("  ·  ") })),
    services: services.map((service) => ({ label: "SERVICE", title: service.title, detail: service.description, extra: "Discuss a project in the Contact room" })),
    certifications: certifications.map(([org, name, date, credential]) => ({ label: `${org} · ${date}`, title: name, detail: "Professional learning credential", extra: `Credential ID  ${credential}` })),
    achievements: achievements.map((item) => ({ label: "RECOGNITION", title: item.title, detail: item.detail, extra: "" })),
    contact: [{ label: "EMAIL", title: links.email, detail: "For project inquiries and professional collaboration.", extra: "" }, { label: "GITHUB", title: links.githubProfile.replace("https://github.com/", ""), detail: "Public repositories and development work.", extra: "" }, { label: "LINKEDIN", title: links.linkedin.replace("https://", ""), detail: "Professional profile.", extra: "" }, { label: "AVAILABILITY", title: "Open to remote opportunities", detail: "Use the portfolio contact form to send a project inquiry.", extra: "" }],
  };
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  const cards = content[id];
  ctx.fillStyle = "#f7f4ec"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ede7db"; ctx.fillRect(0, 0, canvas.width, 150);
  ctx.strokeStyle = "#9a7b58"; ctx.lineWidth = 3; ctx.strokeRect(12, 12, 1000, 1000);
  ctx.fillStyle = "#8b6848"; ctx.font = "600 18px Arial"; ctx.fillText(`SAJJAD HAIDER     /     ROOM ${index}`, 42, 48);
  ctx.fillStyle = "#292b28"; ctx.font = "700 42px Arial"; ctx.fillText(title.toUpperCase(), 40, 105);
  ctx.fillStyle = "#777064"; ctx.font = "500 17px Arial"; ctx.fillText(`${cards.length.toString().padStart(2, "0")}  NOTES  ·  SELECT A DOOR TO CONTINUE`, 42, 133);

  const columns = ["projects", "skills", "certifications", "achievements", "services"].includes(id) ? 2 : 1;
  const gap = 14; const left = 38; const top = 170; const bottom = 990;
  const cardWidth = (canvas.width - left * 2 - gap * (columns - 1)) / columns;
  const rows = Math.ceil(cards.length / columns);
  const cardHeight = Math.min(rows <= 2 ? 300 : 200, (bottom - top - gap * Math.max(0, rows - 1)) / Math.max(rows, 1));
  const wrap = (text: string, maxWidth: number, font: string) => {
    ctx.font = font;
    const lines: string[] = []; let line = "";
    for (const word of text.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    return lines;
  };
  cards.forEach((card, i) => {
    const column = i % columns; const row = Math.floor(i / columns);
    const x = left + column * (cardWidth + gap); const y = top + row * (cardHeight + gap);
    ctx.fillStyle = "#fffdf8"; ctx.fillRect(x, y, cardWidth, cardHeight);
    ctx.strokeStyle = "#d5cbbb"; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, cardWidth, cardHeight);
    ctx.fillStyle = "#a06e47"; ctx.fillRect(x, y, 4, cardHeight);
    let textY = y + 20;
    if (card.label) { ctx.fillStyle = "#8a7054"; ctx.font = "600 13px Arial"; ctx.fillText(card.label.toUpperCase().slice(0, 68), x + 16, textY); textY += 23; }
    ctx.fillStyle = "#302c26";
    const titleLines = wrap(card.title, cardWidth - 32, "700 19px Arial").slice(0, 2);
    ctx.font = "700 19px Arial";
    for (const line of titleLines) { ctx.fillText(line, x + 16, textY); textY += 23; }
    ctx.fillStyle = "#625b50";
    const detailLines = wrap(card.detail, cardWidth - 32, "400 15px Arial"); ctx.font = "400 15px Arial";
    const detailLimit = id === "projects" ? 3 : columns === 1 ? 3 : 2;
    for (const line of detailLines.slice(0, detailLimit)) { if (textY < y + cardHeight - 12) ctx.fillText(line, x + 16, textY); textY += 19; }
    if (card.extra && textY < y + cardHeight - 6) {
      ctx.fillStyle = "#7c6348";
      const extraLines = wrap(card.extra, cardWidth - 32, "500 13px Arial"); ctx.font = "500 13px Arial";
      for (const line of extraLines.slice(0, Math.max(1, Math.floor((y + cardHeight - textY - 7) / 16)))) { ctx.fillText(line, x + 16, textY); textY += 16; }
    }
  });
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}

function box(parent: THREE.Object3D, size: [number, number, number], position: [number, number, number], material: THREE.Material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addSketchFrame(scene: THREE.Object3D, z: number, x: number) {
  const frame = new THREE.Group();
  frame.position.set(x, 2.8, z);
  const wood = new THREE.MeshStandardMaterial({ color: "#a77650", roughness: 0.82 });
  const paper = new THREE.MeshStandardMaterial({ color: "#fffdf7", roughness: 1, side: THREE.DoubleSide });
  const pencil = new THREE.LineBasicMaterial({ color: "#7c786e", transparent: true, opacity: 0.8 });
  box(frame, [0.045, 0.92, 1.2], [0, 0, 0], wood);
  const drawing = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.68), paper);
  drawing.rotation.y = Math.PI / 2;
  drawing.position.x = x > 0 ? -0.027 : 0.027;
  frame.add(drawing);
  const cloud = new THREE.Group();
  const cloudPoints: THREE.Vector3[] = [];
  const pts = [[-.26, -.03], [-.17, .10], [-.07, .12], [.01, .23], [.12, .20], [.2, .08], [.29, .04]];
  for (const [py, pz] of pts) cloudPoints.push(new THREE.Vector3(x > 0 ? -0.04 : 0.04, py, pz));
  cloud.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cloudPoints), pencil));
  const hills = [
    new THREE.Vector3(x > 0 ? -0.04 : 0.04, -.28, -.23),
    new THREE.Vector3(x > 0 ? -0.04 : 0.04, -.11, -.10),
    new THREE.Vector3(x > 0 ? -0.04 : 0.04, -.25, .05),
    new THREE.Vector3(x > 0 ? -0.04 : 0.04, -.06, .18),
    new THREE.Vector3(x > 0 ? -0.04 : 0.04, -.25, .28),
  ];
  cloud.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(hills), pencil));
  frame.add(cloud);
  scene.add(frame);
}

function addAvatar(scene: THREE.Scene) {
  const avatar = new THREE.Group();
  avatar.name = "About-room avatar placeholder";
  avatar.position.set(6.8, 0, -3.8);
  avatar.scale.setScalar(0.42);
  avatar.visible = false;
  const skin = new THREE.MeshStandardMaterial({ color: "#bd8d6b", roughness: 0.9 });
  const hair = new THREE.MeshStandardMaterial({ color: "#35271f", roughness: 0.92 });
  const jacket = new THREE.MeshStandardMaterial({ color: "#343c3d", roughness: 0.96 });
  const shirt = new THREE.MeshStandardMaterial({ color: "#f0ebe0", roughness: 0.96 });
  const trousers = new THREE.MeshStandardMaterial({ color: "#51483e", roughness: 0.96 });
  const shoe = new THREE.MeshStandardMaterial({ color: "#302821", roughness: 0.92 });
  const body = (geometry: THREE.BufferGeometry, material: THREE.Material, pos: [number, number, number], rot?: [number, number, number]) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    avatar.add(mesh);
    return mesh;
  };
  body(new THREE.CapsuleGeometry(0.27, 0.62, 5, 10), jacket, [0, 1.14, 0]);
  body(new THREE.ConeGeometry(0.19, 0.48, 4), shirt, [0, 1.18, 0.03], [0, Math.PI / 4, 0]);
  body(new THREE.CylinderGeometry(0.085, 0.1, 0.18, 12), skin, [0, 1.57, 0]);
  body(new THREE.SphereGeometry(0.215, 20, 16), skin, [0, 1.84, 0]);
  body(new THREE.SphereGeometry(0.22, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.54), hair, [0, 1.9, -0.015]);
  body(new THREE.CapsuleGeometry(0.072, 0.49, 4, 8), jacket, [-0.37, 1.14, 0.02], [0, 0, -0.1]);
  body(new THREE.CapsuleGeometry(0.072, 0.49, 4, 8), jacket, [0.37, 1.14, 0.02], [0, 0, 0.1]);
  body(new THREE.SphereGeometry(0.09, 10, 8), skin, [-0.39, 0.83, 0.02]);
  body(new THREE.SphereGeometry(0.09, 10, 8), skin, [0.39, 0.83, 0.02]);
  body(new THREE.CapsuleGeometry(0.105, 0.55, 4, 8), trousers, [-0.14, 0.49, 0]);
  body(new THREE.CapsuleGeometry(0.105, 0.55, 4, 8), trousers, [0.14, 0.49, 0]);
  body(new THREE.BoxGeometry(0.22, 0.12, 0.38), shoe, [-0.14, 0.08, -0.08]);
  body(new THREE.BoxGeometry(0.22, 0.12, 0.38), shoe, [0.14, 0.08, -0.08]);
  const softOutline = new THREE.LineBasicMaterial({ color: "#3f3932", transparent: true, opacity: 0.66 });
  avatar.traverse((o) => {
    if (o instanceof THREE.Mesh && o.geometry.type !== "BoxGeometry") {
      o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 28), softOutline));
    }
  });
  scene.add(avatar);
  return avatar;
}

function addExhibitionRoom(
  world: THREE.Group,
  section: (typeof sections)[number],
  z: number,
  floor: THREE.Material,
  wall: THREE.Material,
) {
  const side = section.side;
  const x = side * 5.86;
  box(world, [4.7, 0.11, 4.35], [x, -0.055, z], floor, false);
  box(world, [0.18, 4.2, 4.5], [side * 8.22, 2.08, z], wall, false);
  box(world, [4.9, 4.2, 0.18], [x, 2.08, z + 2.25], wall, false);
  box(world, [4.9, 4.2, 0.18], [x, 2.08, z - 2.25], wall, false);
  const wood = new THREE.MeshStandardMaterial({ color: "#a97a52", roughness: 0.9 });
  const trim = new THREE.MeshStandardMaterial({ color: "#94704f", roughness: 0.84 });
  const stone = new THREE.MeshStandardMaterial({ color: "#ddd6c9", roughness: 0.98 });
  const brass = new THREE.MeshStandardMaterial({ color: "#9e815f", metalness: 0.45, roughness: 0.5 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.13, 3.22, 3.15), trim);
  board.position.set(side * 8.1, 2.1, z);
  board.castShadow = true;
  world.add(board);
  const display = new THREE.Mesh(new THREE.PlaneGeometry(2.98, 3.08), new THREE.MeshBasicMaterial({ map: roomDetailsTexture(section.id, section.label, section.number), side: THREE.DoubleSide }));
  display.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  display.position.set(side * 8.025, 2.1, z);
  world.add(display);

  if (section.id === "projects") {
    for (const offset of [-1.12, 0, 1.12]) {
      box(world, [0.62, 0.72, 0.62], [side * 5.45, 0.36, z + offset], stone);
      box(world, [0.74, 0.8, 0.16], [side * 5.45, 1.15, z + offset], wood);
    }
  } else if (section.id === "experience") {
    box(world, [0.09, 1.48, 0.09], [side * 5.3, 1.55, z - 1.05], brass, false);
    box(world, [0.09, 1.48, 0.09], [side * 5.3, 1.55, z + 1.05], brass, false);
    box(world, [0.12, 0.08, 2.2], [side * 5.3, 2.25, z], brass, false);
    for (let mark = 0; mark < 4; mark++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), wood);
      dot.position.set(side * 5.25, 2.2, z - 0.75 + mark * 0.5);
      world.add(dot);
    }
  } else if (section.id === "education") {
    for (let layer = 0; layer < 4; layer++) {
      const book = box(world, [0.55, 0.12, 0.65], [side * (5.15 + (layer % 2) * 0.08), 0.12 + layer * 0.13, z], layer % 2 ? trim : wood);
      book.rotation.z = layer % 2 ? 0.035 : -0.025;
    }
  } else if (section.id === "skills") {
    for (const offset of [-0.82, 0, 0.82]) {
      const screen = box(world, [0.16, 0.58, 0.65], [side * 6.4, 1.55, z + offset], wood);
      screen.castShadow = true;
      box(world, [0.04, 0.43, 0.5], [side * 6.305, 1.55, z + offset], stone, false);
    }
  } else if (section.id === "certifications") {
    for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) {
      const seal = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.028, 8, 20), brass);
      seal.rotation.y = Math.PI / 2;
      seal.position.set(side * 6.8, 1.8 + row * 0.66, z - 0.8 + col * 0.8);
      world.add(seal);
    }
  } else if (section.id === "achievements") {
    box(world, [0.62, 0.22, 0.62], [side * 5.5, 0.11, z], stone);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 0.44, 12), brass);
    cup.position.set(side * 5.5, 0.43, z);
    cup.castShadow = true;
    world.add(cup);
    for (const offset of [-0.2, 0.2]) {
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 14, Math.PI), brass);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(side * 5.5, 0.47, z + offset);
      world.add(handle);
    }
  } else if (section.id === "services") {
    for (let block = 0; block < 3; block++) {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.56), block === 1 ? brass : wood);
      cube.position.set(side * (5.25 + block * 0.55), 1.15 + (block === 1 ? 0.32 : 0), z);
      cube.rotation.set(0.08, 0.12 * block, 0.11 * (block - 1));
      world.add(cube);
    }
  } else if (section.id === "contact") {
    box(world, [1.4, 0.12, 0.78], [side * 5.6, 0.92, z], wood);
    for (const offset of [-0.28, 0.28]) box(world, [0.1, 0.9, 0.1], [side * 5.6, 0.45, z + offset], trim, false);
    const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.18, 18, 1, true), new THREE.MeshStandardMaterial({ color: "#e4d2b5", side: THREE.DoubleSide }));
    lamp.position.set(side * 5.1, 1.42, z);
    world.add(lamp);
  } else {
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.72, 20), stone);
    pedestal.position.set(side * 5.5, 0.36, z);
    world.add(pedestal);
    const keepsake = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), section.id === "home" ? new THREE.MeshStandardMaterial({ color: "#73826c", roughness: 0.95 }) : brass);
    keepsake.position.set(side * 5.5, 0.95, z);
    keepsake.scale.y = 1.3;
    world.add(keepsake);
  }
  const sconce = new THREE.PointLight(0xffe7c7, 0.42, 5, 2);
  sconce.position.set(side * 7.5, 2.35, z);
  world.add(sconce);
}

export default function CorridorScene({ active, movement, onChoose, onReady, onError }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hoveredDoor, setHoveredDoor] = useState<SectionId | null>(null);
  const activeRef = useRef(active);
  const movementRefLatest = useRef(movement);
  const chooseRef = useRef(onChoose);
  const readyRef = useRef(onReady);
  const errorRef = useRef(onError);
  useEffect(() => { chooseRef.current = onChoose; }, [onChoose]);
  useEffect(() => { readyRef.current = onReady; }, [onReady]);
  useEffect(() => { errorRef.current = onError; }, [onError]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      errorRef.current();
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f3f0e8");
    scene.fog = new THREE.Fog("#f3f0e8", 20, 45);
    const camera = new THREE.PerspectiveCamera(61, 1, 0.1, 70);
    camera.position.set(0, 1.62, 2.2);
    const world = new THREE.Group();
    scene.add(world);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.className = "corridor-canvas";
    renderer.domElement.setAttribute("aria-label", "Interactive three-dimensional illustrated corridor. Use WASD or arrow keys to move and click a door to enter a section.");
    renderer.domElement.setAttribute("role", "img");
    host.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xfff9ee, 0x85725d, 2.0);
    scene.add(hemi);
    const sunlight = new THREE.DirectionalLight(0xffedce, 2.3);
    sunlight.position.set(-3, 8, 5);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(1024, 1024);
    sunlight.shadow.camera.left = -8;
    sunlight.shadow.camera.right = 8;
    sunlight.shadow.camera.top = 8;
    sunlight.shadow.camera.bottom = -34;
    sunlight.shadow.bias = -0.0003;
    scene.add(sunlight);

    const floorTex = woodTexture();
    const wallMat = new THREE.MeshStandardMaterial({ color: "#f4f1e9", roughness: 0.96 });
    const skirting = new THREE.MeshStandardMaterial({ color: "#e3ddd1", roughness: 0.94 });
    const trim = new THREE.MeshStandardMaterial({ color: "#9c7453", roughness: 0.78 });
    const panelMat = new THREE.MeshStandardMaterial({ color: "#ae7b51", roughness: 0.83 });
    const panelInset = new THREE.MeshStandardMaterial({ color: "#bb895d", roughness: 0.86 });
    const metal = new THREE.MeshStandardMaterial({ color: "#8d7654", metalness: 0.68, roughness: 0.35 });
    // Carve ten real doorway openings from the corridor walls and frame compact rooms behind them.
    for (const side of [-1, 1] as const) {
      let cursor = 3;
      const doorsOnSide = sections.filter((section) => section.side === side);
      doorsOnSide.forEach((section) => {
        const sectionIndex = sections.findIndex((candidate) => candidate.id === section.id);
        const z = -2.1 - sectionIndex * 2.7;
        const openingTop = z + 0.77;
        const openingBottom = z - 0.77;
        const segmentLength = cursor - openingTop;
        if (segmentLength > 0) box(world, [0.23, 4.2, segmentLength], [side * 3.43, 2.08, (cursor + openingTop) / 2], wallMat, false);
        box(world, [0.23, 1.58, 1.56], [side * 3.43, 3.41, z], wallMat, false);
        cursor = openingBottom;
        addExhibitionRoom(world, section, z, new THREE.MeshStandardMaterial({ map: floorTex, color: "#cfac88", roughness: 0.86 }), wallMat);
      });
      if (cursor > -31) box(world, [0.23, 4.2, cursor + 31], [side * 3.43, 2.08, (cursor - 31) / 2], wallMat, false);
    }
    box(world, [6.9, 0.1, 34], [0, -0.055, -14], new THREE.MeshStandardMaterial({ color: "#7f6048", roughness: 0.98 }), false);
    // individually laid boards make the timber floor read as a real material in motion
    const boardMat = new THREE.MeshStandardMaterial({ map: floorTex, color: "#d2aa81", roughness: 0.8 });
    const compactFloor = window.matchMedia("(max-width: 640px)").matches;
    const columns = compactFloor ? 8 : 16;
    const rows = compactFloor ? 23 : 27;
    const plankWidth = 6.24 / columns;
    const boardGeo = new THREE.BoxGeometry(plankWidth - 0.008, 0.075, 1.27);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const plank = new THREE.Mesh(boardGeo, boardMat);
        plank.position.set(-3.12 + col * plankWidth + plankWidth / 2, 0.015, 2 - row * 1.29 + (row % 2 ? 0.25 : 0));
        plank.receiveShadow = true;
        plank.castShadow = true;
        world.add(plank);
      }
    }
    box(world, [0.12, 0.24, 34], [-3.28, 0.16, -14], skirting);
    box(world, [0.12, 0.24, 34], [3.28, 0.16, -14], skirting);
    box(world, [0.15, 0.1, 34], [-3.3, 3.92, -14], skirting, false);
    box(world, [0.15, 0.1, 34], [3.3, 3.92, -14], skirting, false);
    box(world, [6.9, 0.18, 34], [0, 4.15, -14], new THREE.MeshStandardMaterial({ color: "#e9e5dc", roughness: 1 }), false);

    const doorRecords: { id: SectionId; side: -1 | 1; z: number; hinge: THREE.Group }[] = [];
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const z = -2.1 - i * 2.7;
      const side = section.side;
      const x = side * 3.23;
      const frame = new THREE.Group();
      frame.position.set(x, 0, z);
      const jambX = side > 0 ? -0.1 : 0.1;
      box(frame, [0.22, 2.54, 0.12], [jambX, 1.27, -0.66], trim);
      box(frame, [0.22, 2.54, 0.12], [jambX, 1.27, 0.66], trim);
      box(frame, [0.25, 0.17, 1.46], [jambX, 2.61, 0], trim);
      const hinge = new THREE.Group();
      hinge.position.set(jambX, 0, -0.57);
      const leaf = new THREE.Group();
      leaf.userData.sectionId = section.id;
      hinge.add(leaf);
      const doorMat = panelMat.clone();
      const slab = box(leaf, [0.11, 2.28, 1.12], [0, 1.17, 0.56], doorMat);
      slab.name = "door-slab";
      slab.userData.sectionId = section.id;
      const outline = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: "#514238", transparent: true, opacity: 0.85 }));
      outline.position.copy(slab.position);
      leaf.add(outline);
      for (const y of [0.62, 1.77]) {
        box(leaf, [0.018, 0.77, 0.76], [side * -0.064, y, 0.56], panelInset, false);
        const contour = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.02, 0.77, 0.76)), new THREE.LineBasicMaterial({ color: "#76573f", transparent: true, opacity: 0.78 }));
        contour.position.set(side * -0.078, y, 0.56);
        leaf.add(contour);
      }
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.24), new THREE.MeshBasicMaterial({ map: labelTexture(section.label, section.number), side: THREE.DoubleSide }));
      plaque.rotation.y = Math.PI / 2;
      plaque.position.set(side * -0.071, 2.14, 0.56);
      plaque.userData.sectionId = section.id;
      leaf.add(plaque);
      const handle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), metal);
      handle.position.set(side * -0.12, 1.05, 0.23);
      handle.userData.sectionId = section.id;
      leaf.add(handle);
      frame.add(hinge);
      world.add(frame);
      doorRecords.push({ id: section.id, side, z, hinge });
      addSketchFrame(world, z - 0.65, side > 0 ? -3.27 : 3.27);
    }
    let highlightedDoor: SectionId | null = null;
    const highlightDoor = (id: SectionId | null) => {
      if (highlightedDoor === id) return;
      highlightedDoor = id;
      setHoveredDoor(id);
      for (const record of doorRecords) {
        const leaf = record.hinge.children[0];
        leaf?.traverse((object) => {
          if (object instanceof THREE.Mesh && object.name === "door-slab" && object.material instanceof THREE.MeshStandardMaterial) {
            object.material.color.set(id === record.id ? "#c2926c" : "#ae7b51");
          }
        });
      }
    };

    // Repeated pencil marks, a suspended lamp, and a small plinth keep the long hall inhabited.
    const pencil = new THREE.LineBasicMaterial({ color: "#858077", transparent: true, opacity: 0.64 });
    for (const z of [-5.9, -11.3, -16.7, -22.1, -27.5]) {
      const sign = Math.abs(Math.round(z / 5.4)) % 2 ? 1 : -1;
      const x = sign * 3.27;
      const points = [new THREE.Vector3(x, 2.5, z - 0.18), new THREE.Vector3(x, 2.62, z), new THREE.Vector3(x, 2.49, z + 0.15), new THREE.Vector3(x, 2.54, z + 0.32)];
      world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), pencil));
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 8), metal);
      stem.position.set(0, 3.68, z - 0.3);
      world.add(stem);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.2, 20, 1, true), new THREE.MeshStandardMaterial({ color: "#e5d3b6", side: THREE.DoubleSide, roughness: 0.75 }));
      shade.position.set(0, 3.4, z - 0.3);
      scene.add(shade);
      const lamp = new THREE.PointLight(0xfff0d5, 0.35, 4.8, 2);
      lamp.position.set(0, 3.28, z - 0.3);
      scene.add(lamp);
    }
    for (const [z, x] of [[-3.2, -3.27], [-9.7, 3.27], [-14.5, -3.27], [-20, 3.27], [-25.7, -3.27]] as const) {
      addSketchFrame(world, z, x);
    }
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.68, 24), new THREE.MeshStandardMaterial({ color: "#d9d2c5", roughness: 0.95 }));
    pedestal.position.set(0, 0.34, -28.4);
    pedestal.castShadow = true;
    world.add(pedestal);
    const potted = new THREE.Mesh(new THREE.IcosahedronGeometry(0.39, 1), new THREE.MeshStandardMaterial({ color: "#71816b", roughness: 0.95 }));
    potted.position.set(0, 0.93, -28.4);
    potted.scale.set(0.8, 1.2, 0.8);
    potted.castShadow = true;
    world.add(potted);
    const avatar = addAvatar(scene);

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const cursorLookTarget = new THREE.Vector2();
    const cursorLookCurrent = new THREE.Vector2();
    let dragYaw = 0;
    let dragPitch = 0;
    let cameraYawTarget = 0;
    let pointerLocked = false;
    let mouseLook: { id: number; x: number; y: number } | null = null;
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const touchedDoor = raycaster.intersectObjects(world.children, true).some((item) => {
          let current: THREE.Object3D | null = item.object;
          while (current) {
            if (current.userData.sectionId) return true;
            current = current.parent;
          }
          return false;
        });
        if (!touchedDoor) {
          touchLook = { id: event.pointerId, x: event.clientX, y: event.clientY };
          renderer.domElement.setPointerCapture(event.pointerId);
        }
      }
      if (event.button !== 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = pointerLocked ? 0 : ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = pointerLocked ? 0 : -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(world.children, true).find((item) => {
        let current: THREE.Object3D | null = item.object;
        while (current) {
          if (current.userData.sectionId) return true;
          current = current.parent;
        }
        return false;
      });
      if (hit) {
        let current: THREE.Object3D | null = hit.object;
        while (current && !current.userData.sectionId) current = current.parent;
        if (current) chooseRef.current(current.userData.sectionId as SectionId);
      } else if (event.pointerType === "mouse") {
        mouseLook = { id: event.pointerId, x: event.clientX, y: event.clientY };
        renderer.domElement.setPointerCapture(event.pointerId);
        renderer.domElement.style.cursor = "grabbing";
      }
    };
    let touchLook: { id: number; x: number; y: number } | null = null;
    const onPointerMove = (event: PointerEvent) => {
      if (pointerLocked) {
        dragYaw = THREE.MathUtils.clamp(dragYaw - event.movementX * 0.0022, -1.35, 1.35);
        dragPitch = THREE.MathUtils.clamp(dragPitch - event.movementY * 0.0018, -0.55, 0.55);
        return;
      }
      if (touchLook && event.pointerId === touchLook.id) {
        const dx = event.clientX - touchLook.x;
        const dy = event.clientY - touchLook.y;
        touchLook.x = event.clientX;
        touchLook.y = event.clientY;
        dragYaw -= dx * 0.004;
        dragPitch = THREE.MathUtils.clamp(dragPitch - dy * 0.003, -0.55, 0.55);
        return;
      }
      if (mouseLook && event.pointerId === mouseLook.id) {
        const dx = event.clientX - mouseLook.x;
        const dy = event.clientY - mouseLook.y;
        mouseLook.x = event.clientX;
        mouseLook.y = event.clientY;
        dragYaw -= dx * 0.003;
        dragPitch = THREE.MathUtils.clamp(dragPitch - dy * 0.0025, -0.55, 0.55);
        return;
      }
      if (event.pointerType === "touch") return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      cursorLookTarget.set(pointer.x, pointer.y);
      raycaster.setFromCamera(pointer, camera);
      const hover = raycaster.intersectObjects(world.children, true).find((item) => {
        let current: THREE.Object3D | null = item.object;
        while (current) {
          if (current.userData.sectionId) return true;
          current = current.parent;
        }
        return false;
      });
      let hovered: SectionId | null = null;
      if (hover) {
        let current: THREE.Object3D | null = hover.object;
        while (current && !current.userData.sectionId) current = current.parent;
        if (current) hovered = current.userData.sectionId as SectionId;
      }
      renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
      highlightDoor(hovered);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (touchLook?.id === event.pointerId) touchLook = null;
      if (mouseLook?.id === event.pointerId) {
        mouseLook = null;
        renderer.domElement.style.cursor = "grab";
      }
    };
    const onPointerLeave = () => { if (!mouseLook && !touchLook) { cursorLookTarget.set(0, 0); highlightDoor(null); } };
    const onWindowPointerMove = (event: PointerEvent) => {
      if (pointerLocked) return;
      if (event.pointerType !== "mouse" || mouseLook) return;
      const rect = renderer.domElement.getBoundingClientRect();
      cursorLookTarget.set(
        THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
        THREE.MathUtils.clamp(-((event.clientY - rect.top) / rect.height) * 2 + 1, -1, 1),
      );
    };
    const onLockRequest = () => { cursorLookTarget.set(0, 0); void renderer.domElement.requestPointerLock?.(); };
    const onPointerLockChange = () => {
      pointerLocked = document.pointerLockElement === renderer.domElement;
      renderer.domElement.style.cursor = pointerLocked ? "none" : "grab";
      window.dispatchEvent(new CustomEvent("portfolio:pointer-lock-change", { detail: pointerLocked }));
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("portfolio:pointer-lock", onLockRequest);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    const resize = () => {
      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    readyRef.current();

    let active = "home" as SectionId;
    let cameraHasArrived = false;
    const timer = new THREE.Timer();
    timer.connect(document);
    let raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let transitionFrom: SectionId = "home";
    let transitionStage = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.05);
      cursorLookCurrent.lerp(cursorLookTarget, Math.min(1, dt * 2.4));
      const selectedIndex = sections.findIndex((s) => s.id === active);
      if (pointerLocked) {
        pointer.set(0, 0);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(world.children, true).find((item) => {
          let current: THREE.Object3D | null = item.object;
          while (current) { if (current.userData.sectionId) return true; current = current.parent; }
          return false;
        });
        let current: THREE.Object3D | null = hit?.object ?? null;
        while (current && !current.userData.sectionId) current = current.parent;
        highlightDoor(current?.userData.sectionId as SectionId | undefined ?? null);
      }
      for (const door of doorRecords) {
        const isLeavingThroughDoor = door.id === transitionFrom && transitionStage === 0;
        const goal = door.id === active || isLeavingThroughDoor ? -door.side * 1.02 : 0;
        door.hinge.rotation.y += (goal - door.hinge.rotation.y) * Math.min(1, dt * (reduced.matches ? 12 : 3.5));
      }
      avatar.visible = active === "about";
      if (!cameraHasArrived && selectedIndex >= 0) {
        const d = doorRecords[selectedIndex];
        const fromIndex = sections.findIndex((section) => section.id === transitionFrom);
        const fromDoor = doorRecords[fromIndex];
        let desired = new THREE.Vector3(0, 1.62, 2.2);
        let yaw = 0;
        if (transitionStage === 0 && fromDoor) {
          // Leave the current room through its open portal before walking along the hall.
          desired = new THREE.Vector3(0, 1.62, fromDoor.z);
          yaw = 0;
        } else if (transitionStage === 1 && active !== "home") {
          // Align with the selected doorway inside the corridor.
          desired = new THREE.Vector3(0, 1.62, d.z);
        } else if (transitionStage === 2 && active !== "home") {
          desired = new THREE.Vector3(d.side * 5.05, 1.62, d.z);
          yaw = -d.side * Math.PI / 2;
        } else if (active === "home") {
          desired = new THREE.Vector3(0, 1.62, 2.2);
        }
        camera.position.lerp(desired, Math.min(1, dt * (reduced.matches ? 10 : 3.2)));
        camera.rotation.order = "YXZ";
        cameraYawTarget = yaw;
        if (camera.position.distanceTo(desired) < 0.08) {
          if (transitionStage === 0 && fromDoor) transitionStage = active === "home" ? 3 : 1;
          else if (transitionStage === 1 && active !== "home") transitionStage = 2;
          else cameraHasArrived = true;
        }
      }

      camera.rotation.order = "YXZ";
      const cursorYaw = pointerLocked ? 0 : -cursorLookCurrent.x * 0.34;
      const cursorPitch = pointerLocked ? 0 : cursorLookCurrent.y * 0.2;
      const lookYaw = THREE.MathUtils.clamp(cameraYawTarget + dragYaw + cursorYaw, -Math.PI + 0.12, Math.PI - 0.12);
      const lookPitch = THREE.MathUtils.clamp(dragPitch + cursorPitch, -0.65, 0.65);
      const lookDamping = Math.min(1, dt * (reduced.matches ? 12 : 4.4));
      camera.rotation.y += (lookYaw - camera.rotation.y) * lookDamping;
      camera.rotation.x += (lookPitch - camera.rotation.x) * lookDamping;

      const keys = new Set(movementRef.current);
      if (keys.size && cameraHasArrived) {
        const pace = 2.5 * dt;
        const forward = keys.has("w") || keys.has("arrowup");
        const backward = keys.has("s") || keys.has("arrowdown");
        const left = keys.has("a") || keys.has("arrowleft");
        const right = keys.has("d") || keys.has("arrowright");
        const forwardVector = camera.getWorldDirection(new THREE.Vector3());
        forwardVector.y = 0;
        forwardVector.normalize();
        const rightVector = new THREE.Vector3().crossVectors(forwardVector, new THREE.Vector3(0, 1, 0)).normalize();
        const movementVector = new THREE.Vector3();
        if (forward) movementVector.add(forwardVector);
        if (backward) movementVector.sub(forwardVector);
        if (left) movementVector.sub(rightVector);
        if (right) movementVector.add(rightVector);
        if (movementVector.lengthSq() > 0) camera.position.addScaledVector(movementVector.normalize(), pace);
        const currentRoom = sections[selectedIndex];
        if (active !== "home" && currentRoom) {
          camera.position.x = currentRoom.side > 0 ? THREE.MathUtils.clamp(camera.position.x, 3.82, 7.82) : THREE.MathUtils.clamp(camera.position.x, -7.82, -3.82);
          camera.position.z = THREE.MathUtils.clamp(camera.position.z, doorRecords[selectedIndex].z - 1.78, doorRecords[selectedIndex].z + 1.78);
        } else {
          camera.position.x = THREE.MathUtils.clamp(camera.position.x, -2.65, 2.65);
          camera.position.z = THREE.MathUtils.clamp(camera.position.z, -31.8, 2.3);
        }
        camera.position.y = 1.62;
      }
      renderer.render(scene, camera);
    };
    const movementRef = { current: movement };
    raf = requestAnimationFrame(loop);

    // This small adapter keeps the animation loop's latest UI state without rebuilding the scene.
    let previousActive = active;
    const stateTimer = window.setInterval(() => {
      const nextActive = activeRef.current;
      if (nextActive !== previousActive) {
        previousActive = nextActive;
        transitionFrom = active;
        active = nextActive;
        dragYaw = 0;
        dragPitch = 0;
        cursorLookTarget.set(0, 0);
        transitionStage = transitionFrom === "home" ? (active === "home" ? 3 : 1) : 0;
        cameraHasArrived = false;
      }
      movementRef.current = movementRefLatest.current;
    }, 100);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(stateTimer);
      observer.disconnect();
      timer.dispose();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("portfolio:pointer-lock", onLockRequest);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
      renderer.dispose();
      floorTex.dispose();
      world.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const materials = Array.isArray(o.material) ? o.material : [o.material];
          materials.forEach((material) => material.dispose());
        }
      });
      host.removeChild(renderer.domElement);
    };
  // Scene geometry is intentionally created once; state is read by the animation loop via refs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { movementRefLatest.current = movement; }, [movement]);

  const hoveredLabel = sections.find((section) => section.id === hoveredDoor)?.label;
  return <div ref={hostRef} className="scene-host" aria-hidden="false">
    {hoveredLabel && <div className="door-tooltip">Click to enter <strong>{hoveredLabel}</strong><span>↗</span></div>}
  </div>;
}

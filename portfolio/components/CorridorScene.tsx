"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { achievements, certifications, education, experience, links, projects, sections, services, skillGroups, type SectionId } from "@/data/portfolio";

type Props = {
  active: SectionId;
  welcome: boolean;
  welcomeReset: number;
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

type BoardEntry = { title: string; detail?: string; meta?: string };

function boardContent(sectionId: SectionId): { title: string; subtitle: string; entries: BoardEntry[]; columns?: 1 | 2 } {
  if (sectionId === "home") return {
    title: "Sajjad Haider",
    subtitle: "AI & Full-Stack Developer",
    entries: [
      { title: "What I build", detail: "AI-powered applications, intelligent automation, and complete digital products." },
      { title: "How I work", detail: "Turning practical ideas into polished, useful experiences across interface, backend, and deployment." },
      { title: "Current focus", detail: "Applied AI, automation systems, and dependable full-stack products." },
      { title: "Availability", detail: "Available for remote opportunities." },
    ],
  };
  if (sectionId === "about") return {
    title: "About me",
    subtitle: "Intelligent products. Practical engineering.",
    entries: [
      { title: "Background", detail: "AI student at Bahauddin Zakariya University, building practical software alongside my studies." },
      { title: "Technical interests", detail: "AI applications, language model integrations, document workflows, and automation." },
      { title: "Development approach", detail: "Start with the problem, keep the experience understandable, and choose technology for the job." },
      { title: "Direction", detail: "Growing as an AI product engineer, connecting modern web systems with useful applied intelligence." },
    ],
  };
  if (sectionId === "projects") return {
    title: "Selected projects",
    subtitle: "Products, experiments, and solutions",
    columns: 2,
    entries: projects.map((project) => ({ title: project.title, detail: project.description, meta: project.tech.slice(0, 3).join(" · ") || project.category })),
  };
  if (sectionId === "experience") return {
    title: "Professional experience",
    subtitle: "Selected roles and ongoing work",
    entries: experience.map((item) => ({ title: item.role, detail: item.description, meta: `${item.org} · ${item.date}` })),
  };
  if (sectionId === "education") return {
    title: "Education",
    subtitle: "Academic background",
    entries: education.map((item) => ({ title: item.title, detail: item.detail, meta: `${item.place} · ${item.status}` })),
  };
  if (sectionId === "skills") return {
    title: "Technical skills",
    subtitle: "A practical full-stack and AI toolkit",
    columns: 2,
    entries: skillGroups.map((group) => ({ title: group.title, detail: group.skills.join(" · ") })),
  };
  if (sectionId === "services") return {
    title: "Services",
    subtitle: "Practical software for real product needs",
    entries: services.map((service) => ({ title: service.title, detail: service.description, meta: service.technologies.join(" · ") })),
  };
  if (sectionId === "certifications") return {
    title: "Certifications",
    subtitle: "Credentials and continuing study",
    columns: 2,
    entries: certifications.map(([issuer, name, date, id]) => ({ title: name, detail: `${issuer} · ${date}`, meta: `Credential ID: ${id}` })),
  };
  if (sectionId === "achievements") return {
    title: "Achievements",
    subtitle: "Academic, sports, and community recognition",
    columns: 2,
    entries: achievements.map((item) => ({ title: item.title, detail: item.detail })),
  };
  return {
    title: "Contact",
    subtitle: "For recruiters and collaborators",
    entries: [
      { title: "Email", detail: links.email },
      { title: "GitHub", detail: "@sajjadhaider1016-dot", meta: links.githubProfile },
      { title: "LinkedIn", detail: "Professional profile", meta: links.linkedin },
      { title: "WhatsApp", detail: "Open a conversation", meta: links.whatsapp },
    ],
  };
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  const visibleLines = lines.slice(0, maxLines);
  if (lines.length > maxLines && visibleLines.length) {
    let last = visibleLines[visibleLines.length - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    visibleLines[visibleLines.length - 1] = `${last.trimEnd()}…`;
  }
  visibleLines.forEach((visibleLine, index) => ctx.fillText(visibleLine, x, y + index * lineHeight));
  return y + visibleLines.length * lineHeight;
}

function roomDetailsTexture(sectionId: SectionId) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext("2d")!;
  // Draw at the established layout size, then rasterize at 1⅓× for crisp in-world type.
  ctx.scale(4 / 3, 4 / 3);
  const accent = "#a76543";
  const ink = "#302c27";
  const muted = "#665e53";
  const { title, subtitle, entries, columns = 1 } = boardContent(sectionId);
  const pad = 48;
  const contentWidth = canvas.width - pad * 2;
  ctx.fillStyle = "#f8f5ed";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#d0c4b4";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
  ctx.fillStyle = accent;
  ctx.font = "700 18px Arial";
  ctx.fillText(`SAJJAD HAIDER   /   ${sections.find((item) => item.id === sectionId)?.number}`, pad, 62);
  ctx.fillStyle = ink;
  ctx.font = "700 42px Arial";
  let y = drawWrappedText(ctx, title, pad, 122, contentWidth, 48, 2);
  ctx.fillStyle = accent;
  ctx.font = "600 22px Arial";
  y = drawWrappedText(ctx, subtitle, pad, y + 4, contentWidth, 29, 2);
  ctx.strokeStyle = "#b7a993";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(pad, y + 18); ctx.lineTo(canvas.width - pad, y + 18); ctx.stroke();
  const startY = y + 42;
  const colGap = 20;
  const colWidth = columns === 2 ? (contentWidth - colGap) / 2 : contentWidth;
  const rowsPerColumn = columns === 2 ? Math.ceil(entries.length / 2) : entries.length;
  const itemHeight = Math.min(160, Math.floor((canvas.height - startY - pad) / rowsPerColumn));
  const dense = columns === 2 || entries.length >= 3;
  entries.forEach((entry, index) => {
    const col = columns === 2 ? Math.floor(index / rowsPerColumn) : 0;
    const row = columns === 2 ? index % rowsPerColumn : index;
    const x = pad + col * (colWidth + colGap);
    const rowY = startY + row * itemHeight;
    const innerPad = 13;
    ctx.fillStyle = index % 2 === 0 ? "#f0ebe1" : "#f5f1e9";
    ctx.fillRect(x, rowY, colWidth, itemHeight - 10);
    ctx.fillStyle = accent;
    ctx.fillRect(x, rowY, 4, itemHeight - 10);
    ctx.fillStyle = ink;
    ctx.font = dense ? "700 21px Arial" : "700 25px Arial";
    let textY = drawWrappedText(ctx, entry.title, x + innerPad, rowY + (dense ? 24 : 28), colWidth - innerPad * 2, dense ? 22 : 30, 2);
    if (entry.detail) {
      ctx.fillStyle = muted;
      ctx.font = dense ? "400 17px Arial" : "400 20px Arial";
      textY = drawWrappedText(ctx, entry.detail, x + innerPad, textY + 2, colWidth - innerPad * 2, dense ? 18 : 23, dense ? 2 : 3);
    }
    if (entry.meta) {
      ctx.fillStyle = accent;
      ctx.font = dense ? "600 13px Arial" : "600 16px Arial";
      drawWrappedText(ctx, entry.meta, x + innerPad, Math.min(rowY + itemHeight - (dense ? 20 : 14), textY + 4), colWidth - innerPad * 2, dense ? 15 : 19, dense ? 1 : 2);
    }
  });
  ctx.fillStyle = muted;
  ctx.font = "600 13px Arial";
  ctx.fillText("ILLUSTRATED PORTFOLIO  ·  ROOM DISPLAY", pad, canvas.height - 26);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function welcomeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 700;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#a76543";
  ctx.font = "600 30px Arial";
  ctx.fillText("AI ENGINEER   /   FULL-STACK DEVELOPER", 700, 78);
  ctx.fillStyle = "#302c27";
  ctx.font = "600 116px Arial";
  ctx.fillText("Sajjad Haider", 700, 230);
  ctx.fillStyle = "#a76543";
  ctx.font = "italic 82px Georgia";
  ctx.fillText("AI & Full-Stack Developer", 700, 342);
  ctx.fillStyle = "#554d43";
  ctx.font = "400 30px Arial";
  ctx.fillText("Building intelligent digital experiences", 700, 414);
  ctx.font = "400 25px Arial";
  ctx.fillText("AI applications  ·  automation  ·  full-stack products", 700, 458);
  ctx.fillStyle = "#8d6b52";
  ctx.font = "500 24px Arial";
  ctx.fillText("Choose a room to explore  ·  Move forward or backward to begin", 700, 520);
  ctx.strokeStyle = "#a76543";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(570, 568); ctx.lineTo(830, 568); ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function addWelcomeInstallation(world: THREE.Group) {
  const installation = new THREE.Group();
  installation.name = "3D portfolio welcome typography";
  installation.position.z = 1.2;
  const portraitX = -1.68;
  const portraitY = 1.88;
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.76, 0.08), new THREE.MeshBasicMaterial({ color: "#8e6647", transparent: true, depthWrite: false }));
  frame.position.set(portraitX, portraitY, 0);
  installation.add(frame);
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 1.62), new THREE.MeshBasicMaterial({ color: "#f7f3ea", transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  mat.position.set(portraitX, portraitY, 0.046);
  installation.add(mat);
  const portraitMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const portrait = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.5), portraitMaterial);
  portrait.position.set(portraitX, portraitY, 0.051);
  portrait.name = "Sajjad Haider portrait in the 3D welcome lobby";
  installation.add(portrait);
  new THREE.TextureLoader().load("/identity/sajjad-haider.jpg", (texture) => {
    if (!portrait.parent) { texture.dispose(); return; }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    portraitMaterial.map = texture;
    portraitMaterial.needsUpdate = true;
  });
  const heroMaterial = new THREE.MeshBasicMaterial({ map: welcomeTexture(), transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const heroText = new THREE.Mesh(new THREE.PlaneGeometry(5.25, 2.625), heroMaterial);
  heroText.position.set(0.82, 2.58, 0.02);
  heroText.scale.set(0.72, 0.82, 1);
  installation.add(heroText);
  const accent = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.018, 0.025), new THREE.MeshBasicMaterial({ color: "#a76543", transparent: true, depthWrite: false }));
  accent.position.set(0.82, 3.48, 0.04);
  installation.add(accent);
  world.add(installation);
  return installation;
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
  roomBoards: Map<SectionId, THREE.MeshBasicMaterial>,
) {
  const side = section.side;
  const x = side * 5.86;
  box(world, [4.7, 0.11, 4.35], [x, -0.055, z], floor, false);
  box(world, [0.18, 4.2, 4.5], [side * 8.22, 2.08, z], wall, false);
  box(world, [4.9, 4.2, 0.18], [x, 2.08, z + 2.25], wall, false);
  box(world, [4.9, 4.2, 0.18], [x, 2.08, z - 2.25], wall, false);
  const ceiling = new THREE.MeshStandardMaterial({ color: "#e8e2d6", roughness: 0.94 });
  const reveal = new THREE.MeshStandardMaterial({ color: "#c7b9a5", roughness: 0.82 });
  const roomMetal = new THREE.MeshStandardMaterial({ color: "#9c8060", metalness: 0.34, roughness: 0.62 });
  const coveMetal = new THREE.MeshStandardMaterial({ color: "#9c8060", emissive: "#9c653d", emissiveIntensity: 0.12, metalness: 0.22, roughness: 0.6 });
  box(world, [4.92, 0.14, 4.62], [x, 4.12, z], ceiling, false);
  for (const edge of [-1, 1]) {
    box(world, [0.13, 0.12, 4.58], [side * (5.86 + edge * 2.28), 3.92, z], reveal, false);
    box(world, [4.74, 0.12, 0.12], [x, 3.92, z + edge * 2.18], reveal, false);
  }
  // A softly lit ceiling cove and restrained brass inlay make each side room feel finished.
  box(world, [0.035, 0.025, 3.6], [side * 7.85, 3.83, z], coveMetal, false);
  const wood = new THREE.MeshStandardMaterial({ color: "#a97a52", roughness: 0.9 });
  const trim = new THREE.MeshStandardMaterial({ color: "#94704f", roughness: 0.84 });
  const stone = new THREE.MeshStandardMaterial({ color: "#ddd6c9", roughness: 0.98 });
  const brass = new THREE.MeshStandardMaterial({ color: "#9e815f", metalness: 0.45, roughness: 0.5 });
  const boardZ = z;
  const boardCenterY = 1.98;
  const boardWidth = 2.45;
  const boardHeight = 2.88;
  box(world, [0.14, boardHeight + 0.18, boardWidth + 0.18], [side * 8.08, boardCenterY, boardZ], trim);
  const boardMaterial = new THREE.MeshBasicMaterial({ color: "#f8f5ed", side: THREE.DoubleSide, toneMapped: false });
  roomBoards.set(section.id, boardMaterial);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(boardWidth, boardHeight), boardMaterial);
  board.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  board.position.set(side * 7.99, boardCenterY, boardZ);
  board.userData.sectionId = section.id;
  board.name = `${section.label} room information board`;
  world.add(board);
  box(world, [0.045, 0.045, boardWidth - 0.12], [side * 7.88, boardCenterY - boardHeight / 2 + 0.08, boardZ], roomMetal, false);
  const pictureLight = new THREE.PointLight(0xffe6c3, 0.2, 3.2, 2);
  pictureLight.position.set(side * 7.5, 3.83, boardZ);
  world.add(pictureLight);

  if (section.id === "projects") {
    // A gallery wall replaces the generic lounge furniture: three aligned, readable exhibits
    // face the entrance while leaving the information board and the center aisle clear.
    const galleryWood = new THREE.MeshStandardMaterial({ color: "#8f6848", roughness: 0.78 });
    const galleryPaper = new THREE.MeshStandardMaterial({ color: "#f7f3ea", roughness: 0.94 });
    const previewPaths = ["/projects/veyra-live.png", "/projects/study-buddy-live.png", "/projects/docedit-live.png"];
    const previewTitles = ["VEYRA", "STUDY BUDDY", "DOCEDIT"];
    const galleryXs = [4.55, 5.9, 7.25];
    for (const projectIndex of [0, 1, 2]) {
      const displayX = side * galleryXs[projectIndex];
      const displayZ = z + 2.08;
      box(world, [1.18, 1.26, 0.11], [displayX, 2.08, displayZ], galleryWood, false);
      box(world, [1.08, 1.16, 0.035], [displayX, 2.08, displayZ - 0.073], galleryPaper, false);
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 512; labelCanvas.height = 96;
      const labelContext = labelCanvas.getContext("2d")!;
      labelContext.fillStyle = "#f7f3ea"; labelContext.fillRect(0, 0, 512, 96);
      labelContext.fillStyle = "#463a30"; labelContext.font = "600 32px Arial"; labelContext.textAlign = "center";
      labelContext.fillText(previewTitles[projectIndex], 256, 62);
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      labelTexture.colorSpace = THREE.SRGBColorSpace;
      const label = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.18), new THREE.MeshBasicMaterial({ map: labelTexture, toneMapped: false, side: THREE.DoubleSide }));
      label.position.set(displayX, 1.5, displayZ - 0.096);
      world.add(label);
      const previewMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide, toneMapped: false });
      const preview = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.72), previewMaterial);
      preview.position.set(displayX, 2.17, displayZ - 0.098);
      preview.userData.sectionId = section.id;
      world.add(preview);
      new THREE.TextureLoader().load(previewPaths[projectIndex], (texture) => {
        if (!preview.parent) { texture.dispose(); return; }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        previewMaterial.map = texture;
        previewMaterial.needsUpdate = true;
      });
    }
    box(world, [0.055, 0.05, 3.4], [side * 5.9, 0.035, z + 2.02], brass, false);
    const galleryLight = new THREE.PointLight(0xffe4bf, 0.42, 5, 2);
    galleryLight.position.set(side * 5.9, 3.42, z + 1.25);
    world.add(galleryLight);
    // Low display bench at the back, outside the viewing lane.
    box(world, [2.4, 0.12, 0.45], [side * 5.86, 0.48, z - 1.72], wood);
    for (const xOffset of [-1.02, 1.02]) box(world, [0.08, 0.42, 0.08], [side * (5.86 + xOffset), 0.23, z - 1.72], trim, false);
  } else {
    // A slim console, lounge chair, and plant furnish the other rooms without crowding Projects.
    box(world, [1.05, 0.09, 1.42], [side * 6.92, 0.84, z + 1.65], wood);
    for (const dx of [-0.43, 0.43]) for (const dz of [-0.58, 0.58]) box(world, [0.07, 0.78, 0.07], [side * (6.92 + dx), 0.4, z + 1.65 + dz], trim, false);
    box(world, [0.85, 0.12, 0.82], [side * 4.62, 0.48, z - 1.32], stone);
    box(world, [0.12, 0.74, 0.78], [side * 4.62, 0.88, z - 1.68], wood);
    for (const dx of [-0.32, 0.32]) for (const dz of [-0.27, 0.27]) box(world, [0.075, 0.45, 0.075], [side * (4.62 + dx), 0.23, z - 1.32 + dz], trim, false);
    const planter = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.28, 0.42, 16), stone);
    planter.position.set(side * 7.42, 0.22, z + 1.62);
    world.add(planter);
    const foliage = new THREE.MeshStandardMaterial({ color: "#75816a", roughness: 0.96 });
    for (let leaf = 0; leaf < 5; leaf++) {
      const angle = (leaf / 5) * Math.PI * 2;
      const sprig = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.88, 7), foliage);
      sprig.position.set(side * 7.42 + Math.cos(angle) * 0.13, 0.82, z + 1.62 + Math.sin(angle) * 0.13);
      sprig.rotation.z = Math.cos(angle) * 0.32;
      sprig.rotation.x = Math.sin(angle) * 0.3;
      sprig.castShadow = true;
      world.add(sprig);
    }
  }

  if (section.id === "experience") {
    box(world, [0.09, 1.48, 0.09], [side * 5.12, 1.55, z + 0.75], brass, false);
    box(world, [0.09, 1.48, 0.09], [side * 5.12, 1.55, z + 2], brass, false);
    box(world, [0.12, 0.08, 1.3], [side * 5.12, 2.25, z + 1.38], brass, false);
    for (let mark = 0; mark < 4; mark++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), wood);
      dot.position.set(side * 5.06, 2.2, z + 0.9 + mark * 0.28);
      world.add(dot);
    }
  } else if (section.id === "education") {
    for (let layer = 0; layer < 4; layer++) {
      const book = box(world, [0.55, 0.12, 0.65], [side * (5.15 + (layer % 2) * 0.08), 0.12 + layer * 0.13, z], layer % 2 ? trim : wood);
      book.rotation.z = layer % 2 ? 0.035 : -0.025;
    }
  } else if (section.id === "skills") {
    for (const offset of [-0.82, 0, 0.82]) {
      const screen = box(world, [0.16, 0.58, 0.65], [side * 5.12, 1.55, z + 1.5 + offset * 0.55], wood);
      screen.castShadow = true;
      box(world, [0.04, 0.43, 0.5], [side * 5.025, 1.55, z + 1.5 + offset * 0.55], stone, false);
    }
  } else if (section.id === "certifications") {
    for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) {
      const seal = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.028, 8, 20), brass);
      seal.rotation.y = Math.PI / 2;
      seal.position.set(side * 5.12, 1.8 + row * 0.66, z + 1.15 + col * 0.42);
      world.add(seal);
    }
  } else if (section.id === "achievements") {
    box(world, [0.62, 0.22, 0.62], [side * 5.12, 0.11, z + 1.5], stone);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 0.44, 12), brass);
    cup.position.set(side * 5.12, 0.43, z + 1.5);
    cup.castShadow = true;
    world.add(cup);
    for (const offset of [-0.2, 0.2]) {
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 14, Math.PI), brass);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(side * 5.12, 0.47, z + 1.5 + offset);
      world.add(handle);
    }
  } else if (section.id === "services") {
    for (let block = 0; block < 3; block++) {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.56), block === 1 ? brass : wood);
      cube.position.set(side * (4.7 + block * 0.42), 1.15 + (block === 1 ? 0.32 : 0), z + 1.48);
      cube.rotation.set(0.08, 0.12 * block, 0.11 * (block - 1));
      world.add(cube);
    }
  } else if (section.id === "contact") {
    box(world, [1.4, 0.12, 0.78], [side * 4.2, 0.92, z + 1.3], wood);
    for (const offset of [-0.28, 0.28]) box(world, [0.1, 0.9, 0.1], [side * 4.2, 0.45, z + 1.3 + offset], trim, false);
    const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.18, 18, 1, true), new THREE.MeshStandardMaterial({ color: "#e4d2b5", side: THREE.DoubleSide }));
    lamp.position.set(side * 4.75, 1.42, z + 1.3);
    world.add(lamp);
  } else if (section.id !== "projects") {
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.72, 20), stone);
    pedestal.position.set(side * 5.12, 0.36, z + 1.5);
    world.add(pedestal);
    const keepsake = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), section.id === "home" ? new THREE.MeshStandardMaterial({ color: "#73826c", roughness: 0.95 }) : brass);
    keepsake.position.set(side * 5.12, 0.95, z + 1.5);
    keepsake.scale.y = 1.3;
    world.add(keepsake);
  }
  const sconce = new THREE.PointLight(0xffe7c7, 0.42, 5, 2);
  sconce.position.set(side * 7.5, 2.35, z);
  world.add(sconce);
}

export default function CorridorScene({ active, welcome, welcomeReset, movement, onChoose, onReady, onError }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hoveredDoor, setHoveredDoor] = useState<SectionId | null>(null);
  const activeRef = useRef(active);
  const welcomeRef = useRef(welcome);
  const welcomeResetRef = useRef(welcomeReset);
  const movementRefLatest = useRef(movement);
  const chooseRef = useRef(onChoose);
  const readyRef = useRef(onReady);
  const errorRef = useRef(onError);
  useEffect(() => { chooseRef.current = onChoose; }, [onChoose]);
  useEffect(() => { welcomeResetRef.current = welcomeReset; }, [welcomeReset]);
  useEffect(() => { readyRef.current = onReady; }, [onReady]);
  useEffect(() => { errorRef.current = onError; }, [onError]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const isMobile = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: false, powerPreference: isMobile ? "low-power" : "high-performance" });
    } catch {
      errorRef.current();
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f3f0e8");
    scene.fog = new THREE.Fog("#f3f0e8", 34, 72);
    const camera = new THREE.PerspectiveCamera(isMobile ? 66 : 61, 1, 0.1, 85);
    camera.position.set(0, 1.62, 6.4);
    const world = new THREE.Group();
    scene.add(world);
    const welcomeInstallation = addWelcomeInstallation(world);
    welcomeInstallation.visible = welcome;
    const welcomeMaterials: THREE.Material[] = [];
    welcomeInstallation.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          material.transparent = true;
          material.depthWrite = false;
          welcomeMaterials.push(material);
        }
      }
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = !isMobile;
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
    sunlight.shadow.mapSize.set(isMobile ? 512 : 1024, isMobile ? 512 : 1024);
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
    const roomBoardMaterials = new Map<SectionId, THREE.MeshBasicMaterial>();
    // Carve ten real doorway openings from the corridor walls and frame compact rooms behind them.
    for (const side of [-1, 1] as const) {
      let cursor = 9;
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
        addExhibitionRoom(world, section, z, new THREE.MeshStandardMaterial({ map: floorTex, color: "#cfac88", roughness: 0.86 }), wallMat, roomBoardMaterials);
      });
      if (cursor > -31) box(world, [0.23, 4.2, cursor + 31], [side * 3.43, 2.08, (cursor - 31) / 2], wallMat, false);
    }
    box(world, [6.9, 0.1, 40], [0, -0.055, -11], new THREE.MeshStandardMaterial({ color: "#7f6048", roughness: 0.98 }), false);
    // individually laid boards make the timber floor read as a real material in motion
    const boardMat = new THREE.MeshStandardMaterial({ map: floorTex, color: "#d2aa81", roughness: 0.8 });
    const compactFloor = window.matchMedia("(max-width: 640px)").matches;
    const columns = compactFloor ? 8 : 16;
    const rows = compactFloor ? 29 : 31;
    const plankWidth = 6.24 / columns;
    const boardGeo = new THREE.BoxGeometry(plankWidth - 0.008, 0.075, 1.27);
    const floorPlanks = new THREE.InstancedMesh(boardGeo, boardMat, columns * rows);
    const plankMatrix = new THREE.Matrix4();
    let plankIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        plankMatrix.makeTranslation(-3.12 + col * plankWidth + plankWidth / 2, 0.015, 5.8 - row * 1.29 + (row % 2 ? 0.25 : 0));
        floorPlanks.setMatrixAt(plankIndex++, plankMatrix);
      }
    }
    floorPlanks.instanceMatrix.needsUpdate = true;
    floorPlanks.receiveShadow = !isMobile;
    floorPlanks.castShadow = !isMobile;
    world.add(floorPlanks);
    box(world, [0.12, 0.24, 34], [-3.28, 0.16, -14], skirting);
    box(world, [0.12, 0.24, 34], [3.28, 0.16, -14], skirting);
    box(world, [0.15, 0.1, 34], [-3.3, 3.92, -14], skirting, false);
    box(world, [0.15, 0.1, 34], [3.3, 3.92, -14], skirting, false);
    box(world, [6.9, 0.18, 40], [0, 4.15, -11], new THREE.MeshStandardMaterial({ color: "#e9e5dc", roughness: 1 }), false);

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
      const doorFinishes = ["#9a6d4d", "#a77a55", "#86664c", "#b07e56", "#8f7258"];
      doorMat.color.set(doorFinishes[i % doorFinishes.length]);
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
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.31), new THREE.MeshBasicMaterial({ map: labelTexture(section.label, section.number), side: THREE.DoubleSide, toneMapped: false }));
      plaque.rotation.y = Math.PI / 2;
      plaque.position.set(side * -0.071, 2.14, 0.56);
      plaque.userData.sectionId = section.id;
      leaf.add(plaque);
      const handle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), metal);
      handle.position.set(side * -0.12, 1.05, 0.23);
      handle.userData.sectionId = section.id;
      leaf.add(handle);
      for (const hingeY of [0.27, 1.15, 2.03]) {
        const hingePin = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.13, 10), metal);
        hingePin.position.set(side * -0.08, hingeY, 0.04);
        leaf.add(hingePin);
      }
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
      camera.fov = isMobile ? 68 : 61;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    readyRef.current();

    let active = activeRef.current;
    const loadedRoomBoards = new Set<SectionId>();
    const ensureRoomBoard = (sectionId: SectionId) => {
      if (loadedRoomBoards.has(sectionId)) return;
      const material = roomBoardMaterials.get(sectionId);
      if (!material) return;
      material.map = roomDetailsTexture(sectionId);
      material.color.set("#ffffff");
      material.needsUpdate = true;
      loadedRoomBoards.add(sectionId);
    };
    if (!welcome) ensureRoomBoard(active);
    let cameraHasArrived = welcome;
    const timer = new THREE.Timer();
    timer.connect(document);
    let raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let transitionFrom: SectionId = "home";
    let transitionStage = 0;
    const movementRef = { current: movement };
    let previousActive = active;
    let previousWelcome = welcome;
    let previousWelcomeReset = welcomeReset;
    let welcomeDismissed = false;
    let welcomeOpacity = welcome ? 1 : 0;
    const movementVelocity = new THREE.Vector3();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.05);
      const nextActive = activeRef.current;
      const nextWelcome = welcomeRef.current;
      const nextWelcomeReset = welcomeResetRef.current;
      if (nextActive !== previousActive || nextWelcome !== previousWelcome || nextWelcomeReset !== previousWelcomeReset) {
        const leavingWelcome = previousWelcome && !nextWelcome;
        const returningToWelcome = nextWelcome && (!previousWelcome || nextWelcomeReset !== previousWelcomeReset);
        if (returningToWelcome) welcomeDismissed = false;
        previousActive = nextActive;
        transitionFrom = active;
        active = nextActive;
        previousWelcome = nextWelcome;
        previousWelcomeReset = nextWelcomeReset;
        dragYaw = 0;
        dragPitch = 0;
        cursorLookTarget.set(0, 0);
        movementVelocity.set(0, 0, 0);
        // The lobby is a distinct destination: room selection returns there before revealing the hero.
        transitionStage = leavingWelcome ? 1 : returningToWelcome ? 3 : 0;
        cameraHasArrived = false;
      }
      const welcomeTargetOpacity = nextWelcome && !welcomeDismissed && cameraHasArrived ? 1 : 0;
      welcomeOpacity += (welcomeTargetOpacity - welcomeOpacity) * (1 - Math.exp(-(reduced.matches ? 16 : 7.5) * dt));
      welcomeInstallation.visible = welcomeOpacity > 0.008;
      for (const material of welcomeMaterials) material.opacity = welcomeOpacity;
      if (!nextWelcome) ensureRoomBoard(active);
      movementRef.current = movementRefLatest.current;
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
        const goal = (!nextWelcome && door.id === active) || isLeavingThroughDoor ? -door.side * 1.02 : 0;
        door.hinge.rotation.y += (goal - door.hinge.rotation.y) * Math.min(1, dt * (reduced.matches ? 12 : 3.5));
      }
      avatar.visible = active === "about" && !nextWelcome;
      if (!cameraHasArrived && selectedIndex >= 0) {
        const d = doorRecords[selectedIndex];
        const fromIndex = sections.findIndex((section) => section.id === transitionFrom);
        const fromDoor = doorRecords[fromIndex];
        let desired = new THREE.Vector3(0, 1.62, 2.2);
        let yaw = 0;
        if (transitionStage === 3) {
          desired.set(0, 1.62, 6.4);
        } else if (transitionStage === 0 && fromDoor) {
          // Leave the current room through its open portal before walking along the hall.
          desired = new THREE.Vector3(0, 1.62, fromDoor.z);
          yaw = 0;
        } else if (transitionStage === 1) {
          // Align with the selected doorway inside the corridor.
          desired = new THREE.Vector3(0, 1.62, d.z);
        } else if (transitionStage === 2) {
          // Keep a portrait phone far enough from the display wall to frame the whole room panel.
          desired = new THREE.Vector3(d.side * (isMobile ? 4 : 5.05), 1.62, d.z);
          yaw = -d.side * Math.PI / 2;
        }
        const transitionRate = reduced.matches ? 10 : isMobile ? 4.5 : 3.35;
        camera.position.lerp(desired, 1 - Math.exp(-transitionRate * dt));
        camera.rotation.order = "YXZ";
        cameraYawTarget = yaw;
        if (camera.position.distanceTo(desired) < 0.08) {
          if (transitionStage === 0 && fromDoor) transitionStage = 1;
          else if (transitionStage === 1) transitionStage = 2;
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
      const walkingForwardOrBackward = keys.has("w") || keys.has("s") || keys.has("arrowup") || keys.has("arrowdown");
      if (nextWelcome && walkingForwardOrBackward) welcomeDismissed = true;
      if (keys.size && cameraHasArrived) {
        const forward = keys.has("w") || keys.has("arrowup");
        const backward = keys.has("s") || keys.has("arrowdown");
        const left = keys.has("a") || keys.has("arrowleft");
        const right = keys.has("d") || keys.has("arrowright");
        const forwardVector = camera.getWorldDirection(new THREE.Vector3());
        forwardVector.y = 0;
        forwardVector.normalize();
        const rightVector = new THREE.Vector3().crossVectors(forwardVector, new THREE.Vector3(0, 1, 0)).normalize();
        const targetVelocity = new THREE.Vector3();
        if (forward) targetVelocity.add(forwardVector);
        if (backward) targetVelocity.sub(forwardVector);
        if (left) targetVelocity.sub(rightVector);
        if (right) targetVelocity.add(rightVector);
        if (targetVelocity.lengthSq() > 0) targetVelocity.normalize().multiplyScalar(isMobile ? 3.4 : 3);
        const movementDamping = 1 - Math.exp(-(targetVelocity.lengthSq() > 0 ? 8 : 10) * dt);
        movementVelocity.lerp(targetVelocity, movementDamping);
        camera.position.addScaledVector(movementVelocity, dt);
        const currentRoom = nextWelcome ? undefined : sections[selectedIndex];
        if (currentRoom) {
          const roomEdge = isMobile ? 7.1 : 7.82;
          camera.position.x = currentRoom.side > 0 ? THREE.MathUtils.clamp(camera.position.x, 3.82, roomEdge) : THREE.MathUtils.clamp(camera.position.x, -roomEdge, -3.82);
          camera.position.z = THREE.MathUtils.clamp(camera.position.z, doorRecords[selectedIndex].z - 1.78, doorRecords[selectedIndex].z + 1.78);
        } else {
          camera.position.x = THREE.MathUtils.clamp(camera.position.x, -2.65, 2.65);
          camera.position.z = THREE.MathUtils.clamp(camera.position.z, -31.8, nextWelcome ? 8.3 : 2.3);
        }
        camera.position.y = 1.62;
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
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
          materials.forEach((material) => {
            if ("map" in material && material.map instanceof THREE.Texture) material.map.dispose();
            material.dispose();
          });
        }
      });
      host.removeChild(renderer.domElement);
    };
  // Scene geometry is intentionally created once; state is read by the animation loop via refs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { welcomeRef.current = welcome; }, [welcome]);
  useEffect(() => { movementRefLatest.current = movement; }, [movement]);

  const hoveredLabel = sections.find((section) => section.id === hoveredDoor)?.label;
  return <div ref={hostRef} className="scene-host" aria-hidden="false">
    {hoveredLabel && <div className="door-tooltip">Click to enter <strong>{hoveredLabel}</strong><span>↗</span></div>}
  </div>;
}

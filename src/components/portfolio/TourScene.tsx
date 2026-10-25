"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";

type Stop = { id: string; label: string; heading: string; summary: string; progress: number; x: number; y: number; z: number; kind: "section" | "project" };
type ProjectStop = { id: string; label: string; summary: string; detail: string };

function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
}

function labelTexture(label: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#171512"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#bd7951"; context.lineWidth = 3; context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    context.fillStyle = "#efe8dc"; context.font = "600 30px Georgia"; context.textBaseline = "middle";
    const text = label.length > 27 ? `${label.slice(0, 25)}…` : label;
    context.fillText(text, 30, 96, canvas.width - 60);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

function displayTexture(heading = "Portfolio", summary = "Explore this destination in Sajjad’s portfolio.", detail = "") {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 640;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#151311"; context.fillRect(0, 0, canvas.width, canvas.height);
    const glow = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    glow.addColorStop(0, "rgba(187,112,73,.24)"); glow.addColorStop(.58, "rgba(187,112,73,.02)"); glow.addColorStop(1, "rgba(187,112,73,.12)");
    context.fillStyle = glow; context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#a96c4a"; context.lineWidth = 5; context.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
    context.fillStyle = "#c27d56"; context.font = "600 23px Arial"; context.letterSpacing = "5px";
    context.fillText("SAJJAD HAIDER  /  PORTFOLIO", 54, 76);
    context.fillStyle = "#f1e9dc"; context.font = "600 58px Georgia"; context.letterSpacing = "0px";
    const title = heading.length > 30 ? `${heading.slice(0, 29)}…` : heading;
    context.fillText(title, 54, 168, 900);
    context.fillStyle = "#c4b9ab"; context.font = "28px Arial";
    const words = summary.split(/\s+/); let line = ""; let y = 236; let lines = 0;
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > 885 && line) { context.fillText(line, 54, y); y += 43; line = word; lines++; if (lines === 4) break; }
      else line = candidate;
    }
    if (lines < 4 && line) context.fillText(line, 54, y);
    if (detail) {
      context.fillStyle = "#d8875f"; context.font = "600 21px Arial";
      const tags = detail.length > 90 ? `${detail.slice(0, 87)}…` : detail;
      context.fillText(tags, 54, 564, 890);
    }
    context.fillStyle = "#88796b"; context.font = "18px Arial"; context.fillText("SELECT A DESTINATION TO CONTINUE", 54, 604);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

function Ground() {
  const grid = useMemo(() => {
    const vertices: number[] = [];
    for (let z = 6; z >= -200; z -= 4) {
      vertices.push(-38, -2, z, 38, -2, z);
    }
    for (let x = -36; x <= 36; x += 3) vertices.push(x, -2, 8, x, -2, -202);
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3)); return geometry;
  }, []);
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.08, -98]} receiveShadow>
      <planeGeometry args={[90, 220]} /><meshStandardMaterial color="#11100e" roughness={.92} metalness={.08} />
    </mesh>
    <mesh position={[0, -1.97, -98]} receiveShadow><boxGeometry args={[5.8, .16, 220]} /><meshStandardMaterial color="#28231e" roughness={.7} metalness={.2} /></mesh>
    <lineSegments geometry={grid}><lineBasicMaterial color="#916044" transparent opacity={.18} /></lineSegments>
    {[-2.8, 2.8].map((x) => <mesh key={x} position={[x, -1.82, -98]}><boxGeometry args={[.035, .04, 220]} /><meshBasicMaterial color="#bd7951" transparent opacity={.48} /></mesh>)}
  </>;
}

function Architecture({ stops, projectStops }: { stops: Stop[]; projectStops: ProjectStop[] }) {
  const ring = useMemo(() => new THREE.TorusGeometry(1.55, .032, 8, 96), []);
  const portalRing = useMemo(() => new THREE.TorusGeometry(1.55, .022, 8, 160), []);
  const portalArc = useMemo(() => new THREE.TorusGeometry(1.55, .042, 10, 120, Math.PI * .82), []);
  const plaqueTextures = useMemo(() => stops.map((stop) => labelTexture(stop.label ?? "Portfolio")), [stops]);
  const displayTextures = useMemo(() => stops.map((stop) => displayTexture(stop.heading ?? stop.label, stop.summary)), [stops]);
  const projectTextures = useMemo(() => projectStops.map((stop) => displayTexture(stop.label, stop.summary, stop.detail)), [projectStops]);
  const gates = useRef<Array<THREE.Group | null>>([]);
  const beacons = useRef<Array<THREE.Mesh | null>>([]);
  const features = useRef<Array<THREE.Group | null>>([]);
  const selectedScale = useMemo(() => new THREE.Vector3(1.045, 1.045, 1), []);
  const quietLandmarkScale = useMemo(() => new THREE.Vector3(.42, .42, .72), []);
  const galleryPreviewScale = useMemo(() => new THREE.Vector3(.56, .56, .78), []);
  useEffect(() => () => { plaqueTextures.forEach((texture) => texture.dispose()); displayTextures.forEach((texture) => texture.dispose()); projectTextures.forEach((texture) => texture.dispose()); }, [plaqueTextures, displayTextures, projectTextures]);

  useFrame((_, delta) => {
    if (!stops.length) return;
    const progress = THREE.MathUtils.clamp(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight), 0, 1);
    let active = 0;
    for (let i = 1; i < stops.length; i++) if (Math.abs(stops[i].progress - progress) < Math.abs(stops[active].progress - progress)) active = i;
    const ease = 1 - Math.exp(-4 * delta);
    gates.current.forEach((gate, index) => {
      if (!gate) return;
      const selected = index === active;
      const restingScale = stops[index].kind === "project" ? galleryPreviewScale : quietLandmarkScale;
      gate.scale.lerp(selected ? selectedScale : restingScale, ease);
      gate.position.y = stops[index].y + Math.sin(performance.now() * .00055 + index * .8) * (selected ? .12 : .035);
      const feature = features.current[index];
      if (feature) {
        const time = performance.now() * .001;
        const activity = selected ? 1 : .24;
        if (stops[index].id === "skills") { feature.rotation.y = time * .13 * activity; feature.rotation.x = Math.sin(time * .4) * .12 * activity; }
        else if (stops[index].id === "experience") { feature.rotation.y = Math.sin(time * .28) * .08 * activity; feature.position.y = -.34 + Math.sin(time * .68) * .09 * activity; }
        else if (stops[index].id === "contact") { feature.rotation.y = time * .2 * activity; feature.rotation.z = Math.sin(time * .3) * .06 * activity; }
        else if (stops[index].id === "services") { feature.rotation.y = time * .11 * activity; feature.position.y = -.35 + Math.sin(time * .62) * .07 * activity; }
        else if (stops[index].id === "education") { feature.rotation.y = Math.sin(time * .24) * .1 * activity; feature.position.y = -.35 + Math.sin(time * .45 + 1) * .08 * activity; }
        else if (stops[index].id === "achievements") { feature.rotation.y = time * .16 * activity; feature.rotation.z = Math.sin(time * .4) * .035 * activity; }
        else if (stops[index].id === "github") { feature.rotation.y = time * .15 * activity; feature.rotation.x = Math.sin(time * .32) * .12 * activity; }
      }
      const material = gate.children[0] instanceof THREE.Mesh ? gate.children[0].material : null;
      if (material instanceof THREE.MeshStandardMaterial) material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, selected ? 1.15 : .42, ease);
    });
    beacons.current.forEach((beacon, index) => {
      if (!beacon) return;
      beacon.position.y = .3 + Math.sin(performance.now() * .001 + index * 1.7) * .5;
      const material = beacon.material;
      if (material instanceof THREE.MeshStandardMaterial) material.emissiveIntensity = .3 + (Math.sin(performance.now() * .0013 + index) + 1) * .32;
    });
  });

  return <>
    {stops.map((stop, index) => <group key={stop.id} ref={(node) => { gates.current[index] = node; }} position={[stop.x, stop.y, stop.z]}>
      {stop.kind !== "project" && <>
        {stop.id === "home" && <group position={[0, -.32, -.48]}>
          <mesh geometry={portalRing} rotation={[.04, -.08, -.12]} scale={[1.64, 1.42, .72]}>
            <meshStandardMaterial color="#b6a58d" roughness={.34} metalness={.82} emissive="#70523a" emissiveIntensity={.14} />
          </mesh>
          <mesh geometry={portalRing} rotation={[-.12, .18, .28]} scale={[1.5, 1.31, .66]}>
            <meshStandardMaterial color="#8b8274" roughness={.4} metalness={.72} transparent opacity={.34} />
          </mesh>
          <mesh geometry={portalArc} rotation={[.04, -.08, 2.78]} scale={[1.64, 1.42, .72]}>
            <meshStandardMaterial color="#d59a72" roughness={.28} metalness={.82} emissive="#a35d39" emissiveIntensity={.34} />
          </mesh>
          {[.42, 3.56].map((angle, marker) => <mesh key={marker} position={[Math.cos(angle) * 2.58, Math.sin(angle) * 2.22, .025]}>
            <sphereGeometry args={[.035, 12, 12]} />
            <meshBasicMaterial color={marker ? "#b4a38b" : "#d59a72"} />
          </mesh>)}
        </group>}
        {stop.id !== "contact" && <>
          <mesh position={[-1.5, -2.45, 0]} castShadow receiveShadow><boxGeometry args={[.18, 2.05, .2]} /><meshStandardMaterial color="#645141" roughness={.42} metalness={.62} /></mesh>
          <mesh position={[1.5, -2.45, 0]} castShadow receiveShadow><boxGeometry args={[.18, 2.05, .2]} /><meshStandardMaterial color="#645141" roughness={.42} metalness={.62} /></mesh>
          <mesh position={[0, -3.65, 0]} receiveShadow><cylinderGeometry args={[1.7, 1.95, .22, 8]} /><meshStandardMaterial color="#332d26" roughness={.65} metalness={.32} /></mesh>
        </>}
      </>}
      {stop.kind === "project" && <>
        <mesh position={[0, -2.03, -.05]} receiveShadow><boxGeometry args={[5.65, .3, 2.05]} /><meshStandardMaterial color="#3b332b" roughness={.56} metalness={.58} /></mesh>
        <mesh position={[0, -1.84, -.15]}><boxGeometry args={[4.5, .08, 1.35]} /><meshStandardMaterial color="#79583e" roughness={.35} metalness={.72} emissive="#5c321d" emissiveIntensity={.42} /></mesh>
      </>}
      <mesh position={[0, .1, -.08]}><planeGeometry args={[2.45, .62]} /><meshBasicMaterial map={plaqueTextures[index]} transparent toneMapped={false} /></mesh>
      {/* Keep only the entrance and project displays as screens. The other stops
          are sculptural landmarks so the tour does not feel like a row of menus. */}
      {(stop.id === "home" || stop.kind === "project") && <>
        <mesh position={[0, -.35, -.2]} castShadow><boxGeometry args={[4.55, 2.98, .34]} /><meshStandardMaterial color="#76543d" roughness={.3} metalness={.78} emissive="#512d1c" emissiveIntensity={.4} /></mesh>
        <mesh position={[0, -.35, .005]}><planeGeometry args={[4.24, 2.66]} /><meshBasicMaterial map={stop.kind === "project" ? projectTextures[projectStops.findIndex((project) => project.id === stop.id)] : displayTextures[index]} toneMapped={false} /></mesh>
        <mesh position={[0, -.35, .07]} onClick={(event) => { event.stopPropagation(); jumpTo(stop.id); }} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "auto"; }}>
          <planeGeometry args={[4.24, 2.66]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </>}
      {stop.id === "experience" && <group ref={(node) => { features.current[index] = node; }} position={[0, -.34, .5]}>
        <mesh><cylinderGeometry args={[.035, .035, 2.35, 12]} /><meshStandardMaterial color="#a7825c" metalness={.76} roughness={.28} emissive="#704b2c" emissiveIntensity={.4} /></mesh>
        {[-.78, 0, .78].map((y, nodeIndex) => <mesh key={y} position={[nodeIndex % 2 ? .1 : -.1, y, .02]}><octahedronGeometry args={[.18, 0]} /><meshStandardMaterial color="#edb77c" emissive="#d9784d" emissiveIntensity={.75} metalness={.58} roughness={.24} /></mesh>)}
      </group>}
      {stop.id === "skills" && <group ref={(node) => { features.current[index] = node; }} position={[0, -.32, .58]}>
        <mesh><icosahedronGeometry args={[.48, 1]} /><meshStandardMaterial color="#887256" roughness={.28} metalness={.72} emissive="#7b492b" emissiveIntensity={.42} wireframe /></mesh>
        {Array.from({ length: 6 }, (_, nodeIndex) => <mesh key={nodeIndex} position={[Math.cos(nodeIndex * Math.PI / 3) * .95, Math.sin(nodeIndex * Math.PI / 3) * .7, .04]}><icosahedronGeometry args={[.12 + (nodeIndex % 2) * .035, 1]} /><meshStandardMaterial color="#d3ab7b" emissive="#a55c36" emissiveIntensity={.5} metalness={.56} roughness={.24} /></mesh>)}
      </group>}
      {stop.id === "contact" && <group ref={(node) => { features.current[index] = node; }} position={[0, -.36, .48]}>
        {[0, 1, 2].map((tier) => <mesh key={tier} position={[0, -.62 + tier * .34, 0]}><cylinderGeometry args={[1.15 - tier * .15, 1.36 - tier * .12, .12, 9]} /><meshStandardMaterial color={tier === 2 ? "#d5b17d" : "#554536"} roughness={.3} metalness={.74} emissive="#6e4329" emissiveIntensity={.38} /></mesh>)}
        <mesh position={[0, .22, 0]}><dodecahedronGeometry args={[.52, 0]} /><meshStandardMaterial color="#c9a778" roughness={.2} metalness={.84} emissive="#b26739" emissiveIntensity={.82} /></mesh>
        <mesh geometry={ring} position={[0, .18, 0]} rotation={[.35, .12, .2]} scale={[1.2, 1.2, .78]}><meshStandardMaterial color="#c39a70" roughness={.34} metalness={.66} emissive="#805537" emissiveIntensity={.36} transparent opacity={.72} /></mesh>
      </group>}
      {stop.id === "services" && <group ref={(node) => { features.current[index] = node; }} position={[0, -.35, .45]}>
        {[-.76, 0, .76].map((x, pillar) => <group key={x} position={[x, pillar === 1 ? .12 : -.08, 0]}>
          <mesh castShadow><cylinderGeometry args={[.16, .28, 1.15 + pillar * .22, 6]} /><meshStandardMaterial color={pillar === 1 ? "#bf8a63" : "#6b5744"} metalness={.66} roughness={.34} emissive="#804b2b" emissiveIntensity={.48} /></mesh>
          <mesh position={[0, .68 + pillar * .11, 0]}><octahedronGeometry args={[.2, 0]} /><meshStandardMaterial color="#e6bb8c" emissive="#d9784d" emissiveIntensity={.72} metalness={.55} roughness={.25} /></mesh>
        </group>)}
        <mesh position={[0, -.73, 0]}><cylinderGeometry args={[1.2, 1.45, .14, 9]} /><meshStandardMaterial color="#393126" roughness={.48} metalness={.68} /></mesh>
      </group>}
      {stop.id === "education" && <group ref={(node) => { features.current[index] = node; }} position={[0, -.35, .45]}>
        {[-1, 0, 1].map((step) => <mesh key={step} position={[step * .38, -.42 + (step + 1) * .27, -step * .24]} castShadow><boxGeometry args={[1.15, .23, .68]} /><meshStandardMaterial color={step === 1 ? "#b98c60" : "#514536"} roughness={.42} metalness={.62} emissive="#65402a" emissiveIntensity={.36} /></mesh>)}
        <mesh position={[0, .45, -.5]}><octahedronGeometry args={[.32, 0]} /><meshStandardMaterial color="#e5ba84" emissive="#c67243" emissiveIntensity={.75} metalness={.52} roughness={.26} /></mesh>
      </group>}
      {stop.id === "achievements" && <group ref={(node) => { features.current[index] = node; }} position={[0, -.34, .48]}>
        <mesh position={[0, .18, 0]}><cylinderGeometry args={[.32, .43, .64, 8]} /><meshStandardMaterial color="#d1a76e" roughness={.24} metalness={.82} emissive="#aa672e" emissiveIntensity={.76} /></mesh>
        {[-1, 1].map((side) => <mesh key={side} position={[side * .48, .23, 0]} rotation={[0, 0, side * -.25]}><torusGeometry args={[.28, .07, 8, 24, Math.PI * 1.3]} /><meshStandardMaterial color="#d8ad77" roughness={.28} metalness={.76} emissive="#8b562d" emissiveIntensity={.48} /></mesh>)}
        <mesh position={[0, -.36, 0]}><cylinderGeometry args={[.58, .73, .15, 8]} /><meshStandardMaterial color="#534333" roughness={.32} metalness={.7} /></mesh>
      </group>}
      {stop.id === "github" && <group ref={(node) => { features.current[index] = node; }} position={[0, -.33, .48]}>
        {[[-.72, .46, 0], [0, 0, .06], [.68, -.43, -.03], [.72, .55, -.03], [-.7, -.52, -.02]].map(([x, y, z], nodeIndex) => <mesh key={nodeIndex} position={[x, y, z]}><icosahedronGeometry args={[nodeIndex === 1 ? .22 : .13, 1]} /><meshStandardMaterial color={nodeIndex === 1 ? "#d3a675" : "#927453"} emissive="#a95e35" emissiveIntensity={.78} metalness={.66} roughness={.22} /></mesh>)}
        <mesh><icosahedronGeometry args={[.42, 1]} /><meshStandardMaterial color="#7d6951" wireframe metalness={.74} roughness={.28} emissive="#89512f" emissiveIntensity={.55} /></mesh>
        {[0, 1, 2, 3].map((link) => <mesh key={link} position={[Math.cos(link * Math.PI / 2) * .34, Math.sin(link * Math.PI / 2) * .23, 0]} rotation={[0, 0, link * Math.PI / 2]}><boxGeometry args={[.6, .025, .025]} /><meshBasicMaterial color="#ca9367" /></mesh>)}
      </group>}
      <mesh position={[0, -.9, .25]} onClick={(event) => { event.stopPropagation(); jumpTo(stop.id); }} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "auto"; }}>
        <sphereGeometry args={[.2, 16, 16]} /><meshBasicMaterial color="#e78452" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={(node) => { beacons.current[index] = node; }} position={[stop.x < 0 ? 2.45 : -2.45, .3, .2]}><icosahedronGeometry args={[.11, 1]} /><meshStandardMaterial color="#f1b283" emissive="#d9784d" emissiveIntensity={.55} metalness={.48} roughness={.25} /></mesh>
      <pointLight position={[0, .6, .6]} color={stop.id === "contact" ? "#d2a66f" : "#cf784f"} intensity={index === 0 ? 2.8 : 1.4} distance={6} />
    </group>)}
  </>;
}

function DistantArchitecture({ stops }: { stops: Stop[] }) {
  const columns = useRef<THREE.InstancedMesh>(null);
  const lintels = useRef<THREE.InstancedMesh>(null);
  const columnGeometry = useMemo(() => new THREE.BoxGeometry(.3, 5.2, .3), []);
  const columnMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#28231e", metalness: .55, roughness: .55 }), []);
  const lintelGeometry = useMemo(() => new THREE.BoxGeometry(13.5, .22, .42), []);
  const lintelMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#332c24", metalness: .6, roughness: .48, emissive: "#3e2418", emissiveIntensity: .28 }), []);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const scale = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const rotation = useMemo(() => new THREE.Quaternion(), []);
  const landmarks = useMemo(() => stops.filter((stop) => stop.kind !== "project"), [stops]);
  const count = Math.max(landmarks.length, 1);
  const beamCount = Math.ceil(count / 3);
  useEffect(() => {
    if (columns.current) {
      landmarks.forEach((stop, index) => [-1, 1].forEach((side, sideIndex) => {
        const height = 3.8 + ((index + sideIndex) % 4) * .75;
        position.set(stop.x + side * (9.4 + (index % 2) * 1.3), height / 2 - 2, stop.z + (sideIndex ? 2.4 : -2.4));
        scale.set(1, height / 5.2, 1);
        matrix.compose(position, rotation, scale);
        columns.current?.setMatrixAt(index * 2 + sideIndex, matrix);
      }));
      columns.current.instanceMatrix.needsUpdate = true;
    }
    if (lintels.current) {
      scale.set(1, 1, 1);
      landmarks.filter((_, index) => index % 4 === 1).forEach((stop, index) => {
        position.set(stop.x + (index % 2 ? 1.8 : -1.8), 4.7 + (index % 2) * .8, stop.z - 2.4);
        matrix.compose(position, rotation, scale);
        lintels.current?.setMatrixAt(index, matrix);
      });
      lintels.current.instanceMatrix.needsUpdate = true;
    }
  }, [landmarks, position, rotation, scale, matrix]);
  return <>
    <instancedMesh ref={columns} args={[columnGeometry, columnMaterial, count * 2]} castShadow receiveShadow />
    <instancedMesh ref={lintels} args={[lintelGeometry, lintelMaterial, beamCount]} castShadow receiveShadow />
  </>;
}

function LandmarkSpires({ stops }: { stops: Stop[] }) {
  const spires = useMemo(() => stops.filter((stop) => stop.kind !== "project").flatMap((stop, index) => [-1, 1].map((side) => ({
    key: `${stop.id}-${side}`, x: stop.x + side * (9 + (index % 3) * 1.6), z: stop.z + (side < 0 ? -4.2 : 3.4),
    height: 4.3 + (index % 4) * 1.35, accent: (index + (side < 0 ? 1 : 0)) % 3 === 0, variant: (index + (side < 0 ? 1 : 0)) % 3,
  }))), [stops]);
  const cores = useRef<Array<THREE.Mesh | null>>([]);
  useFrame(({ clock }) => {
    cores.current.forEach((core, index) => {
      if (!core) return;
      core.rotation.y = clock.elapsedTime * (index % 2 ? .08 : -.08);
      core.position.y = 1.2 + Math.sin(clock.elapsedTime * .34 + index) * .12;
    });
  });
  return <>
    {spires.map((spire, index) => <group key={spire.key} position={[spire.x, -2, spire.z]}>
      <mesh position={[0, .12, 0]} castShadow receiveShadow><cylinderGeometry args={[1.05, 1.3, .3, 6]} /><meshStandardMaterial color="#29241f" roughness={.72} metalness={.38} /></mesh>
      <mesh position={[0, spire.height / 2, 0]} castShadow receiveShadow>{spire.variant === 1 ? <cylinderGeometry args={[.32, .62, spire.height, 6]} /> : <boxGeometry args={[spire.variant === 2 ? .46 : .72, spire.height, spire.variant === 2 ? .46 : .72]} />}<meshStandardMaterial color="#40382f" roughness={.48} metalness={.54} /></mesh>
      <mesh position={[0, spire.height + .14, 0]} castShadow>{spire.variant === 2 ? <coneGeometry args={[.45, .66, 5]} /> : <octahedronGeometry args={[.46, 0]} />}<meshStandardMaterial color="#5e4838" roughness={.28} metalness={.78} emissive="#7d4a2d" emissiveIntensity={.42} /></mesh>
      <mesh ref={(node) => { cores.current[index] = node; }} position={[0, 1.2, .4]}><octahedronGeometry args={[.14, 1]} /><meshStandardMaterial color="#f0b58a" emissive="#db8050" emissiveIntensity={.95} metalness={.55} roughness={.25} /></mesh>
      <mesh position={[0, .5, .374]}><boxGeometry args={[.05, Math.max(1.2, spire.height - 1.2), .025]} /><meshBasicMaterial color={spire.accent ? "#d88b60" : "#8e7157"} transparent opacity={.74} /></mesh>
    </group>)}
  </>;
}

function Atmosphere() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(240 * 3);
    for (let i = 0; i < 240; i++) { values[i * 3] = Math.sin(i * 12.989) * 16; values[i * 3 + 1] = Math.sin(i * 7.23) * 7; values[i * 3 + 2] = -((i * 1.618) % 110); }
    return values;
  }, []);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * .035) * .025; });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#d4bda2" size={.035} transparent opacity={.42} sizeAttenuation /></points>;
}

function CameraTravel({ stops, pointer }: { stops: Stop[]; pointer: MutableRefObject<THREE.Vector2> }) {
  const { size } = useThree();
  const mobile = size.width < 700;
  const desired = useRef(new THREE.Vector3(0, 1.8, 7));
  const look = useRef(new THREE.Vector3(0, 1, -2));
  const targetLook = useRef(new THREE.Vector3());
  const viewA = useRef(new THREE.Vector3());
  const viewB = useRef(new THREE.Vector3());
  const focusA = useRef(new THREE.Vector3());
  const focusB = useRef(new THREE.Vector3());
  useFrame(({ camera, clock }, delta) => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    let left = stops[0]; let right = stops.at(-1);
    for (let i = 0; i < stops.length - 1; i++) if (progress >= stops[i].progress && progress <= stops[i + 1].progress) { left = stops[i]; right = stops[i + 1]; break; }
    if (!left || !right) return;
    const span = Math.max(.0001, right.progress - left.progress);
    const t = THREE.MathUtils.smoothstep((progress - left.progress) / span, 0, 1);
    const arc = Math.sin(t * Math.PI);
    const pose = (stop: Stop, cameraOut: THREE.Vector3, focusOut: THREE.Vector3) => {
      const xSide = mobile ? 0 : stop.kind === "project" ? (stop.x < 0 ? -1 : 1) * .7 : stop.id.length % 2 ? -1 : 1;
      const lift = stop.id === "experience" ? 2.5 : stop.id === "skills" ? .45 : stop.id === "education" ? 1.4 : stop.id === "contact" ? 2 : stop.kind === "project" ? 1.25 : 1.65;
      const distance = mobile
        ? stop.id === "projects" ? 17 : stop.kind === "project" ? 10.6 : stop.id === "home" ? 12.5 : stop.id === "contact" ? 12 : 13
        : stop.id === "projects" ? 15 : stop.id === "contact" ? 10 : stop.kind === "project" ? 7.4 : 10.8;
      cameraOut.set(stop.x + xSide * (mobile ? 0 : stop.kind === "project" ? .6 : 2.25), mobile ? 1.45 + lift * .58 : 1.65 + lift, stop.z + distance);
      focusOut.set(stop.x + (stop.kind === "project" ? 0 : -xSide * .32), stop.y - (stop.id === "experience" ? .9 : .42), stop.z - (stop.kind === "project" ? .8 : 1.15));
    };
    pose(left, viewA.current, focusA.current);
    pose(right, viewB.current, focusB.current);
    const flybySide = (left.x <= right.x ? 1 : -1) * (left.kind === "project" || right.kind === "project" ? 3 : 1.6);
    const pointerStrength = mobile ? .12 : 1;
    desired.current.set(
      THREE.MathUtils.lerp(viewA.current.x, viewB.current.x, t) + pointer.current.x * 1.05 * pointerStrength + arc * flybySide * (mobile ? .42 : 1),
      THREE.MathUtils.lerp(viewA.current.y, viewB.current.y, t) + pointer.current.y * .5 * pointerStrength + arc * (left.id === "experience" || right.id === "experience" ? 2.2 : mobile ? .48 : 1.1),
      THREE.MathUtils.lerp(viewA.current.z, viewB.current.z, t) + arc * (left.kind === "project" || right.kind === "project" ? mobile ? 1.2 : 2.6 : mobile ? .75 : 1.8),
    );
    targetLook.current.set(THREE.MathUtils.lerp(focusA.current.x, focusB.current.x, t) + arc * flybySide * .23, THREE.MathUtils.lerp(focusA.current.y, focusB.current.y, t), THREE.MathUtils.lerp(focusA.current.z, focusB.current.z, t));
    const ease = 1 - Math.exp(-1.35 * delta);
    camera.position.lerp(desired.current, ease);
    look.current.lerp(targetLook.current, ease);
    const drift = mobile ? 0 : Math.sin(clock.elapsedTime * .16) * .025;
    camera.lookAt(look.current.x + drift, look.current.y, look.current.z);
    camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, Math.sin(progress * Math.PI * 2) * .018 + pointer.current.x * -.008, 1.2, delta);
    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = mobile
        ? left.kind === "project" || right.kind === "project" ? 56 : left.id === "home" || right.id === "home" ? 50 : 53
        : left.kind === "project" || right.kind === "project" ? 39 : left.id === "home" || right.id === "home" ? 48 : 45;
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, mobile ? 2 : 1.2, delta);
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

export function TourScene({ stops, projectStops }: { stops: Stop[]; projectStops: ProjectStop[] }) {
  const pointer = useRef(new THREE.Vector2());
  return <Canvas className="world-tour-canvas" shadows dpr={[1, 1.25]} camera={{ position: [0, 2.2, 7], fov: 46, near: .1, far: 160 }} gl={{ antialias: false, powerPreference: "low-power", toneMapping: THREE.ACESFilmicToneMapping }} onPointerMove={(event) => { if (event.pointerType === "touch") return; pointer.current.set((event.clientX / window.innerWidth - .5) * 2, -(event.clientY / window.innerHeight - .5) * 2); }} onPointerLeave={() => pointer.current.set(0, 0)}>
    <color attach="background" args={["#100e0c"]} />
    <fog attach="fog" args={["#100e0c", 15, 105]} />
    <ambientLight intensity={.82} />
    <hemisphereLight args={["#e2cfb4", "#29211a", .78]} />
    <directionalLight position={[-3, 8, 3]} intensity={2.8} color="#f0d6b8" castShadow shadow-mapSize={[512, 512]} />
    <directionalLight position={[5, 5, -15]} intensity={1.65} color="#b28162" />
    <Ground />
    <DistantArchitecture stops={stops} />
    <LandmarkSpires stops={stops} />
    <Architecture stops={stops} projectStops={projectStops} />
    <Atmosphere />
    <CameraTravel stops={stops} pointer={pointer} />
  </Canvas>;
}

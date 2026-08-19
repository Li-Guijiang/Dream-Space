"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

interface PlanetData {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  colors: string[];
  ring?: boolean;
  desc: string;
  moons?: number;
  dayLength?: string;
  temp?: string;
}

const planets: PlanetData[] = [
  { name: "水星", radius: 0.38, distance: 6, speed: 4.1, colors: ["#8c8c8c", "#6b6b6b", "#a0a0a0", "#5a5a5a"], desc: "最小的行星，表面布满陨石坑", moons: 0, dayLength: "59 地球日", temp: "−173°C ~ 427°C" },
  { name: "金星", radius: 0.95, distance: 9, speed: 1.6, colors: ["#e8cda0", "#d4a860", "#c49548", "#f0d8a8"], desc: "最热的行星，浓密的二氧化碳大气", moons: 0, dayLength: "243 地球日", temp: "462°C" },
  { name: "地球", radius: 1, distance: 13, speed: 1, colors: ["#1a6bc4", "#2d8f4e", "#1a6bc4", "#4da6ff", "#2d8f4e"], desc: "我们的家园，已知唯一有生命的行星", moons: 1, dayLength: "24 小时", temp: "15°C" },
  { name: "火星", radius: 0.53, distance: 17, speed: 0.53, colors: ["#c1440e", "#e55b3c", "#a83808", "#d44a1a"], desc: "红色星球，人类下一个探索目标", moons: 2, dayLength: "24.6 小时", temp: "−63°C" },
  { name: "木星", radius: 2.5, distance: 24, speed: 0.084, colors: ["#c4a46f", "#e0ae6f", "#8b6d3f", "#d4985a", "#a07840"], desc: "最大的行星，大红斑风暴已持续数百年", moons: 95, dayLength: "9.9 小时", temp: "−110°C" },
  { name: "土星", radius: 2.1, distance: 32, speed: 0.034, colors: ["#d4b96e", "#c4a55a", "#e8d08c", "#b09040"], ring: true, desc: "壮观的环系统，密度比水还小", moons: 146, dayLength: "10.7 小时", temp: "−140°C" },
  { name: "天王星", radius: 1.6, distance: 40, speed: 0.012, colors: ["#7de0e6", "#5cc8d0", "#4ab8c0", "#90f0f0"], desc: "躺着旋转的冰巨星", moons: 28, dayLength: "17.2 小时", temp: "−195°C" },
  { name: "海王星", radius: 1.5, distance: 47, speed: 0.006, colors: ["#3a5fcd", "#4b70dd", "#2848b0", "#5880ee"], desc: "最远的行星，风速最快", moons: 16, dayLength: "16.1 小时", temp: "−200°C" },
];

// procedural texture generator
function makePlanetTexture(colors: string[], size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext("2d")!;

  // base fill
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // noise bands
  for (let y = 0; y < canvas.height; y++) {
    const bandColor = colors[Math.floor((y / canvas.height) * colors.length) % colors.length];
    ctx.fillStyle = bandColor;
    const noise = Math.sin(y * 0.1) * 10 + Math.sin(y * 0.3) * 5;
    ctx.fillRect(0, y, canvas.width, 1);
    // add random spots
    for (let i = 0; i < 3; i++) {
      const sx = Math.random() * canvas.width;
      const sw = 20 + Math.random() * 40;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.globalAlpha = 0.3;
      ctx.fillRect(sx, y, sw, 1);
    }
  }
  ctx.globalAlpha = 1;

  // swirl patterns
  for (let i = 0; i < 15; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const r = 10 + Math.random() * 30;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const c = colors[Math.floor(Math.random() * colors.length)];
    grad.addColorStop(0, c);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeSunTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, "#ff8800");
  grad.addColorStop(0.3, "#ffcc00");
  grad.addColorStop(0.6, "#ff6600");
  grad.addColorStop(1, "#ffaa00");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);
  // spots
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 512, y = Math.random() * 256, r = 5 + Math.random() * 20;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,200,0,0.6)");
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const tex = useMemo(makeSunTexture, []);
  useFrame((_, delta) => { if (meshRef.current) meshRef.current.rotation.y += delta * 0.1; });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.06} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.03} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={tex} emissive="#ff8800" emissiveIntensity={1.5} />
      </mesh>
      <pointLight color="#ffd000" intensity={3} distance={200} />
    </group>
  );
}

function Planet({ data, onClick }: { data: PlanetData; onClick: (pos: THREE.Vector3) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const tex = useMemo(() => makePlanetTexture(data.colors), [data.colors]);

  useFrame((_, delta) => {
    angleRef.current += delta * data.speed * 0.15;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * data.distance;
      groupRef.current.position.z = Math.sin(angleRef.current) * data.distance;
    }
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.distance - 0.02, data.distance + 0.02, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); if (groupRef.current) onClick(groupRef.current.position.clone()); }}
        >
          <sphereGeometry args={[data.radius, 64, 64]} />
          <meshStandardMaterial map={tex} roughness={0.8} metalness={0.05} />
        </mesh>
        {data.ring && (
          <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[data.radius * 1.4, data.radius * 2.2, 64]} />
            <meshBasicMaterial color="#d4b96e" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}
        <Html position={[0, data.radius + 0.8, 0]} center distanceFactor={15} style={{ pointerEvents: "none" }}>
          <div className="text-white text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
            {data.name}
          </div>
        </Html>
      </group>
    </>
  );
}

function FlyCamera({ target, onArrived }: { target: THREE.Vector3 | null; onArrived: () => void }) {
  const { camera, controls } = useThree();
  const flyDest = useRef<THREE.Vector3 | null>(null);
  const startPos = useRef(new THREE.Vector3());
  const progress = useRef(1);
  const prevId = useRef("");

  useFrame((_, delta) => {
    const id = target ? `${target.x.toFixed(1)},${target.z.toFixed(1)}` : "";
    if (target && id !== prevId.current) {
      prevId.current = id;
      startPos.current.copy(camera.position);
      const dist = target.length();
      flyDest.current = new THREE.Vector3(target.x * 0.5, dist * 0.25 + 2, target.z * 0.5 + dist * 0.3);
      progress.current = 0;
      const ctrl = controls as any;
      if (ctrl) ctrl.enabled = false;
    }
    if (progress.current >= 1 || !flyDest.current) return;
    progress.current = Math.min(1, progress.current + delta * 0.6);
    const t = 1 - Math.pow(1 - progress.current, 3);
    camera.position.lerpVectors(startPos.current, flyDest.current, t);
    camera.lookAt(0, 0, 0);
    if (progress.current >= 1) {
      const ctrl = controls as any;
      if (ctrl) ctrl.enabled = true;
      onArrived();
    }
  });
  return null;
}

function Scene({ onSelect }: { onSelect: (p: PlanetData | null) => void }) {
  const [flyTarget, setFlyTarget] = useState<THREE.Vector3 | null>(null);

  return (
    <>
      <ambientLight intensity={0.12} />
      <Stars radius={300} depth={80} count={8000} factor={5} saturation={0} fade speed={0.5} />
      <Sun />
      {planets.map((p) => (
        <Planet key={p.name} data={p} onClick={(pos) => { onSelect(p); setFlyTarget(pos); }} />
      ))}
      <FlyCamera target={flyTarget} onArrived={() => setFlyTarget(null)} />
      <OrbitControls enablePan={false} minDistance={5} maxDistance={120} enableDamping dampingFactor={0.05} rotateSpeed={0.5} zoomSpeed={0.8} />
    </>
  );
}

export default function StarsPage() {
  const [selected, setSelected] = useState<PlanetData | null>(null);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">星空</h1>
        <p className="text-xs text-slate-400">拖拽旋转 · 滚轮缩放 · 点击星球飞过去查看详情</p>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-white/5 bg-black" style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}>
        <Canvas camera={{ position: [0, 25, 50], fov: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
          <Scene onSelect={setSelected} />
        </Canvas>

        {selected && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-4 right-4 w-64 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 rounded-full" style={{ background: `linear-gradient(135deg, ${selected.colors[0]}, ${selected.colors[1]})` }} />
              <span className="text-xs text-slate-400">{selected.distance} AU</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selected.desc}</p>
            <div className="space-y-1.5 text-xs">
              {selected.moons !== undefined && <div className="flex justify-between"><span className="text-slate-400">卫星</span><span className="text-slate-200">{selected.moons} 颗</span></div>}
              {selected.dayLength && <div className="flex justify-between"><span className="text-slate-400">自转周期</span><span className="text-slate-200">{selected.dayLength}</span></div>}
              {selected.temp && <div className="flex justify-between"><span className="text-slate-400">表面温度</span><span className="text-slate-200">{selected.temp}</span></div>}
            </div>
          </motion.div>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {planets.map((p) => (
            <button
              key={p.name}
              onClick={() => setSelected(p)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border ${selected?.name === p.name ? "bg-white/20 text-white border-white/30" : "bg-black/40 text-slate-400 border-white/5 hover:text-white hover:bg-white/10"}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

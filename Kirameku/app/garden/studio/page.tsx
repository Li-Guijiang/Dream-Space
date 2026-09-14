"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Move, RotateCw, Trash2, Copy, Camera, RotateCcw,
  ChevronDown, Armchair, Table, Lightbulb, BookOpen, Leaf, Image,
} from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

// ========== Types ==========
interface FurnitureItem {
  type: string;
  name: string;
}

interface Category {
  name: string;
  icon: string;
  open: boolean;
  items: FurnitureItem[];
}

interface PaletteColor {
  name: string;
  hex: string;
}

// ========== Data ==========
const categories: Category[] = [
  { name: "沙发", icon: "couch", open: true, items: [
    { type: "sofa-3", name: "三人沙发" }, { type: "sofa-2", name: "双人沙发" }, { type: "sofa-1", name: "单人沙发" },
  ]},
  { name: "桌椅", icon: "table", open: false, items: [
    { type: "coffee-table", name: "茶几" }, { type: "side-table", name: "边桌" }, { type: "chair", name: "餐椅" },
  ]},
  { name: "灯具", icon: "lightbulb", open: false, items: [
    { type: "floor-lamp", name: "落地灯" },
  ]},
  { name: "储物", icon: "book", open: false, items: [
    { type: "bookshelf", name: "书架" },
  ]},
  { name: "装饰", icon: "leaf", open: false, items: [
    { type: "rug", name: "地毯" }, { type: "plant", name: "绿植" }, { type: "wall-art", name: "装饰画" },
  ]},
];

const colorPalettes: Record<string, PaletteColor[]> = {
  sofa: [
    { name: "鼠尾草绿", hex: "#6b8f71" }, { name: "焦糖橙", hex: "#c4713b" },
    { name: "深海蓝", hex: "#3d5a6e" }, { name: "烟灰色", hex: "#7a7a7a" },
    { name: "奶油白", hex: "#d4c8b8" }, { name: "勃艮第", hex: "#8a4040" },
  ],
  wood: [
    { name: "胡桃木", hex: "#6b5438" }, { name: "橡木", hex: "#a0845c" },
    { name: "白蜡木", hex: "#c4a882" }, { name: "黑檀", hex: "#2d2a26" },
    { name: "樱桃木", hex: "#8b5e3c" },
  ],
  metal: [
    { name: "哑光黑", hex: "#1a1a1a" }, { name: "黄铜", hex: "#c4a050" },
    { name: "铬银", hex: "#c8c8c8" }, { name: "玫瑰金", hex: "#b8806e" },
  ],
  decor: [
    { name: "森林绿", hex: "#4a7c59" }, { name: "陶土红", hex: "#c4713b" },
    { name: "靛蓝", hex: "#3d5a6e" }, { name: "米白", hex: "#d4c8b8" },
    { name: "酒红", hex: "#8a4040" },
  ],
};

const ROOM_W = 8, ROOM_D = 6, ROOM_H = 3.2;

// ========== Three.js Helpers ==========
function makeMat(color: string, type: string) {
  const p: THREE.MeshStandardMaterialParameters = { color };
  switch (type) {
    case "fabric": p.roughness = 0.85; p.metalness = 0; break;
    case "leather": p.roughness = 0.35; p.metalness = 0.05; break;
    case "wood": p.roughness = 0.65; p.metalness = 0; break;
    case "metal": p.roughness = 0.2; p.metalness = 0.85; break;
    case "matte": p.roughness = 0.7; p.metalness = 0; break;
    default: p.roughness = 0.5; p.metalness = 0;
  }
  return new THREE.MeshStandardMaterial(p);
}

function createFloorTexture() {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 1024;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#c4a882";
  ctx.fillRect(0, 0, 1024, 1024);
  const plankH = 128;
  for (let i = 0; i < 8; i++) {
    const y = i * plankH;
    const r = 175 + Math.random() * 25;
    const g = 148 + Math.random() * 20;
    const b = 110 + Math.random() * 20;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y + 1, 1024, plankH - 2);
    for (let j = 0; j < 20; j++) {
      ctx.strokeStyle = `rgba(${r - 35},${g - 30},${b - 25},${0.08 + Math.random() * 0.08})`;
      ctx.lineWidth = 0.5 + Math.random() * 2;
      ctx.beginPath();
      let gy = y + 8 + Math.random() * (plankH - 16);
      ctx.moveTo(0, gy);
      for (let x = 0; x < 1024; x += 25) { gy += (Math.random() - 0.5) * 5; ctx.lineTo(x, gy); }
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(80,60,40,0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createWallTexture() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f0ebe4";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.025})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }
  return new THREE.CanvasTexture(c);
}

// ========== Furniture Creators ==========
function createSofa(seats: number, color?: string, matType?: string) {
  const g = new THREE.Group();
  const w = seats * 0.72 + 0.16;
  const fabric = makeMat(color || "#6b8f71", matType || "fabric");
  const legMat = makeMat("#1a1a1a", "metal");
  const legGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8);
  [[-w/2+0.1, 0.05, 0.32], [w/2-0.1, 0.05, 0.32], [-w/2+0.1, 0.05, -0.32], [w/2-0.1, 0.05, -0.32]].forEach(p => {
    const m = new THREE.Mesh(legGeo, legMat); m.position.set(...(p as [number, number, number])); m.castShadow = true; g.add(m);
  });
  const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.13, 0.82), fabric);
  base.position.set(0, 0.165, 0); base.castShadow = true; base.receiveShadow = true;
  base.userData.isColorable = true; g.add(base);
  const cw = (w - 0.12) / seats - 0.04;
  for (let i = 0; i < seats; i++) {
    const x = -w/2 + 0.1 + cw/2 + i * (cw + 0.04);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(cw, 0.11, 0.58), fabric);
    seat.position.set(x, 0.285, 0.04); seat.castShadow = true; seat.userData.isColorable = true; g.add(seat);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, 0.32, 0.1), fabric);
  back.position.set(0, 0.39, -0.36); back.castShadow = true; back.userData.isColorable = true; g.add(back);
  for (let i = 0; i < seats; i++) {
    const x = -w/2 + 0.1 + cw/2 + i * (cw + 0.04);
    const bc = new THREE.Mesh(new THREE.BoxGeometry(cw - 0.02, 0.28, 0.08), fabric);
    bc.position.set(x, 0.39, -0.28); bc.castShadow = true; bc.userData.isColorable = true; g.add(bc);
  }
  if (seats > 1) {
    [-1, 1].forEach(s => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.68), fabric);
      arm.position.set(s * (w/2 - 0.05), 0.34, -0.02); arm.castShadow = true; arm.userData.isColorable = true; g.add(arm);
    });
  }
  g.userData = { isFurniture: true, type: "sofa", name: `${seats}人沙发`, color: color || "#6b8f71", materialType: matType || "fabric", palette: "sofa" };
  return g;
}

function createCoffeeTable(color?: string) {
  const g = new THREE.Group();
  const wood = makeMat(color || "#8b6f4e", "wood");
  const legMat = makeMat("#1a1a1a", "metal");
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.65), wood);
  top.position.y = 0.4; top.castShadow = true; top.receiveShadow = true; top.userData.isColorable = true; g.add(top);
  const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
  [[-0.5, 0.2, 0.25], [0.5, 0.2, 0.25], [-0.5, 0.2, -0.25], [0.5, 0.2, -0.25]].forEach(p => {
    const m = new THREE.Mesh(legGeo, legMat); m.position.set(...(p as [number, number, number])); m.castShadow = true; g.add(m);
  });
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 0.5), wood);
  shelf.position.y = 0.12; shelf.castShadow = true; shelf.receiveShadow = true; shelf.userData.isColorable = true; g.add(shelf);
  g.userData = { isFurniture: true, type: "table", name: "茶几", color: color || "#8b6f4e", materialType: "wood", palette: "wood" };
  return g;
}

function createSideTable(color?: string) {
  const g = new THREE.Group();
  const wood = makeMat(color || "#8b6f4e", "wood");
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 24), wood);
  top.position.y = 0.55; top.castShadow = true; top.receiveShadow = true; top.userData.isColorable = true; g.add(top);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.55, 12), wood);
  stem.position.y = 0.275; stem.castShadow = true; stem.userData.isColorable = true; g.add(stem);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.015, 24), wood);
  base.position.y = 0.007; base.castShadow = true; base.userData.isColorable = true; g.add(base);
  g.userData = { isFurniture: true, type: "table", name: "边桌", color: color || "#8b6f4e", materialType: "wood", palette: "wood" };
  return g;
}

function createChair(color?: string) {
  const g = new THREE.Group();
  const mat = makeMat(color || "#2d2a26", "matte");
  const legMat = makeMat("#1a1a1a", "metal");
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.44), mat);
  seat.position.y = 0.44; seat.castShadow = true; seat.receiveShadow = true; seat.userData.isColorable = true; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 0.03), mat);
  back.position.set(0, 0.67, -0.2); back.castShadow = true; back.userData.isColorable = true; g.add(back);
  const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.44, 8);
  [[-0.18, 0.22, 0.17], [0.18, 0.22, 0.17], [-0.18, 0.22, -0.17], [0.18, 0.22, -0.17]].forEach(p => {
    const m = new THREE.Mesh(legGeo, legMat); m.position.set(...(p as [number, number, number])); m.castShadow = true; g.add(m);
  });
  g.userData = { isFurniture: true, type: "chair", name: "餐椅", color: color || "#2d2a26", materialType: "matte", palette: "wood" };
  return g;
}

function createFloorLamp(color?: string) {
  const g = new THREE.Group();
  const metal = makeMat(color || "#1a1a1a", "metal");
  const shadeMat = new THREE.MeshStandardMaterial({ color: "#f5f0e8", roughness: 0.8, metalness: 0, side: THREE.DoubleSide });
  const baseM = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.02, 24), metal);
  baseM.position.y = 0.01; baseM.castShadow = true; g.add(baseM);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.5, 12), metal);
  pole.position.y = 0.77; pole.castShadow = true; g.add(pole);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 0.28, 24, 1, true), shadeMat);
  shade.position.y = 1.62; shade.castShadow = true; g.add(shade);
  const bulb = new THREE.PointLight(0xffe8cc, 0.6, 4);
  bulb.position.y = 1.55; g.add(bulb);
  g.userData = { isFurniture: true, type: "lamp", name: "落地灯", color: color || "#1a1a1a", materialType: "metal", palette: "metal", hasLight: true };
  return g;
}

function createBookshelf(color?: string) {
  const g = new THREE.Group();
  const wood = makeMat(color || "#a0845c", "wood");
  [-0.37, 0.37].forEach(x => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.8, 0.32), wood);
    side.position.set(x, 0.9, 0); side.castShadow = true; side.receiveShadow = true; side.userData.isColorable = true; g.add(side);
  });
  for (let i = 0; i < 5; i++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.71, 0.025, 0.32), wood);
    shelf.position.set(0, i * 0.45, 0); shelf.castShadow = true; shelf.receiveShadow = true; shelf.userData.isColorable = true; g.add(shelf);
  }
  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.71, 1.8, 0.01), makeMat("#e8e0d6", "matte"));
  backPanel.position.set(0, 0.9, -0.16); g.add(backPanel);
  const bookColors = ["#c4713b", "#3d5a6e", "#6b8f71", "#8a4040", "#d4c8b8"];
  for (let row = 0; row < 4; row++) {
    const y = row * 0.45 + 0.14;
    const count = 3 + Math.floor(Math.random() * 4);
    let bx = -0.3;
    for (let b = 0; b < count; b++) {
      const bw = 0.03 + Math.random() * 0.04;
      const bh = 0.2 + Math.random() * 0.1;
      const book = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.2), makeMat(bookColors[b % 5], "matte"));
      book.position.set(bx + bw/2, y + bh/2 - 0.01, 0.02);
      g.add(book);
      bx += bw + 0.005;
      if (bx > 0.28) break;
    }
  }
  g.userData = { isFurniture: true, type: "bookshelf", name: "书架", color: color || "#a0845c", materialType: "wood", palette: "wood" };
  return g;
}

function createRug(color?: string) {
  const g = new THREE.Group();
  const mat = makeMat(color || "#d4c8b8", "fabric");
  const rug = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.015, 1.7), mat);
  rug.position.y = 0.007; rug.receiveShadow = true; rug.userData.isColorable = true; g.add(rug);
  const edgeMat = makeMat("#b8a898", "fabric");
  const edge = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.016, 1.5), edgeMat);
  edge.position.y = 0.008; g.add(edge);
  g.userData = { isFurniture: true, type: "rug", name: "地毯", color: color || "#d4c8b8", materialType: "fabric", palette: "decor" };
  return g;
}

function createPlant() {
  const g = new THREE.Group();
  const potMat = makeMat("#d4c8b8", "matte");
  const leafMat = makeMat("#4a7c59", "matte");
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.22, 16), potMat);
  pot.position.y = 0.11; pot.castShadow = true; g.add(pot);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16), makeMat("#6b5438", "matte"));
  soil.position.y = 0.22; g.add(soil);
  [[0, 0.5, 0], [0.08, 0.58, 0.05], [-0.06, 0.55, -0.04], [0.04, 0.45, -0.06], [-0.05, 0.48, 0.06]].forEach(p => {
    const r = 0.1 + Math.random() * 0.06;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.01, r), 12, 10), leafMat);
    leaf.position.set(...(p as [number, number, number])); leaf.castShadow = true; leaf.userData.isColorable = true; g.add(leaf);
  });
  g.userData = { isFurniture: true, type: "plant", name: "绿植", color: "#4a7c59", materialType: "matte", palette: "decor" };
  return g;
}

function createWallArt(color?: string) {
  const g = new THREE.Group();
  const frameMat = makeMat("#2d2a26", "wood");
  const canvasMat = makeMat(color || "#3d5a6e", "matte");
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.62, 0.03), frameMat);
  frame.castShadow = true; g.add(frame);
  const canvas = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.52, 0.01), canvasMat);
  canvas.position.z = 0.015; canvas.userData.isColorable = true; g.add(canvas);
  g.userData = { isFurniture: true, type: "wall-art", name: "装饰画", color: color || "#3d5a6e", materialType: "matte", palette: "decor" };
  return g;
}

function createFurniture(type: string, opts: { color?: string; materialType?: string } = {}) {
  switch (type) {
    case "sofa-3": return createSofa(3, opts.color, opts.materialType);
    case "sofa-2": return createSofa(2, opts.color, opts.materialType);
    case "sofa-1": return createSofa(1, opts.color, opts.materialType);
    case "coffee-table": return createCoffeeTable(opts.color);
    case "side-table": return createSideTable(opts.color);
    case "chair": return createChair(opts.color);
    case "floor-lamp": return createFloorLamp(opts.color);
    case "bookshelf": return createBookshelf(opts.color);
    case "rug": return createRug(opts.color);
    case "plant": return createPlant();
    case "wall-art": return createWallArt(opts.color);
    default: return null;
  }
}

function getFurnitureFromIntersect(obj: THREE.Object3D): THREE.Group | null {
  let current: THREE.Object3D | null = obj;
  while (current) {
    if (current.userData?.isFurniture) return current as THREE.Group;
    current = current.parent;
  }
  return null;
}

function changeFurnitureColor(obj: THREE.Group, color: string) {
  obj.traverse(child => {
    if ((child as THREE.Mesh).isMesh && child.userData.isColorable) {
      ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(color);
    }
  });
}

function changeFurnitureMaterial(obj: THREE.Group, matType: string) {
  obj.traverse(child => {
    if ((child as THREE.Mesh).isMesh && child.userData.isColorable) {
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      const color = mat.color;
      const newMat = makeMat("#" + color.getHexString(), matType);
      mat.dispose();
      (child as THREE.Mesh).material = newMat;
    }
  });
}

// ========== Icon mapping ==========
const catIcons: Record<string, React.ElementType> = {
  couch: Armchair, table: Table, lightbulb: Lightbulb, book: BookOpen, leaf: Leaf, image: Image,
};

// ========== Component ==========
export default function StudioPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const furnitureRef = useRef<THREE.Group[]>([]);
  const selectedRef = useRef<THREE.Group | null>(null);
  const selectionBoxRef = useRef<THREE.BoxHelper | null>(null);
  const hoveredRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef(new THREE.Vector3());
  const floorPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const pointerDownPosRef = useRef(new THREE.Vector2());
  const pointerDragStartRef = useRef(false);

  // UI state
  const [mode, setMode] = useState<"translate" | "rotate">("translate");
  const [selectedData, setSelectedData] = useState<any>(null);
  const [furnitureCount, setFurnitureCount] = useState(0);
  const [openCats, setOpenCats] = useState<Record<number, boolean>>({ 0: true });
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = useCallback((msg: string, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  }, []);

  const updatePropertiesPanel = useCallback(() => {
    const sel = selectedRef.current;
    if (!sel) { setSelectedData(null); return; }
    const d = sel.userData;
    const pos = sel.position;
    const rot = sel.rotation;
    const sc = sel.scale.x;
    setSelectedData({
      name: d.name, type: d.type, color: d.color, materialType: d.materialType, palette: d.palette,
      posX: pos.x.toFixed(2), posZ: pos.z.toFixed(2),
      rotY: ((THREE.MathUtils.radToDeg(rot.y) % 360 + 540) % 360 - 180).toFixed(0),
      scale: sc.toFixed(2),
    });
  }, []);

  const updateSelectionBox = useCallback(() => {
    if (selectionBoxRef.current && selectedRef.current) selectionBoxRef.current.update();
  }, []);

  const deselectFurniture = useCallback(() => {
    selectedRef.current = null;
    if (selectionBoxRef.current) {
      selectionBoxRef.current.parent?.remove(selectionBoxRef.current);
      selectionBoxRef.current.geometry.dispose();
      selectionBoxRef.current = null;
    }
    updatePropertiesPanel();
  }, [updatePropertiesPanel]);

  const selectFurniture = useCallback((obj: THREE.Group) => {
    if (selectedRef.current === obj) return;
    deselectFurniture();
    selectedRef.current = obj;
    const box = new THREE.BoxHelper(obj, 0xc4713b);
    box.userData.isHelper = true;
    sceneRef.current?.add(box);
    selectionBoxRef.current = box;
    updatePropertiesPanel();
  }, [deselectFurniture, updatePropertiesPanel]);

  const deleteSelected = useCallback(() => {
    if (!selectedRef.current) return;
    const name = selectedRef.current.userData.name;
    const obj = selectedRef.current;
    sceneRef.current?.remove(obj);
    furnitureRef.current = furnitureRef.current.filter(f => f !== obj);
    obj.traverse(child => {
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
      const mat = (child as THREE.Mesh).material;
      if (mat) {
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat.dispose();
      }
    });
    deselectFurniture();
    setFurnitureCount(furnitureRef.current.length);
    showToast(`已删除 ${name}`, "warning");
  }, [deselectFurniture, showToast]);

  const duplicateSelected = useCallback(() => {
    if (!selectedRef.current) return;
    const d = selectedRef.current.userData;
    let typeName = d.type;
    if (d.type === "sofa") typeName = `sofa-${d.name[0]}`;
    const clone = createFurniture(typeName, { color: d.color, materialType: d.materialType });
    if (!clone) return;
    clone.position.copy(selectedRef.current.position).add(new THREE.Vector3(0.5, 0, 0.5));
    clone.rotation.copy(selectedRef.current.rotation);
    clone.scale.copy(selectedRef.current.scale);
    sceneRef.current?.add(clone);
    furnitureRef.current.push(clone);
    selectFurniture(clone);
    setFurnitureCount(furnitureRef.current.length);
    showToast(`已复制 ${d.name}`);
  }, [selectFurniture, showToast]);

  const addFurniture = useCallback((type: string) => {
    const f = createFurniture(type);
    if (!f) return;
    f.position.set((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2);
    sceneRef.current?.add(f);
    furnitureRef.current.push(f);
    selectFurniture(f);
    setFurnitureCount(furnitureRef.current.length);
    showToast(`已添加 ${f.userData.name}`, "success");
  }, [selectFurniture, showToast]);

  const resetView = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(5.5, 4.5, 6.5);
    controlsRef.current.target.set(0, 0.8, 0);
    controlsRef.current.update();
    showToast("视角已重置");
  }, [showToast]);

  const takeScreenshot = useCallback(() => {
    const r = rendererRef.current;
    const s = sceneRef.current;
    const c = cameraRef.current;
    if (!r || !s || !c) return;
    r.render(s, c);
    const link = document.createElement("a");
    link.download = "studio-screenshot.png";
    link.href = r.domElement.toDataURL("image/png");
    link.click();
    showToast("截图已保存", "success");
  }, [showToast]);

  // Property change handlers
  const setPosX = useCallback((v: number) => {
    if (!selectedRef.current) return;
    selectedRef.current.position.x = v;
    updateSelectionBox();
    updatePropertiesPanel();
  }, [updateSelectionBox, updatePropertiesPanel]);

  const setPosZ = useCallback((v: number) => {
    if (!selectedRef.current) return;
    selectedRef.current.position.z = v;
    updateSelectionBox();
    updatePropertiesPanel();
  }, [updateSelectionBox, updatePropertiesPanel]);

  const setRotY = useCallback((v: number) => {
    if (!selectedRef.current) return;
    selectedRef.current.rotation.y = THREE.MathUtils.degToRad(v);
    updateSelectionBox();
    updatePropertiesPanel();
  }, [updateSelectionBox, updatePropertiesPanel]);

  const setScale = useCallback((v: number) => {
    if (!selectedRef.current) return;
    selectedRef.current.scale.set(v, v, v);
    updateSelectionBox();
    updatePropertiesPanel();
  }, [updateSelectionBox, updatePropertiesPanel]);

  const setColor = useCallback((color: string) => {
    if (!selectedRef.current) return;
    changeFurnitureColor(selectedRef.current, color);
    selectedRef.current.userData.color = color;
    updatePropertiesPanel();
  }, [updatePropertiesPanel]);

  const setMaterial = useCallback((mat: string) => {
    if (!selectedRef.current) return;
    changeFurnitureMaterial(selectedRef.current, mat);
    selectedRef.current.userData.materialType = mat;
    updatePropertiesPanel();
  }, [updatePropertiesPanel]);

  // ========== Three.js Init ==========
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e8e2da");
    scene.fog = new THREE.Fog("#e8e2da", 12, 20);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(5.5, 4.5, 6.5);
    camera.lookAt(0, 0.8, 0);
    cameraRef.current = camera;

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 2;
    controls.maxDistance = 16;
    controls.target.set(0, 0.8, 0);
    controlsRef.current = controls;

    // Room
    const floorTex = createFloorTexture();
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.6, metalness: 0 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData.isFloor = true;
    scene.add(floor);

    const wallTex = createWallTexture();
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9, metalness: 0 });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_H), wallMat);
    backWall.position.set(0, ROOM_H / 2, -ROOM_D / 2);
    backWall.receiveShadow = true; backWall.userData.isWall = true; scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D, ROOM_H), wallMat);
    leftWall.position.set(-ROOM_W / 2, ROOM_H / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true; leftWall.userData.isWall = true; scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D, ROOM_H), wallMat.clone());
    (rightWall.material as THREE.MeshStandardMaterial).map = wallTex.clone();
    rightWall.position.set(ROOM_W / 2, ROOM_H / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true; rightWall.userData.isWall = true; scene.add(rightWall);

    // Baseboards
    const baseMat = makeMat("#d4cdc4", "matte");
    const bGeo = 0.08;
    const bb = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W, bGeo, 0.015), baseMat);
    bb.position.set(0, bGeo / 2, -ROOM_D / 2 + 0.007); scene.add(bb);
    const bl = new THREE.Mesh(new THREE.BoxGeometry(0.015, bGeo, ROOM_D), baseMat);
    bl.position.set(-ROOM_W / 2 + 0.007, bGeo / 2, 0); scene.add(bl);
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.015, bGeo, ROOM_D), baseMat);
    br.position.set(ROOM_W / 2 - 0.007, bGeo / 2, 0); scene.add(br);

    // Window
    const windowGroup = new THREE.Group();
    const winW = 2.0, winH = 1.5;
    const winPane = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshBasicMaterial({ color: "#f8f4ee", transparent: true, opacity: 0.95 }));
    windowGroup.add(winPane);
    const frameMatW = makeMat("#e8e0d6", "matte");
    const ft = 0.04;
    [[-winW/2, 0, 0.01, ft, winH + ft], [winW/2, 0, 0.01, ft, winH + ft],
     [0, winH/2, 0.01, winW + ft * 2, ft], [0, -winH/2, 0.01, winW + ft * 2, ft],
     [0, 0, 0.01, ft * 0.6, winH]].forEach(([x, y, z, w, h]) => {
      const f = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.01, w), Math.max(0.01, h), 0.03), frameMatW);
      f.position.set(x, y, z); windowGroup.add(f);
    });
    windowGroup.position.set(-ROOM_W / 2 + 0.02, 1.9, -0.5);
    windowGroup.rotation.y = Math.PI / 2;
    scene.add(windowGroup);

    // Ceiling light
    const ceilLight = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 24), makeMat("#e8e0d6", "matte"));
    ceilLight.position.set(0, ROOM_H - 0.01, 0);
    ceilLight.rotation.x = Math.PI;
    scene.add(ceilLight);

    // Lighting
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.5));
    scene.add(new THREE.HemisphereLight(0xfff5e6, 0xc4a882, 0.4));
    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.0);
    dirLight.position.set(-3, 6, 2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6;
    dirLight.shadow.camera.bottom = -6;
    dirLight.shadow.bias = -0.001;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    const ceilPt = new THREE.PointLight(0xffe8cc, 0.4, 10);
    ceilPt.position.set(0, ROOM_H - 0.1, 0);
    ceilPt.castShadow = true;
    ceilPt.shadow.mapSize.width = 1024;
    ceilPt.shadow.mapSize.height = 1024;
    scene.add(ceilPt);

    scene.add(new THREE.DirectionalLight(0xe8f0ff, 0.2).translateX(4).translateY(3).translateZ(4));

    // Default furniture
    const defaults = [
      { type: "rug", pos: [0, 0, 0.3] as [number, number, number] },
      { type: "sofa-3", pos: [0, 0, 1.2] as [number, number, number], color: "#6b8f71" },
      { type: "coffee-table", pos: [0, 0, 0.1] as [number, number, number] },
      { type: "floor-lamp", pos: [-3.2, 0, 1.5] as [number, number, number], color: "#1a1a1a" },
      { type: "side-table", pos: [2.8, 0, 1.5] as [number, number, number] },
      { type: "plant", pos: [3.3, 0, -2.3] as [number, number, number] },
      { type: "bookshelf", pos: [-3.3, 0, -1.5] as [number, number, number] },
      { type: "wall-art", pos: [1.5, 1.8, -2.95] as [number, number, number], color: "#c4713b" },
    ];
    defaults.forEach(item => {
      const f = createFurniture(item.type, { color: item.color });
      if (!f) return;
      f.position.set(...item.pos);
      scene.add(f);
      furnitureRef.current.push(f);
    });
    setFurnitureCount(furnitureRef.current.length);

    // Interaction helpers
    function getMousePos(e: MouseEvent | PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      getMousePos(e);
      pointerDownPosRef.current.set(e.clientX, e.clientY);
      pointerDragStartRef.current = false;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);
      let hitFurniture: THREE.Group | null = null;
      for (const hit of intersects) {
        const f = getFurnitureFromIntersect(hit.object);
        if (f) { hitFurniture = f; break; }
      }

      if (hitFurniture) {
        selectFurniture(hitFurniture);
        if (modeRef.current === "translate") {
          isDraggingRef.current = true;
          controls.enabled = false;
          const intersectPt = new THREE.Vector3();
          raycasterRef.current.ray.intersectPlane(floorPlaneRef.current, intersectPt);
          if (intersectPt) {
            dragOffsetRef.current.copy(hitFurniture.position).sub(intersectPt);
            dragOffsetRef.current.y = 0;
          }
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      getMousePos(e);

      if (isDraggingRef.current && selectedRef.current) {
        const dx = e.clientX - pointerDownPosRef.current.x;
        const dy = e.clientY - pointerDownPosRef.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) pointerDragStartRef.current = true;

        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersectPt = new THREE.Vector3();
        raycasterRef.current.ray.intersectPlane(floorPlaneRef.current, intersectPt);
        if (intersectPt) {
          const margin = 0.2;
          selectedRef.current.position.x = Math.max(-ROOM_W/2 + margin, Math.min(ROOM_W/2 - margin, intersectPt.x + dragOffsetRef.current.x));
          selectedRef.current.position.z = Math.max(-ROOM_D/2 + margin, Math.min(ROOM_D/2 - margin, intersectPt.z + dragOffsetRef.current.z));
          updateSelectionBox();
          updatePropertiesPanel();
        }
        return;
      }

      // Hover
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);
      let hitFurniture: THREE.Group | null = null;
      for (const hit of intersects) {
        const f = getFurnitureFromIntersect(hit.object);
        if (f) { hitFurniture = f; break; }
      }

      if (hitFurniture !== hoveredRef.current) {
        if (hoveredRef.current && hoveredRef.current !== selectedRef.current) {
          hoveredRef.current.traverse(c => {
            if ((c as THREE.Mesh).isMesh && c.userData.isColorable) {
              ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).emissive?.set(0x000000);
            }
          });
        }
        hoveredRef.current = hitFurniture;
        if (hoveredRef.current && hoveredRef.current !== selectedRef.current) {
          hoveredRef.current.traverse(c => {
            if ((c as THREE.Mesh).isMesh && c.userData.isColorable) {
              ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).emissive?.set(0x1a1a1a);
            }
          });
        }
        if (canvas) canvas.style.cursor = hitFurniture ? "pointer" : "default";
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        controls.enabled = true;
      }
      if (!pointerDragStartRef.current && e.button === 0) {
        getMousePos(e);
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(scene.children, true);
        let hitFurniture: THREE.Group | null = null;
        for (const hit of intersects) {
          const f = getFurnitureFromIntersect(hit.object);
          if (f) { hitFurniture = f; break; }
        }
        if (!hitFurniture) deselectFurniture();
      }
      pointerDragStartRef.current = false;
    }

    function onKeyDown(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      switch (e.key) {
        case "Delete": case "Backspace": deleteSelected(); break;
        case "Escape": deselectFurniture(); break;
        case "w": case "W": setMode("translate"); break;
        case "e": case "E": setMode("rotate"); break;
        case "d": case "D":
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); duplicateSelected(); }
          break;
      }
      if (modeRef.current === "rotate" && selectedRef.current) {
        const step = e.shiftKey ? 15 : 5;
        if (e.key === "ArrowLeft") {
          selectedRef.current.rotation.y -= THREE.MathUtils.degToRad(step);
          updateSelectionBox(); updatePropertiesPanel();
        } else if (e.key === "ArrowRight") {
          selectedRef.current.rotation.y += THREE.MathUtils.degToRad(step);
          updateSelectionBox(); updatePropertiesPanel();
        }
      }
    }

    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);

    // Animation loop
    let raf: number;
    function animate() {
      raf = requestAnimationFrame(animate);
      controls.update();
      if (selectionBoxRef.current && selectedRef.current) selectionBoxRef.current.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      controls.dispose();
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep mode ref in sync
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // ========== Render ==========
  const selPalette = selectedData ? (colorPalettes[selectedData.palette] || colorPalettes.decor) : [];
  const selMaterials = selectedData
    ? (selectedData.palette === "sofa" ? ["fabric", "leather"] : selectedData.palette === "wood" ? ["wood"] : selectedData.palette === "metal" ? ["metal"] : ["matte"])
    : [];

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="h-12 shrink-0 border-b border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-4">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold tracking-wider text-slate-800 dark:text-white">MØDE<span className="text-amber-600">.</span></span>
          <span className="text-[10px] text-slate-400 tracking-widest">STUDIO</span>
        </div>

        <div className="flex items-center gap-1">
          {[
            { m: "translate" as const, icon: Move, tip: "移动 (W)" },
            { m: "rotate" as const, icon: RotateCw, tip: "旋转 (E)" },
          ].map(btn => (
            <button key={btn.m} title={btn.tip} onClick={() => setMode(btn.m)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${mode === btn.m ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"}`}>
              <btn.icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1" />
          <button title="删除 (Del)" onClick={deleteSelected} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button title="复制" onClick={duplicateSelected} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1" />
          <button title="重置视角" onClick={resetView} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button title="截图" onClick={takeScreenshot} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
          8m × 6m · 客厅
        </span>
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: furniture catalog */}
        <div className="hidden md:flex flex-col w-52 shrink-0 border-r border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-slate-900/60 overflow-y-auto">
          <div className="p-4 pb-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">家具库</span>
          </div>
          {categories.map((cat, ci) => {
            const Icon = (catIcons[cat.icon] || Armchair) as React.ComponentType<{ className?: string }>;
            const isOpen = openCats[ci] ?? cat.open;
            return (
              <div key={cat.name}>
                <button onClick={() => setOpenCats(prev => ({ ...prev, [ci]: !isOpen }))}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  {cat.name}
                  <ChevronDown className={`w-3 h-3 ml-auto text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-60" : "max-h-0"}`}>
                  {cat.items.map(item => (
                    <button key={item.type} onClick={() => addFurniture(item.type)}
                      className="flex items-center gap-2 w-full pl-[52px] pr-4 py-2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3D Viewport */}
        <div ref={containerRef} className="flex-1 relative bg-[#e8e2da]">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full pointer-events-none whitespace-nowrap">
            点击选择 · 拖拽移动 · 右键旋转视角 · 左侧面板添加家具
          </div>
        </div>

        {/* Right panel: properties */}
        <div className="hidden md:flex flex-col w-60 shrink-0 border-l border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-slate-900/60 overflow-y-auto">
          {selectedData ? (
            <>
              {/* Name */}
              <div className="p-4 border-b border-slate-200/60 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{selectedData.name}</span>
                  <span className="text-[9px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{selectedData.type.toUpperCase()}</span>
                </div>
              </div>

              {/* Position */}
              <div className="p-4 border-b border-slate-200/60 dark:border-white/5 space-y-3">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">位置</span>
                <PropSlider label="X" value={selectedData.posX} min={-3.8} max={3.8} step={0.05} unit="m"
                  onChange={v => setPosX(parseFloat(v))} />
                <PropSlider label="Z" value={selectedData.posZ} min={-2.8} max={2.8} step={0.05} unit="m"
                  onChange={v => setPosZ(parseFloat(v))} />
              </div>

              {/* Rotation */}
              <div className="p-4 border-b border-slate-200/60 dark:border-white/5 space-y-3">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">旋转</span>
                <PropSlider label="Y" value={selectedData.rotY} min={-180} max={180} step={1} unit="°"
                  onChange={v => setRotY(parseFloat(v))} />
              </div>

              {/* Scale */}
              <div className="p-4 border-b border-slate-200/60 dark:border-white/5 space-y-3">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">缩放</span>
                <PropSlider label="比例" value={selectedData.scale} min={0.5} max={2.0} step={0.05} unit="x"
                  onChange={v => setScale(parseFloat(v))} />
              </div>

              {/* Material */}
              {selMaterials.length > 1 && (
                <div className="p-4 border-b border-slate-200/60 dark:border-white/5 space-y-3">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">材质</span>
                  <div className="flex gap-1.5">
                    {selMaterials.map(m => (
                      <button key={m} onClick={() => setMaterial(m)}
                        className={`flex-1 py-1.5 text-[11px] font-medium rounded-md border transition-all ${
                          selectedData.materialType === m
                            ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200"
                            : "border-slate-200 dark:border-white/10 text-slate-400 hover:border-slate-400"
                        }`}>
                        {m === "fabric" ? "布料" : m === "leather" ? "皮革" : m === "wood" ? "木材" : m === "metal" ? "金属" : "哑光"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              <div className="p-4 space-y-3">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">颜色</span>
                <div className="flex flex-wrap gap-2">
                  {selPalette.map(c => (
                    <button key={c.hex} title={c.name} onClick={() => setColor(c.hex)}
                      className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${selectedData.color === c.hex ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" : ""}`}
                      style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Move className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">点击场景中的家具<br />查看和编辑属性</p>
              </div>
              <div className="p-4 border-t border-slate-200/60 dark:border-white/5 space-y-3">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">场景信息</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">空间</span><span className="text-slate-600 dark:text-slate-300">客厅 · 8m × 6m</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">层高</span><span className="text-slate-600 dark:text-slate-300">3.2m</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">家具数</span><span className="text-slate-600 dark:text-slate-300">{furnitureCount} 件</span></div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200/60 dark:border-white/5 space-y-3">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">快捷键</span>
                <div className="space-y-2 text-xs">
                  {[["W", "移动模式"], ["E", "旋转模式"], ["Del", "删除选中"], ["Esc", "取消选择"]].map(([k, v]) => (
                    <div key={k} className="flex justify-between"><span className="text-slate-400 font-mono">{k}</span><span className="text-slate-600 dark:text-slate-300">{v}</span></div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
          className={`fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg text-xs font-medium text-white shadow-lg ${
            toast.type === "success" ? "bg-emerald-600" : toast.type === "warning" ? "bg-amber-600" : toast.type === "error" ? "bg-red-600" : "bg-slate-800 dark:bg-slate-700"
          }`}>
          {toast.msg}
        </motion.div>
      )}
    </motion.div>
  );
}

// ========== Property Slider Component ==========
function PropSlider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: string; min: number; max: number; step: number; unit: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-400 w-8">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-600" />
      <span className="text-[11px] font-mono text-slate-500 w-12 text-right">{value}{unit}</span>
    </div>
  );
}

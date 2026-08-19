"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

const CELL = 10;
const PATTERNS: Record<string, [number, number][]> = {
  "滑翔机": [[0,1],[1,2],[2,0],[2,1],[2,2]],
  "脉冲星": [
    [2,4],[2,5],[2,6],[4,2],[5,2],[6,2],[4,7],[5,7],[6,7],
    [2,10],[2,11],[2,12],[7,4],[7,5],[7,6],[10,2],[11,2],[12,2],
    [10,7],[11,7],[12,7],[10,10],[10,11],[10,12],[7,10],[7,11],[7,12],
    [12,4],[12,5],[12,6],[4,12],[5,12],[6,12],
  ],
  "轻量级飞船": [[0,0],[0,3],[1,4],[2,0],[2,4],[3,1],[3,2],[3,3],[3,4]],
  "信标": [[0,0],[0,1],[1,0],[2,3],[3,2],[3,3]],
  "闪烁器": [[1,0],[1,1],[1,2]],
  "太空船": [[0,1],[0,4],[1,0],[2,0],[2,4],[3,0],[3,1],[3,2],[3,3]],
};

export default function LifePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(8);
  const [gen, setGen] = useState(0);
  const [alive, setAlive] = useState(0);
  const gridRef = useRef<boolean[][]>([]);
  const runningRef = useRef(false);
  const speedRef = useRef(8);
  const genRef = useRef(0);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  function countAlive(grid?: boolean[][]) {
    const g = grid ?? gridRef.current;
    let n = 0;
    for (const col of g) for (const cell of col) if (cell) n++;
    return n;
  }

  const step = useCallback(() => {
    const grid = gridRef.current;
    const c = grid.length;
    if (!c) return;
    const r = grid[0].length;
    const next: boolean[][] = Array.from({ length: c }, () => Array(r).fill(false));
    for (let x = 0; x < c; x++) {
      for (let y = 0; y < r; y++) {
        let neighbors = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            if (grid[(x + dx + c) % c][(y + dy + r) % r]) neighbors++;
          }
        }
        next[x][y] = grid[x][y] ? (neighbors === 2 || neighbors === 3) : neighbors === 3;
      }
    }
    gridRef.current = next;
    genRef.current++;
    setGen(genRef.current);
    setAlive(countAlive(next));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let lastStep = 0;
    let isDragging = false;
    let paintValue = true;

    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      canvas!.width = w * devicePixelRatio;
      canvas!.height = h * devicePixelRatio;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      const c = Math.floor(w / CELL);
      const r = Math.floor(h / CELL);
      const old = gridRef.current;
      if (!old.length || (c === old.length && r === old[0].length)) {
        if (!old.length) gridRef.current = Array.from({ length: c }, () => Array(r).fill(false));
        return;
      }
      const newGrid: boolean[][] = Array.from({ length: c }, () => Array(r).fill(false));
      for (let x = 0; x < Math.min(c, old.length); x++) {
        for (let y = 0; y < Math.min(r, old[0].length); y++) {
          newGrid[x][y] = old[x][y];
        }
      }
      gridRef.current = newGrid;
    }
    resize();
    window.addEventListener("resize", resize);

    function drawGrid() {
      const w = canvas!.clientWidth, h = canvas!.clientHeight;
      const grid = gridRef.current;
      const c = grid.length;
      if (!c) return;
      const r = grid[0].length;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= c; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, r * CELL); ctx.stroke(); }
      for (let y = 0; y <= r; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(c * CELL, y * CELL); ctx.stroke(); }

      ctx.fillStyle = "#38bdf8";
      for (let x = 0; x < c; x++) {
        for (let y = 0; y < r; y++) {
          if (grid[x][y]) ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    }

    function loop(ts: number) {
      if (runningRef.current) {
        const interval = 1000 / speedRef.current;
        if (ts - lastStep > interval) { step(); lastStep = ts; }
      }
      drawGrid();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    function getCell(e: MouseEvent | Touch) {
      const rect = canvas!.getBoundingClientRect();
      return { x: Math.floor((e.clientX - rect.left) / CELL), y: Math.floor((e.clientY - rect.top) / CELL) };
    }

    function onMouseDown(e: MouseEvent) {
      const { x, y } = getCell(e);
      const grid = gridRef.current;
      if (x >= 0 && x < grid.length && y >= 0 && y < grid[0].length) {
        isDragging = true;
        paintValue = !grid[x][y];
        grid[x][y] = paintValue;
        setAlive(countAlive());
      }
    }
    function onMouseMove(e: MouseEvent) {
      if (!isDragging) return;
      const { x, y } = getCell(e);
      const grid = gridRef.current;
      if (x >= 0 && x < grid.length && y >= 0 && y < grid[0].length) {
        grid[x][y] = paintValue;
        setAlive(countAlive());
      }
    }
    function onMouseUp() { isDragging = false; }

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseUp);
      window.removeEventListener("resize", resize);
    };
  }, [step]);

  function placePattern(name: string) {
    const pattern = PATTERNS[name];
    if (!pattern) return;
    const grid = gridRef.current;
    const c = grid.length, r = grid[0]?.length ?? 0;
    const cx = Math.floor(c / 2), cy = Math.floor(r / 2);
    for (const [dx, dy] of pattern) {
      const x = cx + dx, y = cy + dy;
      if (x >= 0 && x < c && y >= 0 && y < r) grid[x][y] = true;
    }
    setAlive(countAlive());
  }

  function clearGrid() {
    const grid = gridRef.current;
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[0].length; y++) grid[x][y] = false;
    }
    genRef.current = 0;
    setGen(0);
    setAlive(0);
  }

  function randomFill() {
    const grid = gridRef.current;
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[0].length; y++) grid[x][y] = Math.random() > 0.7;
    }
    genRef.current = 0;
    setGen(0);
    setAlive(countAlive());
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">生命游戏</h1>
          <p className="text-xs text-slate-400">Conway&apos;s Game of Life — 点击放置细胞，观察演化</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>第 <b className="text-sky-500">{gen}</b> 代</span>
            <span>存活 <b className="text-emerald-500">{alive}</b> 个</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">速度</label>
            <input type="range" min="1" max="30" step="1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-20 accent-sky-500" />
          </div>
          <select
            onChange={(e) => { if (e.target.value) placePattern(e.target.value); e.target.value = ""; }}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-0 outline-none cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>预设图案</option>
            {Object.keys(PATTERNS).map((name) => (<option key={name} value={name}>{name}</option>))}
          </select>
          <button onClick={() => setRunning(!running)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${running ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-sky-500 text-white hover:bg-sky-600"}`}>
            {running ? "暂停" : "开始"}
          </button>
          <button onClick={() => { if (!running) step(); }} disabled={running} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-40">
            单步
          </button>
          <button onClick={randomFill} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">
            随机
          </button>
          <button onClick={clearGrid} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">
            清空
          </button>
        </div>
      </div>
      <div className="bg-black rounded-xl overflow-hidden border border-white/5 cursor-crosshair" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>
    </motion.div>
  );
}

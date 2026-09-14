"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

const CELL = 4;
const EMPTY = 0;
const SAND = 1;
const STONE = 2;
const WATER = 3;

const COLORS: Record<number, string[]> = {
  [SAND]: ["#f4c542", "#e8b730", "#d4a522", "#c8961a"],
  [STONE]: ["#6b7280", "#5a6270", "#4b5563", "#3f4753"],
  [WATER]: ["#38bdf8", "#22a7e0", "#0ea0d0", "#0090c0"],
};

export default function SandPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brush, setBrush] = useState<number>(SAND);
  const [brushSize, setBrushSize] = useState(4);
  const [running, setRunning] = useState(true);
  const gridRef = useRef<{ type: number; color: string }[][]>([]);
  const colsRef = useRef(0);
  const rowsRef = useRef(0);
  const mouseRef = useRef({ x: -1, y: -1, down: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    function initGrid() {
      const cols = Math.floor(canvas!.clientWidth / CELL);
      const rows = Math.floor(canvas!.clientHeight / CELL);
      colsRef.current = cols;
      rowsRef.current = rows;
      gridRef.current = Array.from({ length: cols }, () =>
        Array.from({ length: rows }, () => ({ type: EMPTY, color: "" }))
      );
    }

    function resize() {
      canvas!.width = canvas!.clientWidth * devicePixelRatio;
      canvas!.height = canvas!.clientHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      initGrid();
    }
    resize();
    window.addEventListener("resize", resize);

    function getCellColor(type: number): string {
      const colors = COLORS[type];
      return colors ? colors[Math.floor(Math.random() * colors.length)] : "";
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current.x = Math.floor((e.clientX - rect.left) / CELL);
      mouseRef.current.y = Math.floor((e.clientY - rect.top) / CELL);
    }
    function onMouseDown(e: MouseEvent) { mouseRef.current.down = true; onMouseMove(e); }
    function onMouseUp() { mouseRef.current.down = false; }
    function onTouchMove(e: TouchEvent) { e.preventDefault(); onMouseMove(e.touches[0] as unknown as MouseEvent); }
    function onTouchStart(e: TouchEvent) { mouseRef.current.down = true; onMouseMove(e.touches[0] as unknown as MouseEvent); }
    function onTouchEnd() { mouseRef.current.down = false; }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchend", onTouchEnd);

    function paint() {
      const { x, y, down } = mouseRef.current;
      if (!down || x < 0) return;
      const grid = gridRef.current;
      const cols = colsRef.current;
      const rows = rowsRef.current;
      const half = Math.floor(brushSize / 2);
      for (let dx = -half; dx <= half; dx++) {
        for (let dy = -half; dy <= half; dy++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            if (brush === EMPTY) {
              grid[nx][ny] = { type: EMPTY, color: "" };
            } else if (Math.random() > 0.2) {
              grid[nx][ny] = { type: brush, color: getCellColor(brush) };
            }
          }
        }
      }
    }

    function simulate() {
      const grid = gridRef.current;
      const cols = colsRef.current;
      const rows = rowsRef.current;
      // track which cells already moved this frame
      const moved = new Set<string>();

      for (let y = rows - 2; y >= 0; y--) {
        // randomize x iteration direction for more natural flow
        const startX = Math.random() > 0.5 ? 0 : cols - 1;
        const endX = startX === 0 ? cols : -1;
        const stepX = startX === 0 ? 1 : -1;

        for (let x = startX; x !== endX; x += stepX) {
          const key = `${x},${y}`;
          if (moved.has(key)) continue;
          const cell = grid[x][y];
          if (cell.type === EMPTY || cell.type === STONE) continue;

          if (cell.type === SAND) {
            // fall down
            if (y + 1 < rows && grid[x][y + 1].type === EMPTY) {
              grid[x][y + 1] = cell;
              grid[x][y] = { type: EMPTY, color: "" };
              moved.add(`${x},${y + 1}`);
            }
            // slide diagonally
            else if (y + 1 < rows) {
              const dir = Math.random() > 0.5 ? 1 : -1;
              if (x + dir >= 0 && x + dir < cols && grid[x + dir][y + 1].type === EMPTY) {
                grid[x + dir][y + 1] = cell;
                grid[x][y] = { type: EMPTY, color: "" };
                moved.add(`${x + dir},${y + 1}`);
              } else if (x - dir >= 0 && x - dir < cols && grid[x - dir][y + 1].type === EMPTY) {
                grid[x - dir][y + 1] = cell;
                grid[x][y] = { type: EMPTY, color: "" };
                moved.add(`${x - dir},${y + 1}`);
              }
            }
            // sand sinks in water
            else if (y + 1 < rows && grid[x][y + 1].type === WATER) {
              grid[x][y] = grid[x][y + 1];
              grid[x][y + 1] = cell;
              moved.add(`${x},${y + 1}`);
            }
          }

          if (cell.type === WATER) {
            // fall down
            if (y + 1 < rows && grid[x][y + 1].type === EMPTY) {
              grid[x][y + 1] = cell;
              grid[x][y] = { type: EMPTY, color: "" };
              moved.add(`${x},${y + 1}`);
            }
            // flow sideways
            else {
              const dir = Math.random() > 0.5 ? 1 : -1;
              if (x + dir >= 0 && x + dir < cols && grid[x + dir][y].type === EMPTY) {
                grid[x + dir][y] = cell;
                grid[x][y] = { type: EMPTY, color: "" };
                moved.add(`${x + dir},${y}`);
              } else if (x - dir >= 0 && x - dir < cols && grid[x - dir][y].type === EMPTY) {
                grid[x - dir][y] = cell;
                grid[x][y] = { type: EMPTY, color: "" };
                moved.add(`${x - dir},${y}`);
              }
              // diagonal down
              else if (y + 1 < rows && x + dir >= 0 && x + dir < cols && grid[x + dir][y + 1].type === EMPTY) {
                grid[x + dir][y + 1] = cell;
                grid[x][y] = { type: EMPTY, color: "" };
                moved.add(`${x + dir},${y + 1}`);
              }
            }
          }
        }
      }
    }

    function draw() {
      if (running) {
        paint();
        simulate();
      }

      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      const grid = gridRef.current;
      const cols = colsRef.current;
      const rows = rowsRef.current;

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const cell = grid[x][y];
          if (cell.type !== EMPTY) {
            ctx.fillStyle = cell.color;
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
          }
        }
      }

      // brush preview
      if (mouseRef.current.x >= 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        const bx = mouseRef.current.x * CELL - (brushSize * CELL) / 2 + CELL / 2;
        const by = mouseRef.current.y * CELL - (brushSize * CELL) / 2 + CELL / 2;
        ctx.strokeRect(bx, by, brushSize * CELL, brushSize * CELL);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseUp);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", resize);
    };
  }, [brush, brushSize, running]);

  function clearGrid() {
    const grid = gridRef.current;
    for (let x = 0; x < colsRef.current; x++) {
      for (let y = 0; y < rowsRef.current; y++) {
        grid[x][y] = { type: EMPTY, color: "" };
      }
    }
  }

  const tools = [
    { type: SAND, label: "沙子", color: "#f4c542" },
    { type: WATER, label: "水", color: "#38bdf8" },
    { type: STONE, label: "石头", color: "#6b7280" },
    { type: EMPTY, label: "橡皮", color: "#1e1e1e" },
  ];

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">重力沙子</h1>
          <p className="text-xs text-slate-400">拖拽鼠标放置沙子、水和石头</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {tools.map((t) => (
            <button
              key={t.type}
              onClick={() => setBrush(t.type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                brush === t.type
                  ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/30"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.color }} />
              {t.label}
            </button>
          ))}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">大小</label>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-16 accent-sky-500"
            />
          </div>
          <button
            onClick={() => setRunning(!running)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              running
                ? "bg-sky-500 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {running ? "暂停" : "继续"}
          </button>
          <button
            onClick={clearGrid}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          >
            清空
          </button>
        </div>
      </div>
      <div className="bg-black rounded-xl overflow-hidden border border-white/5 cursor-crosshair" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </motion.div>
  );
}

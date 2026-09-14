"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

const COLORS = [
  "#38bdf8", "#818cf8", "#c084fc", "#f472b6",
  "#fb923c", "#facc15", "#34d399", "#22d3ee",
];

export default function KaleidoscopePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [segments, setSegments] = useState(8);
  const [hue, setHue] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let mouse = { x: 0, y: 0, px: 0, py: 0, down: false };
    let autoAngle = 0;

    function resize() {
      canvas!.width = canvas!.clientWidth * devicePixelRatio;
      canvas!.height = canvas!.clientHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, canvas!.clientWidth, canvas!.clientHeight);
    }
    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onMouseDown(e: MouseEvent) { mouse.down = true; onMouseMove(e); }
    function onMouseUp() { mouse.down = false; }
    function onTouchMove(e: TouchEvent) { e.preventDefault(); onMouseMove(e.touches[0] as unknown as MouseEvent); }
    function onTouchStart(e: TouchEvent) { mouse.down = true; onMouseMove(e.touches[0] as unknown as MouseEvent); }
    function onTouchEnd() { mouse.down = false; }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchend", onTouchEnd);

    function draw() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      const cx = w / 2;
      const cy = h / 2;

      // slight fade for trail effect
      ctx.fillStyle = "rgba(0,0,0,0.02)";
      ctx.fillRect(0, 0, w, h);

      const angleStep = (Math.PI * 2) / segments;

      if (autoPlay) {
        autoAngle += 0.02;
        const radius = Math.min(w, h) * 0.25;
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.x = cx + Math.cos(autoAngle) * radius * Math.sin(autoAngle * 0.7);
        mouse.y = cy + Math.sin(autoAngle) * radius * Math.cos(autoAngle * 1.3);
        mouse.down = true;
      }

      if (mouse.down) {
        const currentHue = (hue + autoAngle * 20) % 360;
        const color = `hsl(${currentHue}, 90%, 65%)`;
        const glowColor = `hsl(${currentHue}, 90%, 80%)`;

        for (let i = 0; i < segments; i++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angleStep * i);

          // draw line
          const lx = mouse.x - cx;
          const ly = mouse.y - cy;
          const plx = mouse.px - cx;
          const ply = mouse.py - cy;

          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 8;
          ctx.lineCap = "round";

          ctx.beginPath();
          ctx.moveTo(plx, ply);
          ctx.lineTo(lx, ly);
          ctx.stroke();

          // mirror
          ctx.scale(1, -1);
          ctx.beginPath();
          ctx.moveTo(plx, ply);
          ctx.lineTo(lx, ly);
          ctx.stroke();

          ctx.restore();
        }
      }

      // center dot
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

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
  }, [segments, hue, autoPlay]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">万花筒</h1>
          <p className="text-xs text-slate-400">拖拽鼠标绘制对称图案</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">分段</label>
            <input
              type="range"
              min="4"
              max="24"
              step="2"
              value={segments}
              onChange={(e) => setSegments(Number(e.target.value))}
              className="w-20 accent-sky-500"
            />
            <span className="text-xs text-slate-500 w-4">{segments}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">色调</label>
            <input
              type="color"
              value={`hsl(${hue}, 90%, 65%)`.replace(/hsl\((\d+),.*/, (_, h) => {
                const s = Math.round(h);
                return `#${((1 << 24) + Math.round(((s / 360) * 360) % 360) * 0).toString(16).slice(1)}`;
              })}
              onChange={(e) => {
                const hex = e.target.value;
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                const max = Math.max(r, g, b), min = Math.min(r, g, b);
                let h = 0;
                if (max !== min) {
                  const d = max - min;
                  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
                  else if (max === g) h = ((b - r) / d + 2) * 60;
                  else h = ((r - g) / d + 4) * 60;
                }
                setHue(Math.round(h));
              }}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              autoPlay
                ? "bg-sky-500 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            {autoPlay ? "停止自动" : "自动绘制"}
          </button>
          <button
            onClick={clearCanvas}
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

"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

const planets = [
  { name: "水星", dist: 60, r: 4, speed: 4.1, color: "#b0b0b0" },
  { name: "金星", dist: 90, r: 6, speed: 1.6, color: "#e8cda0" },
  { name: "地球", dist: 120, r: 7, speed: 1, color: "#4da6ff" },
  { name: "火星", dist: 155, r: 5, speed: 0.53, color: "#e55b3c" },
  { name: "木星", dist: 200, r: 14, speed: 0.084, color: "#e0ae6f" },
  { name: "土星", dist: 250, r: 12, speed: 0.034, color: "#d4b96e", ring: true },
  { name: "天王星", dist: 300, r: 9, speed: 0.012, color: "#7de0e6" },
  { name: "海王星", dist: 340, r: 8, speed: 0.006, color: "#4b70dd" },
];

export default function SolarPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let t = 0;

    function resize() {
      canvas!.width = canvas!.clientWidth * devicePixelRatio;
      canvas!.height = canvas!.clientHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) / 800;

      ctx.clearRect(0, 0, w, h);

      // stars
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      for (let i = 0; i < 120; i++) {
        const sx = (Math.sin(i * 127.1 + 311.7) * 0.5 + 0.5) * w;
        const sy = (Math.sin(i * 269.5 + 183.3) * 0.5 + 0.5) * h;
        const sr = (Math.sin(i * 43.7 + t * 0.001) * 0.5 + 0.5) * 1.5 + 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // sun glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40 * scale);
      glow.addColorStop(0, "rgba(255,200,50,0.8)");
      glow.addColorStop(0.5, "rgba(255,150,0,0.2)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 40 * scale, 0, Math.PI * 2);
      ctx.fill();

      // sun
      ctx.fillStyle = "#ffd000";
      ctx.beginPath();
      ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
      ctx.fill();

      // planets
      planets.forEach((p) => {
        const angle = t * p.speed * 0.0005;
        const px = cx + Math.cos(angle) * p.dist * scale;
        const py = cy + Math.sin(angle) * p.dist * scale;

        // orbit
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, p.dist * scale, 0, Math.PI * 2);
        ctx.stroke();

        // ring for saturn
        if (p.ring) {
          ctx.strokeStyle = "rgba(212,185,110,0.4)";
          ctx.lineWidth = 3 * scale;
          ctx.beginPath();
          ctx.ellipse(px, py, p.r * 1.8 * scale, p.r * 0.5 * scale, 0.3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // planet
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.r * scale, 0, Math.PI * 2);
        ctx.fill();

        // label
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `${10 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(p.name, px, py + p.r * scale + 14 * scale);
      });

      t += 16;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">太阳系</h1>
        <p className="text-xs text-slate-400">八大行星环绕动画</p>
      </div>
      <div className="bg-black rounded-xl overflow-hidden border border-white/5" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <div className="flex flex-wrap gap-2">
        {planets.map((p) => (
          <span key={p.name} className="px-3 py-1.5 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-200/50 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

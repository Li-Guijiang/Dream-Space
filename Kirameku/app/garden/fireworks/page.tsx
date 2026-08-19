"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

export default function FireworksPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let particles: Particle[] = [];

    function resize() {
      canvas!.width = canvas!.clientWidth * devicePixelRatio;
      canvas!.height = canvas!.clientHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function explode(x: number, y: number) {
      const count = 80 + Math.random() * 60;
      const hue = Math.random() * 360;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
        const speed = 2 + Math.random() * 5;
        const ml = 60 + Math.random() * 40;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: ml,
          maxLife: ml,
          color: `hsl(${hue + Math.random() * 40 - 20}, 100%, ${50 + Math.random() * 30}%)`,
          size: 1.5 + Math.random() * 2,
        });
      }
    }

    function draw() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.life--;

        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) particles.splice(i, 1);
      });
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    function onClick(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      explode(e.clientX - rect.left, e.clientY - rect.top);
    }
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">烟花</h1>
        <p className="text-xs text-slate-400">点击任意位置放烟花</p>
      </div>
      <div className="bg-black rounded-xl overflow-hidden border border-white/5 cursor-crosshair" style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </motion.div>
  );
}

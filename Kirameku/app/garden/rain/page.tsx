"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:',.<>?/~`アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

export default function RainPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#00ff41");
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let columns: number[] = [];
    const fontSize = 14;

    function resize() {
      canvas!.width = canvas!.clientWidth * devicePixelRatio;
      canvas!.height = canvas!.clientHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      const colCount = Math.floor(canvas!.clientWidth / fontSize);
      columns = Array.from({ length: colCount }, () => Math.floor(Math.random() * canvas!.clientHeight / fontSize));
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;

      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = columns[i] * fontSize;

        // head bright
        ctx.fillStyle = "#fff";
        ctx.fillText(char, x, y);

        // trail
        ctx.fillStyle = color;
        ctx.fillText(char, x, y - fontSize);

        if (y > h && Math.random() > 0.975) {
          columns[i] = 0;
        }
        columns[i] += speed;
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [color, speed]);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">代码雨</h1>
          <p className="text-xs text-slate-400">Matrix 风格代码瀑布流</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">颜色</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">速度</label>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-20 accent-sky-500"
            />
          </div>
        </div>
      </div>
      <div className="bg-black rounded-xl overflow-hidden border border-white/5" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </motion.div>
  );
}

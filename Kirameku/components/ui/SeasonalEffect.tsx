"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useEffects } from "@/components/providers/EffectProvider";

function getSeason(): { name: string; label: string } {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return { name: "spring", label: "春" };
  if (m >= 5 && m <= 7) return { name: "summer", label: "夏" };
  if (m >= 8 && m <= 10) return { name: "autumn", label: "秋" };
  return { name: "winter", label: "冬" };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  sway: number;
  swaySpeed: number;
  phase: number;
  type: "petal" | "firefly" | "leaf" | "snow";
  color: string;
}

export default function SeasonalEffect() {
  const pathname = usePathname();
  const { seasonalEffect } = useEffects();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animFrame = useRef<number>(0);
  const season = useRef(getSeason());
  const disabled = pathname?.startsWith("/garden/") || !seasonalEffect;

  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const s = season.current.name;
    const isMobile = window.innerWidth < 768;
    const maxParticles = isMobile ? 20 : 40;

    // Pre-fill particles
    particles.current = [];
    for (let i = 0; i < maxParticles; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const speed = 0.3 + Math.random() * 0.6;
      let p: Particle;

      switch (s) {
        case "spring":
          p = {
            x, y,
            vx: -0.2 + Math.random() * 0.4,
            vy: 0.5 + Math.random() * 0.8,
            size: 6 + Math.random() * 8,
            opacity: 0.4 + Math.random() * 0.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.03,
            sway: Math.random() * 20,
            swaySpeed: 0.005 + Math.random() * 0.01,
            phase: Math.random() * Math.PI * 2,
            type: "petal",
            color: ["#f9a8d4", "#f472b6", "#fbcfe8", "#ec4899", "#fce7f3"][Math.floor(Math.random() * 5)],
          };
          break;
        case "summer":
          p = {
            x, y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -(0.3 + Math.random() * 0.5),
            size: 2 + Math.random() * 3,
            opacity: 0.6 + Math.random() * 0.4,
            rotation: 0,
            rotationSpeed: 0,
            sway: Math.random() * 30,
            swaySpeed: 0.008 + Math.random() * 0.012,
            phase: Math.random() * Math.PI * 2,
            type: "firefly",
            color: `hsl(${60 + Math.random() * 40}, 100%, ${60 + Math.random() * 30}%)`,
          };
          break;
        case "autumn":
          p = {
            x, y,
            vx: -0.3 + Math.random() * 0.6,
            vy: 0.5 + Math.random() * 1.0,
            size: 5 + Math.random() * 7,
            opacity: 0.5 + Math.random() * 0.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.04,
            sway: Math.random() * 15,
            swaySpeed: 0.006 + Math.random() * 0.01,
            phase: Math.random() * Math.PI * 2,
            type: "leaf",
            color: ["#d97706", "#b45309", "#ea580c", "#ca8a04", "#a16207"][Math.floor(Math.random() * 5)],
          };
          break;
        default: // winter
          p = {
            x, y,
            vx: -0.2 + Math.random() * 0.4,
            vy: 0.3 + Math.random() * 0.6,
            size: 2 + Math.random() * 4,
            opacity: 0.5 + Math.random() * 0.5,
            rotation: 0,
            rotationSpeed: 0,
            sway: Math.random() * 10,
            swaySpeed: 0.004 + Math.random() * 0.008,
            phase: Math.random() * Math.PI * 2,
            type: "snow",
            color: "#ffffff",
          };
      }
      particles.current.push(p);
    }

    const spawnPetal = (canvasW: number) => {
      const x = Math.random() * canvasW;
      particles.current.push({
        x, y: -20,
        vx: -0.2 + Math.random() * 0.4,
        vy: 0.5 + Math.random() * 0.8,
        size: 6 + Math.random() * 8,
        opacity: 0.4 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        sway: Math.random() * 20,
        swaySpeed: 0.005 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2,
        type: "petal",
        color: ["#f9a8d4", "#f472b6", "#fbcfe8", "#ec4899", "#fce7f3"][Math.floor(Math.random() * 5)],
      });
    };

    const spawnFirefly = (canvasW: number, canvasH: number) => {
      const x = Math.random() * canvasW;
      const y = Math.random() * canvasH;
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(0.3 + Math.random() * 0.5),
        size: 2 + Math.random() * 3,
        opacity: 0,
        rotation: 0,
        rotationSpeed: 0,
        sway: Math.random() * 30,
        swaySpeed: 0.008 + Math.random() * 0.012,
        phase: Math.random() * Math.PI * 2,
        type: "firefly",
        color: `hsl(${60 + Math.random() * 40}, 100%, ${60 + Math.random() * 30}%)`,
      });
    };

    const spawnLeaf = (canvasW: number) => {
      const x = Math.random() * canvasW;
      particles.current.push({
        x, y: -20,
        vx: -0.3 + Math.random() * 0.6,
        vy: 0.5 + Math.random() * 1.0,
        size: 5 + Math.random() * 7,
        opacity: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        sway: Math.random() * 15,
        swaySpeed: 0.006 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2,
        type: "leaf",
        color: ["#d97706", "#b45309", "#ea580c", "#ca8a04", "#a16207"][Math.floor(Math.random() * 5)],
      });
    };

    const spawnSnow = (canvasW: number) => {
      const x = Math.random() * canvasW;
      particles.current.push({
        x, y: -10,
        vx: -0.2 + Math.random() * 0.4,
        vy: 0.3 + Math.random() * 0.6,
        size: 2 + Math.random() * 4,
        opacity: 0.5 + Math.random() * 0.5,
        rotation: 0,
        rotationSpeed: 0,
        sway: Math.random() * 10,
        swaySpeed: 0.004 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2,
        type: "snow",
        color: "#ffffff",
      });
    };

    const drawPetal = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size / 2, p.size / 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawFirefly = (p: Particle) => {
      const glow = Math.sin(Date.now() * 0.003 + p.phase) * 0.5 + 0.5;
      ctx.globalAlpha = p.opacity * glow;
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(0.3, p.color.replace(")", ", 0.3)").replace("hsl", "hsla"));
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const drawLeaf = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.size / 2);
      ctx.quadraticCurveTo(p.size / 2, 0, 0, p.size / 2);
      ctx.quadraticCurveTo(-p.size / 2, 0, 0, -p.size / 2);
      ctx.fill();
      ctx.restore();
    };

    const drawSnow = (p: Particle) => {
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    let frameCount = 0;
    const loop = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const max = isMobile ? 25 : 50;
      if (particles.current.length < max) {
        const spawnRate = isMobile ? 60 : 30;
        if (frameCount % spawnRate === 0) {
          switch (s) {
            case "spring": spawnPetal(canvas.width); break;
            case "summer": spawnFirefly(canvas.width, canvas.height); break;
            case "autumn": spawnLeaf(canvas.width); break;
            default: spawnSnow(canvas.width); break;
          }
        }
      }

      particles.current = particles.current.filter((p) => {
        p.x += p.vx + Math.sin(Date.now() * p.swaySpeed + p.phase) * 0.3;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        const margin = 50;
        return p.x > -margin && p.x < canvas.width + margin && p.y < canvas.height + margin;
      });

      for (const p of particles.current) {
        switch (p.type) {
          case "petal": drawPetal(p); break;
          case "firefly": drawFirefly(p); break;
          case "leaf": drawLeaf(p); break;
          case "snow": drawSnow(p); break;
        }
      }

      animFrame.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrame.current);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9997] pointer-events-none"
    />
  );
}

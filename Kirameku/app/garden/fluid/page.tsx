"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

// Simplified grid-based fluid simulation (Jos Stam style)
const N = 128;
const iter = 4;
const size = (N + 2) * (N + 2);

function IX(x: number, y: number) { return x + (N + 2) * y; }

function setBnd(b: number, x: Float32Array) {
  for (let i = 1; i <= N; i++) {
    x[IX(0, i)] = b === 1 ? -x[IX(1, i)] : x[IX(1, i)];
    x[IX(N + 1, i)] = b === 1 ? -x[IX(N, i)] : x[IX(N, i)];
    x[IX(i, 0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
    x[IX(i, N + 1)] = b === 2 ? -x[IX(i, N)] : x[IX(i, N)];
  }
  x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
  x[IX(0, N + 1)] = 0.5 * (x[IX(1, N + 1)] + x[IX(0, N)]);
  x[IX(N + 1, 0)] = 0.5 * (x[IX(N, 0)] + x[IX(N + 1, 1)]);
  x[IX(N + 1, N + 1)] = 0.5 * (x[IX(N, N + 1)] + x[IX(N + 1, N)]);
}

function linSolve(b: number, x: Float32Array, x0: Float32Array, a: number, c: number) {
  const cRecip = 1.0 / c;
  for (let k = 0; k < iter; k++) {
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        x[IX(i, j)] = (x0[IX(i, j)] + a * (x[IX(i + 1, j)] + x[IX(i - 1, j)] + x[IX(i, j + 1)] + x[IX(i, j - 1)])) * cRecip;
      }
    }
    setBnd(b, x);
  }
}

function diffuse(b: number, x: Float32Array, x0: Float32Array, diff: number, dt: number) {
  const a = dt * diff * N * N;
  linSolve(b, x, x0, a, 1 + 4 * a);
}

function advect(b: number, d: Float32Array, d0: Float32Array, u: Float32Array, v: Float32Array, dt: number) {
  const dtx = dt * N, dty = dt * N;
  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      let x = i - dtx * u[IX(i, j)];
      let y = j - dty * v[IX(i, j)];
      if (x < 0.5) x = 0.5; if (x > N + 0.5) x = N + 0.5;
      const i0 = Math.floor(x), i1 = i0 + 1;
      if (y < 0.5) y = 0.5; if (y > N + 0.5) y = N + 0.5;
      const j0 = Math.floor(y), j1 = j0 + 1;
      const s1 = x - i0, s0 = 1 - s1, t1 = y - j0, t0 = 1 - t1;
      d[IX(i, j)] = s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) + s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
    }
  }
  setBnd(b, d);
}

function project(u: Float32Array, v: Float32Array, p: Float32Array, div: Float32Array) {
  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      div[IX(i, j)] = -0.5 * (u[IX(i + 1, j)] - u[IX(i - 1, j)] + v[IX(i, j + 1)] - v[IX(i, j - 1)]) / N;
      p[IX(i, j)] = 0;
    }
  }
  setBnd(0, div); setBnd(0, p);
  linSolve(0, p, div, 1, 4);
  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      u[IX(i, j)] -= 0.5 * N * (p[IX(i + 1, j)] - p[IX(i - 1, j)]);
      v[IX(i, j)] -= 0.5 * N * (p[IX(i, j + 1)] - p[IX(i, j - 1)]);
    }
  }
  setBnd(1, u); setBnd(2, v);
}

export default function FluidPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viscosity, setViscosity] = useState(0.0001);
  const [diffusion, setDiffusion] = useState(0.00001);
  const stateRef = useRef({
    u: new Float32Array(size), v: new Float32Array(size),
    u_prev: new Float32Array(size), v_prev: new Float32Array(size),
    dens: new Float32Array(size), dens_prev: new Float32Array(size),
    mouse: { x: 0, y: 0, px: 0, py: 0, down: false },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const s = stateRef.current;

    function resize() {
      canvas!.width = canvas!.clientWidth * devicePixelRatio;
      canvas!.height = canvas!.clientHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const scaleX = (N + 2) / rect.width;
      const scaleY = (N + 2) / rect.height;
      s.mouse.px = s.mouse.x;
      s.mouse.py = s.mouse.y;
      s.mouse.x = (e.clientX - rect.left) * scaleX;
      s.mouse.y = (e.clientY - rect.top) * scaleY;
    }
    function onMouseDown(e: MouseEvent) { s.mouse.down = true; onMouseMove(e); }
    function onMouseUp() { s.mouse.down = false; }
    function onTouchMove(e: TouchEvent) { e.preventDefault(); onMouseMove(e.touches[0] as unknown as MouseEvent); }
    function onTouchStart(e: TouchEvent) { s.mouse.down = true; onMouseMove(e.touches[0] as unknown as MouseEvent); }
    function onTouchEnd() { s.mouse.down = false; }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchend", onTouchEnd);

    let lastTime = performance.now();

    function step(dt: number) {
      const { u, v, u_prev, v_prev, dens, dens_prev } = s;
      // add source on mouse drag
      if (s.mouse.down) {
        const i = Math.floor(s.mouse.x);
        const j = Math.floor(s.mouse.y);
        if (i > 0 && i <= N && j > 0 && j <= N) {
          const dx = s.mouse.x - s.mouse.px;
          const dy = s.mouse.y - s.mouse.py;
          for (let di = -2; di <= 2; di++) {
            for (let dj = -2; dj <= 2; dj++) {
              const ci = i + di, cj = j + dj;
              if (ci > 0 && ci <= N && cj > 0 && cj <= N) {
                u[IX(ci, cj)] += dx * 5;
                v[IX(ci, cj)] += dy * 5;
                dens[IX(ci, cj)] += 80;
              }
            }
          }
        }
      }

      // velocity step
      u_prev.set(u); v_prev.set(v);
      diffuse(1, u, u_prev, viscosity, dt);
      diffuse(2, v, v_prev, viscosity, dt);
      project(u, v, u_prev, v_prev);
      u_prev.set(u); v_prev.set(v);
      advect(1, u, u_prev, u_prev, v_prev, dt);
      advect(2, v, v_prev, u_prev, v_prev, dt);
      project(u, v, u_prev, v_prev);

      // density step
      dens_prev.set(dens);
      diffuse(0, dens, dens_prev, diffusion, dt);
      dens_prev.set(dens);
      advect(0, dens, dens_prev, u, v, dt);

      // fade density
      for (let i = 0; i < size; i++) dens[i] *= 0.995;
    }

    // offscreen canvas for fluid rendering
    const offscreen = document.createElement("canvas");
    offscreen.width = N;
    offscreen.height = N;
    const offCtx = offscreen.getContext("2d")!;

    function draw() {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      step(dt);

      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;

      ctx.fillStyle = "rgba(0,0,0,0.95)";
      ctx.fillRect(0, 0, w, h);

      // render density to offscreen canvas
      const imageData = offCtx.createImageData(N, N);
      const data = imageData.data;
      const { dens: dArr } = s;

      for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
          const d = Math.min(dArr[IX(i, j)] / 255, 1);
          const idx = ((j - 1) * N + (i - 1)) * 4;
          data[idx] = Math.floor(d * 30);
          data[idx + 1] = Math.floor(d * 120 + d * d * 135);
          data[idx + 2] = Math.floor(d * 200 + d * d * 55);
          data[idx + 3] = Math.floor(d * 255);
        }
      }
      offCtx.putImageData(imageData, 0, 0);

      // draw scaled to main canvas
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(offscreen, 0, 0, w, h);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", resize);
    };
  }, [viscosity, diffusion]);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">流体模拟</h1>
          <p className="text-xs text-slate-400">拖拽鼠标在画布上创造流体</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">粘度</label>
            <input
              type="range"
              min="0.00001"
              max="0.001"
              step="0.00001"
              value={viscosity}
              onChange={(e) => setViscosity(Number(e.target.value))}
              className="w-20 accent-sky-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">扩散</label>
            <input
              type="range"
              min="0.000001"
              max="0.0001"
              step="0.000001"
              value={diffusion}
              onChange={(e) => setDiffusion(Number(e.target.value))}
              className="w-20 accent-sky-500"
            />
          </div>
        </div>
      </div>
      <div className="bg-black rounded-xl overflow-hidden border border-white/5 cursor-crosshair" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </motion.div>
  );
}

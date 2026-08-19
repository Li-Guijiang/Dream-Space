"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [Math.round(hue2rgb(p, q, h + 1 / 3) * 255), Math.round(hue2rgb(p, q, h) * 255), Math.round(hue2rgb(p, q, h - 1 / 3) * 255)];
}

function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

const EXAMPLE_PALETTES: Record<string, string[]> = {
  "天空蓝": ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"],
  "樱花粉": ["#fce7f3", "#fbcfe8", "#f9a8d4", "#f472b6", "#ec4899", "#db2777", "#be185d"],
  "森林绿": ["#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d"],
  "夕阳橙": ["#fff7ed", "#ffedd5", "#fed7aa", "#fb923c", "#f97316", "#ea580c", "#c2410c"],
  "星空紫": ["#f3e8ff", "#e9d5ff", "#d8b4fe", "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9"],
  "珊瑚红": ["#ffe4e6", "#fecdd3", "#fda4af", "#fb7185", "#f43f5e", "#e11d48", "#be123c"],
};

export default function ColorPage() {
  const [hex, setHex] = useState("#38bdf8");
  const [copied, setCopied] = useState("");

  const rgb = hexToRgb(hex) ?? [56, 189, 248];
  const hsl = rgbToHsl(...rgb);
  const lum = luminance(...rgb);
  const textColor = lum > 0.179 ? "#000" : "#fff";

  const setFromHex = useCallback((v: string) => {
    if (/^#[0-9a-f]{6}$/i.test(v)) setHex(v);
  }, []);

  function setFromRgb(r: number, g: number, b: number) {
    setHex(rgbToHex(Math.min(255, Math.max(0, r)), Math.min(255, Math.max(0, g)), Math.min(255, Math.max(0, b))));
  }

  function setFromHsl(h: number, s: number, l: number) {
    const [r, g, b] = hslToRgb(h, s, l);
    setFromRgb(r, g, b);
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }

  function generateShades(count: number): string[] {
    const shades: string[] = [];
    for (let i = 0; i < count; i++) {
      const l = 95 - (i * 80) / (count - 1);
      const [r, g, b] = hslToRgb(hsl[0], hsl[1], Math.round(l));
      shades.push(rgbToHex(r, g, b));
    }
    return shades;
  }

  function generateComplementary(): string[] {
    return [hex, rgbToHex(...hslToRgb((hsl[0] + 180) % 360, hsl[1], hsl[2]))];
  }

  function generateTriadic(): string[] {
    return [hex, rgbToHex(...hslToRgb((hsl[0] + 120) % 360, hsl[1], hsl[2])), rgbToHex(...hslToRgb((hsl[0] + 240) % 360, hsl[1], hsl[2]))];
  }

  function generateAnalogous(): string[] {
    return [
      rgbToHex(...hslToRgb((hsl[0] - 30 + 360) % 360, hsl[1], hsl[2])),
      hex,
      rgbToHex(...hslToRgb((hsl[0] + 30) % 360, hsl[1], hsl[2])),
    ];
  }

  const CopyBtn = ({ text, label }: { text: string; label: string }) => (
    <button onClick={() => copy(text, label)} className="text-[10px] text-slate-400 hover:text-sky-500 transition-colors">
      {copied === label ? "已复制!" : "复制"}
    </button>
  );

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">颜色工具</h1>
        <p className="text-xs text-slate-400">取色、转换、调色板、渐变生成</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* 左侧：取色器 */}
        <div className="space-y-4">
          {/* 预览 */}
          <div
            className="rounded-xl h-28 flex items-center justify-center text-lg font-bold shadow-inner border border-white/10"
            style={{ backgroundColor: hex, color: textColor }}
          >
            {hex.toUpperCase()}
          </div>

          {/* 原生取色器 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">取色</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={hex}
                onChange={(e) => setFromHex(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm font-mono text-slate-700 dark:text-slate-200 outline-none"
              />
            </div>
          </div>

          {/* 转换值 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">HEX</span>
              <CopyBtn text={hex} label="hex" />
            </div>
            <p className="text-sm font-mono text-slate-700 dark:text-slate-200">{hex}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">RGB</span>
              <CopyBtn text={`rgb(${rgb.join(", ")})`} label="rgb" />
            </div>
            <p className="text-sm font-mono text-slate-700 dark:text-slate-200">rgb({rgb.join(", ")})</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">HSL</span>
              <CopyBtn text={`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`} label="hsl" />
            </div>
            <p className="text-sm font-mono text-slate-700 dark:text-slate-200">hsl({hsl[0]}, {hsl[1]}%, {hsl[2]}%)</p>
          </div>

          {/* RGB 滑块 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">RGB 调整</label>
            {[
              { label: "R", value: rgb[0], color: "#ef4444", onChange: (v: number) => setFromRgb(v, rgb[1], rgb[2]) },
              { label: "G", value: rgb[1], color: "#22c55e", onChange: (v: number) => setFromRgb(rgb[0], v, rgb[2]) },
              { label: "B", value: rgb[2], color: "#3b82f6", onChange: (v: number) => setFromRgb(rgb[0], rgb[1], v) },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                <span className="text-xs font-mono w-4" style={{ color: c.color }}>{c.label}</span>
                <input type="range" min={0} max={255} value={c.value} onChange={(e) => c.onChange(Number(e.target.value))} className="flex-1 accent-sky-500" />
                <span className="text-xs font-mono text-slate-500 w-8 text-right">{c.value}</span>
              </div>
            ))}
          </div>

          {/* HSL 滑块 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">HSL 调整</label>
            {[
              { label: "H", value: hsl[0], max: 360, onChange: (v: number) => setFromHsl(v, hsl[1], hsl[2]) },
              { label: "S", value: hsl[1], max: 100, onChange: (v: number) => setFromHsl(hsl[0], v, hsl[2]) },
              { label: "L", value: hsl[2], max: 100, onChange: (v: number) => setFromHsl(hsl[0], hsl[1], v) },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                <span className="text-xs font-mono w-4 text-slate-400">{c.label}</span>
                <input type="range" min={0} max={c.max} value={c.value} onChange={(e) => c.onChange(Number(e.target.value))} className="flex-1 accent-sky-500" />
                <span className="text-xs font-mono text-slate-500 w-8 text-right">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：调色板 */}
        <div className="space-y-5">
          {/* 色阶 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">色阶</h3>
            <div className="flex rounded-lg overflow-hidden">
              {generateShades(9).map((c, i) => (
                <button
                  key={i}
                  onClick={() => { setHex(c); copy(c, `shade-${i}`); }}
                  className="flex-1 h-12 transition-transform hover:scale-y-110 relative group"
                  style={{ backgroundColor: c }}
                >
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: luminance(...(hexToRgb(c) ?? [0,0,0])) > 0.179 ? "#000" : "#fff" }}>
                    {c.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 配色方案 */}
          {[
            { name: "互补色", colors: generateComplementary() },
            { name: "三色组", colors: generateTriadic() },
            { name: "类似色", colors: generateAnalogous() },
          ].map((scheme) => (
            <div key={scheme.name} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
              <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">{scheme.name}</h3>
              <div className="flex gap-2">
                {scheme.colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => { setHex(c); copy(c, `${scheme.name}-${i}`); }}
                    className="flex-1 h-16 rounded-lg transition-transform hover:scale-105 border border-white/10"
                    style={{ backgroundColor: c }}
                  >
                    <span className="text-[10px] font-mono" style={{ color: luminance(...(hexToRgb(c) ?? [0,0,0])) > 0.179 ? "#000" : "#fff" }}>
                      {c}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* 预设调色板 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">预设调色板</h3>
            <div className="space-y-2">
              {Object.entries(EXAMPLE_PALETTES).map(([name, colors]) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-14 shrink-0">{name}</span>
                  <div className="flex flex-1 rounded-lg overflow-hidden">
                    {colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => { setHex(c); copy(c, `${name}-${i}`); }}
                        className="flex-1 h-8 transition-transform hover:scale-y-125"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 渐变生成 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">渐变预览</h3>
            <div className="space-y-2">
              {[
                { dir: "to right", label: "线性 →" },
                { dir: "to bottom right", label: "对角线 ↘" },
                { dir: "circle", label: "径向" },
              ].map((g) => {
                const grad = g.dir === "circle"
                  ? `radial-gradient(circle, ${hex}, ${rgbToHex(...hslToRgb((hsl[0] + 180) % 360, hsl[1], hsl[2]))})`
                  : `linear-gradient(${g.dir}, ${hex}, ${rgbToHex(...hslToRgb((hsl[0] + 180) % 360, hsl[1], hsl[2]))})`;
                return (
                  <div key={g.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400">{g.label}</span>
                      <button onClick={() => copy(grad, g.label)} className="text-[10px] text-slate-400 hover:text-sky-500">
                        {copied === g.label ? "已复制!" : "复制"}
                      </button>
                    </div>
                    <div className="h-10 rounded-lg" style={{ background: grad }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

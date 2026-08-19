"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

const EXAMPLES = [
  { label: "网址", value: "https://github.com" },
  { label: "邮箱", value: "mailto:hello@example.com" },
  { label: "电话", value: "tel:+8613800138000" },
  { label: "WiFi", value: "WIFI:T:WPA;S:MyNetwork;P:mypassword123;;" },
  { label: "文本", value: "Hello, World! 这是一段测试文本。" },
  { label: "vCard", value: "BEGIN:VCARD\nVERSION:3.0\nFN:张三\nTEL:+8613800138000\nEMAIL:zhangsan@example.com\nEND:VCARD" },
];

type ECLevel = "L" | "M" | "Q" | "H";

export default function QRCodePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("https://github.com");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(300);
  const [ecLevel, setEcLevel] = useState<ECLevel>("M");
  const [margin, setMargin] = useState(true);
  const [error, setError] = useState("");

  const generate = useCallback(async () => {
    if (!canvasRef.current || !text.trim()) return;
    setError("");
    try {
      await QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: margin ? 4 : 1,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: ecLevel,
      });
    } catch (e: any) {
      setError(e.message || "生成失败");
    }
  }, [text, fgColor, bgColor, size, ecLevel, margin]);

  useEffect(() => { generate(); }, [generate]);

  function downloadPNG() {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
  }

  async function downloadSVG() {
    try {
      const svg = await QRCode.toString(text, {
        type: "svg",
        width: size,
        margin: margin ? 4 : 1,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: ecLevel,
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.svg";
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">二维码生成</h1>
        <p className="text-xs text-slate-400">输入文本或链接，生成可下载的二维码</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* 左侧：输入和预览 */}
        <div className="space-y-4">
          {/* 输入 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">内容</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm font-mono text-slate-700 dark:text-slate-200 outline-none resize-none focus:border-sky-400 transition-colors"
              placeholder="输入网址、文本、WiFi 信息等..."
            />
          </div>

          {/* 示例 */}
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setText(ex.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  text === ex.value
                    ? "bg-sky-500 text-white"
                    : "bg-white/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5 hover:border-sky-300"
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* 预览 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-200/50 dark:border-white/5 flex flex-col items-center gap-4">
            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : (
              <canvas ref={canvasRef} className="rounded-lg shadow-lg max-w-full" style={{ imageRendering: "pixelated" }} />
            )}
            <div className="flex gap-2">
              <button onClick={downloadPNG} className="px-4 py-2 rounded-lg text-xs font-medium bg-sky-500 text-white hover:bg-sky-600 active:scale-95 shadow-lg shadow-sky-500/20 transition-all">
                下载 PNG
              </button>
              <button onClick={downloadSVG} className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">
                下载 SVG
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：设置 */}
        <div className="space-y-4">
          {/* 纠错等级 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">纠错等级</label>
            <div className="grid grid-cols-4 gap-1">
              {(["L", "M", "Q", "H"] as ECLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setEcLevel(level)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    ecLevel === level
                      ? "bg-sky-500 text-white"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">L=7% · M=15% · Q=25% · H=30% 容错</p>
          </div>

          {/* 尺寸 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">尺寸</label>
            <input type="range" min={150} max={600} step={50} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-sky-500" />
            <span className="text-xs text-slate-400 font-mono">{size} × {size} px</span>
          </div>

          {/* 颜色 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">颜色</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                <div>
                  <p className="text-[10px] text-slate-400">前景</p>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-300">{fgColor}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                <div>
                  <p className="text-[10px] text-slate-400">背景</p>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-300">{bgColor}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 边距 */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">白边</label>
              <button
                onClick={() => setMargin(!margin)}
                className={`w-9 h-5 rounded-full transition-colors relative ${margin ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${margin ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

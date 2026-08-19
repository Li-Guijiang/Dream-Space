"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

const EXAMPLE_JSON = `{
  "blog": "Kirameku",
  "version": "1.0",
  "features": [
    "文章系统",
    "说说动态",
    "相册管理",
    "留言评论"
  ],
  "config": {
    "theme": "sky-blue",
    "language": "zh-CN",
    "analytics": true
  },
  "stats": {
    "posts": 42,
    "visitors": 12800,
    "uptime": "99.9%"
  }
}`;

export default function JsonPage() {
  const [input, setInput] = useState(EXAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);
  const [stats, setStats] = useState({ keys: 0, arrays: 0, depth: 0 });

  function analyze(obj: any, depth = 0): { keys: number; arrays: number; depth: number } {
    let keys = 0, arrays = 0, maxDepth = depth;
    if (Array.isArray(obj)) {
      arrays++;
      for (const item of obj) {
        const r = analyze(item, depth + 1);
        keys += r.keys; arrays += r.arrays; maxDepth = Math.max(maxDepth, r.depth);
      }
    } else if (obj && typeof obj === "object") {
      for (const k of Object.keys(obj)) {
        keys++;
        const r = analyze(obj[k], depth + 1);
        keys += r.keys; arrays += r.arrays; maxDepth = Math.max(maxDepth, r.depth);
      }
    }
    return { keys, arrays, depth: maxDepth };
  }

  function format() {
    try {
      setError("");
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setStats(analyze(parsed));
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  }

  function compress() {
    try {
      setError("");
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setStats(analyze(parsed));
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  }

  function escape() {
    try {
      setError("");
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(JSON.stringify(parsed)));
    } catch (e: any) {
      setError(e.message);
    }
  }

  function unescape() {
    try {
      setError("");
      const unescaped = JSON.parse(input);
      if (typeof unescaped === "string") {
        setInput(unescaped);
        setOutput("");
      } else {
        setOutput(JSON.stringify(unescaped, null, indent));
      }
    } catch (e: any) {
      setError(e.message);
    }
  }

  function copyOutput() {
    if (output) navigator.clipboard.writeText(output);
  }

  const btnClass = "px-3 py-1.5 rounded-lg text-xs font-medium transition-all";

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">JSON 格式化</h1>
          <p className="text-xs text-slate-400">美化、压缩、转义、校验 JSON 数据</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">缩进</label>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="px-2 py-1 rounded-lg text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-0 outline-none cursor-pointer"
            >
              <option value={2}>2 空格</option>
              <option value={4}>4 空格</option>
              <option value={1}>Tab</option>
            </select>
          </div>
          <button onClick={format} className={`${btnClass} bg-sky-500 text-white hover:bg-sky-600`}>美化</button>
          <button onClick={compress} className={`${btnClass} bg-emerald-500 text-white hover:bg-emerald-600`}>压缩</button>
          <button onClick={escape} className={`${btnClass} bg-amber-500 text-white hover:bg-amber-600`}>转义</button>
          <button onClick={unescape} className={`${btnClass} bg-violet-500 text-white hover:bg-violet-600`}>反转义</button>
          <button onClick={() => setInput(EXAMPLE_JSON)} className={`${btnClass} bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600`}>示例</button>
        </div>
      </div>

      {/* 统计 */}
      {output && !error && (
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>键: <b className="text-sky-500">{stats.keys}</b></span>
          <span>数组: <b className="text-emerald-500">{stats.arrays}</b></span>
          <span>深度: <b className="text-amber-500">{stats.depth}</b></span>
          <span>大小: <b className="text-violet-500">{(new Blob([output]).size / 1024).toFixed(1)} KB</b></span>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: "calc(100vh - 260px)", minHeight: "400px" }}>
        {/* 输入 */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-slate-800/80">
            <span className="text-xs text-slate-400 font-mono">输入</span>
            <button onClick={() => { setInput(""); setOutput(""); setError(""); }} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">清空</button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-mono leading-relaxed p-4 resize-none outline-none"
            placeholder="粘贴 JSON 数据..."
          />
        </div>

        {/* 输出 */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-slate-800/80">
            <span className="text-xs text-slate-400 font-mono">输出</span>
            <button onClick={copyOutput} className="text-xs text-sky-500 hover:text-sky-600">复制</button>
          </div>
          <pre className="flex-1 overflow-auto p-4 bg-white dark:bg-slate-900 text-sm font-mono text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {output || <span className="text-slate-300 dark:text-slate-600">点击上方按钮处理 JSON...</span>}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

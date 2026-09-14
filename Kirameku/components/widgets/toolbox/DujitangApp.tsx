"use client";

import { useState, useCallback } from "react";

export default function DujitangApp() {
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://v2.xxapi.cn/api/dujitang");
      const json = await res.json();
      if (json.code === 200 && json.data) {
        setQuote(json.data);
        setCount((c) => c + 1);
      } else {
        setError("获取失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center gap-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
          <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Quote */}
      <div className="w-full min-h-[80px] flex items-center justify-center px-2">
        {loading ? (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : error ? (
          <span className="text-xs text-rose-400">{error}</span>
        ) : quote ? (
          <p className="text-sm text-slate-700 dark:text-slate-200 text-center leading-relaxed font-medium">
            &ldquo;{quote}&rdquo;
          </p>
        ) : (
          <p className="text-xs text-slate-400 text-center">
            点击下方按钮，<br />来一碗毒鸡汤
          </p>
        )}
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={fetchQuote}
        disabled={loading}
        title="来一碗"
        className={`px-6 py-2 rounded-2xl text-sm font-bold text-white transition-all shadow-lg ${
          loading
            ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
            : "bg-amber-500 hover:bg-amber-600 active:scale-95 shadow-amber-500/25"
        }`}
      >
        {loading ? "熬制中..." : count > 0 ? "再来一碗" : "来一碗毒鸡汤"}
      </button>

      {count > 0 && (
        <span className="text-[10px] text-slate-400">已干 {count} 碗</span>
      )}
    </div>
  );
}

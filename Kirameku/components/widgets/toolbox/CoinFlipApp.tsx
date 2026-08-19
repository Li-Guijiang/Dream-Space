"use client";

import { useState, useRef } from "react";

type Side = "heads" | "tails";

interface FlipResult {
  side: Side;
  id: number;
}

export default function CoinFlipApp() {
  const [result, setResult] = useState<Side | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [history, setHistory] = useState<FlipResult[]>([]);
  const nextId = useRef(0);

  const stats = {
    total: history.length,
    heads: history.filter((r) => r.side === "heads").length,
    tails: history.filter((r) => r.side === "tails").length,
  };

  const flip = () => {
    if (flipping) return;
    setFlipping(true);
    setResult(null);

    setTimeout(() => {
      const side: Side = Math.random() < 0.5 ? "heads" : "tails";
      setResult(side);
      setHistory((prev) => [{ side, id: nextId.current++ }, ...prev].slice(0, 50));
      setFlipping(false);
    }, 600);
  };

  const clearHistory = () => {
    setHistory([]);
    setResult(null);
    nextId.current = 0;
  };

  const headsPercent = stats.total > 0 ? Math.round((stats.heads / stats.total) * 100) : 0;
  const tailsPercent = stats.total > 0 ? 100 - headsPercent : 0;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Coin */}
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <div
          className={`w-28 h-28 rounded-full relative ${flipping ? "animate-spin" : ""}`}
          style={{ perspective: "400px" }}
        >
          <div
            className={`w-full h-full rounded-full flex items-center justify-center shadow-2xl border-4 transition-all duration-300 ${
              result === "heads"
                ? "bg-gradient-to-br from-amber-300 to-amber-500 border-amber-400"
                : result === "tails"
                ? "bg-gradient-to-br from-slate-300 to-slate-500 border-slate-400"
                : "bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-600 dark:to-slate-800 border-slate-300 dark:border-slate-600"
            }`}
          >
            {flipping ? (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-300 to-slate-400 animate-pulse" />
            ) : result === "heads" ? (
              <svg className="w-14 h-14 text-amber-700" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor">1</text>
              </svg>
            ) : result === "tails" ? (
              <svg className="w-14 h-14 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 9h.01M15 9h.01M9.5 15c.83.67 1.67 1 2.5 1s1.67-.33 2.5-1" strokeLinecap="round" />
              </svg>
            )}
          </div>
        </div>

        {/* Result text */}
        {result && !flipping && (
          <div className="text-center">
            <span className={`text-lg font-black ${result === "heads" ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"}`}>
              {result === "heads" ? "正面" : "反面"}
            </span>
          </div>
        )}

        {/* Flip button */}
        <button
          type="button"
          onClick={flip}
          disabled={flipping}
          title="抛硬币"
          className={`px-8 py-2.5 rounded-2xl text-sm font-bold text-white transition-all shadow-lg ${
            flipping
              ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600 active:scale-95 shadow-indigo-500/25"
          }`}
        >
          {flipping ? "抛掷中..." : result ? "再抛一次" : "抛硬币"}
        </button>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="space-y-2">
          {/* Progress bar */}
          <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            {headsPercent > 0 && (
              <div className="bg-amber-400 transition-all duration-500" style={{ width: `${headsPercent}%` }} />
            )}
            {tailsPercent > 0 && (
              <div className="bg-slate-400 dark:bg-slate-500 transition-all duration-500" style={{ width: `${tailsPercent}%` }} />
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-600 dark:text-slate-300">正面 {stats.heads} ({headsPercent}%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                <span className="text-slate-600 dark:text-slate-300">反面 {stats.tails} ({tailsPercent}%)</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">共 {stats.total} 次</span>
              <button type="button" onClick={clearHistory} title="清空记录"
                className="text-slate-400 hover:text-rose-500 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Recent history */}
          <div className="flex gap-1 flex-wrap">
            {history.slice(0, 20).map((r) => (
              <div
                key={r.id}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                  r.side === "heads"
                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
                title={r.side === "heads" ? "正面" : "反面"}
              >
                {r.side === "heads" ? "正" : "反"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

const tips = [
  { text: "正在翻阅书页...", icon: "📖" },
  { text: "知识正在赶来...", icon: "🏃" },
  { text: "书中自有黄金屋...", icon: "✨" },
  { text: "别急，好书值得等待...", icon: "☕" },
  { text: "字里行间加载中...", icon: "🖋️" },
  { text: "作者正在奋笔疾书...", icon: "✍️" },
  { text: "墨水还在晾干...", icon: "🍃" },
  { text: "正在穿越到书中世界...", icon: "🌍" },
];

export default function LoadingTips() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * tips.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % tips.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const tip = tips[index];

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <svg className="w-12 h-12 text-sky-500 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">{tip.icon}</span>
      </div>
      <p className="text-sm text-slate-400 dark:text-slate-500 animate-pulse">{tip.text}</p>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";

const categories = [
  { id: "", label: "随机" },
  { id: "a", label: "动画" },
  { id: "b", label: "漫画" },
  { id: "c", label: "游戏" },
  { id: "d", label: "文学" },
  { id: "e", label: "原创" },
  { id: "f", label: "网络" },
  { id: "g", label: "其他" },
];

interface HitokotoItem {
  text: string;
  from: string;
  type: string;
}

export default function HitokotoApp() {
  const [current, setCurrent] = useState<HitokotoItem>({ text: "点击获取一言~", from: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [history, setHistory] = useState<HitokotoItem[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchHitokoto = useCallback(async (cat?: string) => {
    setLoading(true);
    try {
      const url = cat ? `https://v1.hitokoto.cn/?c=${cat}` : "https://v1.hitokoto.cn";
      const res = await fetch(url);
      const json = await res.json();
      const item = { text: json.hitokoto, from: json.from, type: json.type };
      setCurrent(item);
      setHistory((h) => [item, ...h].slice(0, 20));
    } catch {
      setCurrent({ text: "获取失败，请重试", from: "", type: "" });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(current.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleCategory = (cat: string) => {
    setCategory(cat);
    fetchHitokoto(cat);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 分类标签 */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => handleCategory(c.id)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
              category === c.id
                ? "bg-pink-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="flex-1 flex flex-col">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-3 flex-1">
          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            {loading ? "加载中..." : `"${current.text}"`}
          </p>
          {current.from && (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-2">—— 「{current.from}」</p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchHitokoto(category)}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 transition-colors disabled:opacity-50"
          >
            {loading ? "加载中..." : "换一条"}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            {copied ? "已复制 ✓" : "复制"}
          </button>
        </div>
      </div>

      {/* 历史记录 */}
      {history.length > 1 && (
        <div className="mt-3 max-h-28 overflow-auto">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">历史</div>
          {history.slice(1).map((item, i) => (
            <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 py-0.5 truncate">
              {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

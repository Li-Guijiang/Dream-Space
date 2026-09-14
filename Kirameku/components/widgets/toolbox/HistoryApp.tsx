"use client";

import { useState, useEffect, useRef } from "react";

interface HistoryEvent {
  text: string;
  year: string;
  title: string;
}

function parseEvent(raw: string): HistoryEvent {
  const match = raw.match(/^(\d{4})年(.+)$/);
  if (match) {
    return { year: match[1], title: match[2].trim(), text: raw };
  }
  return { year: "", title: raw, text: raw };
}

export default function HistoryApp() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const initialized = useRef(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://v2.xxapi.cn/api/history");
      const json = await res.json();
      if (json.code === 200 && Array.isArray(json.data)) {
        setEvents(json.data.map(parseEvent));
      } else {
        setError("获取失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized.current) {
      fetchHistory();
      initialized.current = true;
    }
  }, []);

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <span className="text-sm font-bold text-slate-800 dark:text-white">历史上的今天</span>
            <span className="text-[10px] text-slate-400 ml-1.5">{dateStr}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchHistory}
          disabled={loading}
          title="刷新"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-slate-400">翻阅历史中...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <svg className="w-8 h-8 text-rose-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-xs text-rose-400">{error}</span>
            <button type="button" onClick={fetchHistory} className="text-xs text-indigo-500 font-medium hover:underline">重试</button>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="space-y-0.5">
              {events.map((e, i) => (
                <div
                  key={i}
                  className="relative pl-8 group"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-1.5 top-2.5 w-[9px] h-[9px] rounded-full border-2 transition-colors ${
                    expanded === i
                      ? "bg-indigo-500 border-indigo-500"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-indigo-400"
                  }`} />

                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full text-left py-2 pr-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {e.year && (
                      <span className={`text-[10px] font-black mr-1.5 tabular-nums ${
                        expanded === i ? "text-indigo-500" : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {e.year}年
                      </span>
                    )}
                    <span className={`text-xs leading-relaxed ${
                      expanded === i
                        ? "text-indigo-600 dark:text-indigo-300 font-bold"
                        : "text-slate-600 dark:text-slate-300 font-medium"
                    }`}>
                      {e.title}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Count */}
      {events.length > 0 && (
        <div className="text-center text-[10px] text-slate-400 pt-1.5">
          共 {events.length} 条历史事件
        </div>
      )}
    </div>
  );
}

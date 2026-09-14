"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Tab = "clock" | "stopwatch" | "timer";

export default function ClockApp() {
  const [tab, setTab] = useState<Tab>("clock");
  const [now, setNow] = useState(new Date());

  // 秒表状态
  const [swRunning, setSwRunning] = useState(false);
  const [swTime, setSwTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const swRef = useRef<NodeJS.Timeout | null>(null);

  // 倒计时状态
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerLeft, setTimerLeft] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // 秒表逻辑
  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => setSwTime((p) => p + 10), 10);
    } else if (swRef.current) {
      clearInterval(swRef.current);
    }
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning]);

  // 倒计时逻辑
  useEffect(() => {
    if (timerRunning && timerLeft > 0) {
      timerRef.current = setInterval(() => setTimerLeft((p) => p - 1), 1000);
    } else if (timerLeft === 0) {
      setTimerRunning(false);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, timerLeft]);

  const formatSw = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const addLap = useCallback(() => {
    setLaps((p) => [swTime, ...p].slice(0, 20));
  }, [swTime]);

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

  const tabs: { id: Tab; label: string }[] = [
    { id: "clock", label: "时钟" },
    { id: "stopwatch", label: "秒表" },
    { id: "timer", label: "计时" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab 栏 */}
      <div className="flex gap-1 mb-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${
              tab === t.id
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 时钟 */}
      {tab === "clock" && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <div className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-wider">
            {pad(h)}<span className="animate-pulse">:</span>{pad(m)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {now.getFullYear()}/{pad(now.getMonth() + 1)}/{pad(now.getDate())} {weekdays[now.getDay()]}
          </div>
          <div className="relative w-32 h-32 mt-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-200 dark:text-slate-700" />
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 - 90) * Math.PI / 180;
                return <line key={i} x1={50 + 38 * Math.cos(angle)} y1={50 + 38 * Math.sin(angle)} x2={50 + 43 * Math.cos(angle)} y2={50 + 43 * Math.sin(angle)} stroke="currentColor" strokeWidth="1.5" className="text-slate-400 dark:text-slate-500" />;
              })}
              <line x1="50" y1="50" x2={50 + 20 * Math.sin((h % 12) * 30 * Math.PI / 180 + m * Math.PI / 360)} y2={50 - 20 * Math.cos((h % 12) * 30 * Math.PI / 180 + m * Math.PI / 360)} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-slate-900 dark:text-white" />
              <line x1="50" y1="50" x2={50 + 28 * Math.sin(m * 6 * Math.PI / 180)} y2={50 - 28 * Math.cos(m * 6 * Math.PI / 180)} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-indigo-500" />
              <line x1="50" y1="50" x2={50 + 32 * Math.sin(s * 6 * Math.PI / 180)} y2={50 - 32 * Math.cos(s * 6 * Math.PI / 180)} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" className="text-pink-500" />
              <circle cx="50" cy="50" r="2" fill="currentColor" className="text-indigo-500" />
            </svg>
          </div>
        </div>
      )}

      {/* 秒表 */}
      {tab === "stopwatch" && (
        <div className="flex flex-col flex-1">
          <div className="text-center py-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{formatSw(swTime)}</div>
          </div>
          <div className="flex gap-2 justify-center mb-3">
            <button
              type="button"
              onClick={() => setSwRunning(!swRunning)}
              className={`px-6 py-2 rounded-xl text-xs font-bold text-white transition-colors ${swRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-500 hover:bg-indigo-600"}`}
            >
              {swRunning ? "暂停" : "开始"}
            </button>
            {swRunning && (
              <button type="button" onClick={addLap} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                计次
              </button>
            )}
            {!swRunning && swTime > 0 && (
              <button type="button" onClick={() => { setSwTime(0); setLaps([]); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                重置
              </button>
            )}
          </div>
          {laps.length > 0 && (
            <div className="flex-1 overflow-auto">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between text-xs py-1 px-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">第{laps.length - i}次</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{formatSw(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 倒计时 */}
      {tab === "timer" && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <div className="text-4xl font-black text-slate-900 dark:text-white font-mono">
            {formatTimer(timerLeft)}
          </div>
          {/* 快捷时间按钮 */}
          <div className="flex gap-2 flex-wrap justify-center">
            {[60, 180, 300, 600, 1800].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => { setTimerSeconds(sec); setTimerLeft(sec); setTimerRunning(false); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  timerSeconds === sec && !timerRunning
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {sec >= 60 ? `${sec / 60}分钟` : `${sec}秒`}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => timerLeft > 0 && setTimerRunning(!timerRunning)}
              className={`px-6 py-2 rounded-xl text-xs font-bold text-white transition-colors ${timerRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-500 hover:bg-indigo-600"}`}
            >
              {timerRunning ? "暂停" : "开始"}
            </button>
            {!timerRunning && (
              <button type="button" onClick={() => { setTimerLeft(timerSeconds); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                重置
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

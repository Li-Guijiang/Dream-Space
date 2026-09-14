"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type DiceType = 4 | 6 | 8 | 10 | 12 | 20;

const diceTypes: { type: DiceType; label: string }[] = [
  { type: 4, label: "D4" },
  { type: 6, label: "D6" },
  { type: 8, label: "D8" },
  { type: 10, label: "D10" },
  { type: 12, label: "D12" },
  { type: 20, label: "D20" },
];

interface RollResult {
  values: number[];
  total: number;
  type: DiceType;
  count: number;
  timestamp: number;
}

// D6 点数 SVG
function DiceFace({ value, rolling }: { value: number; rolling: boolean }) {
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
  };

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${rolling ? "animate-spin" : ""}`}>
      <rect x="5" y="5" width="90" height="90" rx="15" fill="white" stroke="#6366f1" strokeWidth="3" />
      {(dots[value] || dots[1]).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8" fill="#6366f1" />
      ))}
    </svg>
  );
}

// 通用骰子数字显示
function DiceNumber({ value, max, rolling }: { value: number; max: number; rolling: boolean }) {
  const isMax = value === max;
  return (
    <div className={`w-full h-full flex items-center justify-center rounded-xl border-2 transition-all ${
      isMax
        ? "border-amber-400 bg-amber-50 dark:bg-amber-900/30"
        : "border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-800"
    } ${rolling ? "animate-pulse" : ""}`}>
      <span className={`text-2xl font-black ${isMax ? "text-amber-500" : "text-indigo-600 dark:text-indigo-400"}`}>
        {value}
      </span>
    </div>
  );
}

export default function DiceApp() {
  const [diceType, setDiceType] = useState<DiceType>(6);
  const [diceCount, setDiceCount] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [currentResult, setCurrentResult] = useState<RollResult | null>(null);
  const [history, setHistory] = useState<RollResult[]>([]);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);

    // 模拟动画：快速切换随机数字
    let ticks = 0;
    animRef.current = setInterval(() => {
      ticks++;
      const animValues = Array.from({ length: diceCount }, () =>
        Math.floor(Math.random() * diceType) + 1
      );
      setCurrentResult({
        values: animValues,
        total: animValues.reduce((a, b) => a + b, 0),
        type: diceType,
        count: diceCount,
        timestamp: Date.now(),
      });
      if (ticks >= 10) {
        if (animRef.current) clearInterval(animRef.current);
        // 最终结果
        const finalValues = Array.from({ length: diceCount }, () =>
          Math.floor(Math.random() * diceType) + 1
        );
        const result: RollResult = {
          values: finalValues,
          total: finalValues.reduce((a, b) => a + b, 0),
          type: diceType,
          count: diceCount,
          timestamp: Date.now(),
        };
        setCurrentResult(result);
        setHistory((h) => [result, ...h].slice(0, 20));
        setRolling(false);
      }
    }, 80);
  }, [rolling, diceType, diceCount]);

  useEffect(() => {
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, []);

  const stats = history.length > 0 ? (() => {
    const allValues = history.flatMap((r) => r.values);
    const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);
    return { avg: avg.toFixed(1), max, min, count: allValues.length };
  })() : null;

  return (
    <div className="flex flex-col h-full">
      {/* 骰子类型选择 */}
      <div className="flex gap-1 mb-3">
        {diceTypes.map((d) => (
          <button
            key={d.type}
            type="button"
            onClick={() => { setDiceType(d.type); setCurrentResult(null); }}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
              diceType === d.type
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* 骰子数量 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">数量</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => { setDiceCount(n); setCurrentResult(null); }}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                diceCount === n
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* 骰子展示区 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        {currentResult ? (
          <>
            <div className="grid gap-2 w-full" style={{
              gridTemplateColumns: `repeat(${Math.min(diceCount, 3)}, 1fr)`,
              maxWidth: diceCount <= 2 ? "160px" : "240px",
            }}>
              {currentResult.values.map((v, i) => (
                <div key={i} className="aspect-square w-full max-w-[72px] mx-auto">
                  {diceType === 6 ? (
                    <DiceFace value={v} rolling={rolling} />
                  ) : (
                    <DiceNumber value={v} max={diceType} rolling={rolling} />
                  )}
                </div>
              ))}
            </div>
            {diceCount > 1 && (
              <div className="text-center">
                <span className="text-xs text-slate-400 dark:text-slate-500">合计</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 ml-2">{currentResult.total}</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-slate-300 dark:text-slate-600 text-sm">点击下方按钮投掷</div>
        )}
      </div>

      {/* 投掷按钮 */}
      <button
        type="button"
        onClick={roll}
        disabled={rolling}
        className="w-full py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50 mb-2"
      >
        {rolling ? "投掷中..." : "投掷"}
      </button>

      {/* 统计 */}
      {stats && (
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
          <span>次数 {stats.count}</span>
          <span>均值 {stats.avg}</span>
          <span>最大 {stats.max}</span>
          <span>最小 {stats.min}</span>
        </div>
      )}
    </div>
  );
}

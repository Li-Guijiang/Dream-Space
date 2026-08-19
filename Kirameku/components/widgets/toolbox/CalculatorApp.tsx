"use client";

import { useState } from "react";

export default function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [reset, setReset] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const calc = (a: number, b: number, op: string) => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleNum = (n: string) => {
    if (reset) { setDisplay(n); setReset(false); }
    else { setDisplay(display === "0" ? n : display + n); }
  };

  const handleOp = (nextOp: string) => {
    const current = parseFloat(display);
    if (prev !== null && op) {
      const result = calc(prev, current, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setReset(true);
  };

  const handleEqual = () => {
    if (prev !== null && op) {
      const current = parseFloat(display);
      const result = calc(prev, current, op);
      const opSymbol = { "+": "+", "-": "−", "*": "×", "/": "÷" }[op] || op;
      setHistory((h) => [`${prev} ${opSymbol} ${current} = ${result}`, ...h].slice(0, 10));
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setReset(true);
    }
  };

  const handleClear = () => { setDisplay("0"); setPrev(null); setOp(null); };

  const handlePercent = () => {
    const val = parseFloat(display);
    setDisplay(String(val / 100));
  };

  const handlePlusMinus = () => {
    const val = parseFloat(display);
    setDisplay(String(-val));
  };

  const btnClass = "py-2.5 rounded-xl text-sm font-bold transition-colors active:scale-95";

  return (
    <div className="flex flex-col h-full">
      {/* 显示区 */}
      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 mb-3">
        <div className="text-xs text-slate-400 h-4 text-right">{prev !== null ? `${prev} ${op}` : ""}</div>
        <div className="text-2xl font-black text-slate-900 dark:text-white text-right truncate">{display}</div>
      </div>

      {/* 历史记录 - 中间区域，可滚动 */}
      {history.length > 0 && (
        <div className="flex-1 overflow-y-auto mb-2 pr-1"
          style={{ maskImage: "linear-gradient(transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(transparent, black 8%, black 92%, transparent)" }}
        >
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm py-0.5">历史记录</div>
          {history.map((h, i) => (
            <div key={i} className="text-xs text-slate-500 dark:text-slate-400 py-0.5">{h}</div>
          ))}
        </div>
      )}

      {/* 按钮区 - 固定在底部 */}
      <div className="grid grid-cols-4 gap-1.5 mt-auto">
        <button type="button" onClick={handleClear} className={`${btnClass} bg-rose-400/90 text-white`}>AC</button>
        <button type="button" onClick={handlePlusMinus} className={`${btnClass} bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200`}>±</button>
        <button type="button" onClick={handlePercent} className={`${btnClass} bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200`}>%</button>
        <button type="button" onClick={() => handleOp("/")} className={`${btnClass} bg-indigo-500 text-white`}>÷</button>
        {[7,8,9].map(n => <button key={n} type="button" onClick={() => handleNum(String(n))} className={`${btnClass} bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white`}>{n}</button>)}
        <button type="button" onClick={() => handleOp("*")} className={`${btnClass} bg-indigo-500 text-white`}>×</button>
        {[4,5,6].map(n => <button key={n} type="button" onClick={() => handleNum(String(n))} className={`${btnClass} bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white`}>{n}</button>)}
        <button type="button" onClick={() => handleOp("-")} className={`${btnClass} bg-indigo-500 text-white`}>−</button>
        {[1,2,3].map(n => <button key={n} type="button" onClick={() => handleNum(String(n))} className={`${btnClass} bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white`}>{n}</button>)}
        <button type="button" onClick={() => handleOp("+")} className={`${btnClass} bg-indigo-500 text-white`}>+</button>
        <button type="button" onClick={() => handleNum("0")} className={`${btnClass} bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white col-span-2`}>0</button>
        <button type="button" onClick={() => { if (!display.includes(".")) setDisplay(display + "."); }} className={`${btnClass} bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white`}>.</button>
        <button type="button" onClick={handleEqual} className={`${btnClass} bg-indigo-600 text-white`}>=</button>
      </div>
    </div>
  );
}

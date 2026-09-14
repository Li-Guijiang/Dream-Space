"use client";

import { useState, useCallback, useMemo } from "react";

const BASES = [
  { id: 2, name: "二进制", prefix: "0b", chars: "01" },
  { id: 8, name: "八进制", prefix: "0o", chars: "01234567" },
  { id: 10, name: "十进制", prefix: "", chars: "0123456789" },
  { id: 16, name: "十六进制", prefix: "0x", chars: "0123456789abcdef" },
];

const BASE_ICONS: Record<number, React.ReactNode> = {
  2: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5" /><circle cx="16" cy="16" r="2.5" /><path d="M12 4v16" strokeLinecap="round" /><path d="M8 10.5l4 3m0 0l4-3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  8: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><circle cx="12" cy="16" r="4" /><circle cx="12" cy="8" r="1.5" fill="currentColor" /><circle cx="12" cy="16" r="1.5" fill="currentColor" /></svg>,
  10: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 4v16" strokeLinecap="round" /><path d="M9 4l4 2v12" strokeLinecap="round" strokeLinejoin="round" /><circle cx="17" cy="12" r="4" /><circle cx="17" cy="12" r="1.5" fill="currentColor" /></svg>,
  16: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7l4-3v16" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 7l4-3v16" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 7h12" strokeLinecap="round" /><circle cx="19" cy="17" r="2" fill="currentColor" /></svg>,
};

export default function BaseConverterApp() {
  const [inputBase, setInputBase] = useState(10);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const validate = useCallback((value: string, base: number) => {
    if (!value.trim()) { setError(""); return true; }
    const chars = BASES.find((b) => b.id === base)?.chars || "";
    const clean = value.replace(/\s/g, "").toLowerCase();
    for (const ch of clean) {
      if (!chars.includes(ch)) {
        setError(`"${ch}" 不是有效的 ${base} 进制字符`);
        return false;
      }
    }
    setError("");
    return true;
  }, []);

  const handleInputChange = (val: string) => {
    const clean = val.replace(/\s/g, "").toLowerCase();
    setInputValue(clean);
    validate(clean, inputBase);
  };

  const handleBaseChange = (base: number) => {
    setInputBase(base);
    validate(inputValue, base);
  };

  const results = useMemo(() => {
    if (!inputValue.trim() || error) return null;
    try {
      const decimal = parseInt(inputValue, inputBase);
      if (isNaN(decimal) || decimal < 0) return null;
      return BASES.map((b) => ({
        ...b,
        value: decimal.toString(b.id).toUpperCase(),
        isSource: b.id === inputBase,
      }));
    } catch {
      return null;
    }
  }, [inputValue, inputBase, error]);

  const handleSwap = (targetBase: number) => {
    if (!results) return;
    const target = results.find((r) => r.id === targetBase);
    if (target) {
      setInputBase(targetBase);
      setInputValue(target.value.toLowerCase());
      setError("");
    }
  };

  const commonValues = useMemo(() => {
    if (!inputValue.trim() || error || !results) return null;
    try {
      const decimal = parseInt(inputValue, inputBase);
      if (isNaN(decimal)) return null;
      return {
        byte: decimal < 256 ? `${decimal} Byte` : null,
        kb: decimal >= 1024 ? `${(decimal / 1024).toFixed(2)} KB` : null,
        signed8: decimal < 256 ? (decimal > 127 ? decimal - 256 : decimal).toString() : null,
      };
    } catch {
      return null;
    }
  }, [inputValue, inputBase, error, results]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Input section */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {BASES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleBaseChange(b.id)}
              title={b.name}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                inputBase === b.id
                  ? "bg-indigo-500/15 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-700/40"
              }`}
            >
              {BASE_ICONS[b.id]}
              {b.name.replace("进制", "")}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={`输入 ${BASES.find((b) => b.id === inputBase)?.name} 数值`}
            title="输入数值"
            className={`w-full px-3 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border text-sm font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 transition-shadow ${
              error
                ? "border-rose-300 dark:border-rose-600 focus:ring-rose-400/50"
                : "border-slate-200 dark:border-slate-700 focus:ring-indigo-400/50"
            }`}
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => { setInputValue(""); setError(""); }}
              title="清空"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-600/50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {error && <p className="text-[10px] text-rose-500 font-medium px-1">{error}</p>}
      </div>

      {/* Results */}
      <div className="flex-1 space-y-2">
        {results ? (
          results.filter((r) => !r.isSource).map((r) => (
            <div
              key={r.id}
              className="rounded-xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 p-3 hover:bg-white/60 dark:hover:bg-slate-700/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-500 dark:text-indigo-400">{BASE_ICONS[r.id]}</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{r.name}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(r.value, r.id)}
                    title="复制"
                    className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 text-[10px] rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all font-medium"
                  >
                    {copiedId === r.id ? "已复制" : "复制"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwap(r.id)}
                    title={`切换为 ${r.name} 输入`}
                    className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 text-[10px] rounded-lg text-indigo-500 hover:bg-indigo-500/10 transition-all font-medium"
                  >
                    切换
                  </button>
                </div>
              </div>
              <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100 break-all leading-relaxed">
                {r.prefix && <span className="text-slate-400 dark:text-slate-500">{r.prefix}</span>}
                {r.value}
              </p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <svg className="w-10 h-10 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            <span className="text-xs font-medium">输入数值开始转换</span>
          </div>
        )}
      </div>

      {/* Common values */}
      {commonValues && (
        <div className="flex gap-2 justify-center flex-wrap">
          {commonValues.byte && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">{commonValues.byte}</span>
          )}
          {commonValues.kb && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">{commonValues.kb}</span>
          )}
          {commonValues.signed8 !== null && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">有符号8位: {commonValues.signed8}</span>
          )}
        </div>
      )}
    </div>
  );
}

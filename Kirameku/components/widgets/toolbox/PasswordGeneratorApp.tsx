"use client";

import { useState, useCallback } from "react";

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const AMBIGUOUS = "O0Il1";

interface PasswordHistory {
  password: string;
  strength: number;
  time: number;
}

function getStrength(password: string): { score: number; label: string; color: string; barColor: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (password.length >= 20) score++;

  if (score <= 2) return { score, label: "弱", color: "text-red-500", barColor: "bg-red-500" };
  if (score <= 4) return { score, label: "中", color: "text-amber-500", barColor: "bg-amber-500" };
  if (score <= 5) return { score, label: "强", color: "text-green-500", barColor: "bg-green-500" };
  return { score, label: "极强", color: "text-emerald-500", barColor: "bg-emerald-500" };
}

export default function PasswordGeneratorApp() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<PasswordHistory[]>([]);
  const [batchCount, setBatchCount] = useState(1);
  const [batchPasswords, setBatchPasswords] = useState<string[]>([]);

  const generate = useCallback(() => {
    let chars = "";
    if (options.uppercase) chars += CHAR_SETS.uppercase;
    if (options.lowercase) chars += CHAR_SETS.lowercase;
    if (options.numbers) chars += CHAR_SETS.numbers;
    if (options.symbols) chars += CHAR_SETS.symbols;

    if (!chars) {
      setPassword("请至少选择一种字符类型");
      return;
    }

    if (options.excludeAmbiguous) {
      chars = chars.split("").filter((c) => !AMBIGUOUS.includes(c)).join("");
    }

    const genOne = () => {
      const arr = new Uint32Array(length);
      crypto.getRandomValues(arr);
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars[arr[i] % chars.length];
      }
      // 确保包含所有选中字符类型
      const required: string[] = [];
      if (options.uppercase) required.push(CHAR_SETS.uppercase[Math.floor(Math.random() * CHAR_SETS.uppercase.length)]);
      if (options.lowercase) required.push(CHAR_SETS.lowercase[Math.floor(Math.random() * CHAR_SETS.lowercase.length)]);
      if (options.numbers) required.push(CHAR_SETS.numbers[Math.floor(Math.random() * CHAR_SETS.numbers.length)]);
      if (options.symbols) required.push(CHAR_SETS.symbols[Math.floor(Math.random() * CHAR_SETS.symbols.length)]);

      const arr2 = result.split("");
      required.forEach((c, i) => {
        const pos = Math.floor(Math.random() * arr2.length);
        arr2[pos] = c;
      });
      return arr2.join("");
    };

    if (batchCount > 1) {
      const passwords = Array.from({ length: batchCount }, () => genOne());
      setBatchPasswords(passwords);
      setPassword(passwords[0]);
      const strength = getStrength(passwords[0]);
      setHistory((h) => [{ password: passwords[0], strength: strength.score, time: Date.now() }, ...h].slice(0, 10));
    } else {
      const pw = genOne();
      setPassword(pw);
      setBatchPasswords([]);
      const strength = getStrength(pw);
      setHistory((h) => [{ password: pw, strength: strength.score, time: Date.now() }, ...h].slice(0, 10));
    }
    setCopied(false);
  }, [length, options, batchCount]);

  const handleCopy = async (text?: string) => {
    try {
      await navigator.clipboard.writeText(text || password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // 至少保留一个字符类型
      const hasAny = next.uppercase || next.lowercase || next.numbers || next.symbols;
      if (!hasAny) return prev;
      return next;
    });
  };

  const strength = password ? getStrength(password) : null;

  const optionBtns: { key: keyof typeof options; label: string; desc: string }[] = [
    { key: "uppercase", label: "A-Z", desc: "大写字母" },
    { key: "lowercase", label: "a-z", desc: "小写字母" },
    { key: "numbers", label: "0-9", desc: "数字" },
    { key: "symbols", label: "#$%", desc: "符号" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 密码显示区 */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-3">
        {password ? (
          <>
            <div className="font-mono text-sm text-slate-900 dark:text-white break-all leading-relaxed select-all">
              {password}
            </div>
            {strength && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold ${strength.color}`}>强度: {strength.label}</span>
                  <span className="text-[10px] text-slate-400">{length}位</span>
                </div>
                <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${strength.barColor}`}
                    style={{ width: `${(strength.score / 7) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">点击生成密码</p>
        )}
      </div>

      {/* 批量密码展示 */}
      {batchPasswords.length > 1 && (
        <div className="mb-3 max-h-24 overflow-auto">
          {batchPasswords.map((pw, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 flex-1 truncate">{pw}</span>
              <button
                type="button"
                onClick={() => handleCopy(pw)}
                className="text-[10px] text-indigo-500 font-bold shrink-0"
              >
                复制
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 长度滑块 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">密码长度</span>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{length}</span>
        </div>
        <input
          type="range"
          min={6}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          title="密码长度"
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
          <span>6</span>
          <span>64</span>
        </div>
      </div>

      {/* 字符类型 */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {optionBtns.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggleOption(opt.key)}
            className={`py-1.5 rounded-lg text-center transition-colors ${
              options[opt.key]
                ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
            }`}
          >
            <div className="text-xs font-bold">{opt.label}</div>
            <div className="text-[8px]">{opt.desc}</div>
          </button>
        ))}
      </div>

      {/* 排除易混淆 & 批量数量 */}
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={() => toggleOption("excludeAmbiguous")}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
            options.excludeAmbiguous
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          }`}
        >
          <span className={`w-3 h-3 rounded-sm border flex items-center justify-center ${options.excludeAmbiguous ? "bg-amber-500 border-amber-500" : "border-slate-300 dark:border-slate-600"}`}>
            {options.excludeAmbiguous && <span className="text-white text-[8px]">✓</span>}
          </span>
          排除 O/0/I/l
        </button>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">批量</span>
          {[1, 3, 5, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setBatchCount(n)}
              className={`w-6 h-6 rounded-md text-[10px] font-bold transition-colors ${
                batchCount === n
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* 生成 & 复制 */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={generate}
          className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 transition-colors"
        >
          生成密码
        </button>
        <button
          type="button"
          onClick={() => handleCopy()}
          disabled={!password}
          className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors disabled:opacity-40"
        >
          {copied ? "已复制 ✓" : "复制"}
        </button>
      </div>

      {/* 历史 */}
      {history.length > 1 && (
        <div className="flex-1 overflow-auto border-t border-slate-100 dark:border-slate-800 pt-2">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">历史</div>
          {history.slice(1).map((h, i) => (
            <div key={i} className="flex items-center gap-2 py-0.5">
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 flex-1 truncate">{h.password}</span>
              <button type="button" onClick={() => handleCopy(h.password)} className="text-[9px] text-indigo-500">复制</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

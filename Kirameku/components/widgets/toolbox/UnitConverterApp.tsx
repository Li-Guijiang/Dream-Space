"use client";

import { useState, useMemo } from "react";

interface UnitDef {
  name: string;
  toBase: number; // 转换到基准单位的系数
}

interface CategoryDef {
  id: string;
  name: string;
  icon: string;
  base: string;
  units: Record<string, UnitDef>;
}

const categories: CategoryDef[] = [
  {
    id: "length",
    name: "长度",
    icon: "📏",
    base: "m",
    units: {
      mm: { name: "毫米", toBase: 0.001 },
      cm: { name: "厘米", toBase: 0.01 },
      m: { name: "米", toBase: 1 },
      km: { name: "千米", toBase: 1000 },
      inch: { name: "英寸", toBase: 0.0254 },
      ft: { name: "英尺", toBase: 0.3048 },
      yd: { name: "码", toBase: 0.9144 },
      mi: { name: "英里", toBase: 1609.344 },
      li: { name: "里", toBase: 500 },
      chi: { name: "尺", toBase: 1 / 3 },
      cun: { name: "寸", toBase: 1 / 30 },
    },
  },
  {
    id: "weight",
    name: "重量",
    icon: "⚖️",
    base: "kg",
    units: {
      mg: { name: "毫克", toBase: 0.000001 },
      g: { name: "克", toBase: 0.001 },
      kg: { name: "千克", toBase: 1 },
      t: { name: "吨", toBase: 1000 },
      oz: { name: "盎司", toBase: 0.0283495 },
      lb: { name: "磅", toBase: 0.453592 },
      jin: { name: "斤", toBase: 0.5 },
      liang: { name: "两", toBase: 0.05 },
    },
  },
  {
    id: "temp",
    name: "温度",
    icon: "🌡️",
    base: "c",
    units: {
      c: { name: "摄氏度°C", toBase: 1 },
      f: { name: "华氏度°F", toBase: 1 },
      k: { name: "开尔文K", toBase: 1 },
    },
  },
  {
    id: "area",
    name: "面积",
    icon: "📐",
    base: "m2",
    units: {
      mm2: { name: "平方毫米", toBase: 0.000001 },
      cm2: { name: "平方厘米", toBase: 0.0001 },
      m2: { name: "平方米", toBase: 1 },
      km2: { name: "平方千米", toBase: 1000000 },
      ha: { name: "公顷", toBase: 10000 },
      mu: { name: "亩", toBase: 666.667 },
      ac: { name: "英亩", toBase: 4046.86 },
      ft2: { name: "平方英尺", toBase: 0.092903 },
    },
  },
  {
    id: "volume",
    name: "体积",
    icon: "🧪",
    base: "l",
    units: {
      ml: { name: "毫升", toBase: 0.001 },
      l: { name: "升", toBase: 1 },
      m3: { name: "立方米", toBase: 1000 },
      gal: { name: "加仑", toBase: 3.78541 },
      qt: { name: "夸脱", toBase: 0.946353 },
      cup: { name: "杯", toBase: 0.236588 },
    },
  },
  {
    id: "speed",
    name: "速度",
    icon: "🚀",
    base: "ms",
    units: {
      ms: { name: "米/秒", toBase: 1 },
      kmh: { name: "千米/时", toBase: 1 / 3.6 },
      mph: { name: "英里/时", toBase: 0.44704 },
      kn: { name: "节", toBase: 0.514444 },
      mach: { name: "马赫", toBase: 340.3 },
    },
  },
  {
    id: "data",
    name: "数据",
    icon: "💾",
    base: "b",
    units: {
      b: { name: "字节", toBase: 1 },
      kb: { name: "KB", toBase: 1024 },
      mb: { name: "MB", toBase: 1048576 },
      gb: { name: "GB", toBase: 1073741824 },
      tb: { name: "TB", toBase: 1099511627776 },
    },
  },
  {
    id: "time",
    name: "时间",
    icon: "⏰",
    base: "s",
    units: {
      ms_time: { name: "毫秒", toBase: 0.001 },
      s: { name: "秒", toBase: 1 },
      min: { name: "分钟", toBase: 60 },
      h: { name: "小时", toBase: 3600 },
      d: { name: "天", toBase: 86400 },
      wk: { name: "周", toBase: 604800 },
      yr: { name: "年", toBase: 31536000 },
    },
  },
];

// 温度特殊转换
function convertTemp(value: number, from: string, to: string): number {
  if (from === to) return value;
  // 先转摄氏
  let celsius: number;
  if (from === "c") celsius = value;
  else if (from === "f") celsius = (value - 32) * 5 / 9;
  else celsius = value - 273.15; // k
  // 再转目标
  if (to === "c") return celsius;
  if (to === "f") return celsius * 9 / 5 + 32;
  return celsius + 273.15; // k
}

function formatNumber(n: number): string {
  if (n === 0) return "0";
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 0.0001 && n !== 0)) {
    return n.toExponential(4);
  }
  // 最多保留 8 位小数，去掉尾部零
  const s = n.toFixed(8);
  return s.replace(/\.?0+$/, "");
}

export default function UnitConverterApp() {
  const [catId, setCatId] = useState("length");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [inputValue, setInputValue] = useState("1");

  const cat = categories.find((c) => c.id === catId) || categories[0];
  const unitKeys = Object.keys(cat.units);

  // 初始化默认单位
  useMemo(() => {
    if (!fromUnit || !cat.units[fromUnit]) {
      setFromUnit(unitKeys[0] || "");
    }
    if (!toUnit || !cat.units[toUnit]) {
      setToUnit(unitKeys[1] || unitKeys[0] || "");
    }
  }, [catId]); // eslint-disable-line

  const result = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || !fromUnit || !toUnit) return "";

    if (catId === "temp") {
      return formatNumber(convertTemp(val, fromUnit, toUnit));
    }

    const from = cat.units[fromUnit];
    const to = cat.units[toUnit];
    if (!from || !to) return "";

    const baseVal = val * from.toBase;
    return formatNumber(baseVal / to.toBase);
  }, [inputValue, fromUnit, toUnit, catId, cat]);

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result) setInputValue(result);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 分类选择 */}
      <div className="flex gap-1 flex-wrap mb-3">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setCatId(c.id); setInputValue("1"); }}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
              catId === c.id
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* 输入区 */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-2">
        {/* 来源 */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            title="输入数值"
            placeholder="0"
            className="flex-1 text-lg font-black bg-transparent text-slate-900 dark:text-white outline-none min-w-0"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            title="来源单位"
            className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none shrink-0"
          >
            {unitKeys.map((k) => (
              <option key={k} value={k}>{cat.units[k].name}</option>
            ))}
          </select>
        </div>

        {/* 交换按钮 */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            type="button"
            onClick={swap}
            className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* 结果 */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 text-lg font-black text-indigo-600 dark:text-indigo-400 select-all min-w-0">
            {result || "—"}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            title="目标单位"
            className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none shrink-0"
          >
            {unitKeys.map((k) => (
              <option key={k} value={k}>{cat.units[k].name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 快捷换算列表 */}
      <div className="flex-1 overflow-auto">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
          {inputValue || "0"} {cat.units[fromUnit]?.name || ""} 等于
        </div>
        {unitKeys.filter((k) => k !== fromUnit).map((k) => {
          let val: string;
          const numVal = parseFloat(inputValue);
          if (isNaN(numVal)) {
            val = "—";
          } else if (catId === "temp") {
            val = formatNumber(convertTemp(numVal, fromUnit, k));
          } else {
            const from = cat.units[fromUnit];
            const to = cat.units[k];
            val = from && to ? formatNumber((numVal * from.toBase) / to.toBase) : "—";
          }
          return (
            <div
              key={k}
              className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded px-1"
              onClick={() => { setToUnit(k); }}
            >
              <span className="text-xs text-slate-600 dark:text-slate-400">{cat.units[k].name}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 select-all">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

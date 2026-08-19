"use client";

import { useState } from "react";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

const lunarMonths = ["正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","冬月","腊月"];
const lunarDays = ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];

// 农历数据 2024-2030（每行：闰月月份, 12个月大小月, 闰月大小月）
// 0=小月29天, 1=大月30天
const lunarYearData: Record<number, { leap: number; months: number[]; leapDays?: number }> = {
  2024: { leap: 0, months: [0,1,0,1,0,1,0,0,1,0,1,0] },
  2025: { leap: 6, months: [1,0,1,0,1,0,1,0,0,1,0,1], leapDays: 0 },
  2026: { leap: 0, months: [0,1,0,1,0,0,1,0,1,0,1,0] },
  2027: { leap: 0, months: [1,0,1,0,1,0,0,1,0,1,0,1] },
  2028: { leap: 5, months: [0,1,0,1,0,1,0,0,1,0,1,0], leapDays: 1 },
  2029: { leap: 0, months: [0,1,0,1,1,0,1,0,0,1,0,1] },
  2030: { leap: 0, months: [1,0,1,0,1,1,0,1,0,0,1,0] },
};

// 公历转农历（简化版，基于查表）
function solarToLunar(y: number, m: number, d: number): { month: number; day: number; isLeap: boolean; monthName: string; dayName: string } {
  // 以2026年1月29日(农历正月初一)为基准
  const base = new Date(2026, 0, 29);
  const target = new Date(y, m - 1, d);
  let diff = Math.floor((target.getTime() - base.getTime()) / 86400000);

  let year = 2026;
  let month = 1;
  let day = 1;
  const isLeap = false;

  if (diff < 0) {
    // 往回推
    diff = -diff;
    year = 2025;
    month = 12;
    day = 1;
    // 简化：直接用循环推算
    for (let i = 0; i < diff; i++) {
      day--;
      if (day < 1) {
        month--;
        if (month < 1) { month = 12; year--; }
        const yd = lunarYearData[year];
        if (yd) {
          const mIdx = month - 1;
          day = yd.months[mIdx] ? 30 : 29;
        } else {
          day = 29;
        }
      }
    }
  } else {
    // 往后推
    for (let i = 0; i < diff; i++) {
      day++;
      const yd = lunarYearData[year];
      const maxDay = yd ? (yd.months[month - 1] ? 30 : 29) : 29;
      if (day > maxDay) {
        day = 1;
        month++;
        if (month > 12) { month = 1; year++; }
      }
    }
  }

  return {
    month,
    day,
    isLeap,
    monthName: lunarMonths[month - 1] || `${month}月`,
    dayName: lunarDays[day - 1] || `${day}`,
  };
}

// 公历节日
const solarHolidays: Record<string, string> = {
  "1-1": "元旦", "2-14": "情人节", "3-8": "妇女节", "3-12": "植树节",
  "4-1": "愚人节", "5-1": "劳动节", "5-4": "青年节", "6-1": "儿童节",
  "7-1": "建党节", "8-1": "建军节", "9-10": "教师节", "10-1": "国庆节",
  "12-24": "平安夜", "12-25": "圣诞节",
};

// 农历节日
const lunarHolidays: Record<string, string> = {
  "1-1": "春节", "1-15": "元宵节", "5-5": "端午节", "7-7": "七夕",
  "7-15": "中元节", "8-15": "中秋节", "9-9": "重阳节", "12-30": "除夕",
};

// 节气（近似日期，每年略有变化）
const solarTerms: Record<string, string> = {
  "1-5": "小寒", "1-20": "大寒", "2-3": "立春", "2-18": "雨水",
  "3-5": "惊蛰", "3-20": "春分", "4-4": "清明", "4-19": "谷雨",
  "5-5": "立夏", "5-20": "小满", "6-5": "芒种", "6-21": "夏至",
  "7-7": "小暑", "7-22": "大暑", "8-7": "立秋", "8-22": "处暑",
  "9-7": "白露", "9-22": "秋分", "10-8": "寒露", "10-23": "霜降",
  "11-7": "立冬", "11-22": "小雪", "12-7": "大雪", "12-21": "冬至",
};

// 备忘录存储
const MEMO_KEY = "calendar-memos";

function loadMemos(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(MEMO_KEY) || "{}");
  } catch { return {}; }
}

export default function CalendarApp() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState<number | null>(new Date().getDate());
  const [memos, setMemos] = useState<Record<string, string>>(() => loadMemos());
  const [editingMemo, setEditingMemo] = useState(false);
  const [memoText, setMemoText] = useState("");
  const today = new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => { setViewDate(new Date(year, month - 1, 1)); setSelected(null); };
  const nextMonth = () => { setViewDate(new Date(year, month + 1, 1)); setSelected(null); };
  const goToday = () => { setViewDate(new Date()); setSelected(new Date().getDate()); };

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isWeekend = (index: number) => index % 7 === 0 || index % 7 === 6;

  const getDayInfo = (d: number) => {
    const lunar = solarToLunar(year, month + 1, d);
    const solarKey = `${month + 1}-${d}`;
    const lunarKey = `${lunar.month}-${lunar.day}`;
    const termKey = `${month + 1}-${d}`;
    const holiday = solarHolidays[solarKey] || lunarHolidays[lunarKey] || solarTerms[termKey] || "";
    return { lunar, holiday };
  };

  const selectedInfo = selected ? getDayInfo(selected) : null;
  const selectedMemoKey = selected ? `${year}-${month + 1}-${selected}` : "";

  const saveMemo = () => {
    if (!selected) return;
    const newMemos = { ...memos };
    if (memoText.trim()) {
      newMemos[selectedMemoKey] = memoText.trim();
    } else {
      delete newMemos[selectedMemoKey];
    }
    setMemos(newMemos);
    localStorage.setItem(MEMO_KEY, JSON.stringify(newMemos));
    setEditingMemo(false);
  };

  const hasMemo = (d: number) => !!memos[`${year}-${month + 1}-${d}`];

  return (
    <div className="flex flex-col h-full">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button type="button" onClick={goToday} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-500 transition-colors">
          {year}年{month + 1}月
        </button>
        <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-0.5 text-center mb-3">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`text-[10px] font-bold py-1 ${i === 0 || i === 6 ? "text-rose-400" : "text-slate-400 dark:text-slate-500"}`}>{d}</div>
        ))}
        {days.map((d, i) => {
          if (d === null) return <div key={i} />;
          const info = getDayInfo(d);
          const holiday = info.holiday;
          const todayFlag = isToday(d);
          const selectedFlag = d === selected;
          const weekendFlag = isWeekend(i);
          const memoFlag = hasMemo(d);

          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(d)}
              className={`relative flex flex-col items-center py-1 rounded-lg transition-colors ${
                selectedFlag
                  ? "bg-indigo-500/10 dark:bg-indigo-500/20 ring-1 ring-indigo-500"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className={`text-[11px] leading-tight ${
                todayFlag && !selectedFlag
                  ? "bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold"
                  : selectedFlag
                  ? "font-bold text-indigo-600 dark:text-indigo-400"
                  : weekendFlag
                  ? "text-rose-400"
                  : "text-slate-700 dark:text-slate-300"
              }`}>
                {d}
              </span>
              <span className={`text-[7px] leading-none mt-0.5 truncate w-full px-0.5 ${
                holiday ? "text-amber-500 font-bold" : "text-slate-400 dark:text-slate-600"
              }`}>
                {holiday || info.lunar.dayName}
              </span>
              {memoFlag && <div className="absolute top-0.5 right-1 w-1 h-1 rounded-full bg-pink-500" />}
            </button>
          );
        })}
      </div>

      {/* 选中日期详情 */}
      {selected && selectedInfo && (
        <div className="flex-1 border-t border-slate-100 dark:border-slate-800 pt-2 overflow-auto">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {month + 1}月{selected}日
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                {selectedInfo.lunar.monthName}{selectedInfo.lunar.dayName}
              </span>
              {selectedInfo.holiday && (
                <span className="text-xs text-amber-500 ml-2 font-bold">{selectedInfo.holiday}</span>
              )}
            </div>
          </div>

          {/* 备忘录 */}
          <div className="mt-1">
            {editingMemo ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="写点什么..."
                  maxLength={50}
                  className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400"
                  onKeyDown={(e) => e.key === "Enter" && saveMemo()}
                  autoFocus
                />
                <button type="button" onClick={saveMemo} className="px-2 py-1 rounded-lg bg-indigo-500 text-white text-xs font-bold">保存</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMemoText(memos[selectedMemoKey] || "");
                  setEditingMemo(true);
                }}
                className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {memos[selectedMemoKey] ? (
                  <span className="text-slate-700 dark:text-slate-300">{memos[selectedMemoKey]}</span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">+ 添加备忘</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

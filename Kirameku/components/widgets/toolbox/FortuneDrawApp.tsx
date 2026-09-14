"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface Fortune {
  level: string;
  levelColor: string;
  poem: string;
  advice: string;
  desc: string;
}

const fortunes: Fortune[] = [
  { level: "上上签", levelColor: "text-red-500", poem: "龙飞凤舞庆升平，万事亨通福自生。", advice: "所求皆遂，百事大吉。", desc: "此签大吉，诸事皆宜，正是鸿运当头之时。" },
  { level: "上上签", levelColor: "text-red-500", poem: "春风得意马蹄疾，一日看尽长安花。", advice: "把握时机，乘风破浪。", desc: "运势极佳，无论事业还是感情，都将迎来美好的转折。" },
  { level: "上上签", levelColor: "text-red-500", poem: "紫气东来照四方，吉星高照保安康。", advice: "贵人相助，逢凶化吉。", desc: "福星高照，贵人运旺盛，凡事皆有贵人相助。" },
  { level: "上签", levelColor: "text-orange-500", poem: "云开月明正当时，柳暗花明又一村。", advice: "坚持到底，终见曙光。", desc: "虽然眼前有些困难，但转机就在前方。" },
  { level: "上签", levelColor: "text-orange-500", poem: "春来草木皆生意，丰年禾黍尽登场。", advice: "顺势而为，水到渠成。", desc: "时运正佳，适合开展新计划，一切将顺风顺水。" },
  { level: "上签", levelColor: "text-orange-500", poem: "千里姻缘一线牵，有情人终成眷属。", advice: "缘分天定，珍惜眼前。", desc: "桃花运旺盛，感情方面将有好消息传来。" },
  { level: "中签", levelColor: "text-amber-500", poem: "山重水复疑无路，柳暗花明又一村。", advice: "静待时机，不宜急躁。", desc: "运势平稳，不宜冒进，守成为上策。" },
  { level: "中签", levelColor: "text-amber-500", poem: "月有阴晴圆缺，人有悲欢离合。", advice: "平常心态，顺其自然。", desc: "世事无常，保持平常心，方能从容应对。" },
  { level: "中签", levelColor: "text-amber-500", poem: "行到水穷处，坐看云起时。", advice: "以退为进，韬光养晦。", desc: "暂时的停顿是为了更好的出发，不必焦虑。" },
  { level: "中签", levelColor: "text-amber-500", poem: "一壶浊酒喜相逢，古今多少事，都付笑谈中。", advice: "看淡得失，随遇而安。", desc: "人生如戏，不必太执着于眼前的得失。" },
  { level: "下签", levelColor: "text-blue-500", poem: "风急天高猿啸哀，渚清沙白鸟飞回。", advice: "谨慎行事，三思后行。", desc: "运势欠佳，凡事需多加小心，切勿冲动。" },
  { level: "下签", levelColor: "text-blue-500", poem: "欲渡黄河冰塞川，将登太行雪满山。", advice: "暂时蛰伏，等待时机。", desc: "眼前阻碍较多，不宜强行推进，暂缓为宜。" },
  { level: "下签", levelColor: "text-blue-500", poem: "独在异乡为异客，每逢佳节倍思亲。", advice: "注意健康，多联系亲友。", desc: "近期可能感到孤独或思乡，多与亲友联络。" },
  { level: "下下签", levelColor: "text-slate-500", poem: "屋漏偏逢连夜雨，船迟又遇打头风。", advice: "守拙安分，不宜妄动。", desc: "诸事不顺，宜低调行事，切勿冒险。" },
  { level: "下下签", levelColor: "text-slate-500", poem: "黑云压城城欲摧，甲光向日金鳞开。", advice: "破釜沉舟，背水一战。", desc: "虽处困境，但绝境逢生，关键在于勇气。" },
];

type DrawState = "idle" | "shaking" | "drawn";

export default function FortuneDrawApp() {
  const [state, setState] = useState<DrawState>("idle");
  const [current, setCurrent] = useState<Fortune | null>(null);
  const [history, setHistory] = useState<{ fortune: Fortune; time: number }[]>([]);
  const [shakeAngle, setShakeAngle] = useState(0);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  const draw = useCallback(() => {
    if (state === "shaking") return;
    setState("shaking");
    setCurrent(null);

    // 摇签动画
    let ticks = 0;
    animRef.current = setInterval(() => {
      ticks++;
      setShakeAngle(Math.sin(ticks * 0.8) * 15);
      if (ticks >= 20) {
        if (animRef.current) clearInterval(animRef.current);
        setShakeAngle(0);
        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        setCurrent(fortune);
        setHistory((h) => [{ fortune, time: Date.now() }, ...h].slice(0, 20));
        setState("drawn");
      }
    }, 60);
  }, [state]);

  useEffect(() => {
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, []);

  // 统计
  const levelCounts = history.reduce((acc, h) => {
    acc[h.fortune.level] = (acc[h.fortune.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full">
      {/* 签筒展示区 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {/* 签筒 */}
        <div
          className="relative cursor-pointer select-none"
          onClick={draw}
          style={{ transform: `rotate(${shakeAngle}deg)`, transition: "transform 0.05s" }}
        >
          <svg viewBox="0 0 120 160" className="w-24 h-32">
            {/* 签筒 */}
            <path d="M30 50 L20 150 Q20 155 25 155 L95 155 Q100 155 100 150 L90 50 Z" fill="#8b5cf6" opacity="0.15" stroke="#8b5cf6" strokeWidth="2" />
            <ellipse cx="60" cy="50" rx="35" ry="10" fill="#8b5cf6" opacity="0.1" stroke="#8b5cf6" strokeWidth="2" />
            {/* 签条 */}
            <rect x="45" y="20" width="6" height="80" rx="3" fill="#f59e0b" opacity="0.8" transform={`rotate(${-8 + shakeAngle * 0.3}, 48, 100)`} />
            <rect x="55" y="25" width="6" height="75" rx="3" fill="#f59e0b" opacity="0.6" transform={`rotate(${5 + shakeAngle * 0.2}, 58, 100)`} />
            <rect x="65" y="18" width="6" height="82" rx="3" fill="#f59e0b" opacity="0.7" transform={`rotate(${12 + shakeAngle * 0.4}, 68, 100)`} />
            {/* 签筒装饰 */}
            <rect x="25" y="48" width="70" height="6" rx="3" fill="#8b5cf6" opacity="0.3" />
          </svg>
        </div>

        {state === "idle" && (
          <p className="text-sm text-slate-400 dark:text-slate-500">点击签筒开始抽签</p>
        )}

        {state === "shaking" && (
          <p className="text-sm text-indigo-500 font-bold animate-pulse">摇签中...</p>
        )}

        {/* 签文展示 */}
        {state === "drawn" && current && (
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">
            <div className={`text-lg font-black mb-2 ${current.levelColor}`}>{current.level}</div>
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed mb-2">
              「{current.poem}」
            </p>
            <div className="text-xs text-indigo-500 dark:text-indigo-400 font-bold mb-1">{current.advice}</div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{current.desc}</p>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <button
        type="button"
        onClick={draw}
        disabled={state === "shaking"}
        className="w-full py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50 mb-2"
      >
        {state === "shaking" ? "摇签中..." : state === "drawn" ? "再抽一签" : "开始抽签"}
      </button>

      {/* 统计 */}
      {history.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
          <div className="flex justify-between text-[10px]">
            {["上上签", "上签", "中签", "下签", "下下签"].map((level) => {
              const count = levelCounts[level] || 0;
              const color = fortunes.find((f) => f.level === level)?.levelColor || "text-slate-400";
              return (
                <div key={level} className="text-center">
                  <div className={`font-bold ${color}`}>{count}</div>
                  <div className="text-slate-400 dark:text-slate-500 text-[9px]">{level}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

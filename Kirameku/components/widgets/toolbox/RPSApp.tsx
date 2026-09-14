"use client";

import { useState, useRef } from "react";

type Choice = "rock" | "paper" | "scissors";
type Outcome = "win" | "lose" | "draw";

interface RoundResult {
  player: Choice;
  computer: Choice;
  outcome: Outcome;
  id: number;
}

const CHOICES: { id: Choice; name: string; icon: React.ReactNode }[] = [
  {
    id: "rock",
    name: "石头",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5.5V3a1 1 0 00-2 0v2.5" />
        <path d="M15 5.5V4a1 1 0 00-2 0v1.5" />
        <path d="M19 8V6a1 1 0 00-2 0v2" />
        <path d="M7 8V5a1 1 0 00-2 0v8.5a5.5 5.5 0 0011 0V10a1 1 0 00-2 0" />
        <path d="M7 13.5V10" />
      </svg>
    ),
  },
  {
    id: "paper",
    name: "布",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 00-4 0v1" />
        <path d="M14 10V4a2 2 0 00-4 0v6" />
        <path d="M10 10.5V8a2 2 0 00-4 0v8a8 8 0 0016 0v-5a2 2 0 00-4 0" />
      </svg>
    ),
  },
  {
    id: "scissors",
    name: "剪刀",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    ),
  },
];

const OUTCOME_CONFIG: Record<Outcome, { text: string; color: string; bg: string }> = {
  win: { text: "你赢了!", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/15" },
  lose: { text: "你输了!", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/15" },
  draw: { text: "平局!", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/15" },
};

function getChoiceIcon(choice: Choice): React.ReactNode {
  return CHOICES.find((c) => c.id === choice)?.icon;
}

function getChoiceName(choice: Choice): string {
  return CHOICES.find((c) => c.id === choice)?.name || "";
}

function judge(player: Choice, computer: Choice): Outcome {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) return "win";
  return "lose";
}

export default function RPSApp() {
  const [result, setResult] = useState<RoundResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const nextId = useRef(0);

  const stats = {
    total: history.length,
    win: history.filter((r) => r.outcome === "win").length,
    lose: history.filter((r) => r.outcome === "lose").length,
    draw: history.filter((r) => r.outcome === "draw").length,
  };

  const winRate = stats.total > 0 ? Math.round((stats.win / stats.total) * 100) : 0;

  const play = (choice: Choice) => {
    if (playing) return;
    setPlaying(true);
    setResult(null);
    setComputerChoice(null);

    // Shuffle animation
    const choices: Choice[] = ["rock", "paper", "scissors"];
    let count = 0;
    const shuffle = setInterval(() => {
      setComputerChoice(choices[count % 3]);
      count++;
      if (count > 6) {
        clearInterval(shuffle);
        const comp = choices[Math.floor(Math.random() * 3)];
        const outcome = judge(choice, comp);
        const round: RoundResult = { player: choice, computer: comp, outcome, id: nextId.current++ };
        setComputerChoice(comp);
        setResult(round);
        setHistory((prev) => [round, ...prev].slice(0, 50));
        setPlaying(false);
      }
    }, 80);
  };

  const clearHistory = () => {
    setHistory([]);
    setResult(null);
    setComputerChoice(null);
    nextId.current = 0;
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Battle area */}
      <div className="flex items-center justify-center gap-4 py-2">
        {/* Player side */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">你</span>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
            result
              ? result.outcome === "win"
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10"
                : result.outcome === "lose"
                ? "bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
          }`}>
            {result ? getChoiceIcon(result.player) : (
              <span className="text-2xl">?</span>
            )}
          </div>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1">
          <span className={`text-lg font-black transition-colors ${
            result ? OUTCOME_CONFIG[result.outcome].color : "text-slate-300 dark:text-slate-600"
          }`}>
            {result ? OUTCOME_CONFIG[result.outcome].text : "VS"}
          </span>
          {result && (
            <span className="text-[10px] text-slate-400">
              {getChoiceName(result.player)} vs {getChoiceName(result.computer)}
            </span>
          )}
        </div>

        {/* Computer side */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">电脑</span>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
            result
              ? result.outcome === "lose"
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10"
                : result.outcome === "win"
                ? "bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
          }`}>
            {computerChoice ? getChoiceIcon(computerChoice) : (
              <span className="text-2xl">?</span>
            )}
          </div>
        </div>
      </div>

      {/* Choice buttons */}
      <div className="flex gap-2 justify-center">
        {CHOICES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => play(c.id)}
            disabled={playing}
            title={c.name}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl border transition-all ${
              playing
                ? "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95 hover:shadow-md"
            }`}
          >
            {c.icon}
            <span className="text-[10px] font-bold">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="space-y-2">
          <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            {stats.win > 0 && <div className="bg-emerald-400 transition-all duration-500" style={{ width: `${(stats.win / stats.total) * 100}%` }} />}
            {stats.draw > 0 && <div className="bg-amber-400 transition-all duration-500" style={{ width: `${(stats.draw / stats.total) * 100}%` }} />}
            {stats.lose > 0 && <div className="bg-rose-400 transition-all duration-500" style={{ width: `${(stats.lose / stats.total) * 100}%` }} />}
          </div>

          <div className="flex items-center justify-between text-[10px] font-medium">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-600 dark:text-slate-300">胜 {stats.win}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-600 dark:text-slate-300">平 {stats.draw}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-slate-600 dark:text-slate-300">负 {stats.lose}</span>
              </span>
              <span className="text-indigo-500 dark:text-indigo-400 font-bold">胜率 {winRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">共 {stats.total} 局</span>
              <button type="button" onClick={clearHistory} title="清空记录"
                className="text-slate-400 hover:text-rose-500 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Recent history */}
          <div className="flex gap-1 flex-wrap">
            {history.slice(0, 15).map((r) => (
              <div
                key={r.id}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                  r.outcome === "win"
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    : r.outcome === "lose"
                    ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                    : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                }`}
                title={`你:${getChoiceName(r.player)} 电脑:${getChoiceName(r.computer)}`}
              >
                {r.outcome === "win" ? "胜" : r.outcome === "lose" ? "负" : "平"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

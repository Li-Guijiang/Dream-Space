"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Calendar, FileText, MessageCircle, Gamepad2,
  TrendingUp, Clock, Code2, Sparkles, Heart,
  Zap, Coffee, Music,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { siteConfig } from "@/siteConfig";
import { postsData } from "@/data/posts";
import { chattersData } from "@/data/chatters";
import { getPosts, getPostsCount, type PostItem } from "@/app/api/posts";
import { getChatters, getChattersCount, type ChatterItem } from "@/app/api/chatters";
import { getMessages } from "@/app/api/messages";
import { getAlbums } from "@/app/api/albums";

/* ── helpers ── */
function getDaysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 864e5);
}

function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (target <= 0) return;
    const t0 = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const current = Math.round(p * target);
      if (p >= 1) {
        setCount(target);
        return;
      }
      setCount(current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return <span>{count}</span>;
}

/* ── data ── */
const quotes = [
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "过早优化是万恶之源。", author: "Donald Knuth" },
  { text: "简单是可靠的前提。", author: "Edsger Dijkstra" },
  { text: "先让它工作，再让它正确，最后让它快。", author: "Kent Beck" },
  { text: "任何足够先进的技术都与魔法无异。", author: "Arthur C. Clarke" },
  { text: "世界上最危险的一句话就是：一直都是这样做的。", author: "Grace Hopper" },
];

const techStack = [
  { name: "Next.js 15", color: "#0ea5e9", side: "前端" },
  { name: "React 19", color: "#22d3ee", side: "前端" },
  { name: "Tailwind 4", color: "#2dd4bf", side: "前端" },
  { name: "TypeScript", color: "#3b82f6", side: "前端" },
  { name: "Framer Motion", color: "#ec4899", side: "前端" },
  { name: "FastAPI", color: "#009688", side: "后端" },
  { name: "SQLModel", color: "#ef4444", side: "后端" },
  { name: "PostgreSQL", color: "#336791", side: "后端" },
  { name: "Uvicorn", color: "#1e293b", side: "后端" },
];

const recentPosts = [...postsData.slice(0, 3), ...chattersData.slice(0, 3)]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 6);

/* ── animation ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

/* ── custom tooltip ── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border border-slate-200/50 dark:border-white/10 text-xs">
      <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey}: {p.value} 篇
        </p>
      ))}
    </div>
  );
}

/* ── page ── */
export default function GardenPage() {
  const [quoteIdx] = useState(() => Math.floor(Math.random() * quotes.length));
  const [mounted] = useState(() => {
    if (typeof window === "undefined") return false;
    return true;
  });
  const [recentPosts, setRecentPosts] = useState<PostItem[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [chatterCount, setChatterCount] = useState(0);
  const [trendData, setTrendData] = useState<Array<{ date: string; 文章: number; 说说: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [activePie, setActivePie] = useState<number | undefined>();
  const days = getDaysSince(siteConfig.buildDate);
  const q = quotes[quoteIdx];

  useEffect(() => {
    getPosts({ status: "published", page: 1, size: 6 }).then(setRecentPosts).catch(() => {});
    getPostsCount("published").then((d) => setPostCount(d.count)).catch(() => {});
    getChattersCount("published").then((d) => setChatterCount(d.count)).catch(() => {});
    Promise.all([
      getPosts({ status: "published", page: 1, size: 100 }),
      getChatters({ status: "published", page: 1, size: 100 }),
    ]).then(([posts, chatters]) => {
      const map = new Map<string, { 文章: number; 说说: number }>();
      posts.forEach((p) => {
        const d = (p.published_at ?? p.created_at).slice(0, 10);
        const entry = map.get(d) ?? { 文章: 0, 说说: 0 };
        entry.文章++;
        map.set(d, entry);
      });
      chatters.forEach((c) => {
        const d = c.created_at.slice(0, 10);
        const entry = map.get(d) ?? { 文章: 0, 说说: 0 };
        entry.说说++;
        map.set(d, entry);
      });
      const days10 = Array.from({ length: 10 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 9 + i);
        return d.toISOString().slice(0, 10);
      });
      const data = days10.map((d) => ({
        date: d.slice(5),
        文章: map.get(d)?.文章 ?? 0,
        说说: map.get(d)?.说说 ?? 0,
      }));
      setTrendData(data);
    }).catch(() => {});
    Promise.all([
      getPostsCount("published"),
      getChattersCount("published"),
      getMessages({ page: 1, size: 100 }),
      getAlbums(),
    ]).then(([posts, chatters, messages, albums]) => {
      const countReplies = (arr: typeof messages): number =>
        arr.reduce((s, m) => s + 1 + countReplies(m.replies ?? []), 0);
      const photoCount = albums.reduce((sum, a) => sum + a.photo_count, 0);
      const colors = ["#0ea5e9", "#f59e0b", "#8b5cf6", "#ec4899"];
      setCategoryData([
        { name: "文章", value: posts.count, color: colors[0] },
        { name: "说说", value: chatters.count, color: colors[1] },
        { name: "留言", value: countReplies(messages), color: colors[2] },
        { name: "照片", value: photoCount, color: colors[3] },
      ]);
    }).catch(() => {});
  }, []);

  const statCards = [
    { icon: Calendar, label: "运行天数", value: days, suffix: " 天", color: "from-indigo-500 to-indigo-600", ring: "ring-indigo-500/20" },
    { icon: FileText, label: "文章", value: postCount, suffix: " 篇", color: "from-sky-500 to-sky-600", ring: "ring-sky-500/20" },
    { icon: MessageCircle, label: "说说", value: chatterCount, suffix: " 条", color: "from-amber-500 to-amber-600", ring: "ring-amber-500/20" },
    { icon: Gamepad2, label: "工具", value: 54, suffix: " 个", color: "from-rose-500 to-rose-600", ring: "ring-rose-500/20" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-5 lg:space-y-6">
      {/* ── top bar ── */}
      <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">仪表盘</h1>
          <p className="text-xs text-slate-400">欢迎回来，这里是星港的数据概览</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          {mounted && new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </div>
      </motion.div>

      {/* ── stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((s) => (
          <motion.div
            key={s.label}
            variants={fadeIn}
            className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 md:p-5 border border-slate-200/50 dark:border-white/5 transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg ring-4 ${s.ring}`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              <AnimatedNumber target={s.value} />
              <span className="text-sm font-normal text-slate-400 ml-1">{s.suffix}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* line chart */}
        <motion.div variants={fadeIn} className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 md:p-5 border border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">发布趋势</h2>
          </div>
          <div className="h-52 md:h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="文章" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="说说" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: "#f59e0b" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* pie chart */}
        <motion.div variants={fadeIn} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 md:p-5 border border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">分类占比</h2>
          </div>
          <div className="h-52 md:h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="70%"
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  {...{ activeIndex: activePie, activeOuterRadius: "75%" }}
                  onMouseEnter={(_, i) => setActivePie(i)}
                  onMouseLeave={() => setActivePie(undefined)}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    const units: Record<string, string> = { 文章: "篇", 说说: "条", 留言: "条", 照片: "张" };
                    return [`${value} ${units[name as string] ?? ""}`, name];
                  }}
                  contentStyle={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => <span className="text-xs text-slate-500 dark:text-slate-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* recent posts */}
        <motion.div variants={fadeIn} className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 md:p-5 border border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-sky-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">最近文章</h2>
          </div>
          <div className="space-y-3">
            {recentPosts.map((p) => (
              <div key={p.id} className="flex items-start gap-3 group">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 group-hover:scale-150 transition-transform" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-sky-500 transition-colors">
                    {p.title}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {(p.published_at ?? p.created_at).slice(0, 10)} · {p.category || "未分类"} · {p.views} 阅读
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* tech stack */}
        <motion.div variants={fadeIn} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 md:p-5 border border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-sky-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">技术栈</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {techStack.map((t) => (
              <div key={t.name} className="flex items-center gap-2.5 group cursor-default">
                <div
                  className="w-2 h-2 rounded-full shrink-0 group-hover:scale-150 transition-transform"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                  {t.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* quote + fun facts */}
        <motion.div variants={fadeIn} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 md:p-5 border border-slate-200/50 dark:border-white/5 flex flex-col gap-5">
          {/* quote */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">今日语录</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
              &ldquo;{q.text}&rdquo;
            </p>
            <p className="text-[10px] text-slate-400 mt-1.5 text-right">— {q.author}</p>
          </div>

          {/* divider */}
          <div className="border-t border-slate-200/50 dark:border-white/5" />

          {/* fun facts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">趣味数据</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Coffee, label: "咖啡", value: "∞", color: "text-amber-500" },
                { icon: Zap, label: "修 Bug", value: "数不清", color: "text-yellow-500" },
                { icon: Heart, label: "热爱", value: "100%", color: "text-rose-500" },
                { icon: Music, label: "BGM", value: "循环", color: "text-violet-500" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-100/50 dark:bg-slate-700/30">
                  <f.icon className={`w-3.5 h-3.5 ${f.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{f.value}</p>
                    <p className="text-[10px] text-slate-400 truncate">{f.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── bottom bar ── */}
      <motion.div variants={fadeIn} className="text-center py-2">
        <p className="text-[10px] text-slate-400 dark:text-slate-600">
          悄悄告诉你，这个页面的暗号是 5201314
        </p>
      </motion.div>
    </motion.div>
  );
}

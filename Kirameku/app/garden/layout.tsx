"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, redirect } from "next/navigation";
import {
  ArrowLeft, LayoutDashboard, MapPin, Orbit, CloudRain, User,
  Sparkles, Droplets, Flower2, Mountain, Code2, Grid3x3,
  Sigma, BarChart3, FileText, Braces, Palette, QrCode, Star, Box,
} from "lucide-react";

const navItems = [
  { href: "/garden", label: "仪表盘", icon: LayoutDashboard },
  { href: "/garden/map", label: "地图", icon: MapPin },
  { href: "/garden/solar", label: "太阳系", icon: Orbit },
  { href: "/garden/rain", label: "代码雨", icon: CloudRain },
  { href: "/garden/visitor", label: "访客信息", icon: User },
  { href: "/garden/fireworks", label: "烟花", icon: Sparkles },
  { href: "/garden/fluid", label: "流体", icon: Droplets },
  { href: "/garden/kaleidoscope", label: "万花筒", icon: Flower2 },
  { href: "/garden/sand", label: "重力沙子", icon: Mountain },
  { href: "/garden/python", label: "Python", icon: Code2 },
  { href: "/garden/life", label: "生命游戏", icon: Grid3x3 },
  { href: "/garden/math", label: "数学可视化", icon: Sigma },
  { href: "/garden/sorting", label: "排序算法", icon: BarChart3 },
  { href: "/garden/markdown", label: "Markdown", icon: FileText },
  { href: "/garden/json", label: "JSON", icon: Braces },
  { href: "/garden/color", label: "颜色工具", icon: Palette },
  { href: "/garden/studio", label: "3D工作室", icon: Box },
  { href: "/garden/qrcode", label: "二维码", icon: QrCode },
  { href: "/garden/stars", label: "星空", icon: Star },
];

export default function GardenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [unlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("garden-unlock") === "true";
  });

  if (!unlocked) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex -mt-16">
      {/* 侧边栏 - 桌面端 */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-slate-200/60 dark:border-white/5 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 h-screen">
        <div className="p-5 border-b border-slate-200/60 dark:border-white/5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回主站
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-sky-500">
                <circle cx="12" cy="5" r="3" />
                <line x1="12" y1="8" x2="12" y2="22" />
                <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 dark:text-white">
                星港
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Star Harbor
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((nav) => {
            const active = pathname === nav.href;
            return (
              <Link
                key={nav.href}
                href={nav.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <nav.icon className="w-4 h-4" />
                {nav.label}
              </Link>
            );
          })}
        </nav>


      </aside>

      {/* 移动端顶栏 */}
      <div className="flex-1 flex flex-col md:hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-xl">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-sky-500 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回
          </Link>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-sky-500">
                <circle cx="12" cy="5" r="3" />
                <line x1="12" y1="8" x2="12" y2="22" />
                <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              星港
            </span>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* 内容区 */}
      <main className="flex-1 overflow-y-auto bg-slate-100/40 dark:bg-slate-950/40">
        {children}
      </main>
    </div>
  );
}

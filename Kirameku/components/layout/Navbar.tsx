"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";

import SettingsPanel from "@/components/ui/SettingsPanel";
import {
  Home,
  BookOpen,
  MessageSquare,
  Newspaper,
  FolderGit2,
  Users,
  Camera,
  Clock,
  Music,
  User,
  Sun,
  Moon,
  Menu,
  X,
  Settings,
  Library,
  Bookmark,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "首页", icon: Home },
  { href: "/posts", label: "文章", icon: BookOpen },
  { href: "/moments", label: "说说", icon: MessageSquare },
  { href: "/messages", label: "留言", icon: Newspaper },
  { href: "/novel", label: "小说", icon: Library },
  { href: "/bookmark", label: "收藏夹", icon: Bookmark },
  { href: "/projects", label: "项目", icon: FolderGit2 },
  { href: "/friends", label: "友链", icon: Users },
  { href: "/photowall", label: "照片墙", icon: Camera },
  { href: "/timeline", label: "归档", icon: Clock },
  { href: "/music", label: "音乐", icon: Music },
  { href: "/about", label: "关于", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [easterEgg, setEasterEgg] = useState(false);
  const clickTimes = useRef<number[]>([]);

  const handleLogoClick = useCallback(() => {
    const now = Date.now();
    clickTimes.current.push(now);
    clickTimes.current = clickTimes.current.filter(t => now - t < 2000);
    if (clickTimes.current.length >= 7) {
      clickTimes.current = [];
      setEasterEgg(true);

      // 全屏彩纸 + 闪烁
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "position:fixed;inset:0;z-index:99999;pointer-events:none";
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d")!;
      const W = canvas.width;
      const H = canvas.height;

      // 生成粒子，分 3 波从不同位置发射
      const particles: {
        x: number; y: number; vx: number; vy: number;
        size: number; color: string; rotation: number; vr: number;
        gravity: number; opacity: number; shape: number; born: number;
      }[] = [];
      const colors = ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff6bd6","#c084fc","#fb923c","#38bdf8"];
      for (let wave = 0; wave < 3; wave++) {
        const delay = wave * 15;
        for (let i = 0; i < 200; i++) {
          particles.push({
            x: Math.random() * W,
            y: -20 - Math.random() * 100,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * 3 + 2,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.2,
            gravity: 0.05 + Math.random() * 0.05,
            opacity: 1,
            shape: Math.floor(Math.random() * 3), // 0=rect 1=circle 2=star
            born: delay,
          });
        }
      }

      let frame = 0;
      function animate() {
        ctx.clearRect(0, 0, W, H);
        let alive = false;
        for (const p of particles) {
          if (frame < p.born) { alive = true; continue; }
          const age = frame - p.born;
          p.x += p.vx + Math.sin(age * 0.02) * 0.5;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.998;
          p.rotation += p.vr;
          p.opacity = Math.max(0, 1 - age / 300);
          if (p.opacity <= 0 || p.y > H + 20) continue;
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          if (p.shape === 0) {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else if (p.shape === 1) {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // 五角星
            const s = p.size / 2;
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
              const a = (j * 4 * Math.PI) / 5 - Math.PI / 2;
              const r = j === 0 ? s : s;
              ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
        frame++;
        if (alive) {
          requestAnimationFrame(animate);
        } else {
          canvas.remove();
        }
      }
      animate();

      // 彩蛋提示文字，等彩纸下完后出现
      setTimeout(() => {
        const msg = document.createElement("div");
        msg.innerHTML = `
          <div style="font-size:48px;margin-bottom:12px">🎉</div>
          <div style="font-size:24px;font-weight:bold;margin-bottom:8px">恭喜你发现了彩蛋！</div>
          <div style="font-size:14px;opacity:0.8">连续点击 Logo 7 次触发 · Starhiro の小站</div>
        `;
        msg.style.cssText = `
          position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
          z-index:99999;pointer-events:none;text-align:center;
          color:#fff;
          background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);
          padding:32px 48px;border-radius:20px;
          border:1px solid rgba(255,255,255,0.2);
          box-shadow:0 8px 40px rgba(0,0,0,0.4);
          opacity:0;transition:opacity 0.8s ease;
          font-family:'Noto Serif SC',serif;
        `;
        document.body.appendChild(msg);
        requestAnimationFrame(() => { msg.style.opacity = "1"; });
        setTimeout(() => {
          msg.style.opacity = "0";
          setTimeout(() => msg.remove(), 1000);
        }, 3000);
      }, 3500);

      setTimeout(() => setEasterEgg(false), 8000);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 子站页面隐藏主站导航栏
  if (pathname.startsWith("/garden")) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className={`flex items-center space-x-0.5 select-none ${easterEgg ? "animate-[spin_0.5s_ease-in-out_3]" : ""}`}
              style={easterEgg ? { animation: "spin 0.5s ease-in-out 6, rainbow 3s linear" } : undefined}
            >
              <span className={`text-xl font-bold tracking-tight ${easterEgg ? "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" : "text-slate-800 dark:text-white"}`} style={{ fontFamily: "'Noto Serif SC', serif" }}>
                Starhiro
              </span>
              <span className={`text-xl font-bold ${easterEgg ? "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" : "text-sky-500 dark:text-sky-400"}`} style={{ fontFamily: "serif" }}>
                の
              </span>
              <span className={`text-xl font-bold tracking-tight ${easterEgg ? "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" : "text-slate-800 dark:text-white"}`} style={{ fontFamily: "'Noto Serif SC', serif" }}>
                小站
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${isActive
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-sky-500 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle, Settings & Mobile Menu */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Settings Button */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  title="设置"
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 glass-card rounded-none border-x-0 md:hidden"
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

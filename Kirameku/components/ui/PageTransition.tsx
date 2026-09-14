"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const tips = [
  "按住 Tab 可以呼出快捷导航菜单",
  "试试看 Konami Code：↑↑↓↓←→←→520",
  "在小说页面可以自定义阅读设置",
  "点击页面空白处可以关闭弹窗",
  "拖拽书架上的书籍可以排序",
];

export default function PageTransition() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState("");
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      setTip(tips[Math.floor(Math.random() * tips.length)]);
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          {/* 传送门动画 */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-20 h-20 mb-6"
          >
            <div className="absolute inset-0 rounded-full border-4 border-sky-400/60 animate-spin" style={{ animationDuration: "1s" }} />
            <div className="absolute inset-2 rounded-full border-4 border-indigo-400/60 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
            <div className="absolute inset-4 rounded-full border-4 border-purple-400/60 animate-spin" style={{ animationDuration: "0.8s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-sky-400 animate-pulse" />
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/60 text-sm max-w-xs text-center"
          >
            {tip}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface ReadingProgressProps {
  contentRef: React.RefObject<HTMLElement | null>;
}

export default function ReadingProgress({ contentRef }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [showTOC, setShowTOC] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);
  const tocButtonRef = useRef<HTMLDivElement>(null);

  // 提取标题
  useEffect(() => {
    if (!contentRef.current) return;

    const elements = contentRef.current.querySelectorAll("h1, h2, h3");
    const items: TOCItem[] = [];

    elements.forEach((el, index) => {
      const id = `heading-${index}`;
      el.id = id;
      items.push({
        id,
        text: el.textContent || "",
        level: parseInt(el.tagName.charAt(1)),
      });
    });

    setHeadings(items);
  }, [contentRef]);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(scrollPercent, 100));
      setShowBackToTop(scrollTop > 300);

      // 更新活跃标题
      if (contentRef.current) {
        const elements = contentRef.current.querySelectorAll("h1, h2, h3");
        let currentId = "";

        for (let i = elements.length - 1; i >= 0; i--) {
          const el = elements[i] as HTMLElement;
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            currentId = el.id;
            break;
          }
        }

        setActiveId(currentId);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [contentRef]);

  // 点击外部关闭目录
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showTOC &&
        tocRef.current &&
        !tocRef.current.contains(e.target as Node) &&
        tocButtonRef.current &&
        !tocButtonRef.current.contains(e.target as Node)
      ) {
        setShowTOC(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTOC]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setShowTOC(false);
    }
  };

  return (
    <>
      {/* 阅读进度条 */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* 目录按钮 - 仅在有标题时显示 */}
      {headings.length > 0 && (
        <div ref={tocButtonRef} className="fixed right-4 bottom-24 z-[10002] md:right-6 md:bottom-40">
          <button
            type="button"
            onClick={() => setShowTOC(!showTOC)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all"
            title="目录"
          >
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* 目录面板 */}
      <AnimatePresence>
        {showTOC && headings.length > 0 && (
          <motion.div
            ref={tocRef}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 bottom-36 z-[10002] w-64 max-h-[60vh] md:right-6 md:bottom-56"
          >
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">目录</h3>
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-2">
                {headings.map((heading) => (
                  <button
                    type="button"
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      heading.level === 1 ? "pl-3" : heading.level === 2 ? "pl-6" : "pl-9"
                    } ${
                      activeId === heading.id
                        ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {heading.text}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 回到顶部按钮 */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed right-4 bottom-12 z-[10002] md:right-6 md:bottom-24"
          >
            <button
              type="button"
              onClick={scrollToTop}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all"
              title="回到顶部"
            >
              <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

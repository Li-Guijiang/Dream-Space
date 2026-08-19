"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, Minus, Plus } from "lucide-react";
import { getBookContent, getChapterList, saveBookProgress } from "@/app/api/novel/novel-api";
import { Chapter, decodeBookUrl, loadSettings, saveSettings, ReadingSettings, defaultSettings } from "../../_lib/utils";
import LoadingTips from "../../_lib/LoadingTips";

export default function ReadingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookUrl = decodeBookUrl(params.bookUrl as string);
  const chapterIndex = Number(params.chapter);
  const bookSourceUrl = searchParams.get("source") || "";

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [content, setContent] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<ReadingSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    if (!showSettings) return;
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSettings]);

  const updateSetting = <K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [chapterRes, contentRes] = await Promise.all([
          getChapterList(bookUrl, bookSourceUrl),
          getBookContent(bookUrl, chapterIndex),
        ]);
        if (chapterRes.isSuccess) {
          setChapters(chapterRes.data);
          setChapterTitle(chapterRes.data[chapterIndex]?.title || "");
        }
        if (contentRes.isSuccess) {
          setContent(contentRes.data);
          window.scrollTo(0, 0);
          saveBookProgress(bookUrl, chapterIndex);
        } else {
          setError(contentRes.errorMsg || "获取内容失败");
        }
      } catch {
        setError("网络错误");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookUrl, chapterIndex, bookSourceUrl]);

  const goToChapter = (index: number) => {
    router.push(`/novel/${params.bookUrl}/${index}?source=${encodeURIComponent(bookSourceUrl)}`);
  };

  const goChapter = (dir: -1 | 1) => {
    const newIndex = chapterIndex + dir;
    if (newIndex >= 0 && newIndex < chapters.length) {
      goToChapter(newIndex);
    }
  };

  const themes: Record<string, { bg: string; text: string }> = {
    default: { bg: "bg-white/60 dark:bg-slate-800/60", text: "text-slate-800 dark:text-slate-200" },
    sepia: { bg: "bg-amber-50/80 dark:bg-amber-900/30", text: "text-amber-900 dark:text-amber-100" },
    green: { bg: "bg-emerald-50/80 dark:bg-emerald-900/30", text: "text-emerald-900 dark:text-emerald-100" },
  };
  const t = themes[settings.theme] || themes.default;

  return (
    <div
      className="mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12"
      style={{ maxWidth: settings.contentWidth === "narrow" ? "42rem" : settings.contentWidth === "wide" ? "72rem" : settings.contentWidth === "full" ? "100%" : "56rem" }}
    >
      <button type="button" onClick={() => router.push(`/novel/${params.bookUrl}?source=${encodeURIComponent(bookSourceUrl)}`)} className="flex items-center gap-2 text-slate-500 hover:text-sky-500 mb-4">
        <ArrowLeft className="w-4 h-4" /> 目录
      </button>

      {loading && <LoadingTips />}

      {error && (
        <div className="text-center py-20 text-red-500">{error}</div>
      )}

      {!loading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white text-center flex-1 px-4 truncate">{chapterTitle}</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => goChapter(-1)} disabled={chapterIndex <= 0} title="上一章"
                className="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => goChapter(1)} disabled={chapterIndex >= chapters.length - 1} title="下一章"
                className="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button type="button" onMouseDown={(e) => { e.stopPropagation(); setShowSettings((v) => !v); }} title="阅读设置"
                className={`p-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50 transition-colors ${showSettings ? "bg-sky-500 text-white" : "bg-white/60 dark:bg-slate-800/60 text-slate-500 hover:text-sky-500"}`}>
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 设置面板 */}
          {showSettings && (
            <div ref={settingsRef} className="absolute right-4 top-16 z-50 w-80 p-4 rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">字体大小</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateSetting("fontSize", Math.max(12, settings.fontSize - 1))} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="text-sm w-8 text-center">{settings.fontSize}</span>
                  <button onClick={() => updateSetting("fontSize", Math.min(32, settings.fontSize + 1))} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">行距</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateSetting("lineHeight", Math.max(1.2, +(settings.lineHeight - 0.1).toFixed(1)))} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="text-sm w-8 text-center">{settings.lineHeight}</span>
                  <button onClick={() => updateSetting("lineHeight", Math.min(3, +(settings.lineHeight + 0.1).toFixed(1)))} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">段距</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateSetting("paragraphSpacing", Math.max(0, settings.paragraphSpacing - 4))} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="text-sm w-8 text-center">{settings.paragraphSpacing}</span>
                  <button onClick={() => updateSetting("paragraphSpacing", Math.min(48, settings.paragraphSpacing + 4))} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">字体</span>
                <div className="flex gap-2">
                  {[["serif", "宋体"], ["sans-serif", "黑体"], ["system-ui", "系统"]].map(([val, label]) => (
                    <button key={val} onClick={() => updateSetting("fontFamily", val)}
                      className={`px-3 py-1 rounded-lg text-xs transition-colors ${settings.fontFamily === val ? "bg-sky-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">背景</span>
                  <div className="flex gap-2">
                    {[["default", "默认"], ["sepia", "护眼"], ["green", "绿意"], ["custom", "自定义"]].map(([val, label]) => (
                      <button key={val} onClick={() => updateSetting("theme", val)}
                        className={`px-3 py-1 rounded-lg text-xs transition-colors ${settings.theme === val ? "bg-sky-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {settings.theme === "custom" && (
                  <div className="flex items-center justify-end gap-2">
                    <input
                      type="color"
                      title="自定义背景色"
                      value={settings.customColor}
                      onChange={(e) => updateSetting("customColor", e.target.value)}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{settings.customColor}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">宽度</span>
                <div className="flex gap-2">
                  {[["narrow", "窄"], ["normal", "标准"], ["wide", "宽"], ["full", "全屏"]].map(([val, label]) => (
                    <button key={val} onClick={() => updateSetting("contentWidth", val)}
                      className={`px-3 py-1 rounded-lg text-xs transition-colors ${settings.contentWidth === val ? "bg-sky-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div
            className={`${settings.theme === "custom" ? "" : t.bg} backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-10`}
            style={settings.theme === "custom" ? { backgroundColor: settings.customColor } : undefined}
          >
            <div
              className={`${t.text} max-w-none whitespace-pre-wrap`}
              style={{
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                fontFamily: settings.fontFamily,
              }}
            >
              {content.split("\n").map((para, i) => (
                <p key={i} style={{ marginBottom: `${settings.paragraphSpacing}px` }}>{para.trimStart()}</p>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button type="button" onClick={() => goChapter(-1)} disabled={chapterIndex <= 0}
              className="px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50 text-sm">上一章</button>
            <span className="text-sm text-slate-500">{chapterIndex + 1} / {chapters.length}</span>
            <button type="button" onClick={() => goChapter(1)} disabled={chapterIndex >= chapters.length - 1}
              className="px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50 text-sm">下一章</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

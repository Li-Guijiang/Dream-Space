"use client";

import { useState } from "react";
import Image from "next/image";
import { useBackground } from "@/components/providers/BackgroundProvider";
import { useEffects } from "@/components/providers/EffectProvider";
import { siteConfig } from "@/siteConfig";

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { bgImage, bgBlur, setBgImage, setBgBlur } = useBackground();
  const { clickEffect, mouseTrail, seasonalEffect, sparkleEffect, toggleClickEffect, toggleMouseTrail, toggleSeasonalEffect, toggleSparkleEffect } = useEffects();
  const images = siteConfig.bgImages;
  const currentIndex = images.indexOf(bgImage);
  const [showGrid, setShowGrid] = useState(false);

  function prev() {
    const idx = (currentIndex - 1 + images.length) % images.length;
    setBgImage(images[idx]);
  }

  function next() {
    const idx = (currentIndex + 1) % images.length;
    setBgImage(images[idx]);
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-72 p-4 shadow-2xl z-50 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">设置</h3>
      </div>

      {/* 背景图片选择 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            背景图片
          </label>
          <button
            type="button"
            title="查看全部背景"
            onClick={() => setShowGrid(!showGrid)}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {showGrid ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              )}
            </svg>
          </button>
        </div>

        {/* 全部背景图网格 */}
        {showGrid && (
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {images.map((img) => (
              <button
                key={img}
                type="button"
                title="选择此背景"
                onClick={() => { setBgImage(img); setShowGrid(false); }}
                className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video ${
                  bgImage === img
                    ? "border-sky-500 ring-1 ring-sky-500/30"
                    : "border-transparent hover:border-sky-300"
                }`}
              >
                <Image
                  src={img}
                  alt="背景"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* 当前背景预览 */}
        <div className="relative rounded-xl overflow-hidden border-2 border-white/30 dark:border-white/10 aspect-video">
          <Image
            src={bgImage}
            alt="当前背景"
            fill
            sizes="288px"
            className="object-cover"
          />
          <button
            type="button"
            title="上一张"
            onClick={prev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            title="下一张"
            onClick={next}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                title={`切换到背景 ${i + 1}`}
                onClick={() => setBgImage(img)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentIndex
                    ? "bg-white w-3"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 模糊度调节 */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
          背景模糊度
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            title="背景模糊度"
            value={bgBlur}
            onChange={(e) => setBgBlur(Number(e.target.value))}
            className="flex-1 h-1.5 bg-white/40 dark:bg-slate-700/50 rounded-full appearance-none outline-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #818cf8 ${(bgBlur / 20) * 100}%, rgba(148,163,184,0.4) ${(bgBlur / 20) * 100}%)`,
            }}
          />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-10 text-right">
            {bgBlur}px
          </span>
        </div>
      </div>

      {/* 鼠标效果开关 */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
          鼠标效果
        </label>
        <div className="space-y-2">
          <button
            type="button"
            onClick={toggleClickEffect}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="text-xs text-slate-700 dark:text-slate-300">点击特效</span>
            <div className={`w-9 h-5 rounded-full transition-colors ${clickEffect ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${clickEffect ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </div>
          </button>
          <button
            type="button"
            onClick={toggleMouseTrail}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="text-xs text-slate-700 dark:text-slate-300">鼠标轨迹</span>
            <div className={`w-9 h-5 rounded-full transition-colors ${mouseTrail ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${mouseTrail ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </div>
          </button>
          <button
            type="button"
            onClick={toggleSeasonalEffect}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="text-xs text-slate-700 dark:text-slate-300">季节特效</span>
            <div className={`w-9 h-5 rounded-full transition-colors ${seasonalEffect ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${seasonalEffect ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </div>
          </button>
          <button
            type="button"
            onClick={toggleSparkleEffect}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="text-xs text-slate-700 dark:text-slate-300">星星迸发</span>
            <div className={`w-9 h-5 rounded-full transition-colors ${sparkleEffect ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${sparkleEffect ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

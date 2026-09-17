"use client";

import { useEffect, useState } from "react";

/**
 * Live2D 看板娘
 *
 * 资源放在 /public/live2d（按需只加载当前模型，不会一次性下载全部）。
 * 加载策略做了性能优化，避免上次"首屏卡顿"的问题：
 *   1. 仅在桌面端（宽度 >= 768）加载，小屏既不挡内容也省流量；
 *   2. 等浏览器 load 事件之后再延迟注入脚本，把首屏渲染让给主内容；
 *   3. 用 data 标记去重，避免重复注入。
 *
 * 右下角橙色小标签可随时收起看板娘。
 */
const AUTOLOAD_SRC = "/live2d/jsdelivr/random/autoload.js?v=5";
const LOAD_DELAY_MS = 1500;

export default function Live2D() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) return;

    let timer: number | undefined;

    const schedule = () => {
      timer = window.setTimeout(() => setEnabled(true), LOAD_DELAY_MS);
    };

    if (document.readyState === "complete") {
      schedule();
      return () => {
        if (timer) window.clearTimeout(timer);
      };
    }

    window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (document.querySelector('script[data-live2d="1"]')) return;

    const script = document.createElement("script");
    script.src = AUTOLOAD_SRC;
    script.async = true;
    script.dataset.live2d = "1";
    document.body.appendChild(script);
  }, [enabled]);

  return null;
}

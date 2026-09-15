"use client";

import Script from "next/script";

// Live2D 看板娘默认关闭（资源 214MB，是页面卡顿主因之一）。
// 如需启用，把 ENABLED 改为 true 即可。
const ENABLED = false;

export default function Live2D() {
  if (!ENABLED) return null;
  return (
    <Script
      src="/live2d/jsdelivr/random/autoload.js?v=4"
      strategy="lazyOnload"
    />
  );
}

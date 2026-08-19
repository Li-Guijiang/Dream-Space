"use client";

import Script from "next/script";

export default function Live2D() {
  return (
    <Script
      src="/live2d/jsdelivr/random/autoload.js?v=4"
      strategy="lazyOnload"
    />
  );
}

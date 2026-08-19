"use client";

import { useBackground } from "@/components/providers/BackgroundProvider";
import { siteConfig } from "@/siteConfig";

export default function BackgroundRenderer() {
  const { bgImage, bgBlur } = useBackground();

  return (
    <div className="fixed inset-0 -z-10 h-lvh">
      {siteConfig.useGradient ? (
        <div
          className="absolute inset-0 gradient-background"
          style={{
            backgroundImage: `linear-gradient(135deg, ${siteConfig.themeColors.join(", ")})`,
          }}
        />
      ) : (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${bgImage || siteConfig.bgImages[0]})`,
            }}
          />
          {/* 深色模式遮罩 */}
          <div className="absolute inset-0 bg-transparent dark:bg-black/60 transition-colors duration-500" />
          {bgBlur > 0 && (
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: `blur(${bgBlur}px)`,
                WebkitBackdropFilter: `blur(${bgBlur}px)`,
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

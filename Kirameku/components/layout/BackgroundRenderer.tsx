"use client";

import { useBackground } from "@/components/providers/BackgroundProvider";
import { siteConfig } from "@/siteConfig";

export default function BackgroundRenderer() {
  const { bgImage, bgBlur } = useBackground();
  const current = bgImage || siteConfig.bgImages[0];
  const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(current);

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
          {isVideo ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={current}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={siteConfig.bgPoster || undefined}
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${current})`,
              }}
            />
          )}
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Eye, Heart } from "lucide-react";
import { getPosts, type PostItem } from "@/app/api";

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "今天";
  if (days < 2) return "昨天";
  if (days < 7) return `${days}天前`;
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

export default function LatestPostsCarousel() {
  const [posts, setPosts] = useState<PostItem[]>([]);

  useEffect(() => {
    getPosts({ status: "published", page: 1, size: 4 })
      .then(setPosts)
      .catch(() => { });
  }, []);

  if (!posts.length) {
    return (
      <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl min-h-[220px] flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
        <BookOpen className="w-10 h-10 opacity-40" />
        <span className="text-sm">暂无文章</span>
      </div>
    );
  }

  const hero = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Hero 大图 */}
      <Link
        href={`/posts/${hero.slug}`}
        className="relative flex-1 min-h-[160px] md:min-h-[160px] rounded-3xl overflow-hidden group cursor-pointer"
      >
        <Image
          src={hero.cover || "/images/default-cover.jpg"}
          alt={hero.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 66vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* 底部信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5 line-clamp-1">
            {hero.title}
          </h3>
          <p className="text-white/70 text-sm line-clamp-1 mb-2">
            {hero.description}
          </p>
          <div className="flex items-center gap-4 text-white/50 text-xs">
            <span>{relativeDate(hero.published_at)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {hero.reading_time} 分钟
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {hero.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {hero.likes}
            </span>
          </div>
        </div>
      </Link>

      {/* 小卡片行 */}
      {rest.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {rest.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="relative rounded-2xl overflow-hidden group cursor-pointer h-[80px]"
            >
              <Image
                src={post.cover || "/images/default-cover.jpg"}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="200px"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute inset-0 p-3 flex flex-col justify-end">
                <h4 className="text-xs font-bold text-white line-clamp-1">
                  {post.title}
                </h4>
                <span className="text-[10px] text-white/50">
                  {relativeDate(post.published_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

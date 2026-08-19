"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getChapterList } from "@/app/api/novel/novel-api";
import { Chapter, decodeBookUrl } from "../_lib/utils";
import LoadingTips from "../_lib/LoadingTips";

export default function ChapterListPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookUrl = decodeBookUrl(params.bookUrl as string);
  const bookSourceUrl = searchParams.get("source") || "";
  const bookName = searchParams.get("name") || "";
  const from = searchParams.get("from") || "bookshelf";

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getChapterList(bookUrl, bookSourceUrl);
        if (res.isSuccess) {
          setChapters(res.data);
        } else {
          setError(res.errorMsg || "获取目录失败");
        }
      } catch {
        setError("网络错误");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookUrl, bookSourceUrl]);

  const goToChapter = (index: number) => {
    router.push(`/novel/${params.bookUrl}/${index}?source=${encodeURIComponent(bookSourceUrl)}`);
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12" style={{ maxWidth: "56rem" }}>
      <button
        type="button"
        onClick={() => from === "search" ? router.push("/novel/search?q=" + encodeURIComponent(searchParams.get("q") || "")) : router.push("/novel")}
        className="flex items-center gap-2 text-slate-500 hover:text-sky-500 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {from === "search" ? "搜索结果" : "书架"}
      </button>

      {loading && <LoadingTips />}

      {error && (
        <div className="text-center py-20 text-red-500">{error}</div>
      )}

      {!loading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {bookName || "目录"}
          </h2>
          <p className="text-sm text-slate-500 mb-6">共 {chapters.length} 章</p>
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
              {chapters.map((chapter) => (
                <button
                  type="button"
                  key={chapter.index}
                  onClick={() => goToChapter(chapter.index)}
                  className="text-left px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate"
                >
                  {chapter.title}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

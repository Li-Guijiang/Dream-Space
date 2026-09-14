"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { searchBookMultiSSEUrl } from "@/app/api/novel/novel-api";
import { SearchBook, proxyCover, encodeBookUrl } from "../_lib/utils";
import LoadingTips from "../_lib/LoadingTips";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const filterParam = searchParams.get("filter") || "title";

  const [searchResults, setSearchResults] = useState<SearchBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchLastIndex, setSearchLastIndex] = useState(-1);
  const searchEventSourceRef = useRef<EventSource | null>(null);

  const filteredResults = useMemo(() => {
    if (filterParam === "all") return searchResults;
    const q = query.trim();
    if (!q) return searchResults;
    if (filterParam === "title") return searchResults.filter((b) => b.name === q);
    if (filterParam === "author") return searchResults.filter((b) => b.author.includes(q));
    return searchResults;
  }, [searchResults, filterParam, query]);

  const closeSearchSSE = () => {
    if (searchEventSourceRef.current) {
      searchEventSourceRef.current.close();
      searchEventSourceRef.current = null;
    }
  };

  const startSearchSSE = (key: string, lastIndex = -1) => {
    closeSearchSSE();
    if (lastIndex === -1) {
      setSearchResults([]);
    }
    setSearching(true);
    const url = searchBookMultiSSEUrl(key, lastIndex);
    const es = new EventSource(url);
    searchEventSourceRef.current = es;
    es.onmessage = (e) => {
      if (!e.data) return;
      try {
        const result = JSON.parse(e.data);
        if (result.lastIndex !== undefined) setSearchLastIndex(result.lastIndex);
        if (result.data) {
          setSearchResults((prev) => {
            const map = new Set(prev.map((b) => b.bookUrl));
            const fresh = (result.data as SearchBook[]).filter((b) => !map.has(b.bookUrl));
            return [...prev, ...fresh];
          });
        }
      } catch { /* ignore */ }
    };
    es.addEventListener("end", () => {
      setSearching(false);
      closeSearchSSE();
    });
    es.onerror = () => {
      setSearching(false);
      closeSearchSSE();
    };
  };

  useEffect(() => {
    if (query) {
      setSearchLastIndex(-1);
      startSearchSSE(query, -1);
    }
    return () => { closeSearchSSE(); };
  }, [query]);

  const loadMore = () => {
    if (searching || !query) return;
    startSearchSSE(query, searchLastIndex);
  };

  const goToBook = (book: SearchBook) => {
    const encoded = encodeBookUrl(book.bookUrl);
    router.push(`/novel/${encoded}?source=${encodeURIComponent(book.origin || "")}&name=${encodeURIComponent(book.name)}&from=search&q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12" style={{ maxWidth: "56rem" }}>
      <button
        type="button"
        onClick={() => { closeSearchSSE(); router.push("/novel"); }}
        className="flex items-center gap-2 text-slate-500 hover:text-sky-500 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回书架
      </button>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        搜索结果：{query}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults.map((book, index) => (
          <motion.div
            key={book.bookUrl}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => goToBook(book)}
            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-700 cursor-pointer group"
          >
            <div className="p-5">
              <div className="flex gap-4">
                {book.coverUrl ? (
                  <img
                    src={proxyCover(book.coverUrl)}
                    alt={book.name}
                    width={80}
                    height={112}
                    className="rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-28 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 p-1">
                    <span className="text-white text-xs font-medium text-center leading-tight line-clamp-3">{book.name}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors truncate">
                    {book.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {book.author}
                  </p>
                  {book.latestChapterTitle && (
                    <p className="text-xs text-slate-400 mt-2 truncate">
                      最新：{book.latestChapterTitle}
                    </p>
                  )}
                  {book.originName && (
                    <p className="text-xs text-amber-500 mt-1 truncate">
                      来源：{book.originName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {filteredResults.length === 0 && !searching && (
        <div className="text-center py-20 text-slate-400">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>没有找到相关小说</p>
        </div>
      )}
      {filteredResults.length === 0 && searching && <LoadingTips />}
      {(searchResults.length > 0 || searching) && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={loadMore}
            disabled={searching}
            className="px-6 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-sky-500 disabled:opacity-50 transition-colors"
          >
            {searching ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> 搜索中... {searchResults.length} 条</span>
            ) : (
              "加载更多"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingTips />}>
      <SearchContent />
    </Suspense>
  );
}

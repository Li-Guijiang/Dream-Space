"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BookOpen, Search } from "lucide-react";
import { getBookshelf } from "@/app/api/novel/novel-api";
import { Book, proxyCover, encodeBookUrl } from "./_lib/utils";
import LoadingTips from "./_lib/LoadingTips";

let bookshelfCache: { data: Book[]; time: number } | null = null;
const CACHE_TTL = 60_000;

function SortableBookCard({
  book,
  onClick,
}: {
  book: Book;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: book.bookUrl });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : undefined,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-700 cursor-grab active:cursor-grabbing group"
    >
      <div className="p-5">
        <div className="flex gap-4">
          {book.coverUrl || book.customCoverUrl ? (
            <img
              src={proxyCover(book.customCoverUrl || book.coverUrl)}
              alt={book.name}
              width={80}
              height={112}
              className="rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-28 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 p-1">
              <span className="text-white text-xs font-medium text-center leading-tight line-clamp-3">{book.name}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
              {book.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {book.author}
            </p>
            {book.durChapterTitle && (
              <p className="text-xs text-slate-400 mt-2 truncate">
                读到：{book.durChapterTitle}
              </p>
            )}
            {book.totalChapterNum && (
              <p className="text-xs text-sky-500 mt-1">
                共 {book.totalChapterNum} 章
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NovelPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"all" | "title" | "author">("title");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const BOOK_ORDER_KEY = "novel_book_order";

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBooks((items) => {
        const oldIndex = items.findIndex((b) => b.bookUrl === active.id);
        const newIndex = items.findIndex((b) => b.bookUrl === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(BOOK_ORDER_KEY, JSON.stringify(newOrder.map((b) => b.bookUrl)));
        return newOrder;
      });
    }
  }, []);

  useEffect(() => {
    const loadBookshelf = async () => {
      if (bookshelfCache && Date.now() - bookshelfCache.time < CACHE_TTL) {
        setBooks(bookshelfCache.data);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await getBookshelf();
        if (res.isSuccess) {
          const bookList: Book[] = res.data;
          bookshelfCache = { data: bookList, time: Date.now() };
          const savedOrder = localStorage.getItem(BOOK_ORDER_KEY);
          if (savedOrder) {
            try {
              const order: string[] = JSON.parse(savedOrder);
              bookList.sort((a, b) => {
                const ia = order.indexOf(a.bookUrl);
                const ib = order.indexOf(b.bookUrl);
                return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
              });
            } catch { /* ignore */ }
          }
          setBooks(bookList);
        } else {
          setError(res.errorMsg || "获取书架失败");
        }
      } catch {
        setError("网络错误");
      } finally {
        setLoading(false);
      }
    };
    loadBookshelf();
  }, []);

  const goToBook = (book: Book) => {
    router.push(`/novel/${encodeBookUrl(book.bookUrl)}?source=${encodeURIComponent(book.bookSourceUrl || "")}&name=${encodeURIComponent(book.name)}&from=bookshelf`);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/novel/search?q=${encodeURIComponent(searchQuery.trim())}&filter=${searchFilter}`);
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12" style={{ maxWidth: "56rem" }}>
      {loading && <LoadingTips />}

      {error && (
        <div className="text-center py-20 text-red-500">{error}</div>
      )}

      {!loading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            我的书架
          </h1>
          <div className="mb-8 max-w-lg mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="搜索小说..."
                className="flex-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-sky-400 dark:focus:border-sky-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              {([["all", "全部"], ["title", "精准"], ["author", "作者"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSearchFilter(val)}
                  className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
                    searchFilter === val
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-white/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={books.map((b) => b.bookUrl)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <SortableBookCard
                    key={book.bookUrl}
                    book={book}
                    onClick={() => goToBook(book)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {books.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>书架空空如也</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

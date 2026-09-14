const NOVEL_API_BASE = process.env.NEXT_PUBLIC_NOVEL_API_URL || "";

export async function novelFetch(path: string, options?: RequestInit) {
  const url = `${NOVEL_API_BASE}${path}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  return res;
}

// 获取书架
export async function getBookshelf() {
  const res = await novelFetch("/reader3/getBookshelf");
  return res.json();
}

// 获取目录
export async function getChapterList(bookUrl: string, bookSourceUrl?: string) {
  const res = await novelFetch("/reader3/getChapterList", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: bookUrl, bookSourceUrl: bookSourceUrl || "", refresh: 0 }),
  });
  return res.json();
}

// 获取章节内容
export async function getBookContent(bookUrl: string, index: number) {
  const res = await novelFetch("/reader3/getBookContent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: bookUrl, index }),
  });
  return res.json();
}

// 搜索小说（多源）
export async function searchBookMulti(key: string) {
  const res = await novelFetch("/reader3/searchBookMulti", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, searchSize: 20, concurrentCount: 36 }),
  });
  return res.json();
}

// 搜索小说 SSE 流式 URL（GET，EventSource 用）
export function searchBookMultiSSEUrl(key: string, lastIndex = -1) {
  const params = new URLSearchParams({ key, lastIndex: String(lastIndex), searchSize: "50", concurrentCount: "24" });
  return `${NOVEL_API_BASE}/reader3/searchBookMultiSSE?${params}`;
}

// 获取书源列表
export async function getBookSources() {
  const res = await novelFetch("/reader3/getBookSources?simple=1");
  return res.json();
}

// 搜索单源
export async function searchBook(key: string, bookSourceUrl: string) {
  const res = await novelFetch("/reader3/searchBook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, bookSourceUrl }),
  });
  return res.json();
}

// 保存阅读进度
export async function saveBookProgress(bookUrl: string, index: number) {
  const res = await novelFetch("/reader3/saveBookProgress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: bookUrl, index }),
  });
  return res.json();
}

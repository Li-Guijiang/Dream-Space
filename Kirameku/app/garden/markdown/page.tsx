"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { marked } from "marked";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

const DEFAULT_MD = `# 📝 在线 Markdown 编辑器

实时预览，所见即所得。

---

## 基础语法

**加粗文字** 和 *斜体文字* 以及 ~~删除线~~

> 这是一段引用。Markdown 让写作变得简单而优雅。

### 代码块

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}
hello("Kirameku");
\`\`\`

行内代码 \`const x = 42\` 也可以。

### 列表

- 🎨 支持实时预览
- 🌙 深色/浅色主题
- ✨ 语法高亮
- 📋 导出 HTML

### 表格

| 功能 | 状态 | 备注 |
|------|------|------|
| 标题 | ✅ | h1-h6 |
| 列表 | ✅ | 有序/无序 |
| 代码 | ✅ | 行内/块 |
| 表格 | ✅ | GFM 扩展 |
| 图片 | ✅ | URL 引用 |

### 链接与图片

[Kirameku 博客](https://example.com)

### 数学公式（行内）

E = mc²

---

> 💡 **提示**: 左侧编辑，右侧实时预览。支持标准 Markdown 和 GFM 扩展语法。
`;

export default function MarkdownPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const updatePreview = useCallback((doc: string) => {
    const rendered = marked(doc, { breaks: true, gfm: true });
    if (typeof rendered === "string") {
      setHtml(rendered);
    } else {
      rendered.then(setHtml);
    }
    // word & char count
    const text = doc.replace(/[#*`~\[\]()>|\-_{}!]/g, "").trim();
    setCharCount(doc.length);
    setWordCount(text ? text.split(/\s+/).filter(Boolean).length : 0);
  }, []);

  // init codemirror
  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        updatePreview(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: DEFAULT_MD,
      extensions: [
        basicSetup,
        markdown(),
        oneDark,
        updateListener,
        EditorView.theme({
          "&": { height: "100%", fontSize: "14px" },
          ".cm-scroller": { fontFamily: "var(--font-geist-mono), monospace" },
          ".cm-content": { padding: "8px 0" },
          "&.cm-focused": { outline: "none" },
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;

    // initial render
    updatePreview(DEFAULT_MD);

    return () => { view.destroy(); };
  }, [updatePreview]);

  function exportHTML() {
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
  body { max-width: 720px; margin: 2rem auto; padding: 0 1rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.8; color: #1e293b; }
  h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
  code { background: #f1f5f9; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }
  pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  pre code { background: none; padding: 0; color: inherit; }
  blockquote { border-left: 3px solid #38bdf8; margin: 1em 0; padding: 0.5em 1em; background: #f0f9ff; border-radius: 0 8px 8px 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e2e8f0; padding: 0.5em 0.75em; }
  th { background: #f8fafc; }
  img { max-width: 100%; border-radius: 8px; }
  a { color: #0ea5e9; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 2em 0; }
</style>
</head>
<body>
${html}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "markdown-export.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  const btnClass = "px-3 py-1.5 rounded-lg text-xs font-medium transition-all";

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">Markdown 编辑器</h1>
          <p className="text-xs text-slate-400">实时预览 · 支持 GFM 语法 · 可导出 HTML</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{wordCount} 词</span>
            <span>{charCount} 字符</span>
          </div>
          <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-0.5">
            {(["editor", "split", "preview"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === mode
                    ? "bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {mode === "editor" ? "仅编辑" : mode === "split" ? "分栏" : "仅预览"}
              </button>
            ))}
          </div>
          <button
            onClick={exportHTML}
            className={`${btnClass} bg-sky-500 text-white hover:bg-sky-600 active:scale-95 shadow-lg shadow-sky-500/20`}
          >
            导出 HTML
          </button>
        </div>
      </div>

      <div
        className="flex gap-4"
        style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}
      >
        {/* 编辑器 — 始终挂载，用 display 控制显隐 */}
        <div
          className="flex flex-col rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/10 bg-[#282c34] flex-1 min-w-0"
          style={{ display: viewMode === "preview" ? "none" : "flex" }}
        >
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-[#21252b]">
            <span className="w-3 h-3 rounded-full bg-red-400/80" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
            <span className="ml-2 text-xs text-slate-400 font-mono">document.md</span>
          </div>
          <div ref={editorRef} className="flex-1 overflow-hidden" />
        </div>

        {/* 预览 — 始终挂载 */}
        <div
          className="flex flex-col rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900 flex-1 min-w-0"
          style={{ display: viewMode === "editor" ? "none" : "flex" }}
        >
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-slate-800/80">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-slate-400">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-xs text-slate-400 font-mono">预览</span>
          </div>
          <div ref={previewRef} className="flex-1 overflow-auto p-6">
            <article
              className="prose prose-sm dark:prose-invert max-w-none
                prose-headings:text-slate-800 dark:prose-headings:text-white
                prose-p:text-slate-600 dark:prose-p:text-slate-300
                prose-a:text-sky-500 prose-a:no-underline hover:prose-a:underline
                prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:rounded-xl prose-pre:border prose-pre:border-white/5
                prose-blockquote:border-sky-400 prose-blockquote:bg-sky-50 dark:prose-blockquote:bg-sky-500/5 prose-blockquote:rounded-r-lg prose-blockquote:py-0.5
                prose-th:bg-slate-50 dark:prose-th:bg-slate-800
                prose-img:rounded-xl
                prose-hr:border-slate-200 dark:prose-hr:border-white/10"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

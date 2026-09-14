"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

const DEFAULT_CODE = `# 在线 Python 编辑器
# 在这里写代码，点击运行按钮执行

print("Hello, World! 🎉")
print()

# 试试循环
for i in range(5):
    print(f"⭐ Star {i + 1}")

print()

# 列表推导
squares = [x ** 2 for x in range(1, 11)]
print(f"平方数: {squares}")

# 字典操作
info = {
    "博客": "Kirameku",
    "语言": "Python",
    "运行环境": "WebAssembly (Pyodide)"
}
for key, value in info.items():
    print(f"  {key}: {value}")
`;

export default function PythonPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const pyodideRef = useRef<any>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // init pyodide
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
    script.async = true;
    script.onload = async () => {
      try {
        const pyodide = await (window as any).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
        });
        pyodideRef.current = pyodide;
        setLoading(false);
      } catch {
        setLoadError(true);
        setLoading(false);
      }
    };
    script.onerror = () => { setLoadError(true); setLoading(false); };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // init codemirror
  useEffect(() => {
    if (!editorRef.current) return;

    const runKeymap = keymap.of([{
      key: "Mod-Enter",
      run: () => { runCodeRef.current(); return true; },
    }]);

    const state = EditorState.create({
      doc: DEFAULT_CODE,
      extensions: [
        basicSetup,
        python(),
        oneDark,
        runKeymap,
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

    return () => { view.destroy(); };
  }, []);

  const runCode = useCallback(async () => {
    if (!pyodideRef.current || running) return;
    const code = viewRef.current?.state.doc.toString() ?? "";
    setRunning(true);
    setOutput("运行中...\n");
    try {
      const pyodide = pyodideRef.current;
      pyodide.runPython(`
import sys, io
__stdout_capture = io.StringIO()
sys.stdout = __stdout_capture
sys.stderr = __stdout_capture
`);
      try {
        await pyodide.runPythonAsync(code);
      } catch (e: any) {
        const captured = pyodide.runPython("__stdout_capture.getvalue()");
        setOutput((captured ? captured + "\n" : "") + `错误: ${e.message}`);
        setRunning(false);
        return;
      }
      const captured = pyodide.runPython("__stdout_capture.getvalue()");
      setOutput(captured || "(无输出)");
      pyodide.runPython("sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__");
    } catch (e: any) {
      setOutput(`错误: ${e.message}`);
    }
    setRunning(false);
  }, [running]);

  const runCodeRef = useRef(runCode);
  runCodeRef.current = runCode;

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">Python 编辑器</h1>
          <p className="text-xs text-slate-400">在浏览器中运行 Python 代码 · Ctrl+Enter 运行</p>
        </div>
        <button
          onClick={runCode}
          disabled={running || loading}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            running || loading
              ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 shadow-lg shadow-emerald-500/20"
          }`}
        >
          {running ? (
            <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />运行中</>
          ) : loading ? (
            <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />加载引擎</>
          ) : (
            <><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M8 5v14l11-7z" /></svg>运行</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>
        {/* CodeMirror 编辑器 */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/10 bg-[#282c34]">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-[#21252b]">
            <span className="w-3 h-3 rounded-full bg-red-400/80" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
            <span className="ml-2 text-xs text-slate-400 font-mono">main.py</span>
          </div>
          <div ref={editorRef} className="flex-1 overflow-hidden" />
        </div>

        {/* 输出面板 */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/80 dark:bg-slate-800/80">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-slate-400">
              <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span className="text-xs text-slate-400 font-mono">输出</span>
          </div>
          <div ref={outputRef} className="flex-1 overflow-auto p-4">
            {loadError ? (
              <p className="text-sm text-red-400">Pyodide 引擎加载失败，请检查网络连接后刷新页面。</p>
            ) : loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="animate-spin w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full" />
                正在加载 Python 引擎（首次可能需要几秒）...
              </div>
            ) : (
              <pre className="text-sm text-slate-700 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">{output}</pre>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

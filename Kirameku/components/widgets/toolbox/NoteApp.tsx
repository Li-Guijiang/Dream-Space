"use client";

import { useState, useEffect, useRef } from "react";

interface Note {
  id: string;
  text: string;
  createdAt: number;
  color: string;
}

const STORAGE_KEY = "toolbox-notes";
const COLORS = [
  "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700",
  "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700",
  "bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700",
  "bg-rose-100 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700",
  "bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700",
];

function loadNotes(): Note[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export default function NoteApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setNotes(loadNotes());
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (initialized.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  const addNote = () => {
    const text = input.trim();
    if (!text) return;
    setNotes((prev) => [
      { id: Date.now().toString(), text, createdAt: Date.now(), color: COLORS[prev.length % COLORS.length] },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const text = editText.trim();
    if (!text) { deleteNote(editingId); setEditingId(null); return; }
    setNotes((prev) => prev.map((n) => n.id === editingId ? { ...n, text } : n));
    setEditingId(null);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Input area */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote(); } }}
          placeholder="写点什么..."
          title="输入便签内容"
          className="flex-1 h-10 px-3 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 resize-y min-h-[40px] max-h-[200px] outline-none focus:ring-2 focus:ring-indigo-400/50 transition-shadow"
        />
        <button
          type="button"
          onClick={addNote}
          title="添加便签"
          className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 active:scale-95 transition-all shadow-md shadow-indigo-500/20 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-xs font-medium">还没有便签</span>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={`group rounded-xl border p-3 transition-all duration-200 hover:shadow-md ${note.color}`}>
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    title="编辑便签"
                    className="w-full px-2 py-1 rounded-lg bg-white/50 dark:bg-slate-800/50 text-sm text-slate-800 dark:text-slate-200 resize-none outline-none focus:ring-1 focus:ring-indigo-400"
                    autoFocus
                  />
                  <div className="flex gap-1 justify-end">
                    <button type="button" onClick={() => setEditingId(null)} title="取消"
                      className="px-2 py-0.5 text-xs rounded-lg text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors">取消</button>
                    <button type="button" onClick={saveEdit} title="保存"
                      className="px-2 py-0.5 text-xs rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">保存</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed">{note.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{formatDate(note.createdAt)}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => startEdit(note)} title="编辑"
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-500 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button type="button" onClick={() => deleteNote(note.id)} title="删除"
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Count */}
      {notes.length > 0 && (
        <div className="text-center text-[10px] text-slate-400 font-medium">
          {notes.length} 条便签
        </div>
      )}
    </div>
  );
}

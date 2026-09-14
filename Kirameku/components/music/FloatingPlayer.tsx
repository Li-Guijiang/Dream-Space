"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useMusic } from "@/components/providers/MusicProvider";

const modeIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  loop: {
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 1l4 4-4 4" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 11V9a4 4 0 014-4h14" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 23l-4-4 4-4" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 13v2a4 4 0 01-4 4H3" /></svg>,
    label: "列表循环",
  },
  single: {
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 1l4 4-4 4" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 11V9a4 4 0 014-4h14" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 23l-4-4 4-4" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 13v2a4 4 0 01-4 4H3" /><text x="10" y="15" fill="currentColor" stroke="none" fontSize="8" fontWeight="bold">1</text></svg>,
    label: "单曲循环",
  },
  random: {
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>,
    label: "随机播放",
  },
};

export default function FloatingPlayer() {
  const {
    currentSong, isPlaying, currentLyric, volume, isMuted, playMode, playlist, currentIndex,
    togglePlay, nextSong, prevSong, setVolume, toggleMute, togglePlayMode, playSong,
  } = useMusic();
  const [expanded, setExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistUp, setPlaylistUp] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const playlistBtnRef = useRef<HTMLButtonElement>(null);
  const didDrag = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  // Click outside to collapse
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setShowPlaylist(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expanded]);

  // Detect playlist dropdown direction
  const updatePlaylistDirection = useCallback(() => {
    if (!playlistBtnRef.current) return;
    const rect = playlistBtnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setPlaylistUp(spaceBelow < 280);
  }, []);

  const handleTogglePlaylist = () => {
    if (!showPlaylist) updatePlaylistDirection();
    setShowPlaylist((p) => !p);
  };

  if (!currentSong || !visible) return null;

  const volumeIcon = isMuted
    ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
    : volume > 0.5
    ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" /></svg>
    : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.54 8.46a5 5 0 010 7.07" /></svg>;

  return (
    <motion.div
      ref={panelRef}
      drag
      dragMomentum={false}
      dragElastic={false}
      onDragStart={() => { didDrag.current = true; }}
      onDragEnd={() => { setTimeout(() => { didDrag.current = false; }, 100); }}
      className="fixed bottom-24 left-6 z-30"
      style={{ touchAction: "none" }}
    >
      {expanded ? (
        /* Expanded pill bar with full controls */
        <div className="relative">
          <div className="flex items-center gap-1.5 h-12 pl-1 pr-1.5 rounded-full bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl select-none">
            {/* Cover */}
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm cursor-grab active:cursor-grabbing">
              <img src={currentSong.cover} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 max-w-[72px]">
              <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{currentSong.title}</div>
              {currentLyric && (
                <div className="text-[9px] text-indigo-600 dark:text-indigo-300 font-bold truncate">{currentLyric}</div>
              )}
            </div>

            {/* Prev */}
            <button type="button" onClick={prevSong} title="上一首"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:bg-white/40 dark:hover:bg-slate-700/50 transition-colors shrink-0">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
            </button>

            {/* Play/Pause */}
            <button type="button" onClick={togglePlay} title={isPlaying ? "暂停" : "播放"}
              className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors shadow shrink-0">
              {isPlaying
                ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                : <svg className="w-3.5 h-3.5 ml-px" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              }
            </button>

            {/* Next */}
            <button type="button" onClick={nextSong} title="下一首"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:bg-white/40 dark:hover:bg-slate-700/50 transition-colors shrink-0">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>

            {/* Play mode */}
            <button type="button" onClick={togglePlayMode} title={modeIcons[playMode].label}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-white/30 dark:hover:bg-slate-700/50 transition-colors shrink-0">
              {modeIcons[playMode].icon}
            </button>

            {/* Volume */}
            <button type="button" onClick={toggleMute} title={isMuted ? "取消静音" : "静音"}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-white/30 dark:hover:bg-slate-700/50 transition-colors shrink-0">
              {volumeIcon}
            </button>

            {/* Volume slider */}
            <input
              type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              title="音量"
              className="w-14 h-1 accent-indigo-500 cursor-pointer shrink-0"
            />

            {/* Playlist toggle */}
            <button ref={playlistBtnRef} type="button" onClick={handleTogglePlaylist} title="播放列表"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-white/30 dark:hover:bg-slate-700/50 transition-colors shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h10" /></svg>
            </button>

            {/* Collapse */}
            <button type="button" onClick={() => { setExpanded(false); setShowPlaylist(false); }} title="收起"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-700/50 transition-colors shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" /></svg>
            </button>
          </div>

          {/* Playlist dropdown */}
          {showPlaylist && (
            <div
              className={`absolute right-0 w-56 max-h-64 overflow-y-auto rounded-2xl bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl p-2 ${
                playlistUp ? "top-auto bottom-14" : "top-14 bottom-auto"
              }`}
            >
              {playlist.map((song, i) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => { playSong(i); setShowPlaylist(false); }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                    i === currentIndex
                      ? "bg-indigo-500/15 dark:bg-indigo-500/25"
                      : "hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <div className="w-7 h-7 rounded overflow-hidden shrink-0">
                    <img src={song.cover} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-bold truncate ${i === currentIndex ? "text-indigo-600 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200"}`}>
                      {song.title}
                    </div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{song.artist}</div>
                  </div>
                  {i === currentIndex && isPlaying && (
                    <div className="flex items-end gap-[1.5px] h-3 shrink-0">
                      {[0, 1, 2].map((j) => (
                        <div key={j} className="w-[2px] bg-indigo-500 rounded-t-sm animate-pulse" style={{ height: `${3 + j * 2}px`, animationDelay: `${j * 150}ms` }} />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Collapsed: small icon */
        <div
          onClick={() => { if (!didDrag.current) setExpanded(true); }}
          className="w-12 h-12 rounded-full bg-white/50 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl flex items-center justify-center select-none overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <img src={currentSong.cover} alt="" className="w-full h-full object-cover rounded-full pointer-events-none" draggable={false} />
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
              <div className="flex items-end gap-[2px] h-3">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="w-[3px] bg-white rounded-t-sm animate-pulse" style={{ height: `${4 + j * 3}px`, animationDelay: `${j * 150}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

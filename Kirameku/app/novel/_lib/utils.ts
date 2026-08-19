"use client";

export interface Book {
  bookUrl: string;
  name: string;
  author: string;
  coverUrl?: string;
  customCoverUrl?: string;
  intro?: string;
  durChapterTitle?: string;
  durChapterIndex?: number;
  totalChapterNum?: number;
  bookSourceUrl?: string;
}

export interface Chapter {
  title: string;
  index: number;
}

export interface SearchBook {
  bookUrl: string;
  name: string;
  author: string;
  coverUrl?: string;
  intro?: string;
  latestChapterTitle?: string;
  origin?: string;
  originName?: string;
}

export function proxyCover(url?: string): string {
  if (!url) return "";
  return `/reader3/cover?path=${encodeURIComponent(url)}`;
}

export function encodeBookUrl(url: string): string {
  return btoa(unescape(encodeURIComponent(url)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeBookUrl(encoded: string): string {
  try {
    let str = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return "";
  }
}

export const READING_SETTINGS_KEY = "novel_reading_settings";

export const defaultSettings = {
  fontSize: 18,
  lineHeight: 1.8,
  paragraphSpacing: 16,
  fontFamily: "serif",
  theme: "default",
  customColor: "#f5f0e8",
  contentWidth: "normal",
};

export type ReadingSettings = typeof defaultSettings;

export function loadSettings(): ReadingSettings {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(READING_SETTINGS_KEY);
    if (saved) {
      try { return { ...defaultSettings, ...JSON.parse(saved) }; } catch { /* */ }
    }
  }
  return defaultSettings;
}

export function saveSettings(s: ReadingSettings) {
  localStorage.setItem(READING_SETTINGS_KEY, JSON.stringify(s));
}

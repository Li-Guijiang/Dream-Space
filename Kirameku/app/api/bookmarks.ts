import { request } from "./client";

export interface BookmarkSite {
  id: number;
  category_id: number;
  name: string;
  url: string;
  icon: string;
  description: string;
  platforms: string[];
  sort: number;
  created_at: string;
}

export interface BookmarkCategory {
  id: number;
  name: string;
  icon: string;
  description: string;
  sort: number;
  created_at: string;
  sites: BookmarkSite[];
}

export function getBookmarks() {
  return request<BookmarkCategory[]>("/api/bookmarks");
}

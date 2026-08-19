import { request } from "./client";

export interface FriendLinkItem {
  id: number;
  name: string;
  url: string;
  avatar: string;
  description: string;
  sort: number;
  is_approved: boolean;
  created_at: string;
}

export function getFriendLinks() {
  return request<FriendLinkItem[]>("/api/friend-links");
}

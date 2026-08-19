import { request, qs } from "./client";

export interface PostItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  cover: string;
  category: string;
  tags: string[];
  status: string;
  is_pinned: boolean;
  views: number;
  likes: number;
  word_count: number;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostDetail extends PostItem {
  content: string;
}

export function getPosts(params?: {
  status?: string;
  category?: string;
  tag?: string;
  page?: number;
  size?: number;
}) {
  return request<PostItem[]>(`/api/posts${qs(params)}`);
}

export function getPostsCount(status?: string) {
  return request<{ count: number }>(
    `/api/posts/count${qs({ status })}`
  );
}

export function getPostBySlug(slug: string) {
  return request<PostDetail>(`/api/posts/${slug}`);
}

export function getPostById(postId: number) {
  return request<PostDetail>(`/api/posts/detail/${postId}`);
}

export function likePost(postId: number, unlike = false) {
  return request<{ likes: number }>(`/api/posts/${postId}/${unlike ? "unlike" : "like"}`, {
    method: "POST",
  });
}

import { http } from "@/utils/http";

export type PostItem = {
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
};

export type PostDetail = PostItem & { content: string };

/** 获取文章列表 */
export const getPosts = (params?: {
  status?: string;
  category?: string;
  tag?: string;
  page?: number;
  size?: number;
}) => {
  return http.request<PostItem[]>("get", "/api/posts", { params });
};

/** 获取文章数量 */
export const getPostCount = (params?: { status?: string }) => {
  return http.request<{ count: number }>("get", "/api/posts/count", { params });
};

/** 获取文章详情（按 slug，会增加浏览量） */
export const getPostBySlug = (slug: string) => {
  return http.request<PostDetail>("get", `/api/posts/${slug}`);
};

/** 获取文章详情（按 ID，编辑用） */
export const getPostById = (postId: number) => {
  return http.request<PostDetail>("get", `/api/posts/detail/${postId}`);
};

/** 创建文章 */
export const createPost = (data: {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  cover?: string;
  category_id?: number;
  tags?: string[];
  status?: string;
  is_pinned?: boolean;
}) => {
  return http.request<PostItem>("post", "/api/posts", { data });
};

/** 更新文章 */
export const updatePost = (
  postId: number,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    content?: string;
    cover?: string;
    category_id?: number;
    tags?: string[];
    status?: string;
    is_pinned?: boolean;
  }
) => {
  return http.request<PostItem>("put", `/api/posts/${postId}`, { data });
};

/** 删除文章 */
export const deletePost = (postId: number) => {
  return http.request<{ ok: boolean }>("delete", `/api/posts/${postId}`);
};

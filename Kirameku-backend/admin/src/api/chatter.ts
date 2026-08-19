import { http } from "@/utils/http";

export type ChatterItem = {
  id: number;
  content: string;
  images: string[];
  mood: string;
  likes: number;
  comments_count: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ChatterCommentItem = {
  id: number;
  chatter_id: number;
  parent_id: number | null;
  content: string;
  github_user: {
    id: number;
    login: string;
    avatar: string;
    bio: string;
  } | null;
  ip: string;
  status: string;
  created_at: string;
  replies: ChatterCommentItem[];
};

/** 获取说说列表（公开，仅已发布） */
export const getChatters = (params?: {
  status?: string;
  page?: number;
  size?: number;
}) => {
  return http.request<ChatterItem[]>("get", "/api/chatters", { params });
};

/** 获取说说列表（管理，支持全部状态） */
export const getAdminChatters = (params?: {
  status?: string;
  page?: number;
  size?: number;
}) => {
  return http.request<ChatterItem[]>("get", "/api/chatters/admin", { params });
};

/** 获取说说总数 */
export const getChatterCount = (status?: string) => {
  return http.request<{ count: number }>("get", "/api/chatters/count", {
    params: { status }
  });
};

/** 获取说说详情 */
export const getChatterById = (chatterId: number) => {
  return http.request<ChatterItem>("get", `/api/chatters/${chatterId}`);
};

/** 获取说说评论（公开） */
export const getChatterComments = (chatterId: number) => {
  return http.request<ChatterCommentItem[]>(
    "get",
    `/api/chatters/${chatterId}/comments`
  );
};

/** 获取说说评论列表（管理） */
export const getAdminChatterComments = (params?: {
  status?: string;
  page?: number;
  size?: number;
}) => {
  return http.request<ChatterCommentItem[]>(
    "get",
    "/api/chatters/comments/admin",
    { params }
  );
};

/** 更新评论状态（管理） */
export const updateChatterCommentStatus = (
  commentId: number,
  status: string
) => {
  return http.request<ChatterCommentItem>(
    "put",
    `/api/chatters/comments/${commentId}/status`,
    { data: { status } }
  );
};

/** 删除评论（管理） */
export const deleteChatterComment = (commentId: number) => {
  return http.request<{ ok: boolean }>(
    "delete",
    `/api/chatters/comments/${commentId}`
  );
};

/** 创建说说评论（公开） */
export const createChatterComment = (data: {
  chatter_id: number;
  content: string;
  parent_id?: number;
}) => {
  return http.request<ChatterCommentItem>("post", "/api/chatters/comments", {
    data
  });
};

/** 创建说说（管理） */
export const createChatter = (data: {
  content: string;
  images?: string[];
  mood?: string;
  status?: string;
}) => {
  return http.request<ChatterItem>("post", "/api/chatters", { data });
};

/** 更新说说（管理） */
export const updateChatter = (
  chatterId: number,
  data: {
    content?: string;
    images?: string[];
    mood?: string;
    status?: string;
  }
) => {
  return http.request<ChatterItem>("put", `/api/chatters/${chatterId}`, {
    data
  });
};

/** 删除说说（管理） */
export const deleteChatter = (chatterId: number) => {
  return http.request<{ ok: boolean }>("delete", `/api/chatters/${chatterId}`);
};

/** 上传图片到 OSS */
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return http.request<{ url: string; orientation: string }>(
    "post",
    "/api/upload/image",
    {
      data: formData,
      headers: { "Content-Type": "multipart/form-data" }
    }
  );
};

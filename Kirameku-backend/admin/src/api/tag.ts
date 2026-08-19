import { http } from "@/utils/http";

export type TagItem = {
  id: number;
  name: string;
  slug: string;
  post_count: number;
};

/** 获取标签列表 */
export const getTags = () => {
  return http.request<TagItem[]>("get", "/api/tags");
};

/** 创建标签 */
export const createTag = (data: { name: string; slug: string }) => {
  return http.request<TagItem>("post", "/api/tags", { data });
};

/** 更新标签 */
export const updateTag = (
  tagId: number,
  data: { name?: string; slug?: string }
) => {
  return http.request<TagItem>("put", `/api/tags/${tagId}`, { data });
};

/** 删除标签 */
export const deleteTag = (tagId: number) => {
  return http.request<{ ok: boolean }>("delete", `/api/tags/${tagId}`);
};

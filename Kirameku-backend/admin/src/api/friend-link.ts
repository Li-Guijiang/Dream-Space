import { http } from "@/utils/http";

export type FriendLinkItem = {
  id: number;
  name: string;
  url: string;
  avatar: string;
  description: string;
  sort: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
};

/** 获取友链列表（管理，含未审核） */
export const getFriendLinks = () => {
  return http.request<FriendLinkItem[]>("get", "/api/friend-links/admin");
};

/** 创建友链 */
export const createFriendLink = (data: {
  name: string;
  url: string;
  avatar?: string;
  description?: string;
  sort?: number;
}) => {
  return http.request<FriendLinkItem>("post", "/api/friend-links", { data });
};

/** 更新友链 */
export const updateFriendLink = (
  linkId: number,
  data: {
    name?: string;
    url?: string;
    avatar?: string;
    description?: string;
    sort?: number;
    is_approved?: boolean;
  }
) => {
  return http.request<FriendLinkItem>("put", `/api/friend-links/${linkId}`, {
    data
  });
};

/** 删除友链 */
export const deleteFriendLink = (linkId: number) => {
  return http.request<{ ok: boolean }>("delete", `/api/friend-links/${linkId}`);
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

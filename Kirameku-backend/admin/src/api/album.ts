import { http } from "@/utils/http";

export type AlbumItem = {
  id: number;
  title: string;
  description: string;
  cover: string;
  photo_count: number;
  sort: number;
  created_at: string;
  updated_at: string;
};

export type PhotoItem = {
  id: number;
  album_id: number;
  url: string;
  caption: string;
  orientation: string;
  sort: number;
  created_at: string;
};

/** 获取相册列表 */
export const getAlbums = () => {
  return http.request<AlbumItem[]>("get", "/api/albums");
};

/** 创建相册 */
export const createAlbum = (data: {
  title: string;
  description?: string;
  cover?: string;
  sort?: number;
}) => {
  return http.request<AlbumItem>("post", "/api/albums", { data });
};

/** 更新相册 */
export const updateAlbum = (
  albumId: number,
  data: { title?: string; description?: string; cover?: string; sort?: number }
) => {
  return http.request<AlbumItem>("put", `/api/albums/${albumId}`, { data });
};

/** 删除相册 */
export const deleteAlbum = (albumId: number) => {
  return http.request<{ ok: boolean }>("delete", `/api/albums/${albumId}`);
};

/** 获取相册照片列表 */
export const getAlbumPhotos = (albumId: number) => {
  return http.request<PhotoItem[]>("get", `/api/albums/${albumId}/photos`);
};

/** 添加照片 */
export const createPhoto = (data: {
  album_id: number;
  url: string;
  caption?: string;
  orientation?: string;
  sort?: number;
}) => {
  return http.request<PhotoItem>("post", "/api/albums/photos", { data });
};

/** 删除照片 */
export const deletePhoto = (photoId: number) => {
  return http.request<{ ok: boolean }>(
    "delete",
    `/api/albums/photos/${photoId}`
  );
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

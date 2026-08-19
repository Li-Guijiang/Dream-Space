import { http } from "@/utils/http";

export type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort: number;
  post_count: number;
  created_at: string;
  updated_at: string;
};

/** 获取分类列表 */
export const getCategories = () => {
  return http.request<CategoryItem[]>("get", "/api/categories");
};

/** 创建分类 */
export const createCategory = (data: {
  name: string;
  slug: string;
  description?: string;
  sort?: number;
}) => {
  return http.request<CategoryItem>("post", "/api/categories", { data });
};

/** 更新分类 */
export const updateCategory = (
  catId: number,
  data: { name?: string; slug?: string; description?: string; sort?: number }
) => {
  return http.request<CategoryItem>("put", `/api/categories/${catId}`, { data });
};

/** 删除分类 */
export const deleteCategory = (catId: number) => {
  return http.request<{ ok: boolean }>("delete", `/api/categories/${catId}`);
};

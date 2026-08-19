import { http } from "@/utils/http";

export type BookmarkCategoryItem = {
  id: number;
  name: string;
  icon: string;
  description: string;
  sort: number;
  created_at: string;
  updated_at: string;
};

export type BookmarkSiteItem = {
  id: number;
  category_id: number;
  name: string;
  url: string;
  icon: string;
  description: string;
  platforms: string[];
  sort: number;
  created_at: string;
  updated_at: string;
};

// ---- 分类 ----

/** 获取分类列表 */
export const getBookmarkCategories = () => {
  return http.request<BookmarkCategoryItem[]>(
    "get",
    "/api/bookmarks/categories"
  );
};

/** 创建分类 */
export const createBookmarkCategory = (data: {
  name: string;
  icon?: string;
  description?: string;
  sort?: number;
}) => {
  return http.request<BookmarkCategoryItem>(
    "post",
    "/api/bookmarks/categories",
    { data }
  );
};

/** 更新分类 */
export const updateBookmarkCategory = (
  catId: number,
  data: { name?: string; icon?: string; description?: string; sort?: number }
) => {
  return http.request<BookmarkCategoryItem>(
    "put",
    `/api/bookmarks/categories/${catId}`,
    { data }
  );
};

/** 删除分类 */
export const deleteBookmarkCategory = (catId: number) => {
  return http.request<{ ok: boolean }>(
    "delete",
    `/api/bookmarks/categories/${catId}`
  );
};

// ---- 站点 ----

/** 获取站点列表 */
export const getBookmarkSites = (categoryId?: number) => {
  const params = categoryId != null ? { category_id: categoryId } : undefined;
  return http.request<BookmarkSiteItem[]>("get", "/api/bookmarks/sites", {
    params
  });
};

/** 创建站点 */
export const createBookmarkSite = (data: {
  category_id: number;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  platforms?: string[];
  sort?: number;
}) => {
  return http.request<BookmarkSiteItem>("post", "/api/bookmarks/sites", {
    data
  });
};

/** 更新站点 */
export const updateBookmarkSite = (
  siteId: number,
  data: {
    category_id?: number;
    name?: string;
    url?: string;
    icon?: string;
    description?: string;
    platforms?: string[];
    sort?: number;
  }
) => {
  return http.request<BookmarkSiteItem>(
    "put",
    `/api/bookmarks/sites/${siteId}`,
    { data }
  );
};

/** 删除站点 */
export const deleteBookmarkSite = (siteId: number) => {
  return http.request<{ ok: boolean }>(
    "delete",
    `/api/bookmarks/sites/${siteId}`
  );
};

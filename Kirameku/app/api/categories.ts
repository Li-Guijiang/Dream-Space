import { request } from "./client";

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort: number;
  post_count: number;
}

export function getCategories() {
  return request<CategoryItem[]>("/api/categories");
}

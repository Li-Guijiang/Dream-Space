import { http } from "@/utils/http";

export type DashboardStats = {
  counts: {
    posts: number;
    drafts: number;
    categories: number;
    tags: number;
    comments: number;
    messages: number;
    visitors: number;
  };
  post_trend: Array<{ date: string; count: number }>;
  visitor_trend: Array<{ date: string; count: number }>;
  category_distribution: Array<{ name: string; value: number }>;
  browser_distribution: Array<{ name: string; value: number }>;
};

/** 获取仪表盘统计数据 */
export const getDashboardStats = () => {
  return http.request<DashboardStats>("get", "/api/dashboard/stats");
};

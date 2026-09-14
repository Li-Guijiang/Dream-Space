import { http } from "@/utils/http";

export type ProjectItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  long_description: string;
  cover_image: string;
  tech_stack: string[];
  link_github: string;
  link_gitee: string;
  link_live: string;
  link_docs: string;
  status: string;
  status_label: string;
  is_featured: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
};

/** 获取项目列表 */
export const getProjects = () => {
  return http.request<ProjectItem[]>("get", "/api/projects");
};

/** 创建项目 */
export const createProject = (data: Partial<ProjectItem>) => {
  return http.request<ProjectItem>("post", "/api/projects", { data });
};

/** 更新项目 */
export const updateProject = (projectId: number, data: Partial<ProjectItem>) => {
  return http.request<ProjectItem>("put", `/api/projects/${projectId}`, { data });
};

/** 删除项目 */
export const deleteProject = (projectId: number) => {
  return http.request<{ ok: boolean }>("delete", `/api/projects/${projectId}`);
};

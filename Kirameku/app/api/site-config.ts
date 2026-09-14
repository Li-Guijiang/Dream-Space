import { request } from "./client";

export interface SiteConfigItem {
  id: number;
  key: string;
  value: string;
  description: string;
}

export function getSiteConfig() {
  return request<Record<string, string>>("/api/site-config");
}

export function getSiteConfigByKey(key: string) {
  return request<SiteConfigItem>(`/api/site-config/${key}`);
}

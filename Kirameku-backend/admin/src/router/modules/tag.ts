import { tag } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/tag",
  name: "Tag",
  component: Layout,
  redirect: "/tag/index",
  meta: {
    icon: "ri:bookmark-3-line",
    title: "标签管理",
    rank: tag
  },
  children: [
    {
      path: "/tag/index",
      name: "TagIndex",
      component: () => import("@/views/tag/index.vue"),
      meta: {
        title: "标签管理"
      }
    }
  ]
} satisfies RouteConfigsTable;

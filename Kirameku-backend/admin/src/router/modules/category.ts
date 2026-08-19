import { category } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/category",
  name: "Category",
  component: Layout,
  redirect: "/category/index",
  meta: {
    icon: "ri:folder-open-line",
    title: "分类管理",
    rank: category
  },
  children: [
    {
      path: "/category/index",
      name: "CategoryIndex",
      component: () => import("@/views/category/index.vue"),
      meta: {
        title: "分类管理"
      }
    }
  ]
} satisfies RouteConfigsTable;

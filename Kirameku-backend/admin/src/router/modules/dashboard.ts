import { dashboard } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/dashboard",
  name: "Dashboard",
  component: Layout,
  redirect: "/dashboard/index",
  meta: {
    icon: "ri:dashboard-3-line",
    title: "仪表盘",
    rank: dashboard
  },
  children: [
    {
      path: "/dashboard/index",
      name: "DashboardIndex",
      component: () => import("@/views/dashboard/index.vue"),
      meta: {
        title: "仪表盘"
      }
    }
  ]
} satisfies RouteConfigsTable;

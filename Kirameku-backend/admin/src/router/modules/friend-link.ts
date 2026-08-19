import { friendLink } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/friend-link",
  name: "FriendLink",
  component: Layout,
  redirect: "/friend-link/index",
  meta: {
    icon: "ri:links-line",
    title: "友链管理",
    rank: friendLink
  },
  children: [
    {
      path: "/friend-link/index",
      name: "FriendLinkIndex",
      component: () => import("@/views/friend-link/index.vue"),
      meta: {
        title: "友链管理"
      }
    }
  ]
} satisfies RouteConfigsTable;

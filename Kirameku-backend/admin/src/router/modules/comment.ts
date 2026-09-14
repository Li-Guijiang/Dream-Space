import { comment } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/comment",
  name: "Comment",
  component: Layout,
  redirect: "/comment/index",
  meta: {
    icon: "ri:chat-3-line",
    title: "评论管理",
    rank: comment
  },
  children: [
    {
      path: "/comment/index",
      name: "CommentIndex",
      component: () => import("@/views/comment/index.vue"),
      meta: {
        title: "评论管理"
      }
    }
  ]
} satisfies RouteConfigsTable;

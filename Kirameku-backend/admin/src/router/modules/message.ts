import { message } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/message",
  name: "Message",
  component: Layout,
  redirect: "/message/index",
  meta: {
    icon: "ri:message-3-line",
    title: "留言管理",
    rank: message
  },
  children: [
    {
      path: "/message/index",
      name: "MessageIndex",
      component: () => import("@/views/message/index.vue"),
      meta: {
        title: "留言管理"
      }
    }
  ]
} satisfies RouteConfigsTable;

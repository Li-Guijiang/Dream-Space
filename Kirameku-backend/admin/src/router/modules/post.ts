import { post } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/post",
  name: "Post",
  component: Layout,
  redirect: "/post/index",
  meta: {
    icon: "ri:article-line",
    title: "文章管理",
    rank: post
  },
  children: [
    {
      path: "/post/index",
      name: "PostIndex",
      component: () => import("@/views/post/index.vue"),
      meta: {
        title: "文章列表"
      }
    },
    {
      path: "/post/edit/:id?",
      name: "PostEdit",
      component: () => import("@/views/post/edit.vue"),
      meta: {
        title: "编辑文章",
        showLink: false,
        activePath: "/post/index"
      }
    }
  ]
} satisfies RouteConfigsTable;

import { album } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/album",
  name: "Album",
  component: Layout,
  redirect: "/album/index",
  meta: {
    icon: "ri:image-2-line",
    title: "相册管理",
    rank: album
  },
  children: [
    {
      path: "/album/index",
      name: "AlbumIndex",
      component: () => import("@/views/album/index.vue"),
      meta: {
        title: "相册管理"
      }
    }
  ]
} satisfies RouteConfigsTable;

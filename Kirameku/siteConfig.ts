// siteConfig.ts - 全站配置中心

export const siteConfig = {
  // 网站标题与博主信息
  title: "Dream-Space 梦境空间",
  url: "https://dream-space.vip",
  authorName: "Dream-Space",
  bio: "项目开源在 GitHub,点击下面的GitHub图标跳转,欢迎 star 和 fork！(◕‿◕)",

  // 头像设置
  avatarUrl: "/images/hong.jpg",

  // 背景设置
  useGradient: false,
  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"],
  bgImages: [
    "/images/1.webp",
    "/images/42.webp",
    "/images/20.webp",
    "/images/36.webp",
    "/images/39.webp",
    "/images/41.webp",
  ],

  // 默认封面图
  defaultPostCover: "/images/default-cover.jpg",

  // 照片墙预览图
  photoWallImage: "/images/photo-wall.jpg",

  // 云音乐配置（网易云音乐）
  // 填歌单 ID 则自动拉取整个歌单，填歌曲 ID 列表则只播放指定歌曲
  cloudMusicPlaylistId: "17943739323",  // 歌单 ID（优先）
  cloudMusicIds: [],                     // 歌曲 ID 列表（歌单为空时使用）

  // 后端 API 地址（留空，开发通过 next.config.ts rewrites 代理，生产通过 Nginx 反代）
  apiBaseUrl: "",

  // 社交链接
  social: {
    github: "https://github.com/Li-Guijiang/Dream-Space",
    gitee: "https://gitee.com/hongzyh",
    google: "mailto:guh982719@gmail.com",
    email: "your.email@example.com",
    qq: "123456789",
    wechat: "your_wechat_id",
  },

  // 站点信息
  buildDate: "2026-05-07T12:00:00",
  footerBadges: [
    { name: "Next.js 15", color: "text-sky-500" },
    { name: "React 19", color: "text-cyan-400" },
    { name: "Tailwind 4", color: "text-teal-400" },
  ],
  // 备案号（域名备案通过后填写，例如 "赣ICP备XXXXXXXX号"）
  icpConfig: {
    name: "",
    link: "https://beian.miit.gov.cn/",
  },
  moeIcpConfig: {
    name: "",
    link: "https://icp.gov.moe/?keyword=20260527",
  },

  // 分类标题
  chatterTitle: "留言",
  chatterDescription: "生活、技术、随想的碎片记录",
};

// siteConfig.ts - 全站配置中心

export const siteConfig = {
  // 网站标题与博主信息
  title: "Dream-Space 梦境空间",
  url: "https://dream-space.vip",
  authorName: "李贵江",
  bio: "你好，我是李贵江。梦境空间（Dream—Space）的项目创始人",

  // 头像设置
  avatarUrl: "/images/liguijiagn.jpg",

  // 背景设置（支持图片 webp/jpg 或视频 mp4，动态壁纸）
  useGradient: false,
  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"],
  // 视频背景加载前的占位图（可选，留空则直接加载视频）
  bgPoster: "",
  bgImages: [
    "/videos/bg1.mp4",
    "/videos/bg2.mp4",
    "/videos/bg3.mp4",
    "/videos/bg4.mp4",
    "/videos/bg5.mp4",
    "/videos/bg6.mp4",
    "/videos/bg7.mp4",
    "/videos/bg8.mp4",
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
    gitee: "",
    google: "",
    email: "your.email@example.com",
    qq: "",
    wechat: "",
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
    name: "黔ICP备2026016307号-1",
    link: "https://beian.miit.gov.cn/",
  },
  // 公安联网备案（网站安全备案）
  gonganConfig: {
    name: "贵公网安备52052202522645号",
    link: "https://beian.mps.gov.cn/",
    badgeImage: "/images/gongan.png",
  },
  moeIcpConfig: {
    name: "",
    link: "https://icp.gov.moe/?keyword=20260527",
  },

  // 分类标题
  chatterTitle: "留言",
  chatterDescription: "生活、技术、随想的碎片记录",
};

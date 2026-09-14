export interface Project {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  coverImage: string;
  techStack: string[];
  links: {
    github?: string;
    gitee?: string;
    live?: string;
    docs?: string;
  };
  featured?: boolean;
  status: "active" | "archived" | "developing";
  statusLabel: string;
}

export const projects: Project[] = [
  {
    id: "dream-space",
    name: "Dream-Space 梦境空间",
    description: "全栈创意社区 / 个人博客系统 — 记录技术、生活与随想的梦境空间",
    longDescription:
      "基于 Next.js 16 + React 19 + FastAPI 的全栈个人博客与创意社区，支持文章、说说、照片墙、小说阅读、收藏夹、友链、音乐、时间河流等模块。前端采用玻璃拟态（Glassmorphism）设计，后端 FastAPI + SQLModel，附 Vue 管理后台。",
    coverImage: "/images/projects/haxatom.webp",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "FastAPI", "Vue 3"],
    links: {
      github: "https://github.com/Li-Guijiang/Dream-Space",
    },
    featured: true,
    status: "active",
    statusLabel: "维护中",
  },
];

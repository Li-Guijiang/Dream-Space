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
    id: "haxatom",
    name: "HAXAtom",
    description: "原子化解耦 · 乐高式拼装 — 全栈 AI 智能体管理与多端分发平台",
    longDescription:
      "基于 LangChain/LangGraph 的 AI 智能体管理平台，支持 RAG 知识库、可视化 Agent 编排、多渠道分发（Web、飞书、钉钉、QQ、Telegram）。采用原子化架构设计，模块可自由组合，乐高式拼装。",
    coverImage: "/images/projects/haxatom.webp",
    techStack: ["Python", "Vue 3", "FastAPI", "LangChain", "LangGraph", "RAG"],
    links: {
      github: "https://github.com/Xinghongia/HAXAtom",
    },
    featured: true,
    status: "active",
    statusLabel: "维护中",
  },
  {
    id: "starvid",
    name: "StarVid 星河",
    description: "全功能即时通讯社交应用 — 实时聊天、好友管理、群组、朋友圈",
    longDescription:
      "前后端分离架构的 IM 社交应用，支持文本/图片/语音/视频/文件消息、好友管理、群聊 @ 功能、朋友圈动态、WebSocket 实时推送、JWT 双令牌认证。前端 Flutter + GetX，后端 Spring Boot + MyBatis-Plus + MySQL + Redis。",
    coverImage: "/images/projects/starvid.webp",
    techStack: ["Flutter", "Spring Boot", "MySQL", "Redis", "WebSocket", "GetX", "MyBatis-Plus"],
    links: {
      gitee: "https://gitee.com/hongzyh/xinhe",
    },
    featured: false,
    status: "active",
    statusLabel: "开发中",
  },
  {
    id: "hiromu-top",
    name: "hiromu.top",
    description: "资源分享站点",
    longDescription:
      "基于 Vue 构建的资源分享网站，提供丰富的前端交互体验和优质的资源分享。",
    coverImage: "/images/projects/hiromu-top.webp",
    techStack: ["Vue", "APlayer", "Live2D", "CSS3"],
    links: {
      live: "https://hiromu.top/",
    },
    featured: false,
    status: "active",
    statusLabel: "已上线",
  },
];

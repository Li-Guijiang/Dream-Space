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
  {
    id: "fengxiangxi-website",
    name: "枫香溪数智乡村官网",
    description: "红色文化传承与绿色产业振兴的数智乡村官方网站",
    longDescription:
      "为枫香溪打造的数智乡村官网，聚焦红色文化传承与绿色产业振兴，采用 Vue 构建的现代化展示型网站。",
    coverImage: "/images/projects/haxatom.webp",
    techStack: ["Vue", "Vite", "JavaScript", "CSS"],
    links: {
      github: "https://github.com/Li-Guijiang/fengxiangxi-website",
    },
    featured: true,
    status: "active",
    statusLabel: "维护中",
  },
  {
    id: "dream",
    name: "Dream",
    description: "Natural Research — 自然研究相关项目",
    longDescription:
      "自然研究（Natural Research）方向的 Java 项目。",
    coverImage: "/images/projects/haxatom.webp",
    techStack: ["Java"],
    links: {
      github: "https://github.com/Li-Guijiang/Dream",
    },
    status: "developing",
    statusLabel: "开发中",
  },
  {
    id: "tsp-optimization",
    name: "TSP 算法对比研究",
    description: "旅行商问题（TSP）的遗传算法 / 粒子群 / 蚁群算法对比研究",
    longDescription:
      "针对旅行商问题（TSP），采用遗传算法（GA）、粒子群优化算法（PSO）和蚁群优化算法（ACO）进行对比研究。通过数值实验评估三种算法在路径长度和收敛性能方面的表现。结果显示 PSO 收敛速度优势显著，ACO 稳定性与全局搜索能力优越，GA 最终路径质量最佳。",
    coverImage: "/images/projects/haxatom.webp",
    techStack: ["Python", "算法", "优化"],
    links: {
      github: "https://github.com/Li-Guijiang/Optimization-and-Performance-Comparison-of-TSP-Using-GA-PSO-and-ACO",
    },
    status: "archived",
    statusLabel: "已归档",
  },
  {
    id: "math",
    name: "math",
    description: "数学相关练习与代码",
    longDescription: "数学相关的代码练习仓库。",
    coverImage: "/images/projects/haxatom.webp",
    techStack: ["Python"],
    links: {
      github: "https://github.com/Li-Guijiang/math",
    },
    status: "archived",
    statusLabel: "已归档",
  },
  {
    id: "python",
    name: "Python",
    description: "Python 学习与实验代码",
    longDescription: "Python 学习过程中的实验与练习代码（Jupyter Notebook）。",
    coverImage: "/images/projects/haxatom.webp",
    techStack: ["Python", "Jupyter Notebook"],
    links: {
      github: "https://github.com/Li-Guijiang/Python",
    },
    status: "archived",
    statusLabel: "已归档",
  },
  {
    id: "blender",
    name: "Blender",
    description: "Blender 3D 建模练习",
    longDescription: "Blender 3D 建模相关的练习与作品。",
    coverImage: "/images/projects/haxatom.webp",
    techStack: ["Blender", "3D"],
    links: {
      github: "https://github.com/Li-Guijiang/Blender",
    },
    status: "developing",
    statusLabel: "开发中",
  },
  {
    id: "bluearchive",
    name: "BlueArchive",
    description: "Blue Archive 碧蓝档案相关项目",
    longDescription: "碧蓝档案（Blue Archive）相关的 CSS / 前端练习项目。",
    coverImage: "/images/projects/haxatom.webp",
    techStack: ["CSS", "前端"],
    links: {
      github: "https://github.com/Li-Guijiang/BlueArchive",
    },
    status: "developing",
    statusLabel: "开发中",
  },
  {
    id: "fengxiangxi",
    name: "fengxiangxi",
    description: "数智枫香溪网站",
    longDescription: "数智枫香溪相关的 Vue 网站项目。",
    coverImage: "/images/projects/haxatom.webp",
    techStack: ["Vue"],
    links: {
      github: "https://github.com/Li-Guijiang/fengxiangxi",
    },
    status: "developing",
    statusLabel: "开发中",
  },
];

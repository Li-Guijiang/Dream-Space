export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  cover: string;
}

export const postsData: Post[] = [
  {
    slug: "nextjs-15-new-features",
    title: "Next.js 15 新特性深度解析",
    description: "从 App Router 到 Server Components，探索 Next.js 15 带来的革命性变化。",
    date: "2026-04-28",
    category: "技术",
    tags: ["Next.js", "React", "前端"],
    cover: "https://picsum.photos/seed/nextjs/800/400",
  },
  {
    slug: "tailwind-css-tips",
    title: "Tailwind CSS 进阶技巧合集",
    description: "掌握这些 Tailwind 技巧，让你的开发效率翻倍。",
    date: "2026-04-20",
    category: "技术",
    tags: ["Tailwind", "CSS", "前端"],
    cover: "https://picsum.photos/seed/tailwind/800/400",
  },
  {
    slug: "molecular-dynamics-intro",
    title: "分子动力学模拟入门指南",
    description: "从零开始学习 GROMACS，探索微观世界的奥秘。",
    date: "2026-04-15",
    category: "学术",
    tags: ["GROMACS", "分子动力学", "计算化学"],
    cover: "https://picsum.photos/seed/molecular/800/400",
  },
  {
    slug: "rust-learning-path",
    title: "Rust 学习路线图 2026",
    description: "系统化的 Rust 学习路径，从入门到实战。",
    date: "2026-04-10",
    category: "技术",
    tags: ["Rust", "编程语言"],
    cover: "https://picsum.photos/seed/rust/800/400",
  },
  {
    slug: "neural-network-basics",
    title: "神经网络基础：从感知机到深度学习",
    description: "理解神经网络的核心原理，开启 AI 学习之旅。",
    date: "2026-04-05",
    category: "学术",
    tags: ["神经网络", "深度学习", "AI"],
    cover: "https://picsum.photos/seed/neural/800/400",
  },
  {
    slug: "spring-travel-notes",
    title: "春日漫游：西湖骑行记",
    description: "趁着春风正好，骑行环绕西湖一圈的惬意时光。",
    date: "2026-03-28",
    category: "生活",
    tags: ["旅行", "骑行", "杭州"],
    cover: "https://picsum.photos/seed/spring/800/400",
  },
];

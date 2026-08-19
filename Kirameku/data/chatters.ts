export interface Chatter {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export const chattersData: Chatter[] = [
  {
    slug: "gromacs-running",
    title: "GROMACS 跑起来了！",
    description: "折腾了三天三夜，分子动力学模拟终于成功运行。结果看起来还不错，RMSD 稳定在 0.2nm 左右。",
    date: "2026-04-25",
    tags: ["GROMACS", "模拟"],
  },
  {
    slug: "new-mechanical-keyboard",
    title: "新键盘到了",
    description: "入了一把 HHKB Professional Type-S，打字手感真的绝了。就是价格有点肉疼...",
    date: "2026-04-18",
    tags: ["外设", "开箱"],
  },
  {
    slug: "bug-at-3am",
    title: "凌晨三点的 Bug",
    description: "一个诡异的 Bug 折腾到凌晨三点，最后发现是少了一个分号。程序员的日常。",
    date: "2026-04-12",
    tags: ["Debug", "日常"],
  },
  {
    slug: "cat-adopted",
    title: "捡到一只猫",
    description: "实验室楼下捡到一只小橘猫，看起来才两个月大。已经带去宠物医院检查了，很健康！",
    date: "2026-04-08",
    tags: ["猫咪", "日常"],
  },
  {
    slug: "coffee-discovery",
    title: "发现一家宝藏咖啡店",
    description: "学校后门新开了一家手冲咖啡店，老板是个很有故事的人。耶加雪菲真的好喝。",
    date: "2026-04-01",
    tags: ["咖啡", "探店"],
  },
];

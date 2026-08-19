export interface Photo {
  url: string;
  caption?: string;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  cover: string;
  date: string;
  photos: Photo[];
}

export const albums: Album[] = [
  {
    id: "spring-2026",
    title: "2026 春日影像",
    description: "记录这个春天的美好瞬间",
    cover: "https://picsum.photos/seed/spring26/800/600",
    date: "2026.03",
    photos: [
      { url: "https://picsum.photos/seed/s1/800/600", caption: "樱花盛开" },
      { url: "https://picsum.photos/seed/s2/800/600", caption: "西湖落日" },
      { url: "https://picsum.photos/seed/s3/800/600", caption: "校园一角" },
    ],
  },
  {
    id: "lab-life",
    title: "实验室日常",
    description: "科研人的苦与乐",
    cover: "https://picsum.photos/seed/lab/800/600",
    date: "2026.02",
    photos: [
      { url: "https://picsum.photos/seed/l1/800/600", caption: "分子模型" },
      { url: "https://picsum.photos/seed/l2/800/600", caption: "深夜实验室" },
    ],
  },
];

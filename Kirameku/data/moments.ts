export interface Moment {
  id: string;
  content: string;
  images?: string[];
  mood?: string;
  likes: number;
  created_at: string;
}

export const momentsData: Moment[] = [
  {
    id: "1",
    content: "今天终于把博客的照片墙做好了，毛玻璃效果真好看。",
    images: [],
    mood: "开心",
    likes: 3,
    created_at: "2026-05-05T18:30:00",
  },
  {
    id: "2",
    content: "下午拍了一组照片，夕阳真的太美了。光是调色就花了一个小时，但值得。",
    images: ["/images/1.webp", "/images/42.webp"],
    mood: "满足",
    likes: 5,
    created_at: "2026-05-05T14:20:00",
  },
  {
    id: "3",
    content: "中午吃了一碗超辣的螺蛳粉，辣到怀疑人生，但是好爽。",
    mood: "🌶️",
    likes: 2,
    created_at: "2026-05-05T12:00:00",
  },
  {
    id: "4",
    content: "新买的机械键盘到了，打字手感绝了，青轴的声音太治愈。",
    images: [],
    likes: 4,
    created_at: "2026-05-04T20:15:00",
  },
  {
    id: "5",
    content: "今天下雨了，窝在宿舍看了一天动漫，好久没有这么放松了。",
    mood: "悠闲",
    likes: 6,
    created_at: "2026-05-04T16:00:00",
  },
  {
    id: "6",
    content: "论文终于写完了初稿，接下来就是无尽的修改……",
    mood: "累",
    likes: 8,
    created_at: "2026-05-03T23:45:00",
  },
  {
    id: "7",
    content: "和朋友去了新开的咖啡店，拿铁拉花是一只猫，舍不得喝。",
    images: ["/images/20.webp"],
    mood: "☕",
    likes: 7,
    created_at: "2026-05-03T15:30:00",
  },
  {
    id: "8",
    content: "凌晨三点还在改 bug，程序员的日常。",
    mood: "😴",
    likes: 3,
    created_at: "2026-05-02T03:00:00",
  },
  {
    id: "9",
    content: "今天天气真好，适合出去走走。拍了几张照片，记录一下春天的尾巴。",
    images: ["/images/36.webp", "/images/39.webp", "/images/41.webp"],
    mood: "🌸",
    likes: 10,
    created_at: "2026-05-02T10:20:00",
  },
];

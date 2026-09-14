export interface Photo {
  id: string;
  url: string;
  caption: string;
  orientation: "landscape" | "portrait" | "square";
}

export interface PhotoDay {
  date: string;
  label: string;
  photos: Photo[];
}

export const photoDays: PhotoDay[] = [
  {
    date: "2024-12-27",
    label: "2024年12月27日",
    photos: [
      { id: "119", url: "/images/119.webp", caption: "", orientation: "portrait" },
      { id: "121", url: "/images/121.webp", caption: "", orientation: "portrait" },
      { id: "127", url: "/images/127.webp", caption: "", orientation: "portrait" },
      { id: "130", url: "/images/130.webp", caption: "", orientation: "portrait" },
      { id: "133", url: "/images/133.webp", caption: "", orientation: "portrait" },
      { id: "134", url: "/images/134.webp", caption: "", orientation: "portrait" },
    ],
  },
  {
    date: "2024-12-15",
    label: "2024年12月15日",
    photos: [
      { id: "55", url: "/images/55.webp", caption: "", orientation: "landscape" },
      { id: "57", url: "/images/57.webp", caption: "", orientation: "landscape" },
      { id: "58", url: "/images/58.webp", caption: "", orientation: "landscape" },
      { id: "60", url: "/images/60.webp", caption: "", orientation: "landscape" },
      { id: "61", url: "/images/61.webp", caption: "", orientation: "landscape" },
      { id: "63", url: "/images/63.webp", caption: "", orientation: "landscape" },
    ],
  },
  {
    date: "2024-12-14",
    label: "2024年12月14日",
    photos: [
      { id: "20", url: "/images/20.webp", caption: "", orientation: "landscape" },
      { id: "34", url: "/images/34.webp", caption: "", orientation: "landscape" },
      { id: "36", url: "/images/36.webp", caption: "", orientation: "landscape" },
      { id: "39", url: "/images/39.webp", caption: "", orientation: "landscape" },
      { id: "41", url: "/images/41.webp", caption: "", orientation: "landscape" },
      { id: "42", url: "/images/42.webp", caption: "", orientation: "landscape" },
    ],
  },
];

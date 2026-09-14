import HomeClient from "./HomeClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchProfileData() {
  try {
    const [postsRes, chattersRes, albums] = await Promise.all([
      fetch(`${API}/api/posts/count?status=published`, { next: { revalidate: 60 } }).then((r) => r.json()),
      fetch(`${API}/api/chatters/count?status=published`, { next: { revalidate: 60 } }).then((r) => r.json()),
      fetch(`${API}/api/albums`, { next: { revalidate: 60 } }).then((r) => r.json()),
    ]);
    return {
      postCount: postsRes.count ?? 0,
      chatterCount: chattersRes.count ?? 0,
      photoCount: Array.isArray(albums)
        ? albums.reduce((acc: number, a: { photo_count?: number }) => acc + (a.photo_count ?? 0), 0)
        : 0,
    };
  } catch {
    return { postCount: 0, chatterCount: 0, photoCount: 0 };
  }
}

export default async function Home() {
  const { postCount, chatterCount, photoCount } = await fetchProfileData();

  return (
    <HomeClient
      postCount={postCount}
      chatterCount={chatterCount}
      photoCount={photoCount}
    />
  );
}

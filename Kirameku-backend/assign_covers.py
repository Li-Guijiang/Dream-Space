"""给文章分配封面图（从照片墙横版照片中选取）"""
import json
import os
from sqlmodel import Session, select

from app.database import engine
from app.models import Post

# 横版照片（适合做封面）
PHOTOS_MAP = os.path.join(os.path.dirname(__file__), "photos_map.json")


def main():
    with open(PHOTOS_MAP, "r", encoding="utf-8") as f:
        photos_map = json.load(f)
    landscape = [fname for fname, orient in photos_map if orient == "landscape"]

    with Session(engine) as session:
        posts = session.exec(select(Post).where(Post.status == "published")).all()
        for i, post in enumerate(posts):
            if post.cover:
                continue
            # 轮流分配横版照片作为封面
            fname = landscape[i % len(landscape)]
            post.cover = f"/images/photos/{fname}"
            session.add(post)
            print(f"[OK] 文章《{post.title}》封面 -> {fname}")
        session.commit()
        print(f"\n[完成] 共为 {len(posts)} 篇文章分配封面")


if __name__ == "__main__":
    main()

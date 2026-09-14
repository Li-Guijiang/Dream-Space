from datetime import datetime
import json
from sqlmodel import Session, select, func
from fastapi import HTTPException

from app.models import Post, Category, Tag, PostTag
from app.schemas import PostCreate, PostUpdate


def _sync_tags(session: Session, post_id: int, tag_names: list[str]):
    """同步文章标签：删除旧关联，创建新标签（如不存在），建立关联。"""
    # 删除旧关联
    old = session.exec(select(PostTag).where(PostTag.post_id == post_id)).all()
    for pt in old:
        session.delete(pt)

    for name in tag_names:
        name = name.strip()
        if not name:
            continue
        slug = name.lower().replace(" ", "-")
        tag = session.exec(select(Tag).where(Tag.name == name)).first()
        if not tag:
            tag = Tag(name=name, slug=slug)
            session.add(tag)
            session.flush()
        assert tag.id is not None
        session.add(PostTag(post_id=post_id, tag_id=tag.id))

    # 更新标签计数
    _update_tag_counts(session)


def _update_tag_counts(session: Session):
    for tag in session.exec(select(Tag)).all():
        count = session.exec(
            select(func.count(PostTag.post_id)).where(PostTag.tag_id == tag.id)
        ).one()
        tag.post_count = count
        session.add(tag)


def _update_category_count(session: Session, category_id: int | None):
    if category_id is None:
        return
    cat = session.get(Category, category_id)
    if cat:
        count = session.exec(
            select(func.count(Post.id)).where(Post.category_id == category_id)
        ).one()
        cat.post_count = count
        session.add(cat)


def _post_to_dict(post: Post, session: Session) -> dict:
    """将 Post 对象转为带 category 和 tags 的字典。"""
    cat_name = ""
    if post.category_id:
        cat = session.get(Category, post.category_id)
        if cat:
            cat_name = cat.name

    tag_names = []
    pts = session.exec(select(PostTag).where(PostTag.post_id == post.id)).all()
    for pt in pts:
        tag = session.get(Tag, pt.tag_id)
        if tag:
            tag_names.append(tag.name)

    return {
        "id": post.id,
        "title": post.title,
        "slug": post.slug,
        "description": post.description,
        "content": post.content,
        "cover": post.cover,
        "category": cat_name,
        "tags": tag_names,
        "status": post.status,
        "is_pinned": post.is_pinned,
        "views": post.views,
        "likes": post.likes,
        "word_count": post.word_count,
        "reading_time": post.reading_time,
        "published_at": post.published_at,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
    }


def get_posts(
    session: Session,
    status: str | None = None,
    category: str | None = None,
    tag: str | None = None,
    page: int = 1,
    size: int = 10,
) -> list[dict]:
    q = select(Post)
    if status:
        q = q.where(Post.status == status)
    if category:
        cat = session.exec(select(Category).where(Category.slug == category)).first()
        if cat and cat.id is not None:
            q = q.where(Post.category_id == cat.id)
    if tag:
        t = session.exec(select(Tag).where(Tag.slug == tag)).first()
        if t and t.id is not None:
            post_ids = [
                pt.post_id
                for pt in session.exec(
                    select(PostTag).where(PostTag.tag_id == t.id)
                ).all()
            ]
            q = q.where(Post.id.in_(post_ids))

    q = q.order_by(Post.is_pinned.desc(), Post.created_at.desc())
    q = q.offset((page - 1) * size).limit(size)
    posts = list(session.exec(q).all())
    return [_post_to_dict(p, session) for p in posts]


def get_post_by_slug(session: Session, slug: str) -> dict:
    post = session.exec(select(Post).where(Post.slug == slug)).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    post.views += 1
    session.add(post)
    session.commit()
    session.refresh(post)
    return _post_to_dict(post, session)


def get_post_by_id(session: Session, post_id: int) -> dict:
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    return _post_to_dict(post, session)


def create_post(session: Session, data: PostCreate) -> dict:
    tag_names = data.tags
    post_data = data.model_dump(exclude={"tags"})
    post = Post(**post_data)

    # 自动计算字数和阅读时间（仅当未手动指定时）
    if post.content:
        if not post.word_count:
            post.word_count = len(post.content)
        if not post.reading_time:
            post.reading_time = max(1, post.word_count // 300)

    if post.status == "published" and not post.published_at:
        post.published_at = datetime.now()

    session.add(post)
    session.flush()

    if tag_names:
        _sync_tags(session, post.id, tag_names)
    if post.category_id:
        _update_category_count(session, post.category_id)

    session.commit()
    session.refresh(post)
    return _post_to_dict(post, session)


def update_post(session: Session, post_id: int, data: PostUpdate) -> dict:
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")

    tag_names = data.tags
    update_data = data.model_dump(exclude_unset=True, exclude={"tags"})

    old_category = post.category_id
    for k, v in update_data.items():
        setattr(post, k, v)

    if post.content:
        if "word_count" not in update_data:
            post.word_count = len(post.content)
        if "reading_time" not in update_data:
            post.reading_time = max(1, post.word_count // 300)

    if post.status == "published" and not post.published_at:
        post.published_at = datetime.now()

    post.updated_at = datetime.now()
    session.add(post)
    session.flush()

    if tag_names is not None:
        _sync_tags(session, post.id, tag_names)

    _update_category_count(session, old_category)
    _update_category_count(session, post.category_id)

    session.commit()
    session.refresh(post)
    return _post_to_dict(post, session)


def delete_post(session: Session, post_id: int):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    cat_id = post.category_id
    session.delete(post)
    session.flush()
    _update_category_count(session, cat_id)
    _update_tag_counts(session)
    session.commit()


def count_posts(session: Session, status: str | None = None) -> int:
    q = select(func.count(Post.id))
    if status:
        q = q.where(Post.status == status)
    return session.exec(q).one()


def toggle_like(session: Session, post_id: int, unlike: bool = False) -> dict:
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(404, "文章不存在")
    post.likes = max(0, post.likes + (-1 if unlike else 1))
    session.add(post)
    session.commit()
    session.refresh(post)
    return {"likes": post.likes}

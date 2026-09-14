from sqlmodel import Session, select
from fastapi import HTTPException

from app.models import Tag
from app.schemas import TagCreate, TagUpdate


def get_tags(session: Session) -> list[Tag]:
    return list(session.exec(select(Tag).order_by(Tag.post_count.desc())).all())


def create_tag(session: Session, data: TagCreate) -> Tag:
    tag = Tag(**data.model_dump())
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


def update_tag(session: Session, tag_id: int, data: TagUpdate) -> Tag:
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(tag, k, v)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


def delete_tag(session: Session, tag_id: int):
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")
    session.delete(tag)
    session.commit()

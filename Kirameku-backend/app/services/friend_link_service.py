from datetime import datetime
from sqlmodel import Session, select
from fastapi import HTTPException

from app.models import FriendLink
from app.schemas import FriendLinkCreate, FriendLinkUpdate


def get_friend_links(session: Session, approved_only: bool = True) -> list[FriendLink]:
    q = select(FriendLink)
    if approved_only:
        q = q.where(FriendLink.is_approved == True)
    q = q.order_by(FriendLink.sort)
    return list(session.exec(q).all())


def create_friend_link(session: Session, data: FriendLinkCreate) -> FriendLink:
    fl = FriendLink(**data.model_dump())
    session.add(fl)
    session.commit()
    session.refresh(fl)
    return fl


def update_friend_link(
    session: Session, link_id: int, data: FriendLinkUpdate
) -> FriendLink:
    fl = session.get(FriendLink, link_id)
    if not fl:
        raise HTTPException(status_code=404, detail="友链不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(fl, k, v)
    fl.updated_at = datetime.now()
    session.add(fl)
    session.commit()
    session.refresh(fl)
    return fl


def delete_friend_link(session: Session, link_id: int):
    fl = session.get(FriendLink, link_id)
    if not fl:
        raise HTTPException(status_code=404, detail="友链不存在")
    session.delete(fl)
    session.commit()

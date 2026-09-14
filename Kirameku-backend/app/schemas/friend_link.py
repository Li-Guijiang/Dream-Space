from datetime import datetime
from pydantic import BaseModel


class FriendLinkCreate(BaseModel):
    name: str
    url: str
    avatar: str = ""
    description: str = ""
    sort: int = 0


class FriendLinkUpdate(BaseModel):
    name: str | None = None
    url: str | None = None
    avatar: str | None = None
    description: str | None = None
    sort: int | None = None
    is_approved: bool | None = None


class FriendLinkOut(BaseModel):
    id: int
    name: str
    url: str
    avatar: str
    description: str
    sort: int
    is_approved: bool
    created_at: datetime
    updated_at: datetime | None = None

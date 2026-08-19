from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class FriendLink(SQLModel, table=True):
    __tablename__ = "friend_link"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    url: str = Field(max_length=300)
    avatar: str = Field(default="", max_length=500)
    description: str = Field(default="", max_length=300)
    sort: int = Field(default=0)
    is_approved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

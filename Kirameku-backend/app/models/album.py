from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Album(SQLModel, table=True):
    __tablename__ = "album"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=100)
    description: str = Field(default="", max_length=500)
    cover: str = Field(default="", max_length=500)
    photo_count: int = Field(default=0)
    sort: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Photo(SQLModel, table=True):
    __tablename__ = "photo"

    id: Optional[int] = Field(default=None, primary_key=True)
    album_id: int = Field(foreign_key="album.id", index=True)
    url: str = Field(max_length=500)
    caption: str = Field(default="", max_length=200)
    orientation: str = Field(default="landscape", max_length=20)
    sort: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)

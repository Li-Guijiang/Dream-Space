from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class BookmarkCategory(SQLModel, table=True):
    __tablename__ = "bookmark_category"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50)
    icon: str = Field(default="", max_length=50)
    description: str = Field(default="", max_length=200)
    sort: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class BookmarkSite(SQLModel, table=True):
    __tablename__ = "bookmark_site"

    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="bookmark_category.id")
    name: str = Field(max_length=100)
    url: str = Field(max_length=300)
    icon: str = Field(default="", max_length=500)
    description: str = Field(default="", max_length=300)
    platforms: str = Field(default="[]")
    sort: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Category(SQLModel, table=True):
    __tablename__ = "category"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)
    slug: str = Field(max_length=50, unique=True)
    description: str = Field(default="", max_length=200)
    sort: int = Field(default=0)
    post_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Tag(SQLModel, table=True):
    __tablename__ = "tag"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)
    slug: str = Field(max_length=50, unique=True)
    post_count: int = Field(default=0)


class PostTag(SQLModel, table=True):
    __tablename__ = "post_tag"

    post_id: int = Field(foreign_key="post.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)


class Post(SQLModel, table=True):
    __tablename__ = "post"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    slug: str = Field(max_length=200, unique=True, index=True)
    description: str = Field(default="", max_length=500)
    content: str = Field(default="")
    cover: str = Field(default="", max_length=500)
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    status: str = Field(default="draft", max_length=20, index=True)
    is_pinned: bool = Field(default=False)
    views: int = Field(default=0)
    likes: int = Field(default=0)
    word_count: int = Field(default=0)
    reading_time: int = Field(default=0)
    published_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

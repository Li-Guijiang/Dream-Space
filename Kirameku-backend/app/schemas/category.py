from datetime import datetime
from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    sort: int = 0


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    sort: int | None = None


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    sort: int
    post_count: int
    created_at: datetime
    updated_at: datetime


class TagCreate(BaseModel):
    name: str
    slug: str


class TagUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None


class TagOut(BaseModel):
    id: int
    name: str
    slug: str
    post_count: int

from datetime import datetime
from pydantic import BaseModel


# ---- Category ----

class BookmarkCategoryCreate(BaseModel):
    name: str
    icon: str = ""
    description: str = ""
    sort: int = 0


class BookmarkCategoryUpdate(BaseModel):
    name: str | None = None
    icon: str | None = None
    description: str | None = None
    sort: int | None = None


class BookmarkCategoryOut(BaseModel):
    id: int
    name: str
    icon: str
    description: str
    sort: int
    created_at: datetime
    updated_at: datetime | None = None


# ---- Site ----

class BookmarkSiteCreate(BaseModel):
    category_id: int
    name: str
    url: str
    icon: str = ""
    description: str = ""
    platforms: list[str] = []
    sort: int = 0


class BookmarkSiteUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = None
    url: str | None = None
    icon: str | None = None
    description: str | None = None
    platforms: list[str] | None = None
    sort: int | None = None


class BookmarkSiteOut(BaseModel):
    id: int
    category_id: int
    name: str
    url: str
    icon: str
    description: str
    platforms: list[str]
    sort: int
    created_at: datetime
    updated_at: datetime | None = None


class BookmarkFull(BookmarkCategoryOut):
    sites: list[BookmarkSiteOut] = []

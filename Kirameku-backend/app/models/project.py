from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Project(SQLModel, table=True):
    __tablename__ = "project"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    slug: str = Field(max_length=100, unique=True)
    description: str = Field(default="", max_length=500)
    long_description: str = Field(default="")
    cover_image: str = Field(default="", max_length=500)
    tech_stack: str = Field(default="[]")
    link_github: str = Field(default="", max_length=300)
    link_gitee: str = Field(default="", max_length=300)
    link_live: str = Field(default="", max_length=300)
    link_docs: str = Field(default="", max_length=300)
    status: str = Field(default="developing", max_length=20)
    status_label: str = Field(default="", max_length=20)
    is_featured: bool = Field(default=False)
    sort: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

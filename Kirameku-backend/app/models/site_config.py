from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class SiteConfig(SQLModel, table=True):
    __tablename__ = "site_config"

    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(max_length=100, unique=True)
    value: str = Field(default="")
    description: str = Field(default="", max_length=200)
    updated_at: datetime = Field(default_factory=datetime.now)

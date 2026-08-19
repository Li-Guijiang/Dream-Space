from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Visitor(SQLModel, table=True):
    __tablename__ = "visitor"

    id: Optional[int] = Field(default=None, primary_key=True)
    ip: str = Field(max_length=45)
    path: str = Field(default="", max_length=500)
    user_agent: str = Field(default="")
    city: str = Field(default="", max_length=100)
    region: str = Field(default="", max_length=100)
    country: str = Field(default="", max_length=100)
    district: str = Field(default="", max_length=100)
    org: str = Field(default="", max_length=200)
    asn: str = Field(default="", max_length=50)
    is_mobile: bool = Field(default=False)
    is_proxy: bool = Field(default=False)
    is_hosting: bool = Field(default=False)
    browser: str = Field(default="", max_length=50)
    os: str = Field(default="", max_length=50)
    device_type: str = Field(default="", max_length=20)
    created_at: datetime = Field(default_factory=datetime.now)

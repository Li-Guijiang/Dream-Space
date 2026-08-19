from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    __tablename__ = "user"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True)
    hashed_password: str = Field(max_length=128)
    nickname: str = Field(default="", max_length=50)
    avatar: str = Field(default="", max_length=500)
    email: str = Field(default="", max_length=100)
    bio: str = Field(default="", max_length=500)
    is_admin: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

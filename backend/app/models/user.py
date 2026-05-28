"""
CreatorIQ AI - User Model (SQLite compatible)
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    # String PK - works with SQLite and PostgreSQL
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)  # auto-verified for demo
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    plan: Mapped[str] = mapped_column(String(50), default="pro", nullable=False)  # everyone gets pro for demo
    credits_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    credits_limit: Mapped[int] = mapped_column(Integer, default=1000, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    videos: Mapped[List["Video"]] = relationship("Video", back_populates="user", lazy="selectin")  # noqa: F821
    chat_sessions: Mapped[List["ChatSession"]] = relationship("ChatSession", back_populates="user", lazy="selectin")  # noqa: F821

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"

    @property
    def credits_remaining(self) -> int:
        return max(0, self.credits_limit - self.credits_used)

"""
CreatorIQ AI - Video & VideoAnalysis Models (SQLite compatible)
Single file = zero mapper conflicts
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Video(Base):
    __tablename__ = "videos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Source Info
    platform: Mapped[str] = mapped_column(String(50), nullable=False, default="youtube")
    original_url: Mapped[str] = mapped_column(Text, nullable=False, default="")
    video_id: Mapped[str] = mapped_column(String(200), nullable=False, default="", index=True)

    # Metadata
    title: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    creator_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    creator_handle: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    creator_followers: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Engagement Metrics
    views: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    likes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    comments: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    shares: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    saves: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Transcript
    transcript: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    transcript_language: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(String(50), default="completed", nullable=False, index=True)

    # Extra metadata stored as JSON text
    raw_metadata: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    top_comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)           # JSON string
    hashtags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)       # JSON string

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    analyzed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="videos")  # noqa: F821
    analysis: Mapped[Optional["VideoAnalysis"]] = relationship(
        "VideoAnalysis", back_populates="video", uselist=False, lazy="selectin",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Video id={self.id} platform={self.platform} title={str(self.title)[:30]}>"

    @property
    def engagement_rate(self) -> Optional[float]:
        if self.views and self.views > 0 and self.likes:
            return round((self.likes / self.views) * 100, 2)
        return None


class VideoAnalysis(Base):
    """
    ONE VideoAnalysis model. Lives here in video.py.
    The old analysis.py file is replaced by this.
    """
    __tablename__ = "video_analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    video_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("videos.id", ondelete="CASCADE"),
        nullable=False, unique=True, index=True
    )

    # AI Scores (0-100)
    hook_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    retention_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    emotion_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    viral_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    storytelling_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    cta_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    pacing_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    overall_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # AI Analysis Texts
    hook_analysis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retention_analysis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    emotion_analysis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    viral_analysis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    storytelling_analysis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cta_analysis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pacing_analysis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Structured Insights stored as JSON strings (SQLite compatible)
    key_strengths: Mapped[Optional[str]] = mapped_column(Text, nullable=True)       # JSON array string
    improvement_areas: Mapped[Optional[str]] = mapped_column(Text, nullable=True)   # JSON array string
    action_plan: Mapped[Optional[str]] = mapped_column(Text, nullable=True)         # JSON array string
    target_audience: Mapped[Optional[str]] = mapped_column(Text, nullable=True)     # JSON object string
    emotional_triggers: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array string
    curiosity_gaps: Mapped[Optional[str]] = mapped_column(Text, nullable=True)      # JSON array string
    storytelling_structure: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON object string
    viral_elements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)      # JSON array string

    # Script Improvement
    improved_script: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    improved_hook: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    improved_cta: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Summary
    executive_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    video: Mapped["Video"] = relationship("Video", back_populates="analysis")

"""
Models package - import ALL models here for SQLAlchemy to register them.
VideoAnalysis lives in video.py ONLY - no separate analysis.py model.
"""
from app.models.user import User
from app.models.video import Video, VideoAnalysis
from app.models.chat import ChatSession, ChatMessage

__all__ = ["User", "Video", "VideoAnalysis", "ChatSession", "ChatMessage"]

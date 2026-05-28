"""
CreatorIQ AI - Chat Schemas
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[UUID] = None
    video_ids: Optional[List[UUID]] = None  # Context videos for RAG


class ChatMessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    sources: Optional[List[dict]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"
    video_ids: Optional[List[UUID]] = None


class ChatSessionResponse(BaseModel):
    id: UUID
    title: str
    context_video_ids: Optional[List[str]]
    messages: List[ChatMessageResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionListResponse(BaseModel):
    sessions: List[ChatSessionResponse]
    total: int


class StreamChatRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[UUID] = None
    video_ids: Optional[List[UUID]] = None

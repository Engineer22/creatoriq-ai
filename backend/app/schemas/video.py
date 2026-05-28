"""
CreatorIQ AI - Video Schemas
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, HttpUrl, field_validator


class VideoIngestRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_video_url(cls, v: str) -> str:
        supported = ["youtube.com", "youtu.be", "tiktok.com", "instagram.com"]
        if not any(domain in v.lower() for domain in supported):
            raise ValueError("URL must be from YouTube, TikTok, or Instagram")
        return v


class VideoAnalysisScores(BaseModel):
    hook_score: Optional[float] = None
    retention_score: Optional[float] = None
    emotion_score: Optional[float] = None
    viral_score: Optional[float] = None
    storytelling_score: Optional[float] = None
    cta_score: Optional[float] = None
    pacing_score: Optional[float] = None
    overall_score: Optional[float] = None


class VideoAnalysisDetail(VideoAnalysisScores):
    hook_analysis: Optional[str] = None
    retention_analysis: Optional[str] = None
    emotion_analysis: Optional[str] = None
    viral_analysis: Optional[str] = None
    storytelling_analysis: Optional[str] = None
    cta_analysis: Optional[str] = None
    pacing_analysis: Optional[str] = None
    key_strengths: Optional[List[str]] = None
    improvement_areas: Optional[List[str]] = None
    action_plan: Optional[List[dict]] = None
    target_audience: Optional[dict] = None
    emotional_triggers: Optional[List[str]] = None
    curiosity_gaps: Optional[List[str]] = None
    storytelling_structure: Optional[dict] = None
    viral_elements: Optional[List[str]] = None
    improved_script: Optional[str] = None
    improved_hook: Optional[str] = None
    improved_cta: Optional[str] = None
    executive_summary: Optional[str] = None

    model_config = {"from_attributes": True}


class VideoResponse(BaseModel):
    id: UUID
    platform: str
    original_url: str
    video_id: str
    title: Optional[str]
    description: Optional[str]
    thumbnail_url: Optional[str]
    duration: Optional[int]
    creator_name: Optional[str]
    creator_handle: Optional[str]
    creator_followers: Optional[int]
    published_at: Optional[datetime]
    views: Optional[int]
    likes: Optional[int]
    comments: Optional[int]
    shares: Optional[int]
    engagement_rate: Optional[float]
    transcript: Optional[str]
    status: str
    tags: Optional[List[str]]
    hashtags: Optional[List[str]]
    top_comments: Optional[List[dict]]
    analysis: Optional[VideoAnalysisDetail]
    created_at: datetime
    analyzed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class VideoListResponse(BaseModel):
    videos: List[VideoResponse]
    total: int
    page: int
    page_size: int
    has_more: bool

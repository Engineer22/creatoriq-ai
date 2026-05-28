"""
CreatorIQ AI - Comparison Router
Compare 2-5 videos instantly with realistic AI comparison output.
"""
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_id
from app.db.database import get_db
from app.models.video import Video
from app.api.v1.routers.videos import _serialize_video, _parse_json
from app.services.demo_data import generate_comparison

router = APIRouter()
logger = logging.getLogger(__name__)


class CompareRequest(BaseModel):
    video_ids: List[str]


@router.post("/")
async def compare_videos(
    request: CompareRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    if len(request.video_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 videos required for comparison")
    if len(request.video_ids) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 videos can be compared")

    videos = []
    for vid_id in request.video_ids:
        result = await db.execute(
            select(Video).where(Video.id == vid_id, Video.user_id == user_id)
        )
        video = result.scalar_one_or_none()
        if not video:
            raise HTTPException(status_code=404, detail=f"Video {vid_id} not found")
        videos.append(video)

    # Build comparison-friendly dicts
    video_dicts = []
    for v in videos:
        a = v.analysis
        video_dicts.append({
            "id": str(v.id),
            "title": v.title or "Untitled Video",
            "platform": v.platform,
            "thumbnail_url": v.thumbnail_url,
            "views": v.views,
            "likes": v.likes,
            "creator_name": v.creator_name,
            "analysis": {
                "hook_score": a.hook_score if a else 80,
                "viral_score": a.viral_score if a else 80,
                "retention_score": a.retention_score if a else 80,
                "emotion_score": a.emotion_score if a else 80,
                "storytelling_score": a.storytelling_score if a else 80,
                "cta_score": a.cta_score if a else 80,
                "pacing_score": a.pacing_score if a else 80,
                "overall_score": a.overall_score if a else 80,
                "hook_analysis": a.hook_analysis if a else "",
                "key_strengths": _parse_json(a.key_strengths) if a else [],
            } if a else {},
        })

    comparison = generate_comparison(video_dicts)

    return {
        "success": True,
        "videos": video_dicts,
        "comparison": comparison,
    }


@router.get("/my-videos")
async def list_user_videos_for_compare(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get user's analyzed videos for the comparison selector"""
    result = await db.execute(
        select(Video)
        .where(Video.user_id == user_id, Video.status == "completed")
        .order_by(Video.created_at.desc())
        .limit(20)
    )
    videos = result.scalars().all()

    return {
        "success": True,
        "videos": [
            {
                "id": str(v.id),
                "title": v.title,
                "platform": v.platform,
                "thumbnail_url": v.thumbnail_url,
                "overall_score": v.analysis.overall_score if v.analysis else None,
                "viral_score": v.analysis.viral_score if v.analysis else None,
            }
            for v in videos
        ],
    }

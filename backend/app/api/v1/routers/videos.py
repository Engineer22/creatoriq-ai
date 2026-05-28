"""
CreatorIQ AI - Videos Router
Instant demo analysis — no Celery, no Redis, no background tasks.
Paste a URL → get full AI analysis in < 1 second.
"""
import json
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_id
from app.db.database import get_db
from app.models.video import Video, VideoAnalysis
from app.models.user import User
from app.services.demo_data import (
    generate_video_metadata,
    generate_analysis,
    generate_dashboard_stats,
)

router = APIRouter()
logger = logging.getLogger(__name__)


# ─── Schemas ──────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    url: str


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _serialize_video(video: Video) -> dict:
    analysis = None
    if video.analysis:
        a = video.analysis

        def _j(val):
            if val is None:
                return None
            if isinstance(val, str):
                try:
                    return json.loads(val)
                except Exception:
                    return val
            return val

        analysis = {
            "id": str(a.id),
            "hook_score": a.hook_score,
            "retention_score": a.retention_score,
            "emotion_score": a.emotion_score,
            "viral_score": a.viral_score,
            "storytelling_score": a.storytelling_score,
            "cta_score": a.cta_score,
            "pacing_score": a.pacing_score,
            "overall_score": a.overall_score,
            "hook_analysis": a.hook_analysis,
            "retention_analysis": a.retention_analysis,
            "emotion_analysis": a.emotion_analysis,
            "viral_analysis": a.viral_analysis,
            "storytelling_analysis": a.storytelling_analysis,
            "cta_analysis": a.cta_analysis,
            "pacing_analysis": a.pacing_analysis,
            "key_strengths": _j(a.key_strengths),
            "improvement_areas": _j(a.improvement_areas),
            "action_plan": _j(a.action_plan),
            "target_audience": _j(a.target_audience),
            "emotional_triggers": _j(a.emotional_triggers),
            "curiosity_gaps": _j(a.curiosity_gaps),
            "storytelling_structure": _j(a.storytelling_structure),
            "viral_elements": _j(a.viral_elements),
            "improved_script": a.improved_script,
            "improved_hook": a.improved_hook,
            "improved_cta": a.improved_cta,
            "executive_summary": a.executive_summary,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }

    return {
        "id": str(video.id),
        "platform": video.platform,
        "original_url": video.original_url,
        "video_id": video.video_id,
        "title": video.title,
        "description": video.description,
        "thumbnail_url": video.thumbnail_url,
        "duration": video.duration,
        "creator_name": video.creator_name,
        "creator_handle": video.creator_handle,
        "creator_followers": video.creator_followers,
        "views": video.views,
        "likes": video.likes,
        "comments": video.comments,
        "shares": video.shares,
        "saves": video.saves,
        "status": video.status,
        "transcript": video.transcript,
        "tags": _parse_json(video.tags),
        "hashtags": _parse_json(video.hashtags),
        "top_comments": _parse_json(video.top_comments),
        "engagement_rate": video.engagement_rate,
        "created_at": video.created_at.isoformat() if video.created_at else None,
        "analyzed_at": video.analyzed_at.isoformat() if video.analyzed_at else None,
        "analysis": analysis,
    }


def _parse_json(val):
    if val is None:
        return None
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return val
    return val


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/analyze", status_code=status.HTTP_201_CREATED)
async def analyze_video(
    request: AnalyzeRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Paste any YouTube / TikTok / Instagram URL →
    Instantly get full AI analysis stored in SQLite.
    No background tasks. No loading forever.
    """
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    # Generate demo metadata + analysis instantly
    metadata = generate_video_metadata(url)
    analysis_data = generate_analysis(metadata)

    # Create Video record
    video = Video(
        user_id=user_id,
        platform=metadata["platform"],
        original_url=metadata["original_url"],
        video_id=metadata["video_id"],
        title=metadata["title"],
        description=metadata["description"],
        thumbnail_url=metadata["thumbnail_url"],
        duration=metadata["duration"],
        creator_name=metadata["creator_name"],
        creator_handle=metadata["creator_handle"],
        creator_followers=metadata["creator_followers"],
        views=metadata["views"],
        likes=metadata["likes"],
        comments=metadata["comments"],
        shares=metadata["shares"],
        saves=metadata["saves"],
        transcript=metadata["transcript"],
        tags=metadata["tags"],
        hashtags=metadata["hashtags"],
        top_comments=metadata["top_comments"],
        status="completed",
        analyzed_at=datetime.utcnow(),
    )
    db.add(video)
    await db.flush()  # get video.id

    # Create VideoAnalysis record
    analysis = VideoAnalysis(
        video_id=str(video.id),
        hook_score=analysis_data["hook_score"],
        retention_score=analysis_data["retention_score"],
        emotion_score=analysis_data["emotion_score"],
        viral_score=analysis_data["viral_score"],
        storytelling_score=analysis_data["storytelling_score"],
        cta_score=analysis_data["cta_score"],
        pacing_score=analysis_data["pacing_score"],
        overall_score=analysis_data["overall_score"],
        hook_analysis=analysis_data["hook_analysis"],
        retention_analysis=analysis_data["retention_analysis"],
        emotion_analysis=analysis_data["emotion_analysis"],
        viral_analysis=analysis_data["viral_analysis"],
        storytelling_analysis=analysis_data["storytelling_analysis"],
        cta_analysis=analysis_data["cta_analysis"],
        pacing_analysis=analysis_data["pacing_analysis"],
        key_strengths=analysis_data["key_strengths"],
        improvement_areas=analysis_data["improvement_areas"],
        action_plan=analysis_data["action_plan"],
        target_audience=analysis_data["target_audience"],
        emotional_triggers=analysis_data["emotional_triggers"],
        curiosity_gaps=analysis_data["curiosity_gaps"],
        storytelling_structure=analysis_data["storytelling_structure"],
        viral_elements=analysis_data["viral_elements"],
        improved_script=analysis_data["improved_script"],
        improved_hook=analysis_data["improved_hook"],
        improved_cta=analysis_data["improved_cta"],
        executive_summary=analysis_data["executive_summary"],
    )
    db.add(analysis)

    # Increment credits_used
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user:
        user.credits_used = (user.credits_used or 0) + 3

    await db.flush()
    await db.refresh(video)

    logger.info(f"Video analyzed instantly: {video.id} ({video.platform})")

    return {
        "success": True,
        "message": "Video analyzed successfully",
        "video": _serialize_video(video),
    }


@router.get("/")
async def list_videos(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    platform: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all analyzed videos for the current user"""
    query = select(Video).where(Video.user_id == user_id)
    if platform:
        query = query.where(Video.platform == platform)

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar() or 0

    offset = (page - 1) * page_size
    query = query.order_by(desc(Video.created_at)).offset(offset).limit(page_size)
    result = await db.execute(query)
    videos = result.scalars().all()

    return {
        "success": True,
        "videos": [_serialize_video(v) for v in videos],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


@router.get("/dashboard-stats")
async def get_dashboard_stats(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Dashboard summary stats"""
    count_result = await db.execute(
        select(func.count()).select_from(select(Video).where(Video.user_id == user_id).subquery())
    )
    video_count = count_result.scalar() or 0

    # Get recent videos
    recent_result = await db.execute(
        select(Video).where(Video.user_id == user_id).order_by(desc(Video.created_at)).limit(5)
    )
    recent = recent_result.scalars().all()

    stats = generate_dashboard_stats(video_count, user_id)
    stats["recent_videos"] = [_serialize_video(v) for v in recent]

    return {"success": True, **stats}


@router.get("/{video_id}")
async def get_video(
    video_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a single video with full analysis"""
    result = await db.execute(
        select(Video).where(Video.id == video_id, Video.user_id == user_id)
    )
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return {"success": True, "video": _serialize_video(video)}


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    video_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a video and its analysis"""
    result = await db.execute(
        select(Video).where(Video.id == video_id, Video.user_id == user_id)
    )
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    await db.delete(video)
    await db.flush()

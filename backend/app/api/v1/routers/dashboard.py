"""
CreatorIQ AI - Dashboard Router
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_id
from app.db.database import get_db
from app.models.video import Video
from app.models.user import User
from app.api.v1.routers.videos import _serialize_video
from app.services.demo_data import generate_dashboard_stats

router = APIRouter()


@router.get("/")
async def get_dashboard(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Video count
    count_result = await db.execute(
        select(func.count()).select_from(select(Video).where(Video.user_id == user_id).subquery())
    )
    video_count = count_result.scalar() or 0

    # Recent 5 videos
    recent_result = await db.execute(
        select(Video).where(Video.user_id == user_id).order_by(desc(Video.created_at)).limit(5)
    )
    recent_videos = recent_result.scalars().all()

    # User info
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()

    stats = generate_dashboard_stats(video_count, user_id)
    stats["recent_videos"] = [_serialize_video(v) for v in recent_videos]
    if user:
        stats["credits_used"] = user.credits_used
        stats["credits_remaining"] = user.credits_remaining

    return {"success": True, **stats}

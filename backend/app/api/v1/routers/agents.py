"""
CreatorIQ AI - Agents Router
6 demo AI agents with instant, realistic outputs.
No AgentOrchestrator class needed.
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_id
from app.db.database import get_db
from app.models.video import Video
from app.services.demo_data import AGENTS, generate_agent_result

router = APIRouter()
logger = logging.getLogger(__name__)


class RunAgentRequest(BaseModel):
    video_id: Optional[str] = None


@router.get("/")
async def list_agents():
    """List all available AI agents"""
    return {"success": True, "agents": AGENTS}


@router.post("/{agent_id}/run")
async def run_agent(
    agent_id: str,
    request: RunAgentRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Run a specific agent — optionally on a specific video"""
    # Validate agent exists
    agent = next((a for a in AGENTS if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    # Build video context if video_id provided
    video_context = {}
    if request.video_id:
        result = await db.execute(
            select(Video).where(Video.id == request.video_id, Video.user_id == user_id)
        )
        video = result.scalar_one_or_none()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        video_context = {
            "title": video.title or "Untitled",
            "platform": video.platform,
            "views": video.views,
            "likes": video.likes,
            "duration": video.duration,
            "transcript": (video.transcript or "")[:500],
        }
    else:
        # Use generic demo context
        video_context = {
            "title": "Demo Content Analysis",
            "platform": "youtube",
            "views": 500000,
            "likes": 25000,
            "duration": 240,
            "transcript": "Sample transcript for demo analysis...",
        }

    result_data = generate_agent_result(agent_id, video_context)

    return {
        "success": True,
        "agent": agent,
        "video_context": video_context,
        "result": result_data,
    }


@router.post("/run-all")
async def run_all_agents(
    request: RunAgentRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Run ALL 6 agents at once on a video"""
    video_context = {}
    if request.video_id:
        result = await db.execute(
            select(Video).where(Video.id == request.video_id, Video.user_id == user_id)
        )
        video = result.scalar_one_or_none()
        if video:
            video_context = {
                "title": video.title or "Untitled",
                "platform": video.platform,
                "views": video.views,
                "likes": video.likes,
                "duration": video.duration,
            }

    results = {}
    for agent in AGENTS:
        results[agent["id"]] = generate_agent_result(agent["id"], video_context)

    return {
        "success": True,
        "video_id": request.video_id,
        "results": results,
        "agents_run": len(AGENTS),
    }

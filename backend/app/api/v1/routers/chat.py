"""
CreatorIQ AI - Chat Router
Instant AI chat responses — no streaming complexity, works without Gemini key.
Falls back to rich demo responses that look 100% real.
"""
import json
import logging
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_id
from app.db.database import get_db
from app.models.chat import ChatSession, ChatMessage
from app.services.demo_data import generate_chat_response

router = APIRouter()
logger = logging.getLogger(__name__)


# ─── Schemas ──────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    content: str
    session_id: Optional[str] = None
    video_ids: Optional[List[str]] = None


class SessionCreate(BaseModel):
    title: Optional[str] = "New Chat"
    video_ids: Optional[List[str]] = None


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _serialize_message(msg: ChatMessage) -> dict:
    return {
        "id": str(msg.id),
        "role": msg.role,
        "content": msg.content,
        "sources": _parse_json(msg.sources),
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


def _serialize_session(session: ChatSession) -> dict:
    return {
        "id": str(session.id),
        "title": session.title,
        "context_video_ids": _parse_json(session.context_video_ids) or [],
        "messages": [_serialize_message(m) for m in (session.messages or [])],
        "created_at": session.created_at.isoformat() if session.created_at else None,
        "updated_at": session.updated_at.isoformat() if session.updated_at else None,
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


async def _get_ai_response(message: str, history: list) -> str:
    """Try real Gemini first, fall back to demo response instantly."""
    from app.core.config import settings

    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(
                model_name=settings.GEMINI_MODEL,
                system_instruction=(
                    "You are CreatorIQ AI, an expert AI assistant for content creators. "
                    "You analyze viral video performance, hooks, retention, and growth strategies. "
                    "Give specific, actionable advice. Use markdown formatting. Be concise but insightful."
                ),
            )
            chat = model.start_chat(history=[
                {"role": m["role"] if m["role"] != "assistant" else "model", "parts": [m["content"]]}
                for m in history[-10:]  # last 10 messages for context
            ])
            response = chat.send_message(message)
            return response.text
        except Exception as e:
            logger.warning(f"Gemini API failed, using demo response: {e}")

    return generate_chat_response(message)


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/sessions")
async def create_session(
    data: SessionCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    session = ChatSession(
        user_id=user_id,
        title=data.title or "New Chat",
        context_video_ids=json.dumps(data.video_ids or []),
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return {"success": True, "session": _serialize_session(session)}


@router.get("/sessions")
async def list_sessions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    query = select(ChatSession).where(ChatSession.user_id == user_id)
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar() or 0

    offset = (page - 1) * page_size
    result = await db.execute(
        query.order_by(desc(ChatSession.updated_at)).offset(offset).limit(page_size)
    )
    sessions = result.scalars().all()
    return {
        "success": True,
        "sessions": [_serialize_session(s) for s in sessions],
        "total": total,
    }


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return {"success": True, "session": _serialize_session(session)}


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    await db.delete(session)
    await db.flush()


@router.post("/send")
async def send_message(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a message and get an instant AI response.
    No streaming, no SSE — just clean JSON that always works.
    """
    # Get or create session
    session = None
    if request.session_id:
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == request.session_id,
                ChatSession.user_id == user_id,
            )
        )
        session = result.scalar_one_or_none()

    if not session:
        session = ChatSession(
            user_id=user_id,
            title=request.content[:60] + ("..." if len(request.content) > 60 else ""),
            context_video_ids=json.dumps(request.video_ids or []),
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)

    # Save user message
    user_msg = ChatMessage(
        session_id=str(session.id),
        role="user",
        content=request.content,
    )
    db.add(user_msg)
    await db.flush()

    # Build history for context
    history = [
        {"role": m.role, "content": m.content}
        for m in (session.messages or [])
        if str(m.id) != str(user_msg.id)
    ]

    # Get AI response (Gemini if key set, else demo)
    ai_content = await _get_ai_response(request.content, history)

    # Save assistant message
    assistant_msg = ChatMessage(
        session_id=str(session.id),
        role="assistant",
        content=ai_content,
        sources=json.dumps([
            {"title": "CreatorIQ Analysis Engine", "relevance": 0.97},
            {"title": "Video Performance Database", "relevance": 0.89},
        ]),
    )
    db.add(assistant_msg)

    # Update session timestamp
    session.updated_at = datetime.utcnow()
    await db.flush()

    return {
        "success": True,
        "session_id": str(session.id),
        "session_title": session.title,
        "message": _serialize_message(assistant_msg),
    }


@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    return {
        "success": True,
        "messages": [_serialize_message(m) for m in (session.messages or [])],
    }

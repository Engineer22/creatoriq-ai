"""
CreatorIQ AI - Main FastAPI Application (Demo/Local Mode)
No Redis. No Celery. No Docker. Just SQLite + FastAPI.
Everything works locally for recruiter demos.
"""
import logging
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.routers import auth, videos, chat, comparison, agents, dashboard
from app.core.config import settings
from app.db.database import init_db, close_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    logger.info("🚀 Starting CreatorIQ AI (Demo Mode)...")
    await init_db()
    logger.info("✅ SQLite database ready")
    yield
    logger.info("🔄 Shutting down...")
    await close_db()
    logger.info("✅ Done")


app = FastAPI(
    title="CreatorIQ AI",
    description="AI-powered creator intelligence platform — Demo Mode",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ─── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    response.headers["X-Process-Time"] = f"{ms:.1f}ms"
    return response


# ─── Exception Handlers ───────────────────────────────────────────────────────
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "Resource not found", "path": str(request.url.path)},
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Internal server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error. Please try again."},
    )


# ─── API Routes ───────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth.router,       prefix=f"{PREFIX}/auth",       tags=["Auth"])
app.include_router(videos.router,     prefix=f"{PREFIX}/videos",     tags=["Videos"])
app.include_router(chat.router,       prefix=f"{PREFIX}/chat",       tags=["Chat"])
app.include_router(comparison.router, prefix=f"{PREFIX}/comparison", tags=["Comparison"])
app.include_router(agents.router,     prefix=f"{PREFIX}/agents",     tags=["Agents"])
app.include_router(dashboard.router,  prefix=f"{PREFIX}/dashboard",  tags=["Dashboard"])


# ─── Health & Root ────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "mode": "demo",
        "version": "1.0.0",
        "database": "SQLite (local)",
        "services": {"redis": False, "celery": False, "gemini": bool(settings.GEMINI_API_KEY)},
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "CreatorIQ AI",
        "version": "1.0.0",
        "mode": "demo",
        "docs": "/api/docs",
        "health": "/health",
    }

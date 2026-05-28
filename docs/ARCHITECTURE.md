# CreatorIQ AI - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 15)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Chat UI   │  │Compare   │  │Agents    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └──────────────┴─────────────┴──────────────┘         │
│                         Zustand + React Query                 │
└─────────────────────────────┬───────────────────────────────┘
                               │ HTTPS / SSE
┌─────────────────────────────▼───────────────────────────────┐
│                    NGINX REVERSE PROXY                        │
└──────────────────────┬───────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   BACKEND (FastAPI + Python)                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  API ROUTERS                          │    │
│  │  /auth  /videos  /analysis  /chat  /comparison       │    │
│  │  /agents  /dashboard  /export                        │    │
│  └────────────────────┬────────────────────────────────┘    │
│                        │                                      │
│  ┌─────────────────────▼────────────────────────────────┐   │
│  │                  SERVICE LAYER                         │   │
│  │                                                        │   │
│  │  VideoIngestionService   AIAnalysisService            │   │
│  │  ChatService             RAGService                   │   │
│  │  AgentOrchestrator       ExportService                │   │
│  └──────────┬──────────────────────┬─────────────────────┘   │
│             │                      │                          │
│  ┌──────────▼──────┐    ┌─────────▼──────────────────────┐  │
│  │   AI PIPELINE   │    │      DATA LAYER                  │  │
│  │                 │    │                                   │  │
│  │  Gemini 2.0     │    │  PostgreSQL (SQLAlchemy async)   │  │
│  │  Flash          │    │  Redis (caching + sessions)      │  │
│  │                 │    │  FAISS-style vector store        │  │
│  │  Sentence       │    │  (numpy cosine similarity)       │  │
│  │  Transformers   │    │                                   │  │
│  └─────────────────┘    └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## AI Analysis Pipeline

```
Video URL Input
     │
     ▼
VideoIngestionService
├── Platform Detection (YouTube/TikTok/Instagram)
├── Metadata Extraction (title, views, likes, etc.)
├── Transcript Extraction (YouTube only)
└── Comments Fetching (optional)
     │
     ▼
Background Task (FastAPI BackgroundTasks)
     │
     ▼
AIAnalysisService.analyze_video()
├── Build rich analysis prompt
├── Call Gemini 2.0 Flash
├── Parse JSON response
└── Normalize scores
     │
     ▼
Store in PostgreSQL
     │
     ▼
RAGService.add_video_analysis()
├── Build document text
├── Sentence-Transformer embedding
└── Store in numpy vector store
```

## RAG Chat Pipeline

```
User Message
     │
     ▼
RAGService.search()
├── Embed query with Sentence-Transformers
├── Cosine similarity search
└── Return top-K relevant video analyses
     │
     ▼
ChatService.stream_chat()
├── Build context from RAG results
├── Include conversation history (last 10 msgs)
├── Include memory summary (compressed history)
└── Stream from Gemini 2.0
     │
     ▼
Server-Sent Events (SSE)
├── {"type": "session", "session_id": "..."}
├── {"type": "sources", "sources": [...]}
├── {"type": "token", "content": "..."}  (streamed)
└── {"type": "done"}
     │
     ▼
Save to PostgreSQL
```

## Multi-Agent Architecture

```
AgentOrchestrator
├── HookAgent       → Hook type, mechanism, 3 rewrites
├── RetentionAgent  → Drop-off predictions, pacing
├── EmotionAgent    → Emotional journey map
├── TrendAgent      → Viral probability, hashtags
├── ScriptAgent     → Full script rewrite
└── ThumbnailAgent  → CTR concepts, A/B test ideas

Each agent:
- Receives video context (transcript, metadata, etc.)
- Runs specialized Gemini prompt
- Returns structured JSON
- Can stream via SSE
```

## Database Schema

```sql
users
├── id (UUID PK)
├── email, username, hashed_password
├── plan, credits_used, credits_limit
└── timestamps

videos
├── id (UUID PK)
├── user_id (FK → users)
├── platform, original_url, video_id
├── title, description, thumbnail_url
├── views, likes, comments, shares
├── transcript, status
└── timestamps

video_analyses
├── id (UUID PK)
├── video_id (FK → videos, UNIQUE)
├── hook_score, retention_score, emotion_score
├── viral_score, storytelling_score, cta_score
├── *_analysis (text fields)
├── key_strengths, improvement_areas (JSON)
├── action_plan, target_audience (JSON)
└── improved_hook, improved_cta, improved_script

chat_sessions
├── id (UUID PK)
├── user_id (FK → users)
├── title, context_video_ids, memory_summary
└── timestamps

chat_messages
├── id (UUID PK)
├── session_id (FK → chat_sessions)
├── role (user/assistant/system)
├── content, sources (JSON)
└── created_at
```

## Security Architecture

- **JWT Tokens**: Access (30min) + Refresh (30 days)
- **Password Hashing**: bcrypt with work factor 12
- **Rate Limiting**: 100 req/min per IP (middleware)
- **CORS**: Whitelist-based origin control
- **Input Validation**: Pydantic v2 with field validators
- **SQL Injection**: Protected by SQLAlchemy ORM
- **XSS**: Next.js React auto-escaping

## Performance Considerations

- **Async SQLAlchemy**: All DB operations non-blocking
- **Connection Pooling**: 10 connections, 20 overflow
- **Redis Caching**: TTL-based cache for expensive queries
- **Background Tasks**: Video analysis runs in background
- **Streaming**: SSE avoids long HTTP timeouts
- **Vector Store**: Persisted to disk, loaded at startup

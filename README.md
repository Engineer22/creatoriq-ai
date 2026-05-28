# CreatorIQ AI 🚀

**AI-powered creator intelligence platform** for analyzing YouTube Shorts, TikTok videos, and Instagram Reels. Understand WHY content goes viral.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google)](https://ai.google.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)

---

## 🎯 What It Does

CreatorIQ AI analyzes short-form video content across **7 AI-scored dimensions**:

| Dimension | What It Measures |
|-----------|------------------|
| 🎣 Hook Score | First-impression quality & attention capture |
| 📈 Retention | Viewer drop-off prediction & re-engagement |
| ❤️ Emotion | Emotional resonance & psychological triggers |
| 🔥 Viral | Shareability & reach potential |
| 📖 Storytelling | Narrative structure & arc quality |
| 🎯 CTA | Call-to-action placement & effectiveness |
| ⚡ Pacing | Energy, cuts & information density |

Plus: RAG-powered AI chat, side-by-side comparison, 6 specialized agents, script optimizer, PDF reports.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI** | Google Gemini 2.0 Flash, Sentence Transformers |
| **RAG** | Custom vector store with numpy cosine similarity |
| **Backend** | FastAPI, SQLAlchemy (async), Alembic |
| **Database** | PostgreSQL 16, Redis 7 |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS |
| **State** | Zustand, TanStack Query |
| **Charts** | Recharts |
| **Auth** | JWT (access + refresh tokens), bcrypt |
| **Infra** | Docker, Docker Compose, Nginx |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- A **Gemini API key** ([Get one free](https://aistudio.google.com/))

### 1. Clone and Configure

```bash
git clone <repo>
cd creatoriq

# Set up environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Add Your API Keys

Edit `backend/.env`:
```env
GEMINI_API_KEY=your-gemini-api-key-here  # REQUIRED
YOUTUBE_API_KEY=your-youtube-api-key      # Optional (enhances metadata)
RAPID_API_KEY=your-rapidapi-key           # Optional (TikTok/Instagram)
```

### 3. Launch

```bash
docker-compose up --build
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

---

## 🔧 Local Development (Without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Start PostgreSQL and Redis (or use Docker just for DBs)
docker-compose up postgres redis -d

# Run the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local

# Run dev server
npm run dev
```

---

## 📡 API Reference

Full interactive documentation available at `/api/docs` (Swagger UI).

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Create account |
| `POST` | `/api/v1/auth/login` | Login |
| `POST` | `/api/v1/videos/ingest` | Ingest a video URL |
| `GET` | `/api/v1/videos/` | List your videos |
| `GET` | `/api/v1/videos/{id}` | Get video + analysis |
| `GET` | `/api/v1/analysis/{video_id}` | Get full analysis |
| `POST` | `/api/v1/chat/stream` | Streaming AI chat (SSE) |
| `POST` | `/api/v1/comparison/` | Compare multiple videos |
| `POST` | `/api/v1/agents/{name}/run/{video_id}` | Run a specific agent |
| `POST` | `/api/v1/agents/run-all/{video_id}` | Run all agents |
| `GET` | `/api/v1/dashboard/stats` | Dashboard statistics |
| `GET` | `/api/v1/export/report/{video_id}/pdf` | Download PDF report |

---

## 🤖 AI Agents

| Agent | Specialization |
|-------|---------------|
| 🎣 Hook Agent | Hook type, psychological mechanism, 3 optimized versions |
| 📈 Retention Agent | Drop-off predictions, re-engagement moments, pacing |
| ❤️ Emotion Agent | Full emotional journey map, shareability emotion |
| 🔥 Trend Agent | Viral probability, algorithm factors, hashtag strategy |
| ✍️ Script Agent | Full script rewrite with before/after comparison |
| 🖼️ Thumbnail Agent | CTR optimization, concept recommendations |

---

## 🏗 Architecture

```
creatoriq/
├── backend/
│   ├── app/
│   │   ├── api/v1/routers/     # FastAPI route handlers
│   │   ├── agents/             # Specialized AI agents
│   │   ├── core/               # Config, security, logging
│   │   ├── db/                 # SQLAlchemy setup
│   │   ├── middleware/         # Rate limiting, request ID
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic schemas
│   │   └── services/           # Business logic + AI services
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── app/                # Next.js App Router pages
│       ├── components/         # React components
│       ├── lib/                # API client, utils
│       ├── store/              # Zustand state
│       └── types/              # TypeScript definitions
│
├── docker/
│   ├── nginx.conf
│   └── init.sql
│
└── docker-compose.yml
```

---

## 🌐 Deployment

### Vercel + Railway (Recommended)

**Frontend → Vercel:**
```bash
cd frontend
vercel deploy --prod
```

**Backend → Railway:**
```bash
# Railway auto-detects the Dockerfile
# Set environment variables in Railway dashboard
```

### Environment Variables for Production

**Backend:**
```env
APP_ENV=production
DATABASE_URL=postgresql+asyncpg://...  # Your prod PostgreSQL
REDIS_URL=redis://...                   # Your prod Redis
GEMINI_API_KEY=...
JWT_SECRET_KEY=...                      # Strong random secret
SECRET_KEY=...                          # Strong random secret
ALLOWED_ORIGINS=https://yourdomain.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

---

## 📊 Supported Platforms

| Platform | Transcript | Metadata | Comments | Engagement |
|----------|-----------|----------|----------|-----------|
| YouTube | ✅ Auto | ✅ Full (with API key) | ✅ | ✅ |
| TikTok | ❌ | ✅ (with RapidAPI) | ❌ | ✅ |
| Instagram | ❌ | ✅ (with RapidAPI) | ❌ | ✅ |

> **Note:** Transcripts greatly improve analysis quality. YouTube videos with captions get the best results.

---

## 🔑 API Keys Guide

| Key | Required | Source | Cost |
|-----|----------|--------|------|
| `GEMINI_API_KEY` | ✅ Required | [Google AI Studio](https://aistudio.google.com/) | Free tier available |
| `YOUTUBE_API_KEY` | Optional | [Google Cloud Console](https://console.cloud.google.com/) | Free tier |
| `RAPID_API_KEY` | Optional | [RapidAPI](https://rapidapi.com/) | Paid plans |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ for creators who want to understand and replicate viral content patterns.

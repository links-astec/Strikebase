# Strikebase

**Bid intelligence for freelancers.** Strikebase scans live job listings across five platforms, scores every opportunity 0–100 with AI, and tells you exactly why to bid — or skip — before you write a single word.

> Built for the **[Web Data UNLOCKED Hackathon](https://lablab.ai)** (May 2026) · Powered by Bright Data + Claude AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-strikebase.vercel.app-blue?style=flat-square)](https://strikebase.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square)](https://strikebase-api.onrender.com/docs)

---

## The problem

Freelancers waste hours manually scanning job boards, reading low-effort listings, and sending proposals that never get a reply. There's no signal — just noise.

Strikebase replaces that guesswork with a live, data-backed score on every listing in seconds.

---

## What it does

| Feature | Description |
|---|---|
| **Live SERP scan** | Queries Google across Upwork, Freelancer, Guru, PeoplePerHour, and Toptal simultaneously |
| **Deep data extraction** | Pulls bid counts, budgets, required skills, and posting dates from each listing |
| **Client intelligence** | Reads client history behind bot protection: total spend, hire rate, review count, dispute record |
| **AI scoring** | Ranks every listing 0–100 with data-backed reasons and a GO / RISKY / SKIP verdict |
| **Proposal angle** | One-liner opening for your proposal, tailored to each specific job |
| **Job analyzer** | Paste any URL or description — get an instant score against your profile |
| **Project suggestions** | AI recommends portfolio projects that raise your win probability |
| **Scan history** | Every scan saved to your account with full results |

---

## How Bright Data is used

Strikebase uses **all four** Bright Data tools:

| Tool | How it's used |
|---|---|
| **SERP API** | Live Google search to surface fresh listings across all five platforms |
| **Web Scraper API** | Structured extraction of job details (budget, skills, bid count, post date) |
| **Web Unlocker** | Bypasses bot protection to read client profiles — spend history, hire rate, disputes |
| **MCP Server** | Connects AI agents to Bright Data tools natively via the Model Context Protocol |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | FastAPI, Python 3.11, Uvicorn |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Scraping | Bright Data — SERP API, Web Scraper, Web Unlocker, MCP Server |
| AI | Anthropic Claude API |
| Deployment | Vercel (frontend) · Render (backend) |

---

## Project structure

```
Strikebase/
├── backend/
│   ├── agents/          # SERP search, scraper, pipeline orchestration
│   ├── ai/              # Scoring + project suggestion logic
│   ├── middleware/       # JWT auth verification
│   ├── migrations/       # Supabase SQL migrations
│   ├── models/           # Pydantic schemas
│   ├── routers/          # API route handlers
│   ├── config.py         # Environment settings
│   ├── database.py       # Supabase DB helpers
│   └── main.py           # FastAPI app entry point
└── frontend/
    ├── components/       # Shared UI components
    ├── lib/              # API client, auth context, theme
    ├── pages/            # Next.js pages (app/, auth, landing)
    └── styles/           # Global CSS design system
```

---

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Bright Data](https://brightdata.com) account with SERP, Web Scraper, and Web Unlocker zones
- An [Anthropic](https://console.anthropic.com) API key

---

### Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```env
# Bright Data
BRIGHT_DATA_TOKEN=your_token
BRIGHT_DATA_SERP_ZONE=your_serp_zone
BRIGHT_DATA_UNLOCKER_ZONE=your_unlocker_zone

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# App
CORS_ORIGINS=http://localhost:3000
PORT=8000
```

Run the Supabase migration in your project's SQL Editor:

```sql
-- contents of backend/migrations/001_user_profiles.sql
```

Start the server:

```bash
uvicorn main:app --reload
```

API at `http://localhost:8000` · Swagger docs at `http://localhost:8000/docs`

---

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

App at `http://localhost:3000`

---

### Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy the project URL and **service role key** (Settings → API) into `backend/.env`
3. Run `backend/migrations/001_user_profiles.sql` in the SQL Editor
4. Go to **Authentication → URL Configuration** → add `http://localhost:3000/reset-password` to Redirect URLs

---

### Bright Data zones

| Zone | Type | Purpose |
|---|---|---|
| `your_serp_zone` | SERP API | Google search across all platforms |
| `your_unlocker_zone` | Web Unlocker | Job page scraping + client profile reads |

---

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service + Supabase connectivity check |
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Sign in |
| `POST` | `/auth/forgot-password` | Send password reset email |
| `POST` | `/auth/reset-password` | Set new password with recovery token |
| `GET` | `/users/me` | Get profile |
| `PUT` | `/users/me` | Update profile |
| `POST` | `/scan` | Start a new scan |
| `GET` | `/opportunities/{scan_id}` | Poll scan results |
| `GET` | `/scans/history` | User scan history |
| `POST` | `/jobs/analyze` | Analyze a single job URL or description |
| `POST` | `/suggestions` | Get AI project suggestions |

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `BRIGHT_DATA_TOKEN` | Yes | Bright Data API bearer token |
| `BRIGHT_DATA_SERP_ZONE` | Yes | SERP zone name |
| `BRIGHT_DATA_UNLOCKER_ZONE` | Yes | Web Unlocker zone name |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `PORT` | No | Server port (default: `8000`) |

---

## License

MIT

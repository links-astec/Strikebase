# Strikebase

**Freelance bid intelligence.** Strikebase scans live job listings across five platforms, scores every opportunity 0–100 against your specific background, and tells you exactly which jobs are worth bidding on — before you write a single word.

> Built for the **[Web Data UNLOCKED Hackathon](https://lablab.ai)** (May 2026) · Powered by Bright Data · Claude AI · Cognee · AI/ML API

[![Live Demo](https://img.shields.io/badge/Live%20Demo-strikebase.vercel.app-blue?style=flat-square)](https://strikebase.vercel.app?demo=true)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square)](https://strikebase-api.onrender.com/docs)

---

## The problem

Freelancers waste hours writing proposals for jobs they won't win — too many competing bids, clients who never hire, budgets that don't match their rate. The data that would change those odds exists: bid counts, client spend history, hire rates, dispute records. It's hidden behind bot protection, scattered across five platforms, and invisible to anyone without a pipeline to pull it.

---

## What it does

| Feature | Description |
|---|---|
| **Personalised scoring** | Every listing scored 0–100 against your skill levels, niche, and target rate — not a generic market score |
| **Skill proficiency** | Set your level per skill (Beginner / Competent / Expert) — the score weights skill depth against what each listing actually requires |
| **Niche matching** | Describe your specialisation in one line — proposal angles are generated to reflect your specific domain |
| **Portfolio enrichment** | Link your GitHub or portfolio — Bright Data scrapes it and the AI references your actual work in scoring and proposals |
| **Live SERP scan** | Queries all five platforms simultaneously: Upwork, Freelancer, Guru, PeoplePerHour, Toptal |
| **Client intelligence** | Reads client history behind bot protection: total spend, hire rate, reviews, dispute record |
| **Strike Score** | GO / RISKY / SKIP verdict with specific data-backed reasons and red flags |
| **Proposal angle** | A literal first sentence for your proposal, built from the listing, client history, and your background |
| **AI Chat** | Ask anything about an opportunity — the AI has full context and answers with the actual data |
| **Cognee memory** | Every scan builds a knowledge graph. Future scans use prior client intelligence and your win patterns to sharpen scores |
| **Scan history** | All scans saved to your account with full results |

---

## How the technologies are used

### Bright Data — the data layer

| Tool | How it's used |
|---|---|
| **SERP API** | Live Google search to surface fresh listings across all five platforms on every scan |
| **Web Scraper API** | Structured extraction of job details: bid counts, budgets, required skills, post dates |
| **Web Unlocker** | Bypasses bot protection to read client profiles (spend, hire rate, disputes) and portfolio pages (Behance, Dribbble, personal sites) |
| **MCP Server** | Connects AI agents to all three Bright Data tools natively via the Model Context Protocol |

### Claude AI — scoring and analysis
Every listing is scored by Claude using live scraped data, the user's skill profile, and Cognee memory context. Claude writes the verdict, reasons, red flags, and proposal angle.

### Cognee — the memory layer
After every completed scan, results are stored into a per-user knowledge graph. On the next scan, Cognee queries that graph for two signals before scoring: prior intelligence on each client, and patterns from the user's own scan history. The product gets smarter with each use.

### AI/ML API — the chat layer
Powers the AI Chat feature. Streams real-time answers to freelancer questions about any opportunity, with full opportunity context pre-loaded (score, bid count, client history, market rates, red flags).

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | FastAPI, Python 3.11 |
| Database & Auth | Supabase (PostgreSQL) |
| Scraping | Bright Data — SERP API, Web Scraper, Web Unlocker, MCP Server |
| AI Scoring | Anthropic Claude API |
| Memory | Cognee (knowledge graph, AI/ML API backend) |
| Chat | AI/ML API (OpenAI-compatible, gpt-4o-mini) |
| Portfolio | GitHub public API · Bright Data Web Unlocker |
| Deployment | Vercel (frontend) · Render (backend) |

---

## Project structure

```
Strikebase/
├── backend/
│   ├── agents/
│   │   ├── pipeline.py      # Main orchestration: SERP → scrape → score → save
│   │   ├── serp.py          # Bright Data SERP API
│   │   ├── scraper.py       # Bright Data Web Scraper API
│   │   ├── unlocker.py      # Bright Data Web Unlocker (clients + portfolios)
│   │   ├── portfolio.py     # GitHub API + portfolio page scraping
│   │   └── mcp_client.py    # Bright Data MCP Server integration
│   ├── ai/
│   │   ├── scorer.py        # Claude AI scoring
│   │   └── prompts.py       # Prompt templates (skill levels, niche, memory)
│   ├── memory/
│   │   └── cognee_memory.py # Cognee knowledge graph store + query
│   ├── middleware/          # JWT auth verification
│   ├── migrations/          # Supabase SQL migrations
│   ├── models/              # Pydantic schemas
│   ├── routers/
│   │   ├── scan.py          # POST /scan
│   │   ├── opps.py          # GET /opportunities/:id
│   │   ├── chat.py          # POST /chat/opportunity (streaming SSE)
│   │   ├── users.py         # GET/PUT /users/me
│   │   ├── auth.py          # Register, login, password reset
│   │   ├── jobs.py          # POST /jobs/analyze
│   │   └── suggestions.py   # POST /suggestions
│   ├── config.py            # Environment settings
│   ├── database.py          # Supabase helpers
│   └── main.py              # FastAPI entry point
└── frontend/
    ├── components/
    │   ├── ScanForm.tsx      # Skill chips with proficiency levels + niche + portfolio
    │   ├── OpportunityCard.tsx
    │   ├── StrikeScore.tsx
    │   ├── AppShell.tsx
    │   └── ...
    ├── lib/                  # API client, auth context, theme
    ├── pages/
    │   ├── app/
    │   │   ├── scan.tsx      # Scan page
    │   │   ├── chat.tsx      # AI Chat (3-column layout, persistent threads)
    │   │   ├── opportunity/[id].tsx
    │   │   ├── history.tsx
    │   │   ├── settings.tsx  # GitHub + portfolio URL, skill profile
    │   │   └── dashboard.tsx
    │   └── ...
    └── styles/               # Global CSS design system
```

---

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Supabase](https://supabase.com) project
- [Bright Data](https://brightdata.com) account with SERP, Web Scraper, and Web Unlocker zones
- [Anthropic](https://console.anthropic.com) API key
- [AI/ML API](https://aimlapi.com) key

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
BRIGHT_DATA_TOKEN=your_token
BRIGHT_DATA_SERP_ZONE=your_serp_zone
BRIGHT_DATA_UNLOCKER_ZONE=your_unlocker_zone

ANTHROPIC_API_KEY=sk-ant-...
AIML_API_KEY=your_aiml_key

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

CORS_ORIGINS=http://localhost:3000
PORT=8000
```

Run the Supabase migration in your project's SQL Editor (see `backend/migrations/`), then:

```bash
uvicorn main:app --reload
```

API at `http://localhost:8000` · Swagger docs at `http://localhost:8000/docs`

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

App at `http://localhost:3000` — or try the live demo at `strikebase.vercel.app?demo=true` (no signup needed).

---

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health check |
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Sign in |
| `POST` | `/auth/forgot-password` | Send password reset |
| `POST` | `/auth/reset-password` | Set new password |
| `GET` | `/users/me` | Get profile |
| `PUT` | `/users/me` | Update profile (skills, rate, GitHub URL, portfolio URL) |
| `POST` | `/scan` | Start scan (skills with levels, niche, rate, portfolio URLs) |
| `GET` | `/opportunities/{scan_id}` | Poll scan results |
| `GET` | `/scans/history` | User scan history |
| `POST` | `/jobs/analyze` | Analyze a single job URL or description |
| `POST` | `/chat/opportunity` | Streaming AI chat with opportunity context (SSE) |
| `POST` | `/suggestions` | Get AI project suggestions |

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `BRIGHT_DATA_TOKEN` | Yes | Bright Data API bearer token |
| `BRIGHT_DATA_SERP_ZONE` | Yes | SERP zone name |
| `BRIGHT_DATA_UNLOCKER_ZONE` | Yes | Web Unlocker zone name |
| `ANTHROPIC_API_KEY` | Yes | Claude AI scoring |
| `AIML_API_KEY` | Yes | AI/ML API — chat layer + Cognee memory backend |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `PORT` | No | Server port (default: `8000`) |

---

## License

MIT

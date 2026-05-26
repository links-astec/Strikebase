# Strikebase

**Bid intelligence for freelancers.** Strikebase scans live job listings across five platforms, scores every opportunity 0–100, and tells you exactly why to bid — or skip — before you write a single word.

---

## What it does

- **Live SERP scan** — queries Google in real time across Upwork, Freelancer, Guru, PeoplePerHour, and Toptal simultaneously
- **Deep data extraction** — pulls bid counts, budgets, required skills, and posting dates from each listing
- **Client intelligence** — reads client history behind bot protection: total spend, hire rate, review count, dispute record
- **AI scoring** — ranks every listing 0–100 with data-backed reasons and a GO / RISKY / SKIP verdict
- **Proposal angle** — one-liner tip on how to open your proposal for that specific job
- **Job analyzer** — paste any job URL or description and get an instant score against your profile
- **Project suggestions** — AI recommends portfolio projects that would raise your win probability
- **Scan history** — every scan is saved to your account with full results

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | FastAPI, Python 3.10, Uvicorn |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Scraping | Bright Data — SERP API, Web Scraper, Web Unlocker, Datasets |
| AI | Anthropic API |
| Styling | Custom CSS design system (Cormorant Garamond + Jost) |

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

- Python 3.10+
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
-- backend/migrations/001_user_profiles.sql
```

Start the server:

```bash
uvicorn main:app --reload
```

API available at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

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

Start the dev server:

```bash
npm run dev
```

App available at `http://localhost:3000`.

---

### Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy the project URL and **service role key** (Settings → API) into `backend/.env`
3. Run `backend/migrations/001_user_profiles.sql` in the SQL Editor
4. Go to **Authentication → URL Configuration** and add `http://localhost:3000/reset-password` to Redirect URLs (required for password reset emails)

---

### Bright Data zones

You need three zones configured in your Bright Data dashboard:

| Zone | Type | Used for |
|---|---|---|
| `your_serp_zone` | SERP API | Google search across all platforms |
| `your_unlocker_zone` | Web Unlocker | Scraping individual job pages |
| *(optional)* | Web Scraper Datasets | Structured Upwork/Freelancer data |

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
| `POST` | `/scan` | Start a new scan (async) |
| `GET` | `/opportunities/{scan_id}` | Poll scan results |
| `GET` | `/scans/history` | User scan history |
| `POST` | `/jobs/analyze` | Analyze a single job URL or description |
| `POST` | `/suggestions` | Get portfolio project suggestions |
| `GET` | `/test/serp` | Debug Bright Data SERP connectivity |

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
| `CORS_ORIGINS` | No | Comma-separated allowed origins (default: `http://localhost:3000`) |
| `PORT` | No | Server port (default: `8000`) |

---

## License

MIT

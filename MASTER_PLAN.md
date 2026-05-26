# Strikebase — Master Plan (Updated)

> **Hackathon:** Web Data UNLOCKED · May 25–31, 2026  
> **Track:** GTM Intelligence (Track 1) · secondary angle on Track 2 (Finance/market rates)  
> **Prize:** $5K grand prize  
> **Team:** Gabriel Nii Attoh Quaye (Co-founder · Full-stack Engineer) · Prince Edwin Nyarko (Co-founder · Full-stack Developer)  
> **Tagline:** *"Freelancers waste hours bidding on jobs they won't win. We're fixing that."*

---

## Original Plan vs What We Actually Built

### What the plan called for (MVP)

| Planned | Status |
|---|---|
| Landing page (hero + demo card + how it works + 1 CTA) | ✅ Built — and far exceeded: Linear-inspired, product preview, stats strip, 6-feature grid, About section, fully responsive |
| Dashboard `/dashboard` (scan form + ranked feed) | ✅ Built at `/app/dashboard` + `/app/scan` |
| Detail page `/opportunity/[id]` (score, client, rates, proposal) | ✅ Built at `/app/opportunity/[id]` |
| Strike Score (0–100, GO/RISKY/SKIP) | ✅ Built with animated ring component |
| Client deep dive (spend, hire rate, disputes) | ✅ Built — ClientProfile component |
| Live market rates (P25/P50/P75) | ✅ Built — MarketRates component + backend aggregation |
| Proposal angle (AI opening line) | ✅ Built — stored per opportunity, shown on detail page |
| Bright Data SERP API | ✅ Integrated |
| Bright Data Web Scraper API | ✅ Integrated |
| Bright Data Web Unlocker | ✅ Integrated |
| Bright Data MCP Server | ❌ NOT built — using direct Anthropic API instead |
| Async background pipeline (non-blocking scan) | ✅ Built — `BackgroundTasks` in FastAPI |
| Polling every 3s during scan | ✅ Built |
| Supabase (4 tables) | ✅ Built — scans, opportunities, client_profiles, market_rates + user_profiles (5th table added) |
| Cache client profiles (24hr TTL) | ✅ Built in `database.py` |
| Demo mode `?demo=true` | ❌ NOT built — critical gap for hackathon presentation |
| Deployment (Vercel + Railway) | ❌ NOT deployed — running locally only |

---

### Features We Added Beyond the Plan

| Added Feature | Why |
|---|---|
| **Full auth flow** (register, login, forgot password, reset password) | Users need persistent profiles across sessions |
| **Email auto-confirm on register** (Supabase admin API) | Removes the confirmation email step — instant login after signup |
| **User profiles** (skills, rate, experience, bio, GitHub) | Personalises scoring; profile persists between scans |
| **3-step onboarding flow** | Collects profile data smoothly on first visit |
| **Scan history page** | Users can revisit past scan results |
| **Single job URL analyzer** (`/app/analyze`) | Analyze any job link directly without a full scan |
| **AI portfolio suggestions** (`/app/suggestions`) | Claude recommends projects to build to increase win rate |
| **Settings page** (profile + password change) | Users can update all profile data and change password |
| **Skill autocomplete dropdown** (SkillInput component) | 60+ skills with arrow-key navigation and custom skill support |
| **Dark / light theme** (persisted) | Better UX, especially for the landing page |
| **Mobile-first layout** (drawer + top bar + bottom nav) | Full PWA-grade mobile experience |
| **PWA support** (manifest + service worker + icons) | Installable as a mobile app |
| **Techy design system** | Electric blue (#3b82f6), Space Grotesk, JetBrains Mono — zero warm gold remnants |
| **PasswordStrength component** | Segment bar shown while typing passwords |
| **StrikeScore visual component** | Animated SVG ring with color-coded score |
| **End-to-end smoke test script** | `backend/test_endpoints.py` — tests every route |
| **Full schema migration SQL** | `000_full_schema.sql` with RLS + trigger for auto-profile creation |

---

## What's Missing (Gaps to Close Before Demo)

### 🔴 Critical — Must fix before demo

| Gap | Impact | Fix |
|---|---|---|
| **Demo mode `?demo=true`** | Without this, a live Bright Data API call runs during the judge presentation — if it times out, the demo dies | Add a `/opportunities/demo` endpoint that serves `is_demo=true` rows from Supabase; in the frontend check `router.query.demo === "true"` and skip the scan entirely |
| **Deployment** | Judges need a live URL to test | Deploy frontend to Vercel, backend to Railway. Both support free tier. One day of work. |
| **MCP Server** | Plan lists it as a core Bright Data tool — judges will notice if it's missing | Either wire up Bright Data MCP Server as a tool Claude can call, or at minimum reference it in the pitch as "next integration" |

### 🟡 High priority — Polish before submission

| Gap | Impact |
|---|---|
| **Visual scan progress bar** | Pipeline has status messages but UI just spins. Show step names: Searching → Extracting → Scoring |
| **Caching headers in responses** | Client profile cache is in DB but not surfaced to the user — showing "from cache" badge builds trust with judges |
| **Demo data pre-loaded** | Pre-scrape 3 complete scenarios (React dev, Python dev, copywriter) tagged `is_demo=true` before Day 4 ends |
| **Timing alerts (stretch)** | Flag listings posted <2 hours ago with low bids — the "bid timing signals" feature in the plan |

### 🟢 Nice-to-have (post-hackathon)

| Gap | Notes |
|---|---|
| Bookmark/save opportunities | Single DB column + API endpoint |
| Bid tracker (mark + track outcomes) | The data that makes Strikebase invaluable long-term |
| Stripe billing (free tier cap + Pro) | Needed for monetisation |
| Email notifications after scan | Resend or Supabase Edge Functions |
| OAuth login (Google/GitHub) | Supabase supports natively — 1 day |
| Scan scheduling | "Scan for React jobs every morning" |
| Win-rate analytics charts | Score trend over time per user |
| Export to CSV | Power users want this |
| Competitor profiling (stretch) | Who else is bidding, what their profiles look like |

---

## Architecture

```
User browser
    │
    ▼
Next.js 16 frontend (Pages Router, TypeScript, CSS custom properties)
    │  polls /opportunities/:scan_id every 3s while processing
    ▼
FastAPI backend (Python 3.11, httpx async)
    │
    ├── Supabase
    │    ├── Auth (email/password, admin email-confirm, JWT)
    │    ├── Postgres DB (5 tables + RLS)
    │    └── Row Level Security (per-user data isolation)
    │
    ├── Bright Data
    │    ├── SERP API         → Google search across 5 platforms
    │    ├── Web Scraper API  → Structured job listing data
    │    ├── Web Unlocker     → Client profiles behind bot protection
    │    └── Datasets         → Market rate benchmarks (P25/P50/P75)
    │
    └── Anthropic Claude (claude-sonnet-4-5)
         ├── Scoring pipeline → 0–100 score + reasons + verdict + proposal angle
         └── Suggestions      → Portfolio project recommendations
```

---

## All Pages & Routes

```
PUBLIC
  /                        Landing page (Linear-inspired redesign)
  /login                   Sign in
  /register                Create account
  /forgot-password         Request reset email
  /reset-password          Set new password (token from email)

ONBOARDING
  /onboarding              3-step: skills → rate/experience → bio/GitHub

APP (auth required)
  /app/dashboard           Stats tiles + scan launch form
  /app/scan                Scan results — filter by verdict/platform, sort by score/rate/bids
  /app/history             All past scans, click to reload results
  /app/opportunity/[id]    Full breakdown: score, client profile, market rates, proposal angle
  /app/analyze             Drop any job URL → instant AI score + analysis
  /app/settings            Profile, skills, rate, experience, bio, GitHub, password change

MISSING (not built yet)
  /app/suggestions         AI portfolio project recommendations (backend exists, frontend route TBD)
```

---

## Database Schema

```sql
scans           — id, user_id, skills[], hourly_rate, experience, status, progress, created_at
opportunities   — id, scan_id, title, url, platform, budget_min/max, bid_count, client_id,
                  strike_score, verdict, reasons[], red_flags[], proposal_angle, is_demo
client_profiles — client_id (PK), platform, total_spent, hire_rate, review_count,
                  dispute_count, avg_rating, avg_duration_days, scraped_at (cache TTL)
market_rates    — id, skill_tag, platform, p25_rate, median_rate, p75_rate, sample_count, week_start
user_profiles   — id (FK → auth.users), display_name, skills[], hourly_rate, experience,
                  github_url, bio, onboarded
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (Pages Router), TypeScript, CSS Variables (no Tailwind) |
| Backend | FastAPI, Python 3.11, httpx (fully async) |
| Database | Supabase (Postgres + Auth + RLS) |
| Data APIs | Bright Data — SERP API, Web Scraper, Web Unlocker, Datasets |
| AI | Anthropic Claude claude-sonnet-4-5 (scoring + suggestions + analysis) |
| Auth | Supabase Auth (email/password; admin auto-confirm on register) |
| Design | Space Grotesk + Inter + JetBrains Mono; Electric blue (#3b82f6) accent |
| PWA | Web app manifest + cache-first service worker |
| Hosting | **TODO** — Vercel (frontend) + Railway (backend) |

---

## Immediate Action Items (in priority order)

1. **Build demo mode** — `/opportunities/demo` endpoint + `?demo=true` frontend bypass. Pre-load 3 scenarios.
2. **Deploy** — Vercel for frontend, Railway for backend. Get a live URL.
3. **Wire MCP Server** — even a thin integration counts for the hackathon criteria.
4. **Visual progress bar** — show pipeline step names during scan.
5. **Polish suggestions page** — the frontend page may need verification it routes correctly.

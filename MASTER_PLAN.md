# Strikebase — Master Plan

> Freelance bid intelligence platform. Tells you which jobs to bid on — and why — before you write a single word.

**Team:** Gabriel Nii Attoh Quaye (Co-founder · Full-stack Engineer) · Prince Edwin Nyarko (Co-founder · Full-stack Developer)

---

## Vision

Give every freelancer the same intelligence advantage that top agencies have: live market data, client due diligence, and AI-ranked opportunities — in under 30 seconds per scan.

---

## What We've Built ✅

### Backend (FastAPI + Supabase)

| Feature | Status | Notes |
|---|---|---|
| Auth — register + login | ✅ Done | Supabase auth, auto-confirms email via admin API |
| Auth — forgot / reset password | ✅ Done | Token-based reset via email link |
| User profiles (CRUD) | ✅ Done | Skills, hourly rate, experience, bio, GitHub URL, display name |
| Scan pipeline — SERP | ✅ Done | Bright Data SERP API, queries Google across 5 platforms in parallel |
| Scan pipeline — Web Scraper | ✅ Done | Extracts budget, bid count, skills, posted date per listing |
| Scan pipeline — Web Unlocker | ✅ Done | Reads client history behind bot protection (spend, hire rate, disputes) |
| AI scoring (Claude) | ✅ Done | 0–100 strike score, GO/RISKY/SKIP verdict, reasons, red flags, proposal angle |
| Market rate calculation | ✅ Done | P25/P50/P75 from live scan budgets, stored per skill per week |
| Async background pipeline | ✅ Done | Scan never blocks the HTTP response; frontend polls status |
| Scan history | ✅ Done | All scans stored per user, browsable |
| Opportunity detail | ✅ Done | Full breakdown: score, reasons, flags, client profile, market rates |
| Single job URL analyzer | ✅ Done | Drop any job URL, get AI score + analysis |
| Portfolio suggestions (AI) | ✅ Done | Claude recommends 4 buildable projects to raise bid win rate |
| Health + SERP debug endpoints | ✅ Done | `/health`, `/test/serp` |
| RLS + per-user data isolation | ✅ Done | Supabase Row Level Security on all tables |
| Full schema migration SQL | ✅ Done | `000_full_schema.sql` with all tables + trigger for auto profile creation |
| Endpoint smoke test script | ✅ Done | `backend/test_endpoints.py` — tests every route end-to-end |

### Frontend (Next.js + TypeScript)

| Feature | Status | Notes |
|---|---|---|
| Landing page | ✅ Done | Linear-inspired: centered hero, product preview, stats strip, feature grid, About section, footer |
| Login page | ✅ Done | Email/password, show/hide toggle, forgot password link, back button |
| Register page | ✅ Done | Email/password with strength meter, confirm field, back button |
| Forgot password page | ✅ Done | Email input → sends reset link |
| Reset password page | ✅ Done | Token-based, new password + confirm + strength meter |
| Onboarding (3 steps) | ✅ Done | Skills → Rate/Experience → Bio/GitHub; always redirects to dashboard |
| Dashboard | ✅ Done | Scan form, stat tiles (total scans, avg score, top platform, top score), recent activity |
| Scan results page | ✅ Done | Filter by verdict (GO/RISKY/SKIP), filter by platform, sort by Score/Rate/Bids |
| Opportunity detail page | ✅ Done | Full score breakdown, client profile card, market rates chart, proposal angle |
| Scan history page | ✅ Done | List of all past scans, click to view results |
| Job analyzer page | ✅ Done | Paste a job URL → AI score + analysis |
| Portfolio suggestions page | ✅ Done | AI-generated project ideas ranked by score impact |
| Settings page | ✅ Done | Profile (display name, bio, GitHub), skills, rate/experience, password change |
| Skill autocomplete (SkillInput) | ✅ Done | 60+ skills, dropdown on type, arrow key nav, custom skills, max limit |
| StrikeScore visual component | ✅ Done | Animated ring with color-coded score |
| ClientProfile component | ✅ Done | Spend, hire rate, reviews, disputes |
| MarketRates component | ✅ Done | P25/P50/P75 bar visualization |
| PasswordStrength component | ✅ Done | Segment bar, strength label |
| AuthGuard (route protection) | ✅ Done | Redirects unauthenticated users to /login |
| Dark / light theme | ✅ Done | Toggle persisted to localStorage |
| Mobile responsive layout | ✅ Done | Sliding sidebar drawer, fixed top bar, bottom nav (5 icons), scrollable filter pills |
| PWA support | ✅ Done | Web app manifest, service worker (cache-first), iOS meta tags, install prompt |
| PWA icons | ✅ Done | icon-192.png + icon-512.png (lightning bolt, generated via sharp) |
| Techy design system | ✅ Done | Electric blue accent (#3b82f6), cool blue-black bg, Space Grotesk + JetBrains Mono |
| Dev indicator removed | ✅ Done | `devIndicators: false` in next.config.ts |

---

## What's Missing / Gaps to Close

### High Priority (Core Product)

| Gap | Why It Matters |
|---|---|
| **Visual scan progress bar** | Pipeline has status messages but no UI progress indicator — users don't know which step they're on |
| **Real-time scan status** (WebSocket or SSE) | Currently polling every 2s; true real-time would feel faster and cleaner |
| **Bookmark / save opportunities** | Can't save individual jobs from a scan to revisit later |
| **Bid tracker** | Can't mark "I bid on this" and track win/loss outcomes — the data that would make Strikebase truly invaluable over time |
| **Opportunity expiry / freshness flag** | Old listings waste users' time; need to surface "posted today" vs "posted 2 weeks ago" clearly |

### Growth / Monetization

| Gap | Why It Matters |
|---|---|
| **Subscription tiers + Stripe billing** | Free tier (3 scans/day) → Pro tier ($9/mo, unlimited) — needed to monetize |
| **Scan usage limits** | Without a cap, every free user consumes Bright Data API credits |
| **Email notifications** | "3 GO-rated jobs found matching your skills" sent after each scan completes |
| **Referral system** | Invite a friend → both get a free week of Pro |

### Quality / Polish

| Gap | Why It Matters |
|---|---|
| **OAuth login** (Google / GitHub) | Reduces signup friction dramatically |
| **Profile avatar upload** | Currently shows initials only |
| **Scan scheduling** | "Scan for React jobs every day at 9am" — set-and-forget automation |
| **Export to CSV / copy to clipboard** | Power users want to paste results into their own tracker |
| **Win-rate analytics** | Charts showing your average score over time, which platforms work best for your skills |
| **Rate limiting on API** | Prevent abuse; protect Bright Data credit budget |
| **Error boundary UI** | App crashes show blank screen; need friendly error pages |
| **Opportunity count on history** | History list shows scan date but not how many results were found |

### Platform Coverage

| Gap | Why It Matters |
|---|---|
| **LinkedIn freelance gigs** | Large untapped market |
| **Fiverr / 99designs** | Fixed-price market different from hourly — different scoring model needed |
| **Toptal quality check** | Currently in SERP scope but no Toptal-specific parsing |

---

## Architecture

```
User → Next.js frontend
         │
         ▼
FastAPI backend (Python)
         │
         ├─ Supabase (auth + Postgres DB + RLS)
         │
         ├─ Bright Data
         │    ├─ SERP API         → Google search across 5 platforms
         │    ├─ Web Scraper      → Structured job listing data
         │    ├─ Web Unlocker     → Client profile behind bot protection
         │    └─ Datasets         → Market rate benchmarks
         │
         └─ Anthropic Claude      → Scoring + suggestions + analysis
```

---

## Pages & Routes

```
/                        Landing page
/login                   Sign in
/register                Create account
/forgot-password         Request reset email
/reset-password          Set new password (token)
/onboarding              3-step profile setup (skills → rate → bio)

/app/dashboard           Stats + scan launch
/app/scan                Scan results (filter, sort)
/app/history             Past scans
/app/opportunity/[id]    Single opportunity deep dive
/app/analyze             Single job URL analyzer
/app/settings            Profile, skills, rate, password
```

*Suggestions page exists in backend (`/api/suggestions`) but the frontend route may need verification.*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (Pages Router), TypeScript, CSS Variables |
| Backend | FastAPI, Python 3.11, httpx (async) |
| Database | Supabase (Postgres + Auth + RLS) |
| Data APIs | Bright Data — SERP API, Web Scraper, Web Unlocker, Datasets |
| AI | Anthropic Claude (claude-sonnet-4-5 for scoring + suggestions) |
| Auth | Supabase Auth (email/password, admin email-confirm on register) |
| Fonts | Space Grotesk, Inter, JetBrains Mono |
| PWA | Web app manifest + service worker (cache-first) |
| Hosting | (TBD — Vercel for frontend, Railway/Render for backend) |

---

## Immediate Next Steps

1. **Add visual scan progress** — show step names (Searching → Extracting → Scoring) in the UI
2. **Add bookmark/save** on opportunity cards (single DB column + API endpoint)
3. **Wire up Stripe** — free tier cap + Pro subscription  
4. **Add email notification** on scan complete (Supabase Edge Function or Resend)
5. **OAuth** — add Google login via Supabase OAuth provider (1 day of work)

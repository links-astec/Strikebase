# Strikebase — Deployment Guide

Two services. Frontend on Vercel, backend on Railway. Both have free tiers that cover hackathon load.

---

## 1. Backend → Railway

### One-time setup
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select `links-astec/Strikebase`, set **Root Directory** to `backend`
3. Railway auto-detects `railway.toml` — no extra config needed

### Environment variables (add in Railway dashboard → Variables)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
BRIGHT_DATA_TOKEN=...
BRIGHT_DATA_SERP_ZONE=serp_api
BRIGHT_DATA_UNLOCKER_ZONE=unlocker
CORS_ORIGINS=https://strikebase.vercel.app,http://localhost:3000
```

### After deploy
- Copy the Railway public URL (e.g. `https://strikebase-api.up.railway.app`)
- Test: `curl https://strikebase-api.up.railway.app/health`

---

## 2. Frontend → Vercel

### One-time setup
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select `links-astec/Strikebase`, set **Root Directory** to `frontend`
3. Vercel auto-detects Next.js — framework preset applies automatically

### Environment variables (add in Vercel dashboard → Settings → Environment Variables)
```
NEXT_PUBLIC_API_URL=https://strikebase-api.up.railway.app
```
> Replace with your actual Railway URL from step 1.

### After deploy
- Your frontend URL will be `https://strikebase.vercel.app` (or similar)
- Update Railway's `CORS_ORIGINS` to include this exact URL

---

## 3. Demo data — seed before demo day

Run this SQL once in the Supabase SQL editor:
```
backend/migrations/002_demo_seed.sql
```

This inserts 10 realistic opportunities tagged `is_demo=true` (3 GO, 4 RISKY, 3 SKIP) plus market rate data, client profiles, and a demo scan row. The demo toggle in the app sidebar will load these instantly without hitting Bright Data.

---

## 4. MCP Server (Bright Data)

The `jobs/analyze` endpoint uses `@brightdata/mcp` via subprocess for richer URL scraping.

**Railway** — Node.js is available in the Nixpacks build environment. The first `npx -y @brightdata/mcp` call will download and cache the package. No extra setup needed.

**Local dev** — requires Node.js + npm on PATH. Install globally for faster startup:
```bash
npm install -g @brightdata/mcp
```

Install the Python MCP client into the venv (stop the server first):
```bash
pip install "mcp>=1.0.0"
```

---

## 5. CORS checklist

After deploying both services, make sure `CORS_ORIGINS` on Railway includes:
- `https://strikebase.vercel.app` (your Vercel URL)
- `http://localhost:3000` (local dev)

Redeploy Railway after updating env vars.

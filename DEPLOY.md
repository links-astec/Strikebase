# Strikebase — Deployment Guide

Two services. Frontend on Vercel (free), backend on Render (free). Both deploy directly from GitHub.

---

## 1. Backend → Render

### One-time setup
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub account and select `links-astec/Strikebase`
3. Set **Root Directory** to `backend`
4. Render picks up `render.yaml` automatically — build and start commands are pre-filled

   | Setting | Value |
   |---|---|
   | Runtime | Python 3 |
   | Build command | `pip install -r requirements.txt` |
   | Start command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
   | Plan | Free |

### Environment variables (add in Render dashboard → Environment)
```
SUPABASE_URL          https://your-project.supabase.co
SUPABASE_SERVICE_KEY  eyJ...
SUPABASE_ANON_KEY     eyJ...
ANTHROPIC_API_KEY     sk-ant-...
BRIGHT_DATA_TOKEN     ...
BRIGHT_DATA_SERP_ZONE     serp_api
BRIGHT_DATA_UNLOCKER_ZONE unlocker
CORS_ORIGINS          https://strikebase.vercel.app,http://localhost:3000
```

### After deploy
- Your backend URL will be something like `https://strikebase-api.onrender.com`
- Test it: `curl https://strikebase-api.onrender.com/health`

> **Note:** Render free tier spins down after 15 min of inactivity. First request after sleep takes ~30s. For the hackathon demo, hit `/health` once before presenting to wake it up.

---

## 2. Frontend → Vercel

### One-time setup
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select `links-astec/Strikebase`, set **Root Directory** to `frontend`
3. Vercel auto-detects Next.js — no extra config needed

### Environment variables (add in Vercel → Settings → Environment Variables)
```
NEXT_PUBLIC_API_URL   https://strikebase-api.onrender.com
```
> Replace with your actual Render URL.

### After deploy
- Your frontend URL will be `https://strikebase.vercel.app` (or a Vercel-assigned subdomain)
- Update `CORS_ORIGINS` on Render to include this exact URL, then redeploy backend

---

## 3. Demo data — seed before demo day

Run this SQL **once** in the Supabase SQL editor:

```
backend/migrations/002_demo_seed.sql
```

This inserts 10 pre-built opportunities tagged `is_demo=true` — 3 GO, 4 RISKY, 3 SKIP — with realistic client profiles, budgets, bid counts, and proposal angles. The demo toggle in the app sidebar loads these instantly, with no Bright Data calls.

---

## 4. MCP Server (Bright Data)

The `jobs/analyze` endpoint uses `@brightdata/mcp` via subprocess for richer URL scraping.

**Render** — Node.js is available in the Render Python environment. The first `npx -y @brightdata/mcp` call downloads and caches the package automatically. No extra setup needed.

**Local dev** — requires Node.js + npm on PATH. Install globally for faster cold start:
```bash
npm install -g @brightdata/mcp
```

Install the Python MCP client into the venv (stop the server first):
```bash
pip install "mcp>=1.0.0"
```

---

## 5. Pre-demo checklist

- [ ] Run `002_demo_seed.sql` in Supabase
- [ ] Backend live at Render → hit `/health` to verify
- [ ] Frontend live at Vercel → confirm login works
- [ ] `CORS_ORIGINS` on Render includes your Vercel URL
- [ ] `NEXT_PUBLIC_API_URL` on Vercel points to your Render URL
- [ ] Wake up the Render instance 2 minutes before presenting (free tier cold start)
- [ ] Toggle Demo on in the sidebar → run a scan → confirm results appear instantly

---

## 6. CORS checklist

`CORS_ORIGINS` on Render must include (comma-separated, no spaces):
```
https://strikebase.vercel.app,http://localhost:3000
```

Update and redeploy backend any time you add a new frontend origin.

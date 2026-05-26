from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import scan, opps, analyze, status
from routers import auth, users, jobs, suggestions

app = FastAPI(title="Strikebase API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(scan.router)
app.include_router(opps.router)
app.include_router(analyze.router)
app.include_router(status.router)
app.include_router(jobs.router)
app.include_router(suggestions.router)


@app.get("/health")
async def health():
    import httpx

    # Check Supabase connectivity
    supabase_status = "ok"
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{settings.supabase_url}/auth/v1/health")
            supabase_status = "ok" if r.status_code < 500 else f"http_{r.status_code}"
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        supabase_status = f"unreachable — project may be paused ({type(e).__name__})"
    except Exception as e:
        supabase_status = f"error: {e}"

    # Check DB (Supabase PostgREST)
    db_status = "ok"
    try:
        import database as db
        db.get_db().table("scans").select("id").limit(1).execute()
    except Exception as e:
        db_status = f"error: {e}"

    return {
        "status": "ok",
        "service": "strikebase-api",
        "version": "2.0.0",
        "supabase": supabase_status,
        "database": db_status,
        "supabase_url": settings.supabase_url[:40] + "..." if settings.supabase_url else "NOT SET",
        "bright_data_token_set": bool(settings.bright_data_token),
        "anthropic_key_set": bool(settings.anthropic_api_key),
    }


@app.get("/test/serp")
async def test_serp(q: str = "React TypeScript"):
    """Debug endpoint — shows raw BD response AND parsed results."""
    import urllib.parse, json as _json
    from agents.serp import search_job_listings, _bd_request, _parse_serp_json, _parse_google_html

    raw_url = "https://www.google.com/search?" + urllib.parse.urlencode(
        {"q": f"site:upwork.com/jobs {q}", "num": 5}
    )

    serp_status, serp_body = await _bd_request({
        "zone": settings.bright_data_serp_zone,
        "url": raw_url,
        "format": "json",
    })

    # Detect body type
    body_type = "empty"
    if serp_body:
        try:
            parsed = _json.loads(serp_body)
            body_type = f"json_{type(parsed).__name__}"
        except Exception:
            body_type = "html" if "<html" in serp_body.lower() else "text"

    json_parsed = _parse_serp_json(serp_body)
    html_parsed = _parse_google_html(serp_body)

    results = []
    try:
        results = await search_job_listings([q], num_results=5)
    except Exception as e:
        results = [{"error": str(e)}]

    return {
        "config": {
            "token_set": bool(settings.bright_data_token),
            "serp_zone": settings.bright_data_serp_zone or "NOT SET",
            "unlocker_zone": settings.bright_data_unlocker_zone or "NOT SET",
        },
        "serp_zone_request": {
            "status": serp_status,
            "body_type": body_type,
            "body_length": len(serp_body),
            "body_preview": serp_body[:1500],
        },
        "parsing": {
            "json_parser_found": len(json_parsed),
            "html_parser_found": len(html_parsed),
        },
        "final_results_count": len(results),
        "final_results": results[:3],
    }

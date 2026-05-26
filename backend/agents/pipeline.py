"""
Main scraping pipeline — orchestrates all Bright Data tools + AI scoring.
Runs as a FastAPI BackgroundTask so it never blocks the HTTP response.
"""
import asyncio
import uuid
from datetime import datetime, timezone

import database as db
from agents.serp import search_job_listings
from agents.scraper import scrape_listing
from agents.unlocker import get_client_profile
from ai.scorer import score_listing
from models.schemas import ScanRequest

MAX_CONCURRENT_SCRAPES = 5
MAX_LISTINGS = 20


async def run_pipeline(scan_id: str, req: ScanRequest, user_id: str | None = None) -> None:
    """Full pipeline: SERP → Scrape → Client profiles → AI score → Save."""
    try:
        db.update_scan_status(scan_id, "processing", "Searching job boards...")
        try:
            serp_results = await search_job_listings(req.skills, num_results=MAX_LISTINGS)
        except RuntimeError as e:
            db.update_scan_status(scan_id, "error", f"Configuration error: {e}. Check Bright Data environment variables in Render.")
            return

        if not serp_results:
            db.update_scan_status(scan_id, "error", "Bright Data returned no results. Check your zone names and token in Render's environment variables.")
            return

        db.update_scan_status(scan_id, "processing", f"Found {len(serp_results)} listings, extracting details...")

        sem = asyncio.Semaphore(MAX_CONCURRENT_SCRAPES)
        listing_results = await asyncio.gather(
            *[scrape_listing(item, sem) for item in serp_results[:MAX_LISTINGS]],
            return_exceptions=True,
        )
        listings = [r for r in listing_results if isinstance(r, dict) and r]

        if not listings:
            db.update_scan_status(scan_id, "error", "Failed to extract listing details.")
            return

        db.update_scan_status(
            scan_id, "processing",
            f"Fetching client profiles for {len(set(l.get('client_id','') for l in listings if l.get('client_id')))} clients..."
        )

        client_ids = list({l["client_id"] for l in listings if l.get("client_id")})
        client_results = await asyncio.gather(
            *[get_client_profile(cid) for cid in client_ids],
            return_exceptions=True,
        )
        client_map = {
            c["client_id"]: c
            for c in client_results
            if isinstance(c, dict) and c and c.get("client_id")
        }

        market = _compute_market_rates(listings, req.skills)
        if market:
            db.upsert_market_rates(market)

        db.update_scan_status(scan_id, "processing", f"Scoring {len(listings)} opportunities with AI...")

        user = req.model_dump()
        for i, listing in enumerate(listings):
            client = client_map.get(listing.get("client_id", ""))
            score_data = score_listing(listing, client, market, user)

            db.save_opportunity({
                "id": str(uuid.uuid4()),
                "scan_id": scan_id,
                "title": listing.get("title", "Untitled"),
                "url": listing.get("url", ""),
                "platform": listing.get("platform", "upwork"),
                "budget_min": listing.get("budget_min"),
                "budget_max": listing.get("budget_max"),
                "bid_count": listing.get("bid_count"),
                "posted_at": listing.get("posted_at"),
                "client_id": listing.get("client_id", ""),
                "strike_score": score_data.get("strike_score", 50),
                "verdict": score_data.get("verdict", "risky"),
                "reasons": score_data.get("reasons", []),
                "red_flags": score_data.get("red_flags", []),
                "proposal_angle": score_data.get("proposal_angle", ""),
                "is_demo": False,
            })

            db.update_scan_status(
                scan_id, "processing",
                f"Scoring {i + 1} of {len(listings)} opportunities..."
            )

        db.update_scan_status(scan_id, "complete", "Done")

    except Exception as e:
        print(f"[Pipeline] Fatal error for scan {scan_id}: {e}")
        import traceback; traceback.print_exc()
        db.update_scan_status(scan_id, "error", "Pipeline error — please try again.")


def _compute_market_rates(listings: list[dict], skills: list[str]) -> dict | None:
    budgets = sorted([
        l["budget_max"] for l in listings
        if l.get("budget_max") and l["budget_max"] > 0
    ])
    if len(budgets) < 3:
        return None

    n = len(budgets)
    return {
        "id": str(uuid.uuid4()),
        "skill_tag": skills[0].lower() if skills else "general",
        "platform": "multi",
        "p25_rate": budgets[n // 4],
        "median_rate": budgets[n // 2],
        "p75_rate": budgets[3 * n // 4],
        "sample_count": n,
        "week_start": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }

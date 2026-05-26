"""
Bright Data scraper — tries Web Scraper dataset API first,
falls back to Web Unlocker + HTML extraction.
"""
import httpx
import asyncio
import re
from bs4 import BeautifulSoup
from config import settings

TRIGGER_URL  = "https://api.brightdata.com/datasets/v3/trigger"
PROGRESS_URL = "https://api.brightdata.com/datasets/v3/progress/{sid}"
SNAPSHOT_URL = "https://api.brightdata.com/datasets/v3/snapshot/{sid}"
UNLOCKER_URL = "https://api.brightdata.com/request"

UPWORK_DATASET   = "gd_lvz8ah0kl026ufku4y"
FREELANCER_DATASET = "gd_m794xo3l298ja2x99e"

BD_HEADERS = {"Authorization": f"Bearer {settings.bright_data_token}", "Content-Type": "application/json"}


async def scrape_listing(item: dict | str, semaphore: asyncio.Semaphore) -> dict | None:
    """item can be a URL string or a {url, title, snippet, platform} dict from SERP."""
    if isinstance(item, str):
        item = {"url": item, "title": "", "snippet": "", "platform": "upwork" if "upwork" in item else "freelancer"}

    url = item.get("url", "")
    if not url:
        return None

    async with semaphore:
        # First try dataset API (fast structured data)
        result = await _scrape_dataset(url)
        if result:
            return result

        # Fallback: Web Unlocker + HTML parse
        result = await _scrape_unlocker(url, item)
        if result:
            return result

        # Last resort: use SERP snippet data directly
        if item.get("title") or item.get("snippet"):
            return _from_serp_snippet(item)

        return None


async def _scrape_dataset(url: str) -> dict | None:
    """Try Bright Data Web Scraper dataset API."""
    dataset_id = UPWORK_DATASET if "upwork.com" in url else FREELANCER_DATASET
    try:
        async with httpx.AsyncClient(timeout=90) as client:
            tr = await client.post(TRIGGER_URL, headers=BD_HEADERS,
                params={"dataset_id": dataset_id, "format": "json"},
                json=[{"url": url}])
            if tr.status_code not in (200, 201):
                return None
            sid = tr.json().get("snapshot_id")
            if not sid:
                return None

            for _ in range(20):
                await asyncio.sleep(3)
                pr = await client.get(PROGRESS_URL.format(sid=sid), headers=BD_HEADERS)
                st = pr.json().get("status", "")
                if st == "ready":
                    break
                if st in ("failed", "error"):
                    return None
            else:
                return None

            dr = await client.get(SNAPSHOT_URL.format(sid=sid), headers=BD_HEADERS, params={"format": "json"})
            if dr.status_code != 200:
                return None
            rows = dr.json()
            if not rows:
                return None
            raw = rows[0] if isinstance(rows, list) else rows
            normalized = _normalize(raw, url)
            if normalized.get("title") and normalized["title"] != "Untitled":
                print(f"[Scraper] Dataset OK: {url[:60]}")
                return normalized
    except Exception as e:
        print(f"[Scraper] Dataset error for {url[:60]}: {e}")
    return None


async def _scrape_unlocker(url: str, item: dict) -> dict | None:
    """Use Web Unlocker to fetch the page, then parse HTML."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(UNLOCKER_URL, headers=BD_HEADERS, json={
                "zone": settings.bright_data_unlocker_zone,
                "url": url,
                "format": "raw",
            })
            if r.status_code != 200:
                return None
            html = r.text
            return _parse_html(html, url, item)
    except Exception as e:
        print(f"[Scraper] Unlocker error for {url[:60]}: {e}")
    return None


def _parse_html(html: str, url: str, fallback: dict) -> dict | None:
    """Parse job page HTML to extract listing details."""
    try:
        soup = BeautifulSoup(html, "lxml")

        # Try JSON-LD first (most reliable)
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                import json
                data = json.loads(script.string or "")
                if isinstance(data, list):
                    data = data[0]
                if data.get("@type") in ("JobPosting", "Offer"):
                    return _normalize_jsonld(data, url)
            except Exception:
                pass

        platform = fallback.get("platform", "upwork")

        # Platform-specific selectors
        if "upwork.com" in url:
            title_el = soup.select_one("h1, [data-test='job-title'], .air3-line-clamp-1")
            desc_el  = soup.select_one("[data-test='description'], .air3-rich-text, .description")
            budget_el = soup.select_one("[data-test='budget'], .BudgetAmount, [data-qa='budget']")
            bids_el  = soup.select_one("[data-test='proposals-count'], [data-qa='proposals-count']")
        elif "freelancer.com" in url:
            title_el = soup.select_one("h1, .PageProjectViewLogout-header-title")
            desc_el  = soup.select_one(".PageProjectViewLogout-description, .job-description")
            budget_el = soup.select_one(".PageProjectViewLogout-price, .budget-value")
            bids_el  = soup.select_one(".PageProjectViewLogout-bid-count")
        elif "guru.com" in url:
            title_el = soup.select_one("h1, .jobTitle")
            desc_el  = soup.select_one(".jobDesc, .description")
            budget_el = soup.select_one(".budgetAmt, .jobBudget")
            bids_el  = None
        elif "peopleperhour.com" in url:
            title_el = soup.select_one("h1, .hourlieTitle")
            desc_el  = soup.select_one(".hourlieDesc, .description")
            budget_el = soup.select_one(".price, .budget")
            bids_el  = None
        else:
            title_el = soup.select_one("h1")
            desc_el  = soup.select_one("main p, article p")
            budget_el = None
            bids_el  = None

        title = title_el.get_text(strip=True) if title_el else fallback.get("title", "")
        desc  = desc_el.get_text(strip=True)[:500] if desc_el else fallback.get("snippet", "")

        # Try to extract budget from text
        budget_text = budget_el.get_text(strip=True) if budget_el else ""
        budget_min, budget_max = _parse_budget(budget_text or html[:2000])
        bids = _parse_bids(bids_el.get_text(strip=True) if bids_el else "")

        if not title:
            title = fallback.get("title", "")

        result = {
            "title": title or "Untitled",
            "url": url,
            "platform": platform,
            "budget_min": budget_min,
            "budget_max": budget_max,
            "bid_count": bids,
            "posted_at": None,
            "client_id": _extract_client_id(url, html),
            "description": desc,
            "skills": "",
        }
        print(f"[Scraper] Unlocker parsed: {title[:50]}")
        return result
    except Exception as e:
        print(f"[Scraper] HTML parse error: {e}")
        return None


def _from_serp_snippet(item: dict) -> dict:
    """Build a minimal listing from SERP snippet when scraping fails."""
    url = item.get("url", "")
    return {
        "title": item.get("title", "Untitled"),
        "url": url,
        "platform": item.get("platform", "upwork"),
        "budget_min": None,
        "budget_max": None,
        "bid_count": None,
        "posted_at": None,
        "client_id": "",
        "description": item.get("snippet", ""),
        "skills": "",
    }


def _normalize_jsonld(data: dict, url: str) -> dict:
    base = data.get("baseSalary") or {}
    val  = base.get("value") or {}
    return {
        "title": data.get("title", "Untitled"),
        "url": url,
        "platform": "upwork" if "upwork" in url else "freelancer",
        "budget_min": _float(val.get("minValue")),
        "budget_max": _float(val.get("maxValue") or val.get("value")),
        "bid_count": None,
        "posted_at": data.get("datePosted"),
        "client_id": "",
        "description": (data.get("description") or "")[:500],
        "skills": ", ".join(data.get("skills", [])),
    }


def _normalize(raw: dict, url: str) -> dict:
    platform = "upwork" if "upwork.com" in url else "freelancer"
    return {
        "title": raw.get("title") or raw.get("job_title", "Untitled"),
        "url": url,
        "platform": platform,
        "budget_min": _float(raw.get("hourly_low") or raw.get("budget_min") or (raw.get("budget") or {}).get("min")),
        "budget_max": _float(raw.get("hourly_high") or raw.get("budget_max") or (raw.get("budget") or {}).get("max")),
        "bid_count": _int(raw.get("proposals") or raw.get("bid_count") or raw.get("proposal_count")),
        "posted_at": raw.get("published_date") or raw.get("posted_at") or raw.get("date_created"),
        "client_id": str(raw.get("client_id") or raw.get("uid") or (raw.get("client") or {}).get("id", "")),
        "description": (raw.get("description") or raw.get("job_description", ""))[:500],
        "skills": ", ".join(raw.get("skills") or raw.get("required_skills") or []),
    }


def _parse_budget(text: str) -> tuple[float | None, float | None]:
    nums = re.findall(r"\$?([\d,]+(?:\.\d+)?)", text)
    nums = [float(n.replace(",", "")) for n in nums if float(n.replace(",", "")) > 0]
    if len(nums) >= 2:
        return min(nums[:2]), max(nums[:2])
    if len(nums) == 1:
        v = nums[0]
        return v * 0.8, v
    return None, None


def _parse_bids(text: str) -> int | None:
    m = re.search(r"(\d+)", text)
    return int(m.group(1)) if m else None


def _extract_client_id(url: str, html: str) -> str:
    # Upwork client ID patterns
    m = re.search(r"/o/profiles/users/~([A-Za-z0-9]+)", url + html[:1000])
    if m:
        return m.group(1)
    m = re.search(r'"clientId":\s*"([^"]+)"', html[:2000])
    if m:
        return m.group(1)
    return ""


def _float(v) -> float | None:
    try:
        return float(v) if v is not None else None
    except Exception:
        return None


def _int(v) -> int | None:
    try:
        return int(v) if v is not None else None
    except Exception:
        return None

"""Bright Data SERP — searches Google via SERP zone, falls back to Web Unlocker HTML parse."""
import httpx
import asyncio
import urllib.parse
import re
from bs4 import BeautifulSoup
from config import settings

BD_API = "https://api.brightdata.com/request"


def _headers() -> dict:
    return {"Authorization": f"Bearer {settings.bright_data_token}", "Content-Type": "application/json"}

PLATFORMS = [
    ("upwork",        "site:upwork.com/jobs"),
    ("freelancer",    "site:freelancer.com/projects"),
    ("guru",          "site:guru.com/jobs"),
    ("peopleperhour", "site:peopleperhour.com/projects"),
    ("toptal",        "site:toptal.com/freelance-jobs"),
]


async def _bd_request(payload: dict, retries: int = 2) -> tuple[int, str]:
    """Raw BD request — returns (status_code, body_text). Never raises."""
    for attempt in range(retries):
        try:
            async with httpx.AsyncClient(timeout=35) as client:
                r = await client.post(BD_API, headers=_headers(), json=payload)
                return r.status_code, r.text
        except Exception as e:
            print(f"[SERP] Request error (attempt {attempt+1}): {e}")
        if attempt < retries - 1:
            await asyncio.sleep(2)
    return 0, ""


def _parse_serp_json(body: str) -> list[dict]:
    """Try to parse Bright Data SERP JSON response."""
    import json
    try:
        data = json.loads(body)
    except Exception:
        return []
    if not isinstance(data, dict):
        return []

    # Try every common key BD uses for organic results
    organic = (
        data.get("organic")
        or data.get("results")
        or data.get("items")
        or data.get("search_results")
        or []
    )
    # Scan top-level values for a list containing link/url dicts
    if not organic:
        for v in data.values():
            if isinstance(v, list) and v and isinstance(v[0], dict):
                if v[0].get("link") or v[0].get("url"):
                    organic = v
                    break
    return organic


def _parse_google_html(html: str) -> list[dict]:
    """Parse Google search result HTML — fallback when JSON isn't available."""
    results = []
    try:
        soup = BeautifulSoup(html, "lxml")
        for g in soup.select("div.g, div[data-sokoban-container], div[jscontroller]"):
            a = g.select_one("a[href]")
            h3 = g.select_one("h3")
            snippet_el = g.select_one("div[data-sncf], span.aCOpRe, div.VwiC3b, div[style='-webkit-line-clamp:2']")
            href = a.get("href", "") if a else ""
            # Filter out Google internal links
            if not href or href.startswith("/") or "google.com" in href:
                continue
            results.append({
                "url": href,
                "title": h3.get_text(strip=True) if h3 else "",
                "snippet": snippet_el.get_text(strip=True) if snippet_el else "",
            })
    except Exception as e:
        print(f"[SERP] HTML parse error: {e}")
    return results


def _classify_platform(url: str) -> str:
    for name, _ in PLATFORMS:
        if name in url:
            return name
    return "other"


async def _search_platform(platform_prefix: str, skills: list[str], num_results: int) -> list[dict]:
    query = f'{platform_prefix} {" ".join(skills)}'
    google_url = "https://www.google.com/search?" + urllib.parse.urlencode({"q": query, "num": num_results})

    # ── Try 1: SERP zone (structured JSON) ──────────────────────────────────
    if settings.bright_data_serp_zone:
        status, body = await _bd_request({
            "zone": settings.bright_data_serp_zone,
            "url": google_url,
            "format": "json",
        })
        print(f"[SERP] zone={settings.bright_data_serp_zone} status={status} body_len={len(body)}")
        if status == 200:
            organic = _parse_serp_json(body)
            if organic:
                print(f"[SERP] JSON returned {len(organic)} results for '{query[:50]}'")
                return _to_result_list(organic)
            # 200 but no JSON organic — might be HTML from a proxy zone
            print(f"[SERP] JSON had no organic, trying HTML parse. Body[:200]: {body[:200]}")
            html_results = _parse_google_html(body)
            if html_results:
                print(f"[SERP] HTML fallback returned {len(html_results)} results")
                return _html_to_result_list(html_results)
        else:
            print(f"[SERP] SERP zone returned {status}. Body: {body[:300]}")

    # ── Try 2: Web Unlocker zone (HTML fallback) ─────────────────────────────
    if settings.bright_data_unlocker_zone:
        print(f"[SERP] Trying Web Unlocker fallback for '{query[:50]}'")
        status, body = await _bd_request({
            "zone": settings.bright_data_unlocker_zone,
            "url": google_url,
            "format": "raw",
        })
        print(f"[SERP] Unlocker status={status} body_len={len(body)}")
        if status == 200:
            html_results = _parse_google_html(body)
            print(f"[SERP] Unlocker HTML returned {len(html_results)} results")
            return _html_to_result_list(html_results)
        else:
            print(f"[SERP] Unlocker returned {status}. Body: {body[:300]}")

    return []


def _clean_url(url: str) -> str:
    return url.strip().strip('"\'')


def _to_result_list(organic: list) -> list[dict]:
    out = []
    for r in organic:
        link = _clean_url(r.get("link") or r.get("url") or r.get("href", ""))
        if not link or not link.startswith("http"):
            continue
        out.append({
            "url": link,
            "title": r.get("title", ""),
            "snippet": r.get("description") or r.get("snippet") or r.get("summary", ""),
            "platform": _classify_platform(link),
        })
    return out


def _html_to_result_list(items: list) -> list[dict]:
    out = []
    for r in items:
        url = _clean_url(r.get("url", ""))
        if url and url.startswith("http"):
            out.append({**r, "url": url, "platform": _classify_platform(url)})
    return out


async def search_all_platforms(skills: list[str], num_results: int = 20) -> list[dict]:
    if not settings.bright_data_token:
        raise RuntimeError("BRIGHT_DATA_TOKEN is not set")
    if not settings.bright_data_serp_zone and not settings.bright_data_unlocker_zone:
        raise RuntimeError("No Bright Data zone configured (BRIGHT_DATA_SERP_ZONE or BRIGHT_DATA_UNLOCKER_ZONE)")

    per_platform = max(5, num_results // len(PLATFORMS))
    tasks = [_search_platform(prefix, skills, per_platform) for _, prefix in PLATFORMS]
    results_per_platform = await asyncio.gather(*tasks, return_exceptions=True)

    seen: set[str] = set()
    combined: list[dict] = []
    for res in results_per_platform:
        if isinstance(res, list):
            for item in res:
                url = item.get("url", "")
                if url and url not in seen:
                    seen.add(url)
                    combined.append(item)

    print(f"[SERP] Total: {len(combined)} URLs across all platforms")
    return combined[:num_results]


async def search_job_listings(skills: list[str], num_results: int = 20) -> list[dict]:
    return await search_all_platforms(skills, num_results)


# Legacy shims
async def search_upwork_listings(skills: list[str], num_results: int = 20) -> list[str]:
    r = await _search_platform("site:upwork.com/jobs", skills, num_results)
    return [x["url"] for x in r if "upwork.com/jobs/" in x["url"]]


async def search_freelancer_listings(skills: list[str], num_results: int = 20) -> list[str]:
    r = await _search_platform("site:freelancer.com/projects", skills, num_results)
    return [x["url"] for x in r if "freelancer.com/projects/" in x["url"]]

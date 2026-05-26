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

    # BD sometimes returns a top-level array
    if isinstance(data, list):
        return [r for r in data if isinstance(r, dict)]

    if not isinstance(data, dict):
        return []

    organic = (
        data.get("organic")
        or data.get("organic_results")
        or data.get("results")
        or data.get("items")
        or data.get("search_results")
        or data.get("web", {}).get("results")
        or []
    )
    # Last resort: scan top-level values for a list of link/url dicts
    if not organic:
        for v in data.values():
            if isinstance(v, list) and v and isinstance(v[0], dict):
                if v[0].get("link") or v[0].get("url") or v[0].get("href"):
                    organic = v
                    break
    return organic


def _parse_google_html(html: str) -> list[dict]:
    """Parse Google search result HTML — fallback when JSON isn't available."""
    results = []
    try:
        soup = BeautifulSoup(html, "lxml")

        # Collect all <a> tags with real external hrefs — most reliable cross-layout approach
        seen: set[str] = set()
        for a in soup.find_all("a", href=True):
            href = a["href"]
            # Skip Google-internal, fragment, and javascript links
            if not href.startswith("http") or "google.com" in href or "google." in href:
                continue
            if href in seen:
                continue
            seen.add(href)
            # Title: nearest h3, else the link text itself
            h3 = a.find("h3")
            title = h3.get_text(strip=True) if h3 else a.get_text(strip=True)[:120]
            if not title:
                continue
            results.append({"url": href, "title": title, "snippet": ""})

        # Deduplicate keeping first occurrence
        seen2: set[str] = set()
        deduped = []
        for r in results:
            if r["url"] not in seen2:
                seen2.add(r["url"])
                deduped.append(r)
        results = deduped

    except Exception as e:
        print(f"[SERP] HTML parse error: {e}")
    return results


def _unwrap_bd(body: str) -> str:
    """Bright Data sometimes wraps the response: {"status_code":200,"headers":{...},"body":"<html>..."}.
    Extract the actual content so parsers get real HTML or JSON."""
    import json as _json
    try:
        data = _json.loads(body)
        if isinstance(data, dict) and isinstance(data.get("body"), str):
            return data["body"]
    except Exception:
        pass
    return body


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
            content = _unwrap_bd(body)
            organic = _parse_serp_json(content)
            if organic:
                print(f"[SERP] JSON returned {len(organic)} results for '{query[:50]}'")
                return _to_result_list(organic)
            html_results = _parse_google_html(content)
            if html_results:
                print(f"[SERP] HTML parse returned {len(html_results)} results for '{query[:50]}'")
                return _html_to_result_list(html_results)
            print(f"[SERP] SERP zone 200 but no results. Content type preview: {content[:120]}")
        else:
            print(f"[SERP] SERP zone returned {status}. Body: {body[:200]}")

    # ── Try 2: Web Unlocker zone (HTML fallback) ─────────────────────────────
    if settings.bright_data_unlocker_zone:
        status, body = await _bd_request({
            "zone": settings.bright_data_unlocker_zone,
            "url": google_url,
            "format": "raw",
        })
        if status == 200:
            content = _unwrap_bd(body)
            html_results = _parse_google_html(content)
            print(f"[SERP] Unlocker returned {len(html_results)} results for '{query[:50]}'")
            return _html_to_result_list(html_results)
        else:
            print(f"[SERP] Unlocker returned {status}. Body: {body[:200]}")

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

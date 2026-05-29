"""
Portfolio enrichment — Tool 4 extension.
GitHub: public REST API (no key needed).
Other portfolio URLs (Behance, Dribbble, personal sites): Bright Data Web Unlocker.
"""
import asyncio
import re
import httpx
from bs4 import BeautifulSoup
from config import settings

BD_API = "https://api.brightdata.com/request"
GH_API = "https://api.github.com"


def _extract_github_username(url: str) -> str | None:
    match = re.match(r"https?://(?:www\.)?github\.com/([A-Za-z0-9_-]+)/?.*$", url.strip())
    return match.group(1) if match else None


async def fetch_github_summary(github_url: str) -> str | None:
    username = _extract_github_username(github_url)
    if not username:
        return None
    try:
        async with httpx.AsyncClient(
            timeout=10,
            headers={"User-Agent": "Strikebase/1.0", "Accept": "application/vnd.github+json"},
        ) as client:
            profile_r, repos_r = await asyncio.gather(
                client.get(f"{GH_API}/users/{username}"),
                client.get(f"{GH_API}/users/{username}/repos?sort=pushed&per_page=8"),
            )
            if profile_r.status_code != 200:
                return None

            profile = profile_r.json()
            repos = repos_r.json() if repos_r.status_code == 200 else []

            langs: dict[str, int] = {}
            notable: list[str] = []
            for repo in repos:
                if repo.get("fork"):
                    continue
                lang = repo.get("language")
                if lang:
                    langs[lang] = langs.get(lang, 0) + 1
                stars = repo.get("stargazers_count", 0)
                if stars > 0:
                    notable.append(f"{repo['name']} ({stars}★)")

            top_langs = sorted(langs, key=lambda l: -langs[l])[:4]

            parts = [f"GitHub @{username} — {profile.get('public_repos', 0)} public repos"]
            if top_langs:
                parts.append(f"Primary languages: {', '.join(top_langs)}")
            if notable:
                parts.append(f"Starred repos: {', '.join(notable[:3])}")
            if profile.get("bio"):
                parts.append(f"Bio: {profile['bio'][:120]}")

            return " | ".join(parts)

    except Exception as e:
        print(f"[Portfolio] GitHub fetch error: {e}")
        return None


async def fetch_portfolio_summary(portfolio_url: str) -> str | None:
    """Scrape a portfolio page (Behance, Dribbble, personal site) via Bright Data Web Unlocker."""
    if not portfolio_url or not getattr(settings, "bright_data_token", None):
        return None
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                BD_API,
                headers={
                    "Authorization": f"Bearer {settings.bright_data_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "zone": settings.bright_data_unlocker_zone,
                    "url": portfolio_url.strip(),
                    "format": "raw",
                },
            )
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "lxml")
        for tag in soup(["script", "style", "nav", "footer", "head", "header"]):
            tag.decompose()

        text = " ".join(soup.get_text(" ", strip=True).split())[:500]
        domain = re.sub(r"https?://(www\.)?", "", portfolio_url).split("/")[0]
        return f"Portfolio ({domain}): {text}" if text else None

    except Exception as e:
        print(f"[Portfolio] Scrape error for {portfolio_url}: {e}")
        return None


async def get_portfolio_context(github_url: str | None, portfolio_url: str | None) -> str:
    """Returns a combined portfolio context string for the AI scoring prompt."""
    tasks = []
    if github_url:
        tasks.append(fetch_github_summary(github_url))
    if portfolio_url:
        tasks.append(fetch_portfolio_summary(portfolio_url))

    if not tasks:
        return ""

    results = await asyncio.gather(*tasks, return_exceptions=True)
    parts = [r for r in results if isinstance(r, str) and r]
    return "\n".join(parts)

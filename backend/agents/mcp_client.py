"""
Bright Data MCP client — connects to the @brightdata/mcp npm server via stdio.

The MCP server wraps Bright Data's tools (scrape_as_markdown, search_engine, etc.)
in the Model Context Protocol so Claude can call them as native tools.

Usage:
    content = await fetch_url_via_mcp("https://www.upwork.com/jobs/~01abc...")
    # Returns markdown of the page, or None on failure.

Requirements:
    - Node.js + npx available on PATH
    - BRIGHTDATA_API_TOKEN env var (mapped from our BRIGHT_DATA_TOKEN setting)
    - pip install mcp>=1.0.0
"""
import os
import asyncio
from config import settings


async def fetch_url_via_mcp(url: str, max_chars: int = 4000) -> str | None:
    """Scrape a URL via Bright Data MCP server and return markdown content."""
    try:
        from mcp import ClientSession, StdioServerParameters
        from mcp.client.stdio import stdio_client

        env = {
            **os.environ,
            "API_TOKEN": settings.bright_data_token or "",
        }

        params = StdioServerParameters(
            command="npx",
            args=["-y", "@brightdata/mcp"],
            env=env,
        )

        async with stdio_client(params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                result = await session.call_tool("scrape_as_markdown", {"url": url})
                if result.content and len(result.content) > 0:
                    text = result.content[0].text or ""
                    return text[:max_chars]
        return None

    except ImportError:
        print("[MCP] mcp package not installed — run: pip install mcp>=1.0.0")
        return None
    except FileNotFoundError:
        print("[MCP] npx not found — Node.js must be installed to use MCP")
        return None
    except Exception as e:
        print(f"[MCP] Error fetching {url}: {type(e).__name__}: {e}")
        return None


async def search_via_mcp(query: str, num_results: int = 10) -> list[dict] | None:
    """Search via Bright Data MCP server and return structured results."""
    try:
        from mcp import ClientSession, StdioServerParameters
        from mcp.client.stdio import stdio_client
        import json

        env = {**os.environ, "API_TOKEN": settings.bright_data_token or ""}
        params = StdioServerParameters(
            command="npx", args=["-y", "@brightdata/mcp"], env=env
        )

        async with stdio_client(params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                result = await session.call_tool("search_engine", {
                    "query": query,
                    "engine": "google",
                    "num_results": num_results,
                })
                if result.content and len(result.content) > 0:
                    text = result.content[0].text or ""
                    try:
                        return json.loads(text)
                    except json.JSONDecodeError:
                        return [{"snippet": text}]
        return None

    except Exception as e:
        print(f"[MCP] Search error: {type(e).__name__}: {e}")
        return None

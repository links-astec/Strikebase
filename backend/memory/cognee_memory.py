"""
Cognee-based agent memory for Strikebase.
Stores scan history and client reputation so agents learn from past scans.
Uses AI/ML API as the LLM + embedding backend for Cognee.
Gracefully degrades if cognee or aiml_api_key is unavailable.
"""
import asyncio
import logging
import os
from config import settings

log = logging.getLogger(__name__)
_ready: bool | None = None  # None = not yet checked


def _setup() -> bool:
    """Configure Cognee once, using AI/ML API as the LLM backend."""
    if not settings.aiml_api_key:
        return False
    try:
        import cognee  # noqa: F401 — just confirm it's importable

        # Cognee reads LLM config from env vars (most stable across versions)
        os.environ.setdefault("LLM_API_KEY", settings.aiml_api_key)
        os.environ.setdefault("LLM_API_BASE", "https://api.aimlapi.com/v1")
        os.environ.setdefault("LLM_MODEL", "gpt-4o-mini")
        os.environ.setdefault("OPENAI_API_KEY", settings.aiml_api_key)
        os.environ.setdefault("OPENAI_API_BASE", "https://api.aimlapi.com/v1")
        os.environ.setdefault("EMBEDDING_MODEL", "text-embedding-3-small")

        log.info("Cognee memory initialized (AI/ML API backend)")
        return True
    except ImportError:
        log.warning("cognee not installed — memory features disabled")
        return False
    except Exception as e:
        log.warning(f"Cognee setup failed: {e}")
        return False


def _is_ready() -> bool:
    global _ready
    if _ready is None:
        _ready = _setup()
    return _ready


async def store_scan_results(scan_id: str, user_id: str, opportunities: list[dict]) -> None:
    """
    After a scan completes, persist scored opportunities to Cognee's knowledge graph.
    Cognify runs as a detached background task — it never blocks the scan response.
    """
    if not _is_ready():
        return

    try:
        import cognee

        lines = [f"Strikebase scan {scan_id} for user {user_id}:"]
        for opp in opportunities[:10]:
            lines.append(
                f"  Platform={opp.get('platform', '?')} "
                f"Score={opp.get('strike_score', 0)} "
                f"Verdict={opp.get('verdict', '?')} "
                f"Bids={opp.get('bid_count', '?')} "
                f"Budget=${opp.get('budget_max', '?')}/hr "
                f"Client={opp.get('client_id', 'unknown')} "
                f'Title="{opp.get("title", "")[:60]}"'
            )

        text = "\n".join(lines)
        dataset = f"user_{user_id[:8]}_scans"

        await cognee.add(text, dataset_name=dataset)

        # cognify is expensive — run detached so scan response is not delayed
        asyncio.create_task(_run_cognify_safe(dataset))

    except Exception as e:
        log.warning(f"Cognee store_scan_results failed (non-critical): {e}")


async def _run_cognify_safe(dataset: str) -> None:
    try:
        import cognee
        await cognee.cognify(dataset_ids=[dataset])
        log.info(f"Cognee cognify complete for dataset {dataset}")
    except Exception as e:
        log.warning(f"Cognee cognify failed (non-critical): {e}")


async def get_client_memory(client_id: str) -> str | None:
    """
    Query prior knowledge about a client from previous scans.
    Returns a short enrichment string injected into the scoring prompt.
    """
    if not _is_ready() or not client_id:
        return None

    try:
        import cognee

        results = await cognee.search(
            f"client {client_id} reputation hire rate disputes performance",
            query_type="GRAPH_COMPLETION",
        )
        if results:
            snippet = str(results[0])[:300]
            return f"[Memory] Prior data on client {client_id}: {snippet}"
    except Exception as e:
        log.debug(f"Cognee client query failed (non-critical): {e}")
    return None


async def get_user_scan_insights(user_id: str) -> str | None:
    """
    Return patterns from a user's past scans (e.g. which platforms/scores worked).
    Used to personalise future scoring context.
    """
    if not _is_ready() or not user_id:
        return None

    try:
        import cognee

        results = await cognee.search(
            f"user {user_id[:8]} high score opportunities platforms verdicts patterns",
            query_type="GRAPH_COMPLETION",
        )
        if results:
            snippet = str(results[0])[:300]
            return f"[Memory] Past scan patterns for this user: {snippet}"
    except Exception as e:
        log.debug(f"Cognee user query failed (non-critical): {e}")
    return None

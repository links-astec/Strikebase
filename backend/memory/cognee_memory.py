"""
Cognee-based agent memory for Strikebase.
Builds a knowledge graph from every completed scan.
On future scans, enriches scoring with:
  - client reputation data from prior scans
  - user-specific patterns (platforms, score ranges, winning conditions)
Uses AI/ML API as the LLM + embedding backend for Cognee.
Gracefully degrades if cognee or aiml_api_key is unavailable.
"""
import asyncio
import logging
import os
from config import settings

log = logging.getLogger(__name__)
_ready: bool | None = None


def _setup() -> bool:
    if not settings.aiml_api_key:
        return False
    try:
        import cognee

        # Disable multi-user access control — we handle isolation ourselves
        os.environ.setdefault("ENABLE_BACKEND_ACCESS_CONTROL", "false")

        # Point Cognee at AI/ML API via LiteLLM env vars
        os.environ["OPENAI_API_KEY"]  = settings.aiml_api_key
        os.environ["OPENAI_API_BASE"] = "https://api.aimlapi.com/v1"

        # Configure via cognee.config for 0.5.x
        cognee.config.llm_api_key    = settings.aiml_api_key
        cognee.config.llm_api_base   = "https://api.aimlapi.com/v1"
        cognee.config.llm_model      = "openai/gpt-4o-mini"

        log.info("Cognee memory initialised (AI/ML API backend, v0.5.x)")
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
    After a scan completes, persist scored opportunities into Cognee's knowledge graph.
    Runs as a detached background task — never blocks the scan response.
    On future scans, this data is retrieved and injected into the scoring prompt.
    """
    if not _is_ready():
        return
    try:
        import cognee

        lines = [f"Strikebase scan {scan_id} for user {user_id[:8]}:"]
        for opp in opportunities[:10]:
            lines.append(
                f"  Platform={opp.get('platform','?')} "
                f"Score={opp.get('strike_score',0)} "
                f"Verdict={opp.get('verdict','?')} "
                f"Bids={opp.get('bid_count','?')} "
                f"Budget=${opp.get('budget_max','?')}/hr "
                f"Client={opp.get('client_id','unknown')} "
                f"Title=\"{opp.get('title','')[:60]}\""
            )

        text    = "\n".join(lines)
        dataset = f"user_{user_id[:8]}_scans"

        await cognee.add(text, dataset_name=dataset)
        asyncio.create_task(_run_cognify_safe(dataset))

    except Exception as e:
        log.warning(f"Cognee store_scan_results failed (non-critical): {e}")


async def _run_cognify_safe(dataset: str) -> None:
    try:
        import cognee
        await cognee.cognify(datasets=[dataset])
        log.info(f"Cognee cognify complete for dataset {dataset}")
    except Exception as e:
        log.warning(f"Cognee cognify failed (non-critical): {e}")


async def get_client_memory(client_id: str) -> str | None:
    """
    Query the knowledge graph for prior intelligence on a client.
    Returns a short enrichment string injected into the Claude scoring prompt.
    """
    if not _is_ready() or not client_id:
        return None
    try:
        import cognee
        from cognee import SearchType

        results = await cognee.search(
            f"client {client_id} hire rate disputes total spent reputation",
            query_type=SearchType.GRAPH_COMPLETION,
        )
        if results:
            snippet = str(results[0])[:280]
            return f"[Memory] Prior intelligence on client {client_id}: {snippet}"
    except Exception as e:
        log.debug(f"Cognee client query failed (non-critical): {e}")
    return None


async def get_user_scan_insights(user_id: str) -> str | None:
    """
    Query the knowledge graph for patterns from the user's past scans.
    Returns a string injected into the scoring prompt to personalise verdicts.
    Examples: which platforms historically score higher, which bid counts win.
    """
    if not _is_ready() or not user_id:
        return None
    try:
        import cognee
        from cognee import SearchType

        results = await cognee.search(
            f"user {user_id[:8]} high score verdicts platforms patterns winning bids",
            query_type=SearchType.GRAPH_COMPLETION,
        )
        if results:
            snippet = str(results[0])[:280]
            return f"[Memory] Patterns from this user's past scans: {snippet}"
    except Exception as e:
        log.debug(f"Cognee user query failed (non-critical): {e}")
    return None

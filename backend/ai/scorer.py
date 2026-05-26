import json
import anthropic
from config import settings
from ai.prompts import SYSTEM_PROMPT, USER_PROMPT, build_prompt_context

FALLBACK_SCORE = {
    "strike_score": 50,
    "reasons": ["Analysis temporarily unavailable — data insufficient"],
    "red_flags": [],
    "proposal_angle": "Lead with your most relevant experience for this project.",
    "verdict": "risky",
}


def score_listing(listing: dict, client: dict | None, market: dict | None, user: dict) -> dict:
    try:
        ctx = build_prompt_context(listing, client, market, user)
        prompt = USER_PROMPT.format(**ctx)

        ai = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        msg = ai.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=600,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )

        text = msg.content[0].text.strip()
        # Strip accidental markdown fences
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        result = json.loads(text)

        # Clamp score to 0-100
        result["strike_score"] = max(0, min(100, int(result.get("strike_score", 50))))
        return result

    except (json.JSONDecodeError, IndexError, KeyError):
        return FALLBACK_SCORE
    except Exception:
        return FALLBACK_SCORE

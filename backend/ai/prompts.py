SYSTEM_PROMPT = """You are Strikebase, a freelance bid intelligence agent.
You analyze job listings using live scraped data and return a precise win-probability
score with specific, data-backed reasoning.
Respond in valid JSON only. No prose, no markdown fences, no explanation outside JSON."""

USER_PROMPT = """Analyze this opportunity for a {experience} {skills} freelancer at ${rate}/hr.

LISTING:
- Title: {title}
- Budget: ${budget_min}–${budget_max}/hr
- Posted: {hours_ago} hours ago
- Current bids: {bid_count}
- Required skills: {required_skills}
- Description snippet: {description}

CLIENT PROFILE:
- Total spent: ${client_total_spent}
- Hire rate: {hire_rate}% (jobs hired / jobs posted)
- Reviews received: {client_reviews}
- Payment disputes: {disputes}
- Avg project duration: {avg_duration} days

MARKET DATA (this week, {skills}):
- P25 winning rate: ${p25}/hr
- Median winning rate: ${median}/hr
- P75 winning rate: ${p75}/hr

Return ONLY this JSON:
{{
  "strike_score": <integer 0-100>,
  "reasons": [
    "<specific reason with a number>",
    "<specific reason with a number>",
    "<specific reason with a number>"
  ],
  "red_flags": ["<flag if any, empty list if none>"],
  "proposal_angle": "<One concrete sentence: how to open the proposal>",
  "verdict": "go" | "skip" | "risky"
}}

Every reason MUST reference a real number from the data above (e.g. "Only 4 bids so far",
"Client has $62k spent", "Your rate sits at P60 for this skill"). Vague reasons score poorly."""


def build_prompt_context(listing: dict, client: dict | None, market: dict | None, user: dict) -> dict:
    skills_str = ", ".join(user.get("skills", []))
    client = client or {}
    market = market or {}

    hours_ago = "unknown"
    if listing.get("posted_at"):
        try:
            from datetime import datetime, timezone
            posted = datetime.fromisoformat(listing["posted_at"].replace("Z", "+00:00"))
            delta = datetime.now(timezone.utc) - posted
            hours_ago = str(int(delta.total_seconds() / 3600))
        except Exception:
            pass

    return {
        "experience": user.get("experience", "mid"),
        "skills": skills_str,
        "rate": user.get("hourly_rate", 0),
        "title": listing.get("title", "Untitled"),
        "budget_min": listing.get("budget_min", 0),
        "budget_max": listing.get("budget_max", 0),
        "hours_ago": hours_ago,
        "bid_count": listing.get("bid_count", "unknown"),
        "required_skills": listing.get("skills", skills_str),
        "description": (listing.get("description", "") or "")[:300],
        "client_total_spent": client.get("total_spent", "unknown"),
        "hire_rate": client.get("hire_rate", "unknown"),
        "client_reviews": client.get("review_count", "unknown"),
        "disputes": client.get("dispute_count", 0),
        "avg_duration": client.get("avg_duration_days", "unknown"),
        "p25": market.get("p25_rate", user.get("hourly_rate", 0)),
        "median": market.get("median_rate", user.get("hourly_rate", 0)),
        "p75": market.get("p75_rate", user.get("hourly_rate", 0)),
    }

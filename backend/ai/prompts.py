SYSTEM_PROMPT = """You are Strikebase, a freelance bid intelligence agent.
You analyze job listings using live scraped data and return a precise win-probability
score with specific, data-backed reasoning.
Respond in valid JSON only. No prose, no markdown fences, no explanation outside JSON."""

USER_PROMPT = """Analyze this opportunity for a {experience} {skills} freelancer at ${rate}/hr.

LISTING:
- Title: {title}
- Budget: {budget}
- Posted: {posted}
- Current bids: {bid_count}
- Required skills: {required_skills}
- Description: {description}

CLIENT PROFILE:
{client_block}

MARKET DATA (this week, {skills}):
- P25 winning rate: ${p25}/hr
- Median winning rate: ${median}/hr
- P75 winning rate: ${p75}/hr

Rules:
- Only cite numbers that are explicitly provided above — never invent or estimate missing values.
- If a field is "unknown" or "not disclosed", treat it as a red flag or neutral — do not assume a value.
- If the listing is missing budget, bids, AND description, score it 15–25 and verdict "skip".

Return ONLY this JSON:
{{
  "strike_score": <integer 0-100>,
  "reasons": [
    "<specific reason with a real number from the data>",
    "<specific reason with a real number from the data>",
    "<specific reason with a real number from the data>"
  ],
  "red_flags": ["<flag if any, empty list if none>"],
  "proposal_angle": "<One sentence the freelancer can paste as their literal proposal opening line to the client. Must be specific to this listing. Do NOT give meta-advice — write the actual sentence.>",
  "verdict": "go" | "skip" | "risky"
}}"""


def build_prompt_context(listing: dict, client: dict | None, market: dict | None, user: dict) -> dict:
    from datetime import datetime, timezone

    skills_str = ", ".join(user.get("skills", []))
    client = client or {}
    market = market or {}

    # Budget
    bmin = listing.get("budget_min")
    bmax = listing.get("budget_max")
    if bmin is not None and bmax is not None:
        budget = f"${bmin}–${bmax}/hr"
    elif bmax is not None:
        budget = f"${bmax}/hr"
    else:
        budget = "not disclosed"

    # Posted age
    posted = "unknown"
    if listing.get("posted_at"):
        try:
            dt = datetime.fromisoformat(listing["posted_at"].replace("Z", "+00:00"))
            hours = int((datetime.now(timezone.utc) - dt).total_seconds() / 3600)
            if hours < 24:
                posted = f"{hours} hours ago"
            else:
                posted = f"{hours // 24} days ago"
        except Exception:
            pass

    # Client block — only include fields we actually have
    client_lines = []
    if client.get("total_spent") is not None:
        client_lines.append(f"- Total spent: ${client['total_spent']:,.0f}")
    if client.get("hire_rate") is not None:
        client_lines.append(f"- Hire rate: {client['hire_rate']}%")
    if client.get("review_count") is not None:
        client_lines.append(f"- Reviews: {client['review_count']}")
    if client.get("dispute_count") is not None:
        client_lines.append(f"- Payment disputes: {client['dispute_count']}")
    if client.get("avg_duration_days") is not None:
        client_lines.append(f"- Avg project duration: {client['avg_duration_days']} days")
    client_block = "\n".join(client_lines) if client_lines else "- No client data available"

    hourly = user.get("hourly_rate", 0)
    return {
        "experience": user.get("experience", "mid"),
        "skills": skills_str,
        "rate": hourly,
        "title": listing.get("title", "Untitled"),
        "budget": budget,
        "posted": posted,
        "bid_count": listing.get("bid_count") if listing.get("bid_count") is not None else "unknown",
        "required_skills": listing.get("skills") or skills_str,
        "description": (listing.get("description") or "not available")[:400],
        "client_block": client_block,
        "p25": market.get("p25_rate", hourly),
        "median": market.get("median_rate", hourly),
        "p75": market.get("p75_rate", hourly),
    }

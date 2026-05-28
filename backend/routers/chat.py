"""
Opportunity chat endpoint — streams AI responses via Server-Sent Events.
Powered by AI/ML API (OpenAI-compatible). Scoped to a specific opportunity
so the AI has full context to give actionable, data-grounded answers.
"""
import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import OpenAI
from config import settings
from middleware.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])
log = logging.getLogger(__name__)

CHAT_SYSTEM = """\
You are Strikebase, a freelance bid intelligence assistant with deep expertise in \
freelance markets, bid strategy, proposal writing, and client evaluation.

You have already scored and analyzed a specific job opportunity (context below). \
Answer the user's questions about it with direct, actionable advice.

Rules:
- Be concise and direct. No filler phrases like "Great question!" or "Certainly!".
- Lead with the answer, not caveats.
- Use the specific numbers from the opportunity context (score, bid count, budget, etc.).
- When asked to write a proposal, make it personalized to the job details shown.
- Flag risks clearly but don't catastrophize.
- Keep responses under 250 words unless writing a full proposal."""


def _build_context_block(opp: dict) -> str:
    parts = ["## Opportunity Context"]
    parts.append(f"Title: {opp.get('title', 'Unknown')}")
    parts.append(f"Platform: {opp.get('platform', 'unknown').capitalize()}")
    parts.append(f"Strike Score: {opp.get('strike_score', 'N/A')}/100")
    parts.append(f"Verdict: {opp.get('verdict', 'N/A').upper()}")

    if opp.get("budget_min") and opp.get("budget_max"):
        parts.append(f"Budget: ${opp['budget_min']}–${opp['budget_max']}/hr")
    elif opp.get("budget_max"):
        parts.append(f"Budget: up to ${opp['budget_max']}/hr")

    if opp.get("bid_count") is not None:
        parts.append(f"Competing bids so far: {opp['bid_count']}")

    if opp.get("reasons"):
        parts.append("Why to bid: " + "; ".join(opp["reasons"]))

    if opp.get("red_flags"):
        parts.append("Red flags: " + "; ".join(opp["red_flags"]))

    if opp.get("proposal_angle"):
        parts.append(f"Suggested opening line: {opp['proposal_angle']}")

    return "\n".join(parts)


class ChatMsg(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMsg]
    opportunity_context: dict


@router.post("/opportunity")
async def chat_opportunity(req: ChatRequest, _user=Depends(get_current_user)):
    if not settings.aiml_api_key:
        raise HTTPException(503, "Chat unavailable — AI/ML API key not configured")

    if not req.messages:
        raise HTTPException(400, "No messages provided")

    client = OpenAI(
        api_key=settings.aiml_api_key,
        base_url="https://api.aimlapi.com/v1",
        timeout=30.0,
    )

    system_prompt = CHAT_SYSTEM + "\n\n" + _build_context_block(req.opportunity_context)
    messages = [{"role": "system", "content": system_prompt}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages[-10:]]

    def _generate():
        try:
            stream = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=600,
                temperature=0.7,
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content or ""
                if delta:
                    yield f"data: {json.dumps({'text': delta})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            log.error(f"Chat stream error: {e}")
            yield f"data: {json.dumps({'error': 'Chat failed — please try again'})}\n\n"

    return StreamingResponse(
        _generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )

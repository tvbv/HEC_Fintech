"""
Chat / concierge service.

Answers user questions using:
1. The user's profile as personalised context (fetched from DB by profile_id)
2. Tavily web search for recent, sourced information (optional — graceful
   degradation when TAVILY_API_KEY is not set)
3. Cerebras llama3.1-8b to generate the final response

The assistant is country-agnostic: it helps anyone moving from any origin
country to any destination country navigate banking, administration, taxes,
housing, healthcare, and daily life.

The service maintains stateless request/response cycles; conversation history
is passed in by the caller on each request.
"""

from __future__ import annotations

import logging
import os

from cerebras.cloud.sdk import Cerebras
from models import ChatMessage
from services.profile_service import profile_service

logger = logging.getLogger(__name__)

_MAX_HISTORY = 10  # keep last N turns to avoid exceeding context window

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_PERSONA = """\
I'm Cleo. I help people figure out the financial and admin side of moving to a new country — \
banking, visas, paperwork, taxes, housing, the whole thing.

I talk like a friend who's actually done this before, not a call-centre agent.
- Short sentences. I get to the point fast.
- I'm opinionated: "Go with X" beats "you might consider X or possibly Y or perhaps Z".
- I never start with "Bonjour !", "Certainly!", "Of course!", "Great question!", or "I hope this helps!".
- I don't pad answers. Two sentences beats two paragraphs.
- I reply in whatever language you write to me in — French, English, Arabic, Spanish, anything.
- I don't make up URLs, bank names, fees, or procedures. If I'm not sure, I say so in one sentence.
- I cover banking, account opening, wire transfers, visas, residence permits, admin procedures,
  taxes, insurance, and housing — for any origin/destination pair worldwide.\
"""


def _build_system_prompt(profile: dict | None, web_context: str) -> str:
    """
    Build the Cerebras system prompt combining Cleo's persona,
    the user's profile context, and optional Tavily web results.
    """
    sections: list[str] = [_PERSONA]

    if profile:
        origin = profile.get("country_of_residence") or "unknown"
        destination = profile.get("country_moving_to") or "unknown"
        already = profile.get("already_has") or []
        goals = profile.get("goals") or []

        time_map = {
            "just_arrived": "less than 3 months",
            "settling_in": "3–12 months",
            "established": "more than a year",
        }
        time_label = time_map.get(profile.get("time_in_france", ""), "unknown duration")

        income_info = (
            f"yes ({profile.get('income_bracket', 'unspecified')})"
            if profile.get("has_income")
            else "no"
        )

        sections.append(
            f"""
=== USER PROFILE ===
Name            : {profile.get("first_name", "unknown")}
Nationality     : {profile.get("nationality", "unknown")}
Origin country  : {origin}
Destination     : {destination}
Employment      : {profile.get("employment_status", "unknown")}
Has income      : {income_info}
Time at destination: {time_label}
Financial ties abroad: {"yes" if profile.get("has_financial_ties_abroad") else "no"}
Already has     : {", ".join(already) if already else "nothing specified"}
Goals           : {", ".join(goals) if goals else "not specified"}
====================

Tailor every response to this person's specific origin–destination situation ({origin} → {destination}).\
"""
        )

    if web_context:
        sections.append(
            f"""
=== WEB SEARCH RESULTS — read these BEFORE answering ===
{web_context}
=========================================================

MANDATORY: Use these results as your primary source.
Pull out the most useful concrete fact or step and lead with it.
Cite the URL inline (just the domain is fine). 
If the results don't answer the question, say "I couldn't find a clear answer online" — \
don't fill in from memory.\
"""
        )
    else:
        sections.append(
            """
No live web results available for this query.
Answer from general knowledge but flag anything time-sensitive with \
"double-check this as rules change".\
"""
        )

    return "\n".join(sections)


# ---------------------------------------------------------------------------
# Tavily helper
# ---------------------------------------------------------------------------


def _build_tavily_query(message: str, profile: dict | None) -> str:
    """
    Enrich the user message with destination/origin context so Tavily returns
    highly specific, actionable results rather than generic country pages.

    Strategy:
    - Append destination country (most important for admin/banking procedures)
    - Append origin nationality when relevant
    - Append employment status for banking eligibility questions
    - Prefix with "how to" / "démarches" to favour step-by-step results

    Example:
        "comment recuperer son visa" + profile(destination=France, origin=Maroc)
        → "how to retrieve visa France expat from Morocco step by step 2025"
    """
    destination = (profile or {}).get("country_moving_to", "")
    origin = (profile or {}).get("country_of_residence", "")
    status = (profile or {}).get("employment_status", "")

    parts: list[str] = [message]
    if destination:
        parts.append(destination)
    if origin:
        parts.append(f"from {origin}")
    if status:
        parts.append(status)
    parts.append("2025 practical guide expat")

    return " ".join(parts)


def _tavily_search(query: str, profile: dict | None) -> str:
    """
    Search the web via Tavily and return a compact text summary.

    Returns an empty string if TAVILY_API_KEY is not set or the search fails.
    """
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        logger.debug("TAVILY_API_KEY not set — skipping web search.")
        return ""

    try:
        from tavily import TavilyClient  # lazy import — avoids crash if not installed

        enriched_query = _build_tavily_query(query, profile)
        logger.debug("Tavily query: %s", enriched_query)

        client = TavilyClient(api_key=api_key)
        results = client.search(
            query=enriched_query,
            search_depth="advanced",
            max_results=4,
            include_answer=True,
        )

        lines: list[str] = []

        if results.get("answer"):
            lines.append(f"Summary: {results['answer']}")

        for r in results.get("results", []):
            title = r.get("title", "")
            snippet = r.get("content", "")[:400]
            url = r.get("url", "")
            lines.append(f"• {title}: {snippet} ({url})")

        return "\n".join(lines)

    except Exception:
        logger.warning("Tavily search failed — continuing without web context.", exc_info=True)
        return ""


# ---------------------------------------------------------------------------
# Service class
# ---------------------------------------------------------------------------


class ChatService:
    """Handles conversational AI responses with user context and live web search."""

    def respond(
        self,
        profile_id: int,
        message: str,
        history: list[ChatMessage],
    ) -> str:
        """
        Generate a personalised reply to the user's message.

        Args:
            profile_id: ID of the user's profile in the database. Used to
                        inject origin/destination country, status, goals, etc.
                        Pass 0 or any non-existent ID to chat without a profile.
            message:    The user's latest message (any language).
            history:    Previous turns (user + assistant), oldest first.

        Returns:
            The assistant's reply as a plain string.

        Raises:
            RuntimeError: If CEREBRAS_API_KEY is not configured.
        """
        api_key = os.environ.get("CEREBRAS_API_KEY")
        if not api_key:
            raise RuntimeError("CEREBRAS_API_KEY is not configured.")

        # 1. Fetch user profile — best-effort, chat works without it
        profile: dict | None = None
        if profile_id and profile_id > 0:
            try:
                profile = profile_service.get_profile(profile_id)
            except Exception:
                logger.warning(
                    "Could not fetch profile %d — continuing without context.",
                    profile_id,
                    exc_info=True,
                )

        # 2. Web search via Tavily (optional, country-context enriched)
        web_context = _tavily_search(message, profile)

        # 3. Build system prompt
        system_prompt = _build_system_prompt(profile, web_context)

        # 4. Trim history to avoid context overflow
        trimmed = history[-_MAX_HISTORY:]

        # 5. Build Cerebras messages list
        messages: list[dict] = [{"role": "system", "content": system_prompt}]
        for turn in trimmed:
            messages.append({"role": turn.role, "content": turn.content})
        messages.append({"role": "user", "content": message})

        # 6. Call Cerebras
        client = Cerebras(api_key=api_key)
        response = client.chat.completions.create(
            model="llama3.1-8b",
            messages=messages,
            temperature=0.35,
            max_tokens=420,  # enough for a sourced answer without padding
        )

        reply: str = response.choices[0].message.content.strip()
        logger.info(
            "Chat reply generated for profile %d (%d chars).",
            profile_id,
            len(reply),
        )
        return reply


# Module-level singleton
chat_service = ChatService()

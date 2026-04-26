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
You are Cleo, a personal relocation concierge for expats and international students.
Your role is to help anyone moving from one country to another navigate:
- Banking and finance (opening accounts, transfers, credit history)
- Administrative procedures (visas, residence permits, registrations)
- Taxes and social contributions
- Housing and utilities
- Healthcare and insurance
- Daily life practicalities

Core rules:
- You are country-agnostic. You help with any origin → destination pair, worldwide.
- Always reply in the same language the user writes in (French, English, Arabic, Spanish, etc.).
- Personalise every answer using the user's profile (origin, destination, status, goals).
- If web search results are available, use them and cite the source URLs.
- If you are not sure about something, say so — never fabricate facts or figures.
- Be concise, warm, and practical. Bullet points are welcome for step-by-step guides.
- If the question is genuinely out of scope (e.g. medical diagnosis, legal advice requiring a lawyer),
  acknowledge the limit and suggest seeking a professional.\
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
=== LIVE WEB CONTEXT (from Tavily) ===
{web_context}
======================================

Use this information to ground your answer in up-to-date facts. Cite URLs where relevant.\
"""
        )

    return "\n".join(sections)


# ---------------------------------------------------------------------------
# Tavily helper
# ---------------------------------------------------------------------------


def _build_tavily_query(message: str, profile: dict | None) -> str:
    """
    Enrich the user message with destination/origin context so that Tavily
    returns highly relevant, country-specific results.

    Example:
        "comment ouvrir un compte bancaire" + profile(destination=France)
        → "comment ouvrir un compte bancaire en France pour étudiant marocain"
    """
    if not profile:
        return message

    destination = profile.get("country_moving_to")
    origin = profile.get("country_of_residence")
    status = profile.get("employment_status")

    parts: list[str] = [message]
    if destination:
        parts.append(f"in {destination}")
    if origin:
        parts.append(f"for someone from {origin}")
    if status:
        parts.append(f"({status})")

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
            temperature=0.4,   # slightly lower for more factual answers
            max_tokens=1024,   # more room for detailed, sourced answers
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

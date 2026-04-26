"""
Chat / concierge service.

Answers user questions using:
1. The user's profile as personalised context (fetched from DB by profile_id)
2. Tavily web search for recent, sourced information (optional — graceful
   degradation when TAVILY_API_KEY is not set)
3. Cerebras llama3.1-8b to generate the final response

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
# System prompt template
# ---------------------------------------------------------------------------

_PERSONA = """Tu es Cleo, le concierge personnel de l'application France Roots.
Tu aides les expatriés et étudiants étrangers à s'installer en France.
Tu es chaleureux, concis et pratique. Tu réponds toujours en français sauf si
l'utilisateur écrit dans une autre langue.

Règles strictes :
- Réponds uniquement à des questions liées à l'installation en France
  (banque, admin, impôts, logement, santé, vie quotidienne).
- Si une question est hors sujet, redirige poliment vers ton domaine.
- Cite les sources web quand elles sont disponibles.
- Ne fabricke jamais d'informations. Si tu n'es pas sûr, dis-le."""


def _build_system_prompt(profile: dict | None, web_context: str) -> str:
    """
    Build the Cerebras system prompt combining Cleo's persona,
    the user's profile context, and optional Tavily web results.
    """
    sections: list[str] = [_PERSONA]

    if profile:
        already = profile.get("already_has") or []
        goals = profile.get("goals") or []
        time_map = {
            "just_arrived": "moins de 3 mois",
            "settling_in": "3 à 12 mois",
            "established": "plus d'un an",
        }
        time_label = time_map.get(profile.get("time_in_france", ""), "durée inconnue")

        sections.append(
            f"""
--- PROFIL DE L'UTILISATEUR ---
Prénom : {profile.get("first_name", "inconnu")}
Nationalité : {profile.get("nationality", "inconnue")}
Statut professionnel : {profile.get("employment_status", "inconnu")}
Revenus : {"oui (" + profile.get("income_bracket", "") + ")" if profile.get("has_income") else "non"}
Pays d'origine : {profile.get("country_of_residence", "inconnu")}
Depuis en France : {time_label}
Liens financiers à l'étranger : {"oui" if profile.get("has_financial_ties_abroad") else "non"}
Ce qu'il/elle possède déjà : {", ".join(already) if already else "rien de renseigné"}
Objectifs : {", ".join(goals) if goals else "non renseignés"}
-------------------------------

Adapte chaque réponse à cette situation spécifique."""
        )

    if web_context:
        sections.append(
            f"""
--- INFORMATIONS WEB RÉCENTES ---
{web_context}
---------------------------------

Utilise ces informations pour enrichir ta réponse et cite les URLs si pertinent."""
        )

    return "\n".join(sections)


# ---------------------------------------------------------------------------
# Tavily helper
# ---------------------------------------------------------------------------

def _tavily_search(query: str) -> str:
    """
    Search the web via Tavily and return a compact text summary.

    Returns an empty string if TAVILY_API_KEY is not set or the search fails.
    """
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        logger.debug("TAVILY_API_KEY not set — skipping web search.")
        return ""

    try:
        from tavily import TavilyClient  # imported lazily to avoid import error if not installed

        client = TavilyClient(api_key=api_key)
        results = client.search(
            query=query,
            search_depth="advanced",
            max_results=3,
            include_answer=True,
        )

        lines: list[str] = []
        if results.get("answer"):
            lines.append(f"Résumé : {results['answer']}")

        for r in results.get("results", []):
            lines.append(f"- {r.get('title', '')} : {r.get('content', '')[:300]} ({r.get('url', '')})")

        return "\n".join(lines)

    except Exception:
        logger.warning("Tavily search failed — continuing without web context.", exc_info=True)
        return ""


# ---------------------------------------------------------------------------
# Service class
# ---------------------------------------------------------------------------


class ChatService:
    """Handles conversational AI responses with user context and web search."""

    def respond(
        self,
        profile_id: int,
        message: str,
        history: list[ChatMessage],
    ) -> str:
        """
        Generate a personalised reply to the user's message.

        Args:
            profile_id: ID of the user's profile in the database.
            message:    The user's latest message.
            history:    Previous turns (user + assistant), oldest first.

        Returns:
            The assistant's reply as a plain string.

        Raises:
            RuntimeError: If CEREBRAS_API_KEY is not configured.
            Exception:    Propagated Cerebras API errors.
        """
        api_key = os.environ.get("CEREBRAS_API_KEY")
        if not api_key:
            raise RuntimeError("CEREBRAS_API_KEY is not configured.")

        # 1. Fetch user profile (best-effort — chat works without it)
        profile: dict | None = None
        try:
            profile = profile_service.get_profile(profile_id)
        except Exception:
            logger.warning("Could not fetch profile %d — continuing without context.", profile_id, exc_info=True)

        # 2. Web search via Tavily (optional)
        web_context = _tavily_search(message)

        # 3. Build system prompt
        system_prompt = _build_system_prompt(profile, web_context)

        # 4. Trim history to avoid context overflow
        trimmed = history[-_MAX_HISTORY:]

        # 5. Build messages list for Cerebras
        messages: list[dict] = [{"role": "system", "content": system_prompt}]
        for turn in trimmed:
            messages.append({"role": turn.role, "content": turn.content})
        messages.append({"role": "user", "content": message})

        # 6. Call Cerebras
        client = Cerebras(api_key=api_key)
        response = client.chat.completions.create(
            model="llama3.1-8b",
            messages=messages,
            temperature=0.5,
            max_tokens=800,
        )

        reply = response.choices[0].message.content.strip()
        logger.info("Chat reply generated for profile %d (%d chars).", profile_id, len(reply))
        return reply


# Module-level singleton
chat_service = ChatService()

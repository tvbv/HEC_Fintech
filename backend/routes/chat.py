"""
Chat / concierge route.

POST /chat  —  Responds to a user message with personalised AI advice,
               using the user's profile as context and Tavily for web search.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from models import ChatRequest, ChatResponse
from services.chat_service import chat_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(body: ChatRequest) -> ChatResponse:
    """
    Generate a personalised AI response for the user.

    - **profile_id**: ID of the user profile stored in the database. Used to
      inject personalised context (nationality, status, goals, etc.) into the
      AI prompt.
    - **message**: The user's latest message.
    - **history**: Optional conversation history (oldest first), each item
      having a `role` ("user" | "assistant") and `content`.

    Returns a `{"reply": "..."}` object.

    ### Error codes
    - **500**: Cerebras API key not configured or unexpected AI error.
    """
    try:
        reply = chat_service.respond(body.profile_id, body.message, body.history)
        return ChatResponse(reply=reply)
    except RuntimeError as exc:
        logger.error("Chat configuration error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected error in /chat for profile %d.", body.profile_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur interne s'est produite. Veuillez réessayer.",
        ) from exc

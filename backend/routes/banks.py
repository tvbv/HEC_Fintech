"""Bank catalogue and recommendation routes."""

from __future__ import annotations

import logging

from fastapi import APIRouter
from models import RecommendRequest
from services.bank_service import bank_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/recommend")
async def recommend_banks(body: RecommendRequest) -> dict:
    """
    Return 3 personalised bank recommendations for the given expat profile.

    Optionally accepts base64-encoded documents to enrich the analysis.
    When documents are provided the in-memory cache is bypassed.
    """
    result = bank_service.get_recommendations(body.profile, body.documents)
    return {"success": True, "data": result}


@router.get("")
async def get_all_banks() -> dict:
    """Return the complete bank catalogue."""
    return {"success": True, "data": bank_service.get_all_banks()}


@router.get("/{bank_id}")
async def get_bank_by_id(bank_id: str) -> dict:
    """
    Return detailed information for a single bank.

    Raises:
        HTTPException 404: if bank_id is not in the catalogue.
    """
    bank = bank_service.get_bank_by_id(bank_id)
    return {"success": True, "data": bank}

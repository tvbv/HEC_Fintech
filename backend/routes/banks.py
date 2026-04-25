"""Bank recommendation and catalog routes."""

from fastapi import APIRouter
from models import RecommendRequest
from services.bank_service import bank_service

router = APIRouter()


@router.post("/recommend")
def recommend_banks(body: RecommendRequest):
    """
    Get bank recommendations for a user profile.

    Accepts user profile and optional documents for analysis.
    """
    result = bank_service.get_recommendations(body.profile, body.documents)
    return {"success": True, "data": result}


@router.get("")
def get_all_banks():
    """Get the complete catalog of available banks."""
    return {"success": True, "data": bank_service.get_all_banks()}


@router.get("/{bank_id}")
def get_bank_by_id(bank_id: str):
    """Get detailed information about a specific bank."""
    bank = bank_service.get_bank_by_id(bank_id)
    return {"success": True, "data": bank}

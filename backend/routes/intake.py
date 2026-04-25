"""Profile and intake routes."""

from fastapi import APIRouter
from models import IntakeRequest, IntakeResponse
from services.profile_service import profile_service

router = APIRouter()


@router.post("", response_model=IntakeResponse)
def create_intake(request: IntakeRequest):
    """Create a new user profile from intake data."""
    profile_id = profile_service.create_profile(request.model_dump())
    return IntakeResponse(profile_id=profile_id)

"""Profile and intake routes."""

from fastapi import APIRouter, HTTPException
from models import GetProfileResponse, IntakeRequest, IntakeResponse
from services.profile_service import profile_service

router = APIRouter()


@router.post("", response_model=IntakeResponse)
def create_intake(request: IntakeRequest):
    """Create a new user profile from intake data."""
    profile_id = profile_service.create_profile(request.model_dump())
    return IntakeResponse(profile_id=profile_id)


@router.get("/{profile_id}", response_model=GetProfileResponse)
def get_intake(profile_id: int):
    """Retrieve a user profile by ID."""
    profile = profile_service.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return GetProfileResponse(**profile)

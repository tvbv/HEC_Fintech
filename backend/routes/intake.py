"""Profile intake routes."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from models import GetProfileResponse, IntakeRequest, IntakeResponse
from services.profile_service import profile_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=IntakeResponse)
async def create_intake(request: IntakeRequest) -> IntakeResponse:
    """
    Persist a new user onboarding profile.

    Returns the auto-generated profile ID.
    """
    profile_id = profile_service.create_profile(request.model_dump())
    return IntakeResponse(profile_id=profile_id)


@router.get("/{profile_id}", response_model=GetProfileResponse)
async def get_intake(profile_id: int) -> GetProfileResponse:
    """
    Retrieve an existing profile by its ID.

    Raises:
        HTTPException 404: if the profile does not exist.
    """
    profile = profile_service.get_profile(profile_id)
    if not profile:
        logger.warning("Profile %d not found.", profile_id)
        raise HTTPException(status_code=404, detail="Profile not found.")
    return GetProfileResponse(**profile)

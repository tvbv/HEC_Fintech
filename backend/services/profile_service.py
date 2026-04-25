"""Profile service for handling user intake and profile management."""

import json

from database import engine, get_profile, save_profile
from sqlalchemy.orm import Session


class ProfileService:
    """Service for managing user profiles."""

    @staticmethod
    def create_profile(profile_data: dict) -> int:
        """
        Create and save a new user profile.

        Args:
            profile_data: Dictionary containing profile information

        Returns:
            Profile ID as integer
        """
        with Session(engine) as db:
            profile_id = save_profile(db, profile_data)
        return profile_id

    @staticmethod
    def get_profile(profile_id: int) -> dict | None:
        """
        Retrieve a user profile by ID.

        Args:
            profile_id: The profile ID to fetch

        Returns:
            Dictionary with profile data or None if not found
        """
        with Session(engine) as db:
            profile = get_profile(db, profile_id)
            if not profile:
                return None

            # Convert to dictionary and parse goals JSON
            profile_dict = {
                "profile_id": profile.id,
                "first_name": profile.first_name,
                "last_name": profile.last_name,
                "date_of_birth": profile.date_of_birth,
                "nationality": profile.nationality,
                "country_of_residence": profile.country_of_residence,
                "country_moving_to": profile.country_moving_to,
                "employment_status": profile.employment_status,
                "has_income": profile.has_income,
                "income_bracket": profile.income_bracket,
                "currency": profile.currency,
                "goals": json.loads(profile.goals) if profile.goals else None,
                "created_at": profile.created_at.isoformat()
                if profile.created_at
                else None,
            }
            return profile_dict


# Singleton instance
profile_service = ProfileService()
profile_service = ProfileService()

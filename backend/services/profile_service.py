"""Profile service — handles user intake persistence and retrieval."""

from __future__ import annotations

import json
import logging

from database import engine, get_profile, save_profile
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class ProfileService:
    """Manages user profile creation and retrieval via SQLite."""

    def create_profile(self, profile_data: dict) -> int:
        """
        Persist a new user profile and return its database ID.

        Args:
            profile_data: Dict matching the IntakeRequest schema.

        Returns:
            Auto-generated profile ID (integer).

        Raises:
            SQLAlchemyError: propagated from database layer.
        """
        with Session(engine) as db:
            profile_id = save_profile(db, profile_data)
        logger.info("Profile %d created.", profile_id)
        return profile_id

    def get_profile(self, profile_id: int) -> dict | None:
        """
        Retrieve a user profile by ID.

        Args:
            profile_id: The profile ID to fetch.

        Returns:
            Dict with all profile fields; JSON-encoded lists are decoded back
            to Python lists. Returns None if the profile does not exist.
        """
        with Session(engine) as db:
            profile = get_profile(db, profile_id)
            if profile is None:
                return None

            return {
                "profile_id": profile.id,
                # Identity
                "first_name": profile.first_name,
                "last_name": profile.last_name,
                "date_of_birth": profile.date_of_birth,
                "nationality": profile.nationality,
                # Origin & destination
                "country_of_residence": profile.country_of_residence,
                "country_moving_to": profile.country_moving_to,
                # Situation
                "employment_status": profile.employment_status,
                "has_income": profile.has_income,
                "income_bracket": profile.income_bracket,
                "currency": profile.currency,
                # France-specific context
                "time_in_france": profile.time_in_france,
                "has_financial_ties_abroad": profile.has_financial_ties_abroad,
                "already_has": (
                    json.loads(profile.already_has) if profile.already_has else None
                ),
                # Goals
                "goals": json.loads(profile.goals) if profile.goals else None,
                "created_at": (
                    profile.created_at.isoformat() if profile.created_at else None
                ),
            }


# Module-level singleton
profile_service = ProfileService()

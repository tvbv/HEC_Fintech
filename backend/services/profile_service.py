"""Profile service for handling user intake and profile management."""

from database import engine, save_profile
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


# Singleton instance
profile_service = ProfileService()

"""
SQLite database setup via SQLAlchemy.

Tables:
- profiles : one row per POST /intake submission

Functions:
- init_db()      : create tables if they don't exist
- save_profile() : insert a profile row, return its ID
- get_profile()  : retrieve a profile row by ID

JSON-encoded list columns (stored as strings, decoded on read):
- goals       : e.g. '["banking", "taxes"]'
- already_has : e.g. '["local_phone", "proof_of_address"]'
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String, create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, Session

logger = logging.getLogger(__name__)

engine = create_engine(
    "sqlite:///./data.db",
    connect_args={"check_same_thread": False},
)


class Base(DeclarativeBase):
    pass


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(String, nullable=False)
    nationality = Column(String(2), nullable=False)
    country_of_residence = Column(String(2), nullable=False)
    country_moving_to = Column(String(2), nullable=False)
    employment_status = Column(String, nullable=False)
    has_income = Column(Boolean, nullable=False)
    income_bracket = Column(String, nullable=True)
    currency = Column(String(3), nullable=True)
    goals = Column(String, nullable=True)                   # JSON-encoded list
    # Destination-specific context
    time_at_destination = Column(String, nullable=True)     # "just_arrived" | "settling_in" | "established"
    has_financial_ties_abroad = Column(Boolean, nullable=True)
    already_has = Column(String, nullable=True)             # JSON-encoded list
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


def init_db() -> None:
    """Create all tables if they do not already exist."""
    try:
        Base.metadata.create_all(bind=engine)
    except SQLAlchemyError:
        logger.critical("Failed to initialise database.", exc_info=True)
        raise


def save_profile(db: Session, data: dict) -> int:
    """
    Insert a profile row and return its auto-generated ID.

    Serialises list fields (`goals`, `already_has`) to JSON strings before saving.

    Raises:
        SQLAlchemyError: propagated to the caller.
    """
    # Encode list fields as JSON strings for SQLite storage
    _list_fields = ("goals", "already_has")
    for field in _list_fields:
        if field in data and isinstance(data[field], list):
            data = {**data, field: json.dumps(data[field])}

    try:
        profile = Profile(**data)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile.id
    except SQLAlchemyError:
        db.rollback()
        logger.error("save_profile failed.", exc_info=True)
        raise


def get_profile(db: Session, profile_id: int) -> Profile | None:
    """
    Retrieve a profile row by its ID.

    Returns:
        Profile ORM object, or None if not found.
    """
    return db.query(Profile).filter(Profile.id == profile_id).first()

"""
SQLite database setup via SQLAlchemy.

Tables:
- profiles  : one row per /intake submission
- documents : one row per /upload-document submission

Functions:
- init_db()       : create tables if they don't exist
- save_profile()  : insert a profile row, return its ID
- save_document() : insert a document row, return its ID
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
    goals = Column(String, nullable=True)           # stored as JSON array string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    nationality = Column(String(2), nullable=True)
    document_type = Column(String, nullable=True)
    file_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


def init_db() -> None:
    """Create all tables if they don't already exist."""
    try:
        Base.metadata.create_all(bind=engine)
    except SQLAlchemyError as e:
        logger.critical("Failed to initialise database: %s", e, exc_info=True)
        raise


def save_profile(db: Session, data: dict) -> int:
    """
    Insert a profile row and return its auto-generated ID.

    Serialises the `goals` list to a JSON string before saving.

    Raises:
        SQLAlchemyError: propagated to caller so main.py can return HTTP 500.
    """
    if "goals" in data and isinstance(data["goals"], list):
        data = {**data, "goals": json.dumps(data["goals"])}

    try:
        profile = Profile(**data)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile.id
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("save_profile failed: %s", e, exc_info=True)
        raise


def save_document(db: Session, data: dict) -> int:
    """
    Insert a document row and return its auto-generated ID.

    Raises:
        SQLAlchemyError: propagated to caller so main.py can return HTTP 500.
    """
    try:
        doc = Document(**data)
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc.id
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("save_document failed: %s", e, exc_info=True)
        raise

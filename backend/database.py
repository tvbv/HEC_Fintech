import json
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import DeclarativeBase, Session
from datetime import datetime, timezone

engine = create_engine("sqlite:///./data.db", connect_args={"check_same_thread": False})


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
    goals = Column(String, nullable=True)  # stored as JSON array string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


def init_db():
    Base.metadata.create_all(bind=engine)


def save_profile(db: Session, data: dict) -> int:
    if "goals" in data and isinstance(data["goals"], list):
        data["goals"] = json.dumps(data["goals"])
    profile = Profile(**data)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile.id

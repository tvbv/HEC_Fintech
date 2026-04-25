from typing import Optional

from pydantic import BaseModel

# ─────────────────────────────────────────────
# PROFILE / INTAKE MODELS
# ─────────────────────────────────────────────


class IntakeRequest(BaseModel):
    country_of_residence: str
    country_moving_to: str
    first_name: str
    last_name: str
    date_of_birth: str  # "YYYY-MM-DD"
    nationality: str
    employment_status: str
    has_income: bool
    income_bracket: Optional[str] = None
    currency: Optional[str] = "EUR"
    goals: Optional[list[str]] = []


class IntakeResponse(BaseModel):
    profile_id: int


# ─────────────────────────────────────────────
# BANKING / RECOMMENDATION MODELS
# ─────────────────────────────────────────────


class Document(BaseModel):
    data: str  # base64
    mime_type: str = "application/pdf"
    label: str = ""


class UserProfile(BaseModel):
    nationality: Optional[str] = None
    has_french_address: bool = False
    visa_type: Optional[str] = None
    income_range: Optional[str] = None
    monthly_income_eur: Optional[float] = None
    situation: Optional[str] = None
    needs: list[str] = []
    languages: list[str] = []
    goals: list[str] = []


class RecommendRequest(BaseModel):
    profile: UserProfile
    documents: list[Document] = []

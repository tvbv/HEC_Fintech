"""
Pydantic schemas for request / response validation.

Sections:
1. Profile / intake models   (POST /intake, GET /intake/{id})
2. Banking / recommendation models  (POST /banks/recommend)

Allowed values — intake form
─────────────────────────────
employment_status : "employed_fulltime" | "employed_parttime" | "freelance"
                    | "student" | "between_jobs" | "retired"

time_in_france    : "just_arrived"   (< 3 months)
                  | "settling_in"    (3–12 months)
                  | "established"    (> 1 year)

already_has items : "french_bank_account" | "french_phone" | "proof_of_address"
                  | "social_security_number" | "carte_vitale" | "residence_permit"
                  | "french_tax_number" | "caf_number"
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel

# Shorthand type aliases used by IntakeRequest
TimeInFrance = Literal["just_arrived", "settling_in", "established"]
AlreadyHasItem = Literal[
    "french_bank_account",
    "french_phone",
    "proof_of_address",
    "social_security_number",
    "carte_vitale",
    "residence_permit",
    "french_tax_number",
    "caf_number",
]

# ---------------------------------------------------------------------------
# 1. Profile / intake
# ---------------------------------------------------------------------------


class IntakeRequest(BaseModel):
    """Onboarding profile submitted by the user via the intake form."""

    # ── Origin & destination ──────────────────────────────────────────
    country_of_residence: str        # ISO 3166-1 alpha-2, e.g. "GB"
    country_moving_to: str           # ISO 3166-1 alpha-2, e.g. "FR"
    nationality: str                 # ISO 3166-1 alpha-2

    # ── Identity ─────────────────────────────────────────────────────
    first_name: str
    last_name: str
    date_of_birth: str               # "YYYY-MM-DD"

    # ── Situation ────────────────────────────────────────────────────
    employment_status: str           # see module docstring for allowed values
    has_income: bool
    income_bracket: Optional[str] = None   # required when has_income is True
    currency: Optional[str] = "EUR"        # ISO 4217

    # ── France-specific context (new questions) ──────────────────────
    time_in_france: Optional[TimeInFrance] = None
    # "How long in France?" → "just_arrived" | "settling_in" | "established"

    has_financial_ties_abroad: Optional[bool] = None
    # "Financial ties back home?" → True = yes / False = just France

    already_has: Optional[list[AlreadyHasItem]] = []
    # "What do you already have?" → multi-select checklist

    # ── Goals ────────────────────────────────────────────────────────
    goals: Optional[list[str]] = []  # ["banking", "admin_setup", "taxes", "perks"]


class IntakeResponse(BaseModel):
    """Returned after a successful POST /intake."""

    profile_id: int


class GetProfileResponse(BaseModel):
    """Full profile returned by GET /intake/{profile_id}."""

    profile_id: int
    first_name: str
    last_name: str
    date_of_birth: str
    nationality: str
    country_of_residence: str
    country_moving_to: str
    employment_status: str
    has_income: bool
    income_bracket: Optional[str] = None
    currency: Optional[str] = None
    goals: Optional[list[str]] = None
    # France-specific context
    time_in_france: Optional[str] = None
    has_financial_ties_abroad: Optional[bool] = None
    already_has: Optional[list[str]] = None
    created_at: Optional[str] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 2. Banking / recommendation
# ---------------------------------------------------------------------------


class Document(BaseModel):
    """A base64-encoded document passed alongside a recommendation request."""

    data: str                              # base64-encoded file content
    mime_type: str = "application/pdf"
    label: str = ""                        # optional human-readable label


class UserProfile(BaseModel):
    """Expat profile used to compute bank recommendations."""

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
    """Request body for POST /banks/recommend."""

    profile: UserProfile
    documents: list[Document] = []

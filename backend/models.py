"""
Pydantic schemas for request / response validation.

- IntakeRequest   : user profile submitted via the onboarding form
- IntakeResponse  : profile ID returned after saving
- ExtractedDocument     : fields extracted from an uploaded document
- DocumentUploadResponse: wrapper returned by /upload-document
"""

from __future__ import annotations

import re
from typing import Literal, Optional

from pydantic import BaseModel, field_validator, model_validator

# ---------------------------------------------------------------------------
# Allowed values (kept here so the frontend can reference this file as a spec)
# ---------------------------------------------------------------------------

EMPLOYMENT_STATUS_VALUES = Literal[
    "employed_fulltime",
    "employed_parttime",
    "freelance",
    "student",
    "between_jobs",
    "retired",
]

INCOME_BRACKET_VALUES = Literal[
    "under_10k",
    "10k_to_30k",
    "30k_to_60k",
    "60k_to_100k",
    "over_100k",
]

GOAL_VALUES = Literal["banking", "admin_setup", "taxes", "perks"]


# ---------------------------------------------------------------------------
# /intake
# ---------------------------------------------------------------------------

class IntakeRequest(BaseModel):
    country_of_residence: str
    country_moving_to: str
    first_name: str
    last_name: str
    date_of_birth: str          # expected: "YYYY-MM-DD"
    nationality: str            # ISO 3166-1 alpha-2, e.g. "FR"
    employment_status: EMPLOYMENT_STATUS_VALUES
    has_income: bool
    income_bracket: Optional[INCOME_BRACKET_VALUES] = None
    currency: Optional[str] = "EUR"
    goals: Optional[list[GOAL_VALUES]] = []

    @field_validator("country_of_residence", "country_moving_to", "nationality")
    @classmethod
    def validate_country_code(cls, v: str) -> str:
        v = v.strip().upper()
        if not re.fullmatch(r"[A-Z]{2}", v):
            raise ValueError(
                f"'{v}' is not a valid ISO 3166-1 alpha-2 country code (e.g. 'FR', 'DE')."
            )
        return v

    @field_validator("date_of_birth")
    @classmethod
    def validate_date(cls, v: str) -> str:
        v = v.strip()
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v):
            raise ValueError(
                f"'{v}' is not a valid date. Expected format: YYYY-MM-DD."
            )
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip().upper()
        if not re.fullmatch(r"[A-Z]{3}", v):
            raise ValueError(
                f"'{v}' is not a valid ISO 4217 currency code (e.g. 'EUR', 'USD')."
            )
        return v

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name fields cannot be empty.")
        return v

    @model_validator(mode="after")
    def income_bracket_required_when_has_income(self) -> "IntakeRequest":
        if self.has_income and not self.income_bracket:
            raise ValueError(
                "'income_bracket' is required when 'has_income' is true."
            )
        return self


class IntakeResponse(BaseModel):
    profile_id: int


# ---------------------------------------------------------------------------
# /upload-document
# ---------------------------------------------------------------------------

class ExtractedDocument(BaseModel):
    """Fields extracted from an uploaded document by Cerebras.
    All fields are optional — the model sets null when it cannot confidently read a value."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None    # YYYY-MM-DD or null
    nationality: Optional[str] = None      # ISO 3166-1 alpha-2 or null
    document_type: Optional[str] = None    # "passport" | "id_card" | "lease" | etc.


class DocumentUploadResponse(BaseModel):
    document_id: int
    extracted: ExtractedDocument

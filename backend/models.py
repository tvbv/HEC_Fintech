from pydantic import BaseModel, field_validator
from typing import Optional

VALID_EMPLOYMENT_STATUSES = {
    "employed_fulltime", "employed_parttime", "freelance",
    "student", "between_jobs", "retired"
}

VALID_INCOME_BRACKETS = {
    "under_10k", "10k_to_30k", "30k_to_60k", "60k_to_100k", "over_100k"
}

VALID_GOALS = {"banking", "admin_setup", "taxes", "perks"}


class IntakeRequest(BaseModel):
    country_of_residence: str
    country_moving_to: str
    first_name: str
    last_name: str
    date_of_birth: str        # "YYYY-MM-DD"
    nationality: str
    employment_status: str
    has_income: bool
    income_bracket: Optional[str] = None
    currency: Optional[str] = "EUR"
    goals: Optional[list[str]] = []

    @field_validator("country_of_residence", "country_moving_to", "nationality")
    @classmethod
    def must_be_iso_alpha2(cls, v: str) -> str:
        if len(v) != 2 or not v.isalpha():
            raise ValueError(f"'{v}' is not a valid ISO 3166-1 alpha-2 country code (e.g. 'FR', 'DE')")
        return v.upper()

    @field_validator("employment_status")
    @classmethod
    def must_be_valid_employment(cls, v: str) -> str:
        if v not in VALID_EMPLOYMENT_STATUSES:
            raise ValueError(
                f"'{v}' is not valid. Must be one of: {', '.join(sorted(VALID_EMPLOYMENT_STATUSES))}"
            )
        return v

    @field_validator("income_bracket")
    @classmethod
    def must_be_valid_bracket(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_INCOME_BRACKETS:
            raise ValueError(
                f"'{v}' is not valid. Must be one of: {', '.join(sorted(VALID_INCOME_BRACKETS))}"
            )
        return v

    @field_validator("goals")
    @classmethod
    def must_be_valid_goals(cls, v: list[str]) -> list[str]:
        invalid = [g for g in v if g not in VALID_GOALS]
        if invalid:
            raise ValueError(
                f"{invalid} are not valid goals. Must be from: {', '.join(sorted(VALID_GOALS))}"
            )
        return v


class IntakeResponse(BaseModel):
    profile_id: int


class ExtractedDocument(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    nationality: Optional[str] = None
    document_type: Optional[str] = None


class DocumentUploadResponse(BaseModel):
    document_id: int
    extracted: ExtractedDocument

from pydantic import BaseModel
from typing import Optional


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
    # Multi-select goals: "banking", "admin_setup", "taxes", "perks"
    goals: Optional[list[str]] = []


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

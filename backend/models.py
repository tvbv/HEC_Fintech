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


class BankRecommendation(BaseModel):
    name: str
    reason: str
    url: str
    account_type: str
    tier: str


class TaxNote(BaseModel):
    topic: str
    summary: str
    urgency: str
    action_required: str


class AdminTask(BaseModel):
    task: str
    category: str
    deadline_hint: str
    priority: str


class HousingNote(BaseModel):
    tip: str
    category: str


class IntakeResponse(BaseModel):
    profile_id: int
    banks: list[BankRecommendation]
    tax_notes: list[TaxNote]
    admin_checklist: list[AdminTask]
    housing_notes: list[HousingNote]

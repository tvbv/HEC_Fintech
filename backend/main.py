from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, init_db, save_profile
from models import IntakeRequest, IntakeResponse
from llm import get_recommendations

app = FastAPI(title="Expat Onboarding API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to Lovable domain before production
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


@app.post("/intake", response_model=IntakeResponse)
def intake(request: IntakeRequest):
    profile = request.model_dump()

    with Session(engine) as db:
        profile_id = save_profile(db, profile)

    try:
        recommendations = get_recommendations(profile)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")

    return IntakeResponse(
        profile_id=profile_id,
        banks=recommendations.get("banks", []),
        tax_notes=recommendations.get("tax_notes", []),
        admin_checklist=recommendations.get("admin_checklist", []),
        housing_notes=recommendations.get("housing_notes", []),
    )


@app.get("/health")
def health():
    return {"status": "ok"}

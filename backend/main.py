from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, init_db, save_profile
from models import IntakeRequest, IntakeResponse

app = FastAPI(title="Expat Onboarding API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


@app.post("/intake", response_model=IntakeResponse)
def intake(request: IntakeRequest):
    profile = request.model_dump()

    with Session(engine) as db:
        profile_id = save_profile(db, profile)

    return IntakeResponse(profile_id=profile_id)


@app.get("/health")
def health():
    return {"status": "ok"}

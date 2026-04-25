from dotenv import load_dotenv

load_dotenv()

from database import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import banks, health, intake, document_upload

# ─────────────────────────────────────────────
# INITIALIZE DATABASE
# ─────────────────────────────────────────────
init_db()

# ─────────────────────────────────────────────
# CREATE FASTAPI APP
# ─────────────────────────────────────────────
app = FastAPI(
    title="Expat Onboarding & Banking API",
    description="Complete API for expatriate onboarding and bank recommendations",
    version="1.0.0",
)

# ─────────────────────────────────────────────
# CORS MIDDLEWARE
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# REGISTER ROUTERS
# ─────────────────────────────────────────────
app.include_router(health.router, tags=["health"])
app.include_router(intake.router, prefix="/intake", tags=["profile"])
app.include_router(banks.router, prefix="/banks", tags=["banking"])
app.include_router(document_upload.router, prefix="/documents", tags=["documents"])

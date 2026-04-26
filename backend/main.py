"""
Expat Onboarding & Banking API — application entry point.

Routes registered:
  GET  /health              → liveness probe
  GET  /                    → redirect to /docs
  POST /intake              → create user profile
  GET  /intake/{id}         → retrieve user profile
  POST /documents           → upload & extract document fields
  POST /banks/recommend     → AI-powered bank recommendations
  GET  /banks               → full bank catalogue
  GET  /banks/{id}          → single bank detail
  POST /chat                → AI concierge (Cerebras + Tavily)
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from dotenv import load_dotenv

load_dotenv()

from database import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from routes import banks, chat, document_upload, health, intake

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Initialise the SQLite database on startup."""
    init_db()
    logger.info("Database initialised.")
    yield


app = FastAPI(
    title="Expat Onboarding & Banking API",
    description="Complete API for expatriate onboarding and bank recommendations.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Utility route
# ---------------------------------------------------------------------------


@app.get("/", include_in_schema=False)
async def root() -> RedirectResponse:
    """Redirect root URL to the interactive API documentation."""
    return RedirectResponse(url="/docs")


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(health.router)
app.include_router(intake.router, prefix="/intake", tags=["profile"])
app.include_router(document_upload.router, prefix="/documents", tags=["documents"])
app.include_router(banks.router, prefix="/banks", tags=["banking"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])

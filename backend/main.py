"""
Expat Onboarding API — FastAPI entry point.

Routes:
  GET  /          → redirect to /docs
  GET  /health    → liveness probe for Cloud Run
  POST /intake    → save user profile to SQLite
  POST /upload-document → extract fields from PDF/TXT via Cerebras
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from database import engine, init_db, save_document, save_profile
from document import extract_from_pdf, extract_from_text
from models import (
    DocumentUploadResponse,
    ExtractedDocument,
    IntakeRequest,
    IntakeResponse,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

MAX_FILE_SIZE_MB = 10
ALLOWED_EXTENSIONS = {".pdf", ".txt"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info("Database initialised.")
    yield


app = FastAPI(
    title="Expat Onboarding API",
    description=(
        "Helps expats onboard in a new country. "
        "Submit a profile via /intake or upload a document via /upload-document."
    ),
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
# Routes
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
def root():
    """Redirect root to the interactive API docs."""
    return RedirectResponse(url="/docs")


@app.get("/health", tags=["Infra"])
def health():
    """Liveness probe used by Cloud Run."""
    return {"status": "ok"}


@app.post("/intake", response_model=IntakeResponse, tags=["Profile"])
def intake(request: IntakeRequest):
    """
    Persist a user's onboarding profile and return its database ID.
    """
    profile = request.model_dump()

    try:
        with Session(engine) as db:
            profile_id = save_profile(db, profile)
    except Exception as e:
        logger.error("Database error while saving profile: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to save profile. Please try again.")

    logger.info("Profile %d saved.", profile_id)
    return IntakeResponse(profile_id=profile_id)


@app.post("/upload-document", response_model=DocumentUploadResponse, tags=["Documents"])
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF or TXT document. Cerebras extracts structured fields
    (name, date of birth, nationality, document type) from the text content.

    Returns the extracted fields and the database record ID.

    Error codes:
    - 400  Empty file
    - 413  File too large (> 10 MB)
    - 415  Unsupported file type (only .pdf and .txt are accepted)
    - 422  Text extraction failed (e.g. scanned PDF with no text layer)
    - 500  Database error
    - 502  Cerebras API error
    - 503  CEREBRAS_API_KEY not configured
    """
    filename = file.filename or ""
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported file type '{ext}'. "
                f"Accepted formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
            ),
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File too large ({size_mb:.1f} MB). "
                f"Maximum allowed size is {MAX_FILE_SIZE_MB} MB."
            ),
        )

    logger.info("Processing document '%s' (%.2f MB).", filename, size_mb)

    try:
        if ext == ".pdf":
            extracted = extract_from_pdf(file_bytes)
        else:
            extracted = extract_from_text(file_bytes.decode("utf-8", errors="ignore"))

    except ValueError as e:
        # User-facing problem: unreadable file, scanned PDF, empty content, etc.
        raise HTTPException(status_code=422, detail=str(e))

    except RuntimeError as e:
        # Server-side misconfiguration (missing API key, etc.)
        logger.error("Configuration error: %s", e)
        raise HTTPException(status_code=503, detail=str(e))

    except Exception as e:
        # Cerebras API / network failure or unexpected error
        logger.error("Document extraction failed unexpectedly: %s", e, exc_info=True)
        raise HTTPException(
            status_code=502,
            detail="Document extraction failed. Please try again or contact support.",
        )

    try:
        with Session(engine) as db:
            document_id = save_document(
                db,
                {
                    "first_name": extracted.get("first_name"),
                    "last_name": extracted.get("last_name"),
                    "date_of_birth": extracted.get("date_of_birth"),
                    "nationality": extracted.get("nationality"),
                    "document_type": extracted.get("document_type"),
                    "file_name": filename,
                },
            )
    except Exception as e:
        logger.error("Database error while saving document record: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to save document record.")

    logger.info(
        "Document %d saved. Extracted: %s",
        document_id,
        {k: v for k, v in extracted.items() if v is not None},
    )
    return DocumentUploadResponse(
        document_id=document_id,
        extracted=ExtractedDocument(**extracted),
    )

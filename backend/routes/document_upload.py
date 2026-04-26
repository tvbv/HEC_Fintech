"""Document upload route."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
from services.document_service import document_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Response schema (local — not shared with intake models)
# ---------------------------------------------------------------------------


class ExtractedDocument(BaseModel):
    """Fields extracted from an uploaded document. All values may be None."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None   # YYYY-MM-DD or None
    nationality: Optional[str] = None     # ISO 3166-1 alpha-2 or None
    document_type: Optional[str] = None   # "passport" | "id_card" | ... | None


class DocumentUploadResponse(BaseModel):
    extracted: ExtractedDocument


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------


@router.post("", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)) -> DocumentUploadResponse:
    """
    Upload a document (PDF, image, or plain text) and extract identity fields.

    Pipelines:
    - .pdf            → pdfplumber text extraction → Cerebras llama3.1-8b
    - .jpg/.png/.webp → Mistral OCR → Mistral chat
    - .txt            → Cerebras directly

    The extracted fields are returned for use in pre-filling the intake form.
    No document data is persisted.

    Error codes:
    - 400  Empty file
    - 413  File > 10 MB
    - 415  Unsupported file type
    - 422  Unreadable content (e.g. scanned PDF with no text layer)
    - 502  External AI service error
    - 503  API key not configured
    """
    file_bytes = await file.read()
    filename = file.filename or ""
    content_type = file.content_type or ""

    logger.info(
        "Document upload received: '%s' (%d bytes).",
        filename,
        len(file_bytes),
    )

    try:
        extracted = document_service.extract(
            file_bytes=file_bytes,
            filename=filename,
            content_type=content_type,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        logger.error("Document extraction config error: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception:
        logger.error("Document extraction failed unexpectedly.", exc_info=True)
        raise HTTPException(
            status_code=502,
            detail="Document extraction failed. Please try again.",
        )

    logger.info(
        "Extraction complete for '%s': %s",
        filename,
        {k: v for k, v in extracted.items() if v is not None},
    )
    return DocumentUploadResponse(extracted=ExtractedDocument(**extracted))

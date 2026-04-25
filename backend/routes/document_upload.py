"""Document upload routes."""

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
from typing import Optional

from services.document_service import document_service

router = APIRouter()


class ExtractedDocument(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    nationality: Optional[str] = None
    document_type: Optional[str] = None


class DocumentUploadResponse(BaseModel):
    extracted: ExtractedDocument


@router.post("", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a passport or ID document.

    - Images (JPG, PNG, WebP) → Mistral OCR
    - PDFs → pdfplumber + Cerebras
    - TXT → Cerebras directly

    Returns extracted fields to pre-fill the intake form.
    """
    file_bytes = await file.read()

    try:
        extracted = document_service.extract(
            file_bytes=file_bytes,
            filename=file.filename or "",
            content_type=file.content_type or "",
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Extraction failed: {str(e)}")

    return DocumentUploadResponse(extracted=ExtractedDocument(**extracted))

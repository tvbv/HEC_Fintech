"""
Document extraction service.

Routes uploaded files to the appropriate extraction pipeline:
- PDF  → pdfplumber (text extraction) → Cerebras llama3.1-8b
- Image (JPG/PNG/WebP) → Mistral OCR → Mistral chat
- TXT  → Cerebras directly

Returns a normalised dict with keys:
    first_name, last_name, date_of_birth, nationality, document_type
All values may be None if the model cannot identify them with confidence.
"""

from __future__ import annotations

import base64
import io
import json
import logging
import os
import re

import pdfplumber
from cerebras.cloud.sdk import Cerebras
from mistralai import Mistral

logger = logging.getLogger(__name__)

IMAGE_EXTENSIONS: frozenset[str] = frozenset({".jpg", ".jpeg", ".png", ".webp"})
ALLOWED_EXTENSIONS: frozenset[str] = frozenset({".pdf", ".txt"}) | IMAGE_EXTENSIONS
MAX_FILE_SIZE_MB: int = 10
MAX_CHARS: int = 8_000

# ---------------------------------------------------------------------------
# LLM prompts
# ---------------------------------------------------------------------------

_CEREBRAS_SYSTEM_PROMPT = """You are an expert at reading official documents.
From the document text provided, extract the following fields and return ONLY a valid JSON object:
- first_name (string or null)
- last_name (string or null)
- date_of_birth (string in YYYY-MM-DD format, or null)
- nationality (ISO 3166-1 alpha-2 country code e.g. "FR", "DE", "GB", or null)
- document_type (one of: "passport", "id_card", "lease", "payslip", "bank_statement", "other", or null)

Rules:
- Return ONLY valid JSON. No prose, no markdown, no code fences.
- If a field is not clearly identifiable, set it to null. Never guess.
- Dates must be strictly in YYYY-MM-DD format.
- Nationality must be a 2-letter ISO 3166-1 alpha-2 code in uppercase."""

_MISTRAL_EXTRACTION_PROMPT = """You are a passport and ID document reader.
The text above was extracted from a passport or ID document via OCR.
Extract the following fields and return ONLY a valid JSON object:
- first_name (string or null)
- last_name (string or null)
- date_of_birth (string in YYYY-MM-DD format, or null)
- nationality (ISO 3166-1 alpha-2 country code e.g. "FR", "DE", "GB", or null)
- document_type (one of: "passport", "id_card", "other", or null)

Rules:
- Return ONLY valid JSON. No prose, no markdown, no code fences.
- If a field is not clearly identifiable, set it to null. Never guess.
- Dates must be strictly in YYYY-MM-DD format."""

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------


def _empty_extraction() -> dict:
    return {
        "first_name": None,
        "last_name": None,
        "date_of_birth": None,
        "nationality": None,
        "document_type": None,
    }


def _parse_llm_json(raw: str) -> dict:
    """
    Robustly parse a JSON object from an LLM response.

    Handles:
    - Markdown code fences (```json ... ```)
    - Extra prose surrounding the JSON object
    - Completely invalid output (returns empty dict)
    """
    if "```" in raw:
        raw = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*?\}", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    logger.warning("Could not parse LLM response as JSON: %r", raw[:300])
    return {}


def _validate_and_clean(data: dict) -> dict:
    """
    Validate and sanitise extracted fields.

    - Rejects date_of_birth that doesn't match YYYY-MM-DD.
    - Rejects nationality that isn't exactly 2 letters (normalised to uppercase).
    - Sets invalid / missing fields to None.
    """
    result = _empty_extraction()
    for field in ("first_name", "last_name", "document_type"):
        val = data.get(field)
        if isinstance(val, str) and val.strip():
            result[field] = val.strip()
    dob = data.get("date_of_birth")
    if isinstance(dob, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", dob.strip()):
        result["date_of_birth"] = dob.strip()
    nat = data.get("nationality")
    if isinstance(nat, str) and re.fullmatch(r"[A-Za-z]{2}", nat.strip()):
        result["nationality"] = nat.strip().upper()
    return result


# ---------------------------------------------------------------------------
# Service class
# ---------------------------------------------------------------------------


class DocumentService:
    """Routes uploaded files to the correct extraction pipeline."""

    def extract(
        self, file_bytes: bytes, filename: str, content_type: str
    ) -> dict:
        """
        Entry point — validate the file then delegate to the right pipeline.

        Args:
            file_bytes:   Raw file content.
            filename:     Original filename (used for extension detection).
            content_type: MIME type from the multipart upload.

        Returns:
            Dict with keys: first_name, last_name, date_of_birth,
            nationality, document_type (all may be None).

        Raises:
            ValueError:   Empty file, size exceeded, unsupported extension,
                          or unreadable PDF content.
            RuntimeError: Required API key not configured.
        """
        if not file_bytes:
            raise ValueError("The uploaded file is empty.")

        size_mb = len(file_bytes) / (1024 * 1024)
        if size_mb > MAX_FILE_SIZE_MB:
            raise ValueError(
                f"File too large ({size_mb:.1f} MB). "
                f"Maximum allowed size is {MAX_FILE_SIZE_MB} MB."
            )

        ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file type '{ext}'. "
                f"Accepted: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
            )

        if ext == ".pdf":
            return self._extract_from_pdf(file_bytes)
        if ext in IMAGE_EXTENSIONS:
            return self._extract_from_image(
                file_bytes, content_type or "image/jpeg"
            )
        return self._extract_from_text(
            file_bytes.decode("utf-8", errors="ignore")
        )

    # ------------------------------------------------------------------
    # Pipelines
    # ------------------------------------------------------------------

    def _extract_from_pdf(self, file_bytes: bytes) -> dict:
        """PDF → pdfplumber text → Cerebras structured extraction."""
        try:
            text_parts: list[str] = []
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                if not pdf.pages:
                    raise ValueError("The PDF contains no pages.")
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
        except ValueError:
            raise
        except Exception as exc:
            raise ValueError(f"Could not read PDF file: {exc}") from exc

        full_text = "\n".join(text_parts).strip()
        if not full_text:
            raise ValueError(
                "No text could be extracted from this PDF. "
                "It may be a scanned image — please upload an image file (JPG/PNG) instead."
            )
        return self._call_cerebras(full_text)

    def _extract_from_image(self, image_bytes: bytes, mime_type: str) -> dict:
        """Image → Mistral OCR → Mistral chat structured extraction."""
        api_key = os.environ.get("MISTRAL_API_KEY")
        if not api_key:
            raise RuntimeError("MISTRAL_API_KEY is not configured.")

        client = Mistral(api_key=api_key)
        b64 = base64.b64encode(image_bytes).decode("utf-8")

        ocr_response = client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": "image_url",
                "image_url": f"data:{mime_type};base64,{b64}",
            },
        )
        ocr_text = "\n".join(page.markdown for page in ocr_response.pages)

        chat_response = client.chat.complete(
            model="mistral-small-latest",
            messages=[
                {
                    "role": "user",
                    "content": f"{ocr_text}\n\n{_MISTRAL_EXTRACTION_PROMPT}",
                }
            ],
        )
        raw = chat_response.choices[0].message.content.strip()
        return _validate_and_clean(_parse_llm_json(raw))

    def _extract_from_text(self, text: str) -> dict:
        """Plain text → Cerebras structured extraction."""
        if not text.strip():
            raise ValueError("Empty text provided.")
        return self._call_cerebras(text)

    def _call_cerebras(self, text: str) -> dict:
        """
        Call Cerebras llama3.1-8b and return validated extraction.

        Raises:
            RuntimeError: CEREBRAS_API_KEY not configured.
        """
        api_key = os.environ.get("CEREBRAS_API_KEY")
        if not api_key:
            raise RuntimeError("CEREBRAS_API_KEY is not configured.")

        client = Cerebras(api_key=api_key)
        response = client.chat.completions.create(
            model="llama3.1-8b",
            messages=[
                {"role": "system", "content": _CEREBRAS_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Document text:\n\n{text[:MAX_CHARS]}",
                },
            ],
            temperature=0.1,
            max_tokens=300,
        )
        raw = response.choices[0].message.content.strip()
        return _validate_and_clean(_parse_llm_json(raw))


# Module-level singleton
document_service = DocumentService()
